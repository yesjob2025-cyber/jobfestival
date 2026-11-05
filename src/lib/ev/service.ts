// 행사 운영 — 행사 · 참가자 · 입장/퇴장 기록 다루기 (서버 전용)

import { randomBytes } from "node:crypto";
import { q, tx } from "./db";
import { checkPin, hashPin, newPin } from "./auth";
import { FUN_EVENTS } from "@/lib/fun/config";
import { DEFAULT_FIELDS, DEFAULT_SURVEY, FIELD_IDS, stageOf, type FieldId, type PublicEvent, type Stage, type Ticket } from "./shared";

interface EventRow {
  code: string;
  name: string;
  host_org: string;
  place: string;
  starts_on: string;
  ends_on: string;
  color: string;
  fields: FieldId[];
  survey: string[];
  notice: string;
  admin_pin: string;
  staff_pin: string;
  retention_days: number;
  purged: boolean;
  org_id: string | null;
  status: "draft" | "confirmed";
  booths: string[];
  stamp_goal: number;
  short: string;
  logo: string;
}

export interface AttendeeRow {
  id: string;
  token: string;
  name: string | null;
  phone: string | null;
  info: Record<string, string>;
  source: "pre" | "onsite";
  created_at: Date;
  entered_at: Date | null;
  exited_at: Date | null;
  survey: { scores: number[]; comment: string } | null;
  survey_at: Date | null;
}

const toPublic = (r: EventRow): PublicEvent => ({
  code: r.code,
  name: r.name,
  hostOrg: r.host_org,
  place: r.place,
  startsOn: r.starts_on,
  endsOn: r.ends_on,
  color: r.color,
  fields: r.fields,
  survey: r.survey,
  notice: r.notice,
  retentionDays: r.retention_days,
  status: r.status,
  booths: r.booths,
  stampGoal: r.stamp_goal,
  short: r.short,
  logo: r.logo ? `/api/ev/${r.code}/logo?v=${r.logo}` : "",
});

const EVENT_COLS = `code, name, host_org, place, to_char(starts_on, 'YYYY-MM-DD') as starts_on, to_char(ends_on, 'YYYY-MM-DD') as ends_on,
  color, fields, survey, notice, admin_pin, staff_pin, retention_days, purged, org_id::text as org_id, status, booths, stamp_goal, short, logo`;

export async function getEventRow(code: string): Promise<EventRow | null> {
  if (!/^[a-z0-9]{4,12}$/.test(code)) return null;
  const rows = await q<EventRow>(`select ${EVENT_COLS} from ev_events where code = $1`, [code]);
  return rows[0] ?? null;
}

export async function getEvent(code: string): Promise<PublicEvent | null> {
  const r = await getEventRow(code);
  return r ? toPublic(r) : null;
}

// ── 행사 만들기 · 고치기 ─────────────────────────────────────

