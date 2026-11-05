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

-- 기관 계정 (서비스 운영자가 아이디 · 비밀번호를 발급)
create table if not exists ev_orgs (
  id bigserial primary key,
  name text not null,
  login_id text not null unique,
  password text not null,
  contact text not null default '',
  created_at timestamptz not null default now(),
  last_login timestamptz
);
alter table ev_events add column if not exists org_id bigint references ev_orgs(id) on delete set null;
-- draft: 준비 중 · confirmed: 확정 (행사 전용 페이지에 부대행사 버튼이 열림)
alter table ev_events add column if not exists status text not null default 'draft';
alter table ev_events add column if not exists booths jsonb not null default '[]';
alter table ev_events add column if not exists stamp_goal int not null default 0;
alter table ev_events add column if not exists short text not null default '';
alter table ev_events add column if not exists logo text not null default '';

-- 부스 스탬프 (부스에서 참가자 티켓 QR 을 찍음, 부스마다 한 번)
create table if not exists ev_stamps (
  id bigserial primary key,
  event_code text not null references ev_events(code) on delete cascade,
  attendee_id bigint not null references ev_attendees(id) on delete cascade,
  booth text not null,
  at timestamptz not null default now(),
  unique (event_code, attendee_id, booth)
);
-- 부스 체험 횟수 (결과가 나올 때마다, 누가 했는지는 모름)
create table if not exists ev_plays (
  id bigserial primary key,
  event_code text not null references ev_events(code) on delete cascade,
  booth text not null,
  at timestamptz not null default now()
);
create index if not exists ev_plays_event on ev_plays(event_code, at);

-- 첫 화면의 도입 문의
create table if not exists ev_inquiries (
  id bigserial primary key,
  org text not null,
  name text not null,
  phone text not null default '',
  email text not null default '',
  event_date text not null default '',
  size text not null default '',
  booths jsonb not null default '[]',
  message text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now()
);
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
