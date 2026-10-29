// 행사 운영 — 관리자 · 스태프 PIN 확인과 로그인 쿠키 (서버 전용)
//
// 행사마다 관리자 PIN(현황 · 명단 · 보고서)과 스태프 PIN(스캐너 · 현장등록)이 따로 있고,
// PIN 은 해시로만 저장합니다. 로그인하면 12시간짜리 서명 쿠키를 줍니다.

import { createHash, createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Role = "admin" | "staff";

const HOURS = 12;

function secret() {
  const s = process.env.EVENT_SECRET || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!s) throw new Error("EVENT_SECRET not set");
  return createHash("sha256").update(`ev:${s}`).digest();
}

export function hashPin(pin: string) {
  const salt = randomBytes(12).toString("base64url");
  return `${salt}.${scryptSync(pin, salt, 32).toString("base64url")}`;
}

export function checkPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(".");
  if (!salt || !hash) return false;
  const a = scryptSync(pin, salt, 32);
  const b = Buffer.from(hash, "base64url");
  return a.length === b.length && timingSafeEqual(a, b);
}

export const newPin = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

const cookieName = (code: string) => `ev_${code}`;

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export async function login(code: string, role: Role) {
  const exp = Date.now() + HOURS * 3600_000;
  const body = `${code}.${role}.${exp}`;
  (await cookies()).set(cookieName(code), `${body}.${sign(body)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HOURS * 3600,
  });
}

export async function logout(code: string) {
  (await cookies()).delete(cookieName(code));
}

/** 지금 로그인한 역할 (없으면 null) */
export async function roleOf(code: string): Promise<Role | null> {
  const v = (await cookies()).get(cookieName(code))?.value;
  if (!v) return null;
  const parts = v.split(".");
  if (parts.length !== 4) return null;
  const [c, role, exp, sig] = parts;
  const body = `${c}.${role}.${exp}`;
  const good = Buffer.from(sign(body));
  const got = Buffer.from(sig);
  if (c !== code || good.length !== got.length || !timingSafeEqual(good, got)) return null;
  if (Number(exp) < Date.now()) return null;
  return role === "admin" || role === "staff" ? role : null;
}

/** 스태프 화면 — 관리자도 들어갈 수 있음 */
export async function isStaff(code: string) {
  return (await roleOf(code)) !== null;
}

export async function isAdmin(code: string) {
  return (await roleOf(code)) === "admin";
}

/** 새 행사를 만들 수 있는 개설 코드 (환경변수 EVENT_CREATE_CODE) */
export function checkCreateCode(code: string) {
  const want = process.env.EVENT_CREATE_CODE;
  if (!want) return false;
  const a = createHash("sha256").update(code).digest();
  const b = createHash("sha256").update(want).digest();
  return timingSafeEqual(a, b);
}
