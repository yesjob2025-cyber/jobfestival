import "server-only";
import { headers } from "next/headers";

/**
 * 요청 도메인 기준 절대 URL.
 * 입장 QR 에는 이 절대 URL 이 들어가므로 어떤 QR 앱으로 찍어도 열립니다.
 */
export async function absoluteUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? new URL(process.env.SITE_URL ?? "https://jobfestival.co.kr").host;
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return `${proto}://${host}${path}`;
}
