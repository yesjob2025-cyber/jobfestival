// 잡페스티벌 계정 API — /api/jf/{기능}
//   login · logout                 운영자 · 기관 로그인 (아이디 · 비밀번호)
//   me                             지금 로그인 상태
//   inquiry                        첫 화면 도입 문의 (누구나)
//   my-events                      기관: 내 행사 목록
//   orgs · org-create · org-password · events · event-create · event-status · event-org · inquiries · inquiry-done
//                                  운영자 전용

import { randomBytes } from "node:crypto";
import { checkSuper, loginOrg, loginSuper, logoutAll, session } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import {
  addInquiry,
  checkOrgLogin,
  cleanEvent,
  cleanInquiry,
  createEvent,
  createOrg,
  getOrg,
  listEvents,
  listInquiries,
  listOrgs,
  setEventOrg,
  setEventStatus,
  setInquiryDone,
  setOrgPassword,
} from "@/lib/ev/service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ action: string }> };
const err = (message: string, status = 400) => Response.json({ error: message }, { status });

// 비밀번호를 마구 넣어 보는 것 · 문의 도배를 막습니다 (서버 인스턴스별 10분 창)
const hits = new Map<string, { n: number; until: number }>();
function limited(key: string, max: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.until < now) {
    hits.set(key, { n: 1, until: now + 10 * 60_000 });
    return false;
  }
  h.n++;
  return h.n > max;
}
const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/** 읽기 쉬운 임시 비밀번호 (헷갈리는 글자 뺌) */
function newPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(10), (b) => chars[b % chars.length]).join("");
}

export async function GET(_: Request, ctx: Ctx) {
  if (!dbConfigured()) return err("데이터베이스가 연결되지 않았어요.", 503);
  const { action } = await ctx.params;
  const s = await session();

  if (action === "me") {
    const org = s.orgId ? await getOrg(s.orgId) : null;
    return Response.json({ super: s.super, org: org ? { id: org.id, name: org.name, loginId: org.login_id } : null });
  }
  if (action === "my-events") {
    if (!s.orgId && !s.super) return err("로그인이 필요해요.", 401);
    return Response.json(await listEvents(s.super && !s.orgId ? undefined : s.orgId!));
  }
  if (!s.super) return err("운영자 로그인이 필요해요.", 401);
  if (action === "orgs") return Response.json(await listOrgs());
  if (action === "events") return Response.json(await listEvents());
  if (action === "inquiries") return Response.json(await listInquiries());
  return err("없는 기능이에요.", 404);
}

export async function POST(req: Request, ctx: Ctx) {
  if (!dbConfigured()) return err("데이터베이스가 연결되지 않았어요.", 503);
  const { action } = await ctx.params;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (k: string, n = 100) => String(b[k] ?? "").trim().slice(0, n);

  switch (action) {
    case "login": {
      const id = str("id", 40);
      const password = String(b.password ?? "").slice(0, 100);
      if (limited(`login:${ipOf(req)}`, 15) || limited(`login-id:${id}`, 10)) return err("잠시 뒤에 다시 시도해 주세요. (10분)", 429);
      if (checkSuper(id, password)) {
        await loginSuper();
        return Response.json({ kind: "super" });
      }
      const orgId = await checkOrgLogin(id, password);
      if (!orgId) return err("아이디 또는 비밀번호가 맞지 않아요.", 401);
      await logoutAll();
      await loginOrg(orgId);
      return Response.json({ kind: "org" });
    }
    case "logout":
      await logoutAll();
      return Response.json({ ok: true });
    case "inquiry": {
      if (limited(`inq:${ipOf(req)}`, 5)) return err("잠시 뒤에 다시 보내 주세요.", 429);
      const i = cleanInquiry(b);
      if (typeof i === "string") return err(i);
      await addInquiry(i);
      return Response.json({ ok: true });
    }
  }

  const s = await session();
  if (!s.super) return err("운영자 로그인이 필요해요.", 401);
  switch (action) {
    case "org-create": {
      const name = str("name", 60);
      const loginId = str("loginId", 40).toLowerCase();
      if (!name) return err("기관 이름을 적어 주세요.");
      if (!/^[a-z0-9_.-]{4,40}$/.test(loginId)) return err("아이디는 영문 소문자 · 숫자 4자 이상으로 정해 주세요.");
      const password = String(b.password ?? "").trim() || newPassword();
      if (password.length < 8) return err("비밀번호는 8자 이상이어야 해요.");
      const id = await createOrg(name, loginId, password, str("contact", 200));
      if (typeof id !== "string") return err(id.error, 409);
      return Response.json({ id, loginId, password });
    }
    case "org-password": {
      const id = str("id", 20);
      const password = newPassword();
      await setOrgPassword(id, password);
      return Response.json({ id, password });
    }
    case "event-create": {
      const e = cleanEvent(b);
      if (typeof e === "string") return err(e);
      const orgId = str("orgId", 20) || null;
      const out = await createEvent(e, orgId);
      return Response.json({ code: out.code, staffPin: out.staffPin });
    }
    case "event-status": {
      await setEventStatus(str("code", 12), b.status === "confirmed" ? "confirmed" : "draft");
      return Response.json({ ok: true });
    }
    case "event-org": {
      await setEventOrg(str("code", 12), str("orgId", 20) || null);
      return Response.json({ ok: true });
    }
    case "inquiry-done": {
      await setInquiryDone(str("id", 20), b.done !== false);
      return Response.json({ ok: true });
    }
  }
  return err("없는 기능이에요.", 404);
}
