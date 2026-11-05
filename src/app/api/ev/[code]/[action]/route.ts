// 행사별 운영 API — /api/ev/{행사코드}/{기능}
//   login · logout      PIN 로그인 (관리자 · 스태프)
//   register            참가자 등록 (현장 등록은 스태프 로그인 필요)
//   scan · search       입장 · 퇴장 처리, 이름 · 번호 뒷자리 찾기 (스태프)
//   stats               실시간 현황 (스태프)
//   settings · pin      행사 정보 고치기, PIN 다시 발급 (관리자)
//   export              참가자 명단 CSV (관리자)

import { checkPin, isAdmin, isStaff, login, logout } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import { get, put } from "@vercel/blob";
import { blobConfigured } from "@/lib/future-card/blob";
import { FUN_EVENTS } from "@/lib/fun/config";
import {
  addPlay,
  boothStats,
  setEventLogo,
  stamp,
  stampsByAttendee,
  cleanEvent,
  cleanRegistration,
  getEvent,
  getEventRow,
  listAttendees,
  reportData,
  register,
  resetPin,
  scan,
  searchAttendees,
  stats,
  updateEvent,
} from "@/lib/ev/service";
import { FIELD_OPTIONS, formatPhone, kst, stageOf, STAGE_LABEL } from "@/lib/ev/shared";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ code: string; action: string }> };

const err = (message: string, status = 400) => Response.json({ error: message }, { status });

// PIN 을 마구 넣어 보는 것을 막습니다 (행사별 10분에 10번)
const fails = new Map<string, { n: number; until: number }>();
function tooMany(code: string) {
  const f = fails.get(code);
  return !!f && f.n >= 10 && f.until > Date.now();
}
function failed(code: string) {
  const f = fails.get(code);
  const fresh = !f || f.until < Date.now();
  fails.set(code, { n: fresh ? 1 : f.n + 1, until: Date.now() + 10 * 60_000 });
}