export interface EventInput {
  name: string;
  hostOrg: string;
  place: string;
  startsOn: string;
  endsOn: string;
  color: string;
  fields: string[];
  survey: string[];
  notice: string;
  retentionDays: number;
  booths: string[];
  stampGoal: number;
  short: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const BOOTH_IDS = FUN_EVENTS.map((e) => e.slug);

/** 입력 검사 · 정리 — 문제가 있으면 오류 문구 */
export function cleanEvent(b: Partial<EventInput>): EventInput | string {
  const name = String(b.name ?? "").trim().slice(0, 60);
  if (!name) return "행사 이름을 적어 주세요.";
  const startsOn = String(b.startsOn ?? "");
  const endsOn = String(b.endsOn || startsOn);
  if (!DATE.test(startsOn) || !DATE.test(endsOn) || endsOn < startsOn) return "행사 날짜를 확인해 주세요.";
  const color = /^#[0-9a-fA-F]{6}$/.test(String(b.color)) ? String(b.color) : "#13399A";
  const fields = (Array.isArray(b.fields) ? b.fields : DEFAULT_FIELDS).filter((f): f is FieldId => FIELD_IDS.includes(f as FieldId));
  const survey = (Array.isArray(b.survey) ? b.survey : DEFAULT_SURVEY)
    .map((s) => String(s).trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 8);
  const days = Math.round(Number(b.retentionDays ?? 30));
  return {
    name,
    hostOrg: String(b.hostOrg ?? "").trim().slice(0, 60),
    place: String(b.place ?? "").trim().slice(0, 80),
    startsOn,
    endsOn,
    color,
    fields,
    survey: survey.length ? survey : DEFAULT_SURVEY,
    notice: String(b.notice ?? "").trim().slice(0, 500),
    retentionDays: Math.min(365, Math.max(1, Number.isFinite(days) ? days : 30)),
    booths: (Array.isArray(b.booths) ? b.booths : []).filter((x): x is string => typeof x === "string" && BOOTH_IDS.includes(x)),
    stampGoal: Math.min(20, Math.max(0, Math.round(Number(b.stampGoal ?? 0)) || 0)),
    short: String(b.short ?? "").trim().slice(0, 8),
  };
}

const CODE_CHARS = "abcdefghjkmnpqrstuvwxyz23456789";
const newCode = () => Array.from(randomBytes(6), (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");

/** 새 행사 — 행사 코드와 PIN 두 개를 돌려줍니다 (PIN 은 이때만 보임) */
export async function createEvent(e: EventInput, orgId: string | null = null) {
  const adminPin = newPin();
  let staffPin = newPin();
  while (staffPin === adminPin) staffPin = newPin();
  for (let tries = 0; tries < 5; tries++) {
    const code = newCode();
    const rows = await q<{ code: string }>(
      `insert into ev_events (code, name, host_org, place, starts_on, ends_on, color, fields, survey, notice, retention_days, admin_pin, staff_pin, org_id, booths, stamp_goal, short)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) on conflict (code) do nothing returning code`,
      [code, e.name, e.hostOrg, e.place, e.startsOn, e.endsOn, e.color, JSON.stringify(e.fields), JSON.stringify(e.survey), e.notice, e.retentionDays, hashPin(adminPin), hashPin(staffPin), orgId, JSON.stringify(e.booths), e.stampGoal, e.short],
    );
    if (rows[0]) return { code, adminPin, staffPin };
  }
  throw new Error("could not allocate event code");
}

export async function updateEvent(code: string, e: EventInput) {
  await q(
    `update ev_events set name=$2, host_org=$3, place=$4, starts_on=$5, ends_on=$6, color=$7, fields=$8, survey=$9, notice=$10, retention_days=$11,
       booths=$12, stamp_goal=$13, short=$14 where code=$1`,
    [code, e.name, e.hostOrg, e.place, e.startsOn, e.endsOn, e.color, JSON.stringify(e.fields), JSON.stringify(e.survey), e.notice, e.retentionDays, JSON.stringify(e.booths), e.stampGoal, e.short],
  );
}

/** PIN 새로 발급 (잊어버렸거나 스태프가 바뀌었을 때) */
export async function resetPin(code: string, which: "admin" | "staff") {
  const pin = newPin();
  await q(`update ev_events set ${which === "admin" ? "admin_pin" : "staff_pin"} = $2 where code = $1`, [code, hashPin(pin)]);
  return pin;
}

// ── 등록 ────────────────────────────────────────────────────

const newToken = () => randomBytes(16).toString("base64url");

export interface RegisterInput {
  name: string;
  phone: string;
  info: Record<string, string>;
  consent: boolean;
}

export function cleanRegistration(ev: PublicEvent, b: Partial<RegisterInput>): RegisterInput | string {
  const name = String(b.name ?? "").trim().slice(0, 30);
  if (!name) return "이름을 적어 주세요.";
  const phone = String(b.phone ?? "").replace(/\D/g, "");
  if (!/^01\d{8,9}$/.test(phone)) return "휴대폰 번호를 확인해 주세요. (예: 010-1234-5678)";
  if (!b.consent) return "개인정보 수집 · 이용에 동의해 주세요.";
  const info: Record<string, string> = {};
  for (const f of ev.fields) {
    const v = String(b.info?.[f] ?? "").trim().slice(0, 60);
    if (v) info[f] = v;
  }
  return { name, phone, info, consent: true };
}

/**
 * 등록 — 같은 번호로 이미 등록했으면 이름이 같을 때만 그 티켓을 돌려줍니다.
 * onsite: 현장 등록이면 바로 입장 처리
 */
export async function register(code: string, r: RegisterInput, onsite = false): Promise<{ token: string; existed: boolean } | { error: string }> {
  return tx(async (c) => {
    const found = await c.query<{ token: string; name: string; entered_at: Date | null; id: string }>(
      `select id, token, name, entered_at from ev_attendees where event_code = $1 and phone = $2 for update`,
      [code, r.phone],
    );
    const old = found.rows[0];
    if (old) {
      if (old.name !== r.name) return { error: "이 번호는 다른 이름으로 이미 등록돼 있어요. 등록 데스크에 문의해 주세요." };
      if (onsite && !old.entered_at) {
        await c.query(`update ev_attendees set entered_at = now() where id = $1`, [old.id]);
        await c.query(`insert into ev_scans (event_code, attendee_id, kind) values ($1, $2, 'in')`, [code, old.id]);
      }
      return { token: old.token, existed: true };
    }
    const token = newToken();
    const ins = await c.query<{ id: string }>(
      `insert into ev_attendees (event_code, token, name, phone, phone_last4, info, source, entered_at)
       values ($1,$2,$3,$4,$5,$6,$7, ${onsite ? "now()" : "null"}) returning id`,
      [code, token, r.name, r.phone, r.phone.slice(-4), JSON.stringify(r.info), onsite ? "onsite" : "pre"],
    );
    if (onsite) await c.query(`insert into ev_scans (event_code, attendee_id, kind) values ($1, $2, 'in')`, [code, ins.rows[0].id]);
    return { token, existed: false };
  });
}

// ── 티켓 ────────────────────────────────────────────────────

export async function getTicket(token: string): Promise<Ticket | null> {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return null;
  const rows = await q<AttendeeRow & { event_code: string }>(
    `select id, token, name, event_code, entered_at, exited_at, survey_at from ev_attendees where token = $1`,
    [token],
  );
  const a = rows[0];
  if (!a) return null;
  const ev = await getEvent(a.event_code);
  if (!ev) return null;
  const stamps = await q<{ booth: string }>(`select booth from ev_stamps where attendee_id = $1 order by at`, [a.id]);
  return {
    token: a.token,
    name: a.name ?? "",
    stage: stageOf(a),
    stamps: stamps.map((x) => x.booth),
    enteredAt: a.entered_at?.toISOString() ?? null,
    exitedAt: a.exited_at?.toISOString() ?? null,
    surveyDone: !!a.survey_at,
    event: ev,
  };
}

export async function saveSurvey(token: string, scores: number[], comment: string, count: number): Promise<string | null> {
  if (scores.length !== count || scores.some((s) => !Number.isInteger(s) || s < 1 || s > 5)) return "모든 문항에 답해 주세요.";
  const rows = await q<{ id: string }>(
    `update ev_attendees set survey = $2, survey_at = now() where token = $1 and survey_at is null returning id`,
    [token, JSON.stringify({ scores, comment: comment.trim().slice(0, 500) })],
  );
  return rows[0] ? null : "이미 설문에 참여하셨어요.";
}

// ── 입장 · 퇴장 (스태프) ─────────────────────────────────────

export interface ScanResult {
  ok: boolean;
  /** 화면에 크게 보여 줄 한 줄 */
  message: string;
  name?: string;
  detail?: string;
  stage?: Stage;
  surveyDone?: boolean;
  /** 같은 처리를 이미 했는지 (중복 스캔) */
  repeat?: boolean;
}

/** kind: in(입장) · out(퇴장). by: token 또는 참가자 id */
export async function scan(code: string, kind: "in" | "out", by: { token?: string; id?: string }): Promise<ScanResult> {
  return tx(async (c) => {
    const found = await c.query<AttendeeRow & { event_code: string }>(
      `select id, event_code, name, info, entered_at, exited_at, survey_at from ev_attendees
       where ${by.token ? "token = $1" : "id = $1"} and event_code = $2 for update`,
      [by.token ?? by.id, code],
    );
    const a = found.rows[0];
    if (!a) return { ok: false, message: "이 행사 티켓이 아니에요" };
    const name = a.name ?? "";
    const detail = [a.info?.school, a.info?.major, a.info?.grade].filter(Boolean).join(" · ");

    if (kind === "in") {
      // 퇴장했다가 다시 들어오는 경우도 입장으로 기록 (퇴장 시각은 지움)
      if (a.entered_at && !a.exited_at) {
        return { ok: true, repeat: true, message: "이미 입장한 분이에요", name, detail, stage: stageOf(a), surveyDone: !!a.survey_at };
      }
      await c.query(`update ev_attendees set entered_at = coalesce(entered_at, now()), exited_at = null where id = $1`, [a.id]);
      await c.query(`insert into ev_scans (event_code, attendee_id, kind) values ($1, $2, 'in')`, [code, a.id]);
      return { ok: true, message: a.exited_at ? "재입장 완료" : "입장 완료", name, detail, stage: "entered", surveyDone: !!a.survey_at };
    }

    if (!a.entered_at) {
      // 입장 기록 없이 퇴장 — 입장도 같이 기록
      await c.query(`update ev_attendees set entered_at = now() where id = $1`, [a.id]);
    }
    if (a.exited_at) {
      return { ok: true, repeat: true, message: "이미 퇴장한 분이에요", name, detail, stage: "exited", surveyDone: !!a.survey_at };
    }
    await c.query(`update ev_attendees set exited_at = now() where id = $1`, [a.id]);
    await c.query(`insert into ev_scans (event_code, attendee_id, kind) values ($1, $2, 'out')`, [code, a.id]);
    const st = await c.query<{ n: string; goal: number }>(
      `select (select count(*) from ev_stamps where attendee_id = $1) as n, (select stamp_goal from ev_events where code = $2) as goal`,
      [a.id, code],
    );
    const n = Number(st.rows[0]?.n ?? 0);
    const goal = st.rows[0]?.goal ?? 0;
    const stampText = goal ? ` · 스탬프 ${n}/${goal}${n >= goal ? " 완성" : ""}` : n ? ` · 스탬프 ${n}개` : "";
    return {
      ok: true,
      message: "퇴장 완료",
      name,
      detail: (a.survey_at ? "설문 완료 — 기념품을 드려 주세요 🎁" : "설문 미참여 — 티켓 화면에서 설문을 부탁드려요") + stampText,
      stage: "exited",
      surveyDone: !!a.survey_at,
    };
  });
}

/** 이름 또는 휴대폰 뒷자리로 찾기 (수동 처리용) */
export async function searchAttendees(code: string, term: string) {
  const t = term.trim();
  if (!t) return [];
  const digits = t.replace(/\D/g, "");
  const rows = await q<AttendeeRow>(
    `select id, name, phone, info, entered_at, exited_at, survey_at from ev_attendees
     where event_code = $1 and (${digits.length >= 4 ? "phone like '%' || $2" : "name like '%' || $2 || '%'"})
     order by name limit 20`,
    [code, digits.length >= 4 ? digits : t],
  );
  return rows.map((a) => ({
    id: a.id,
    name: a.name ?? "",
    phone4: (a.phone ?? "").slice(-4),
    detail: [a.info?.school, a.info?.major, a.info?.grade].filter(Boolean).join(" · "),
    stage: stageOf(a),
  }));
}

// ── 현황 · 명단 · 보고서 ─────────────────────────────────────

export async function stats(code: string) {
  const [counts] = await q<{
    total: string;
    onsite: string;
    entered: string;
    exited: string;
    surveyed: string;
    stay_min: string | null;
  }>(
    `select count(*) as total,
       count(*) filter (where source = 'onsite') as onsite,
       count(*) filter (where entered_at is not null) as entered,
       count(*) filter (where exited_at is not null) as exited,
       count(*) filter (where survey_at is not null) as surveyed,
       avg(extract(epoch from (exited_at - entered_at)) / 60) filter (where exited_at is not null and entered_at is not null) as stay_min
     from ev_attendees where event_code = $1`,
    [code],
  );
  // 시간대별 입장 · 퇴장 (한국 시간, 첫 입장 · 마지막 퇴장 기준)
  const hourly = await q<{ day: string; hour: number; ins: string; outs: string }>(
    `select to_char(at at time zone 'Asia/Seoul', 'YYYY-MM-DD') as day,
       extract(hour from at at time zone 'Asia/Seoul')::int as hour,
       count(*) filter (where kind = 'in') as ins,
       count(*) filter (where kind = 'out') as outs
     from ev_scans where event_code = $1 group by 1, 2 order by 1, 2`,
    [code],
  );
  const n = (v: string | null | undefined) => Number(v ?? 0);
  return {
    total: n(counts.total),
    onsite: n(counts.onsite),
    pre: n(counts.total) - n(counts.onsite),
    entered: n(counts.entered),
    exited: n(counts.exited),
    inside: n(counts.entered) - n(counts.exited),
    surveyed: n(counts.surveyed),
    stayMin: counts.stay_min ? Math.round(Number(counts.stay_min)) : null,
    hourly: hourly.map((h) => ({ day: h.day, hour: h.hour, ins: n(h.ins), outs: n(h.outs) })),
  };
}
export type Stats = Awaited<ReturnType<typeof stats>>;

export async function listAttendees(code: string) {
  return q<AttendeeRow>(
    `select id, token, name, phone, info, source, created_at, entered_at, exited_at, survey, survey_at
     from ev_attendees where event_code = $1 order by created_at`,
    [code],
  );
}

/** 결과보고서용 — 참가자 구성 · 만족도 */
export async function reportData(code: string) {
  const rows = await listAttendees(code);
  const ev = (await getEventRow(code))!;
  const entered = rows.filter((r) => r.entered_at);
  const tally = (key: string) => {
    const m = new Map<string, number>();
    for (const r of entered) {
      const v = r.info?.[key];
      if (v) m.set(v, (m.get(v) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const surveyed = rows.filter((r) => r.survey);
  const survey = ev.survey.map((question, i) => {
    const dist = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of surveyed) {
      const s = r.survey!.scores[i];
      if (s >= 1 && s <= 5) {
        dist[s - 1]++;
        sum += s;
      }
    }
    const count = dist.reduce((a, b) => a + b, 0);
    return { question, dist, count, avg: count ? sum / count : 0 };
  });
  const comments = surveyed.map((r) => r.survey!.comment).filter((c) => c && c.trim());
  return {
    composition: Object.fromEntries(ev.fields.map((f) => [f, tally(f)])) as Partial<Record<FieldId, [string, number][]>>,
    survey,
    comments,
    purged: ev.purged,
  };
}

/** 보관 기간이 지난 행사의 개인정보 지우기 (통계 숫자 · 설문 · 학교 · 학과 · 학년은 남김) */
export async function purgeExpired() {
  const rows = await q<{ code: string }>(
    `update ev_events set purged = true where not purged and ends_on + retention_days < (now() at time zone 'Asia/Seoul')::date returning code`,
  );
  for (const { code } of rows) {
    await q(
      `update ev_attendees set name = null, phone = null, phone_last4 = '',
         info = info - 'studentNo' - 'email'
       where event_code = $1`,
      [code],
    );
  }
  return rows.map((r) => r.code);
}

// ── 부스 스탬프 · 체험 횟수 ───────────────────────────────────

/** 부스에서 참가자 티켓을 찍어 스탬프 (부스마다 한 번) */
export async function stamp(code: string, booth: string, by: { token?: string; id?: string }): Promise<ScanResult & { count?: number; goal?: number }> {
  const ev = await getEventRow(code);
  if (!ev) return { ok: false, message: "행사를 찾을 수 없어요" };
  const found = await q<AttendeeRow>(
    `select id, name, info, entered_at, exited_at, survey_at from ev_attendees where ${by.token ? "token = $1" : "id = $1"} and event_code = $2`,
    [by.token ?? by.id, code],
  );
  const a = found[0];
  if (!a) return { ok: false, message: "이 행사 티켓이 아니에요" };
  const ins = await q<{ id: string }>(
    `insert into ev_stamps (event_code, attendee_id, booth) values ($1, $2, $3) on conflict do nothing returning id`,
    [code, a.id, booth],
  );
  // 입장 기록 없이 부스에 왔으면 입장도 같이 기록
  if (!a.entered_at) {
    await q(`update ev_attendees set entered_at = now() where id = $1 and entered_at is null`, [a.id]);
    await q(`insert into ev_scans (event_code, attendee_id, kind) values ($1, $2, 'in')`, [code, a.id]);
  }
  const [{ n }] = await q<{ n: string }>(`select count(*) as n from ev_stamps where attendee_id = $1`, [a.id]);
  const count = Number(n);
  const goal = ev.stamp_goal;
  const name = FUN_EVENTS.find((e) => e.slug === booth)?.name ?? booth;
  return {
    ok: true,
    repeat: !ins[0],
    message: ins[0] ? `${name} 스탬프 완료` : `이미 ${name} 스탬프를 찍었어요`,
    name: a.name ?? "",
    detail: goal ? `스탬프 ${count} / ${goal}${count >= goal ? " — 🎁 기념품 받을 수 있어요!" : ""}` : `스탬프 ${count}개`,
    stage: stageOf(a),
    surveyDone: !!a.survey_at,
    count,
    goal,
  };
}

export async function addPlay(code: string, booth: string) {
  await q(`insert into ev_plays (event_code, booth) values ($1, $2)`, [code, booth]);
}

/** 부스별 참여 — 체험 횟수 · 스탬프(참가자 수) · 시간대 */
export async function boothStats(code: string) {
  const plays = await q<{ booth: string; n: string }>(`select booth, count(*) as n from ev_plays where event_code = $1 group by booth`, [code]);
  const stamps = await q<{ booth: string; n: string }>(`select booth, count(*) as n from ev_stamps where event_code = $1 group by booth`, [code]);
  const hourly = await q<{ booth: string; hour: number; n: string }>(
    `select booth, extract(hour from at at time zone 'Asia/Seoul')::int as hour, count(*) as n from ev_stamps where event_code = $1 group by 1, 2 order by 2`,
    [code],
  );
  const dist = await q<{ k: number; n: string }>(
    `select k, count(*) as n from (select attendee_id, count(*)::int as k from ev_stamps where event_code = $1 group by attendee_id) t group by k order by k`,
    [code],
  );
  const num = (rows: { booth: string; n: string }[], b: string) => Number(rows.find((r) => r.booth === b)?.n ?? 0);
  const ev = (await getEventRow(code))!;
  const booths = ev.booths.length ? ev.booths : [...new Set([...plays, ...stamps].map((r) => r.booth))];
  return {
    goal: ev.stamp_goal,
    booths: booths.map((b) => ({ booth: b, plays: num(plays, b), stamps: num(stamps, b) })),
    hourly: hourly.map((h) => ({ booth: h.booth, hour: h.hour, n: Number(h.n) })),
    /** 스탬프 k 개 찍은 사람 수 */
    perPerson: dist.map((d) => ({ k: d.k, n: Number(d.n) })),
  };
}
export type BoothStats = Awaited<ReturnType<typeof boothStats>>;

// ── 기관 계정 ────────────────────────────────────────────────

export interface OrgRow {
  id: string;
  name: string;
  login_id: string;
  contact: string;
  created_at: Date;
  last_login: Date | null;
  events: string;
}

export async function createOrg(name: string, loginId: string, password: string, contact: string): Promise<string | { error: string }> {
  try {
    const rows = await q<{ id: string }>(`insert into ev_orgs (name, login_id, password, contact) values ($1, $2, $3, $4) returning id::text`, [
      name,
      loginId,
      hashPin(password),
      contact,
    ]);
    return rows[0].id;
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return { error: "이미 쓰고 있는 아이디예요." };
    throw e;
  }
}

export async function listOrgs() {
  return q<OrgRow>(
    `select o.id::text, o.name, o.login_id, o.contact, o.created_at, o.last_login, count(e.code)::text as events
     from ev_orgs o left join ev_events e on e.org_id = o.id group by o.id order by o.created_at desc`,
  );
}

export async function getOrg(id: string) {
  const rows = await q<OrgRow>(`select id::text, name, login_id, contact, created_at, last_login, '0' as events from ev_orgs where id = $1`, [id]);
  return rows[0] ?? null;
}

export async function setOrgPassword(id: string, password: string) {
  await q(`update ev_orgs set password = $2 where id = $1`, [id, hashPin(password)]);
}

/** 아이디 · 비밀번호 확인 — 맞으면 기관 id */
export async function checkOrgLogin(loginId: string, password: string): Promise<string | null> {
  const rows = await q<{ id: string; password: string }>(`select id::text, password from ev_orgs where login_id = $1`, [loginId]);
  const o = rows[0];
  // 없는 아이디도 같은 시간이 걸리게 한 번 계산
  const ok = checkPin(password, o?.password ?? "x.x");
  if (!o || !ok) return null;
  await q(`update ev_orgs set last_login = now() where id = $1`, [o.id]);
  return o.id;
}

/** 행사 목록 (orgId 가 없으면 전체 — 운영자용) */
export async function listEvents(orgId?: string) {
  const rows = await q<EventRow & { org_name: string | null; total: string; entered: string }>(
    `select e.*, o.name as org_name,
       (select count(*) from ev_attendees a where a.event_code = e.code) as total,
       (select count(*) from ev_attendees a where a.event_code = e.code and a.entered_at is not null) as entered
     from (select ${EVENT_COLS}, created_at from ev_events) e left join ev_orgs o on o.id = e.org_id::bigint
     ${orgId ? "where e.org_id = $1" : ""} order by e.starts_on desc, e.created_at desc`,
    orgId ? [orgId] : [],
  );
  return rows.map((r) => ({ ...toPublic(r), orgId: r.org_id, orgName: r.org_name ?? "", total: Number(r.total), entered: Number(r.entered) }));
}

export async function setEventStatus(code: string, status: "draft" | "confirmed") {
  await q(`update ev_events set status = $2 where code = $1`, [code, status]);
}

export async function setEventOrg(code: string, orgId: string | null) {
  await q(`update ev_events set org_id = $2 where code = $1`, [code, orgId]);
}

export async function setEventLogo(code: string, version: string) {
  await q(`update ev_events set logo = $2 where code = $1`, [code, version]);
}

// ── 도입 문의 ────────────────────────────────────────────────

export interface Inquiry {
  org: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  size: string;
  booths: string[];
  message: string;
}

export function cleanInquiry(b: Partial<Inquiry>): Inquiry | string {
  const cut = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
  const org = cut(b.org, 60);
  const name = cut(b.name, 30);
  const phone = cut(b.phone, 20);
  const email = cut(b.email, 80);
  if (!org) return "학교 · 기관 이름을 적어 주세요.";
  if (!name) return "담당자 이름을 적어 주세요.";
  if (!phone && !email) return "연락처(전화 또는 이메일)를 하나 이상 적어 주세요.";
  return {
    org,
    name,
    phone,
    email,
    eventDate: cut(b.eventDate, 40),
    size: cut(b.size, 40),
    booths: (Array.isArray(b.booths) ? b.booths : []).filter((x): x is string => typeof x === "string" && BOOTH_IDS.includes(x)),
    message: cut(b.message, 1000),
  };
}

export async function addInquiry(i: Inquiry) {
  await q(
    `insert into ev_inquiries (org, name, phone, email, event_date, size, booths, message) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [i.org, i.name, i.phone, i.email, i.eventDate, i.size, JSON.stringify(i.booths), i.message],
  );
}

export async function listInquiries() {
  return q<{ id: string; org: string; name: string; phone: string; email: string; event_date: string; size: string; booths: string[]; message: string; done: boolean; created_at: Date }>(
    `select id::text, org, name, phone, email, event_date, size, booths, message, done, created_at from ev_inquiries order by done, created_at desc limit 200`,
  );
}

export async function setInquiryDone(id: string, done: boolean) {
  await q(`update ev_inquiries set done = $2 where id = $1`, [id, done]);
}

/** 참가자별 찍은 부스 목록 */
export async function stampsByAttendee(code: string) {
  const rows = await q<{ attendee_id: string; booth: string }>(`select attendee_id::text, booth from ev_stamps where event_code = $1 order by at`, [code]);
  const m = new Map<string, string[]>();
  for (const r of rows) m.set(r.attendee_id, [...(m.get(r.attendee_id) ?? []), r.booth]);
  return m;
}
