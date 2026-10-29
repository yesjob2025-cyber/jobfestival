// ─────────────────────────────────────────────────────────────
// 행사 운영 (등록 → 입장 → 퇴장) — 데이터베이스 (서버 전용)
//
// Postgres 하나만 있으면 됩니다 (Vercel → Storage → Neon 연결 시 DATABASE_URL 이 자동으로 들어감).
// 표는 처음 쓸 때 자동으로 만들어집니다.
// ─────────────────────────────────────────────────────────────

import { Pool, type PoolClient } from "pg";

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const dbConfigured = () => !!url();

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    const conn = url();
    const local = /localhost|127\.0\.0\.1/.test(conn);
    pool = new Pool({ connectionString: conn, max: 5, ssl: local ? undefined : { rejectUnauthorized: false } });
  }
  return pool;
}

const SCHEMA = `
create table if not exists ev_events (
  code text primary key,
  name text not null,
  host_org text not null default '',
  place text not null default '',
  starts_on date not null,
  ends_on date not null,
  color text not null default '#13399A',
  fields jsonb not null default '[]',
  survey jsonb not null default '[]',
  notice text not null default '',
  admin_pin text not null,
  staff_pin text not null,
  retention_days int not null default 30,
  purged boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists ev_attendees (
  id bigserial primary key,
  event_code text not null references ev_events(code) on delete cascade,
  token text not null unique,
  name text,
  phone text,
  phone_last4 text not null default '',
  info jsonb not null default '{}',
  source text not null default 'pre',
  created_at timestamptz not null default now(),
  entered_at timestamptz,
  exited_at timestamptz,
  survey jsonb,
  survey_at timestamptz
);
create unique index if not exists ev_attendees_phone on ev_attendees(event_code, phone) where phone is not null;
create index if not exists ev_attendees_event on ev_attendees(event_code);
create table if not exists ev_scans (
  id bigserial primary key,
  event_code text not null references ev_events(code) on delete cascade,
  attendee_id bigint not null references ev_attendees(id) on delete cascade,
  kind text not null,
  at timestamptz not null default now()
);
create index if not exists ev_scans_event on ev_scans(event_code, at);
`;

async function ensure() {
  ready ??= getPool()
    .query(SCHEMA)
    .then(() => undefined)
    .catch((e) => {
      ready = null;
      throw e;
    });
  return ready;
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensure();
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  await ensure();
  const c = await getPool().connect();
  try {
    await c.query("begin");
    const out = await fn(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}