export async function GET(req: Request, ctx: Ctx) {
  if (!dbConfigured()) return err("데이터베이스가 연결되지 않았어요.", 503);
  const { code, action } = await ctx.params;
  if (!(await getEventRow(code))) return err("행사를 찾을 수 없어요.", 404);
  const url = new URL(req.url);

  if (action === "stats") {
    if (!(await isStaff(code))) return err("로그인이 필요해요.", 401);
    return Response.json(await stats(code), { headers: { "cache-control": "no-store" } });
  }
  if (action === "search") {
    if (!(await isStaff(code))) return err("로그인이 필요해요.", 401);
    return Response.json(await searchAttendees(code, url.searchParams.get("q") ?? ""));
  }
  if (action === "booths") {
    if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
    return Response.json(await boothStats(code), { headers: { "cache-control": "no-store" } });
  }
  if (action === "survey") {
    if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
    return Response.json(await reportData(code), { headers: { "cache-control": "no-store" } });
  }
  if (action === "attendees") {
    if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
    const rows = await listAttendees(code);
    const stampRows = await stampsByAttendee(code);
    return Response.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name ?? "(삭제됨)",
        phone: r.phone ? formatPhone(r.phone) : "",
        info: r.info,
        source: r.source,
        createdAt: r.created_at,
        enteredAt: r.entered_at,
        exitedAt: r.exited_at,
        surveyed: !!r.survey_at,
        stamps: stampRows.get(r.id) ?? [],
        stage: stageOf(r),
      })),
      { headers: { "cache-control": "no-store" } },
    );
  }
  if (action === "logo") {
    // 로고는 누구나 볼 수 있음 (등록 페이지 · 결과 카드)
    const row = await getEventRow(code);
    if (!row?.logo || !blobConfigured()) return new Response("not found", { status: 404 });
    const r = await get(`logos/${code}.png`, { access: "private" }).catch(() => null);
    if (!r || r.statusCode !== 200 || !r.stream) return new Response("not found", { status: 404 });
    return new Response(r.stream, { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } });
  }
  if (action === "export") {
    if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
    const ev = (await getEvent(code))!;
    const rows = await listAttendees(code);
    const fields = FIELD_OPTIONS.filter((f) => ev.fields.includes(f.id));
    const head = ["번호", "이름", "휴대폰", ...fields.map((f) => f.label), "등록 방법", "등록 시각", "입장 시각", "퇴장 시각", "상태", ...ev.survey.map((_, i) => `설문${i + 1}`), "의견"];
    const full = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" } as const;
    const lines = rows.map((r, i) => [
      i + 1,
      r.name ?? "(삭제됨)",
      r.phone ? formatPhone(r.phone) : "",
      ...fields.map((f) => r.info?.[f.id] ?? ""),
      r.source === "onsite" ? "현장" : "사전",
      kst(r.created_at, full),
      kst(r.entered_at, full),
      kst(r.exited_at, full),
      STAGE_LABEL[stageOf(r)],
      ...ev.survey.map((_, k) => r.survey?.scores[k] ?? ""),
      r.survey?.comment ?? "",
    ]);
    const csv = [head, ...lines].map((l) => l.map(csvCell).join(",")).join("\r\n");
    // 엑셀에서 한글이 깨지지 않게 BOM 을 붙입니다
    return new Response("﻿" + csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="attendees-${code}.csv"`,
        "cache-control": "no-store",
      },
    });
  }
  return err("없는 기능이에요.", 404);
}

function csvCell(v: unknown) {
  let s = String(v ?? "");
  // 엑셀 수식 주입 방지
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function POST(req: Request, ctx: Ctx) {
  if (!dbConfigured()) return err("데이터베이스가 연결되지 않았어요.", 503);
  const { code, action } = await ctx.params;
  const row = await getEventRow(code);
  if (!row) return err("행사를 찾을 수 없어요.", 404);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  switch (action) {
    case "login": {
      if (tooMany(code)) return err("잠시 뒤에 다시 시도해 주세요. (10분)", 429);
      const pin = String(b.pin ?? "");
      if (checkPin(pin, row.admin_pin)) {
        await login(code, "admin");
        return Response.json({ role: "admin" });
      }
      if (checkPin(pin, row.staff_pin)) {
        await login(code, "staff");
        return Response.json({ role: "staff" });
      }
      failed(code);
      return err("PIN 이 맞지 않아요.", 401);
    }
    case "logout":
      await logout(code);
      return Response.json({ ok: true });

    case "register": {
      const onsite = b.onsite === true;
      if (onsite && !(await isStaff(code))) return err("현장 등록은 스태프 로그인이 필요해요.", 401);
      if (!onsite && row.ends_on < todayKst()) return err("등록 기간이 끝난 행사예요.");
      const r = cleanRegistration((await getEvent(code))!, b);
      if (typeof r === "string") return err(r);
      const out = await register(code, r, onsite);
      if ("error" in out) return err(out.error, 409);
      return Response.json(out);
    }
    case "scan": {
      if (!(await isStaff(code))) return err("로그인이 필요해요.", 401);
      const token = typeof b.token === "string" ? b.token : undefined;
      const id = typeof b.id === "string" && /^\d+$/.test(b.id) ? b.id : undefined;
      if (!token && !id) return err("QR 을 다시 읽어 주세요.");
      // 부스 스탬프: kind = "stamp", booth = 부대행사 slug
      if (b.kind === "stamp") {
        const booth = String(b.booth ?? "");
        if (!FUN_EVENTS.some((e) => e.slug === booth)) return err("부스를 골라 주세요.");
        return Response.json(await stamp(code, booth, { token, id }));
      }
      return Response.json(await scan(code, b.kind === "out" ? "out" : "in", { token, id }));
    }
    case "play": {
      // 행사 부스 태블릿(스태프 로그인)에서 결과가 나올 때마다
      if (!(await isStaff(code))) return err("로그인이 필요해요.", 401);
      const booth = String(b.booth ?? "");
      if (!FUN_EVENTS.some((e) => e.slug === booth)) return err("부스를 확인해 주세요.");
      await addPlay(code, booth);
      return Response.json({ ok: true });
    }
    case "logo": {
      if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
      if (b.remove === true) {
        await setEventLogo(code, "");
        return Response.json({ logo: "" });
      }
      if (!blobConfigured()) return err("파일 저장소(Vercel Blob)가 연결되지 않았어요.", 503);
      const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.image ?? ""));
      if (!m || m[1].length > 1_500_000) return err("로고는 1MB 이하 이미지로 올려 주세요.");
      await put(`logos/${code}.png`, Buffer.from(m[1], "base64"), { access: "private", contentType: "image/png", addRandomSuffix: false, allowOverwrite: true });
      const v = Date.now().toString(36);
      await setEventLogo(code, v);
      return Response.json({ logo: `/api/ev/${code}/logo?v=${v}` });
    }
    case "settings": {
      if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
      const e = cleanEvent(b);
      if (typeof e === "string") return err(e);
      await updateEvent(code, e);
      return Response.json(await getEvent(code));
    }
    case "pin": {
      if (!(await isAdmin(code))) return err("관리자 로그인이 필요해요.", 401);
      const which = b.which === "admin" ? "admin" : "staff";
      return Response.json({ which, pin: await resetPin(code, which) });
    }
  }
  return err("없는 기능이에요.", 404);
}

function todayKst() {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}
