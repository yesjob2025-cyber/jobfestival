"use client";

// 행사 운영 화면 공통 부품 — 행사 색(color)을 포인트로 씁니다.

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { shade } from "@/lib/ev/shared";

export { shade };

/** 상단 띠 + 가운데 정렬 본문 */
export function Shell(props: { color?: string; title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  const color = props.color ?? "#13399A";
  return (
    <div className="min-h-screen bg-ink-bg" style={{ ["--ev" as string]: color }}>
      <header className="text-white" style={{ background: `linear-gradient(135deg, ${color}, ${shade(color, -30)})` }}>
        <div className={`mx-auto flex items-center gap-3 px-5 py-5 ${props.wide ? "max-w-6xl" : "max-w-xl"}`}>
          <div className="min-w-0 flex-1">
            <h1 className="line-clamp-2 text-xl font-extrabold leading-snug sm:text-2xl">{props.title}</h1>
            {props.sub && <p className="mt-0.5 line-clamp-2 text-sm text-white/80">{props.sub}</p>}
          </div>
          {props.right}
        </div>
      </header>
      <main className={`mx-auto px-4 py-6 sm:px-5 ${props.wide ? "max-w-6xl" : "max-w-xl"}`}>{props.children}</main>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`card p-5 sm:p-6 ${className}`}>{children}</section>;
}

/** 행사 색 버튼 */
export function EvButton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "main" | "line" | "ghost" }) {
  const { tone = "main", className = "", ...rest } = props;
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition disabled:opacity-50";
  const look =
    tone === "main"
      ? "bg-[var(--ev)] text-white hover:brightness-110"
      : tone === "line"
        ? "border-2 border-[var(--ev)] bg-white text-[var(--ev)] hover:bg-ink-bg"
        : "text-ink-soft hover:bg-white";
  return <button type="button" {...rest} className={`${base} ${look} ${className}`} />;
}

export function Field(props: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">
        {props.label}
        {props.required && <span className="ml-0.5 text-kdu-pink">*</span>}
      </span>
      {props.children}
      {props.hint && <span className="mt-1 block text-xs text-ink-muted">{props.hint}</span>}
    </label>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="rounded-xl bg-[#FDECEF] px-4 py-3 text-sm font-bold text-[#B4234F]">{children}</p>;
}

/** 글자 → QR 이미지 */
export function QrImage({ text, size = 320, color = "#0B2A78", className = "" }: { text: string; size?: number; color?: string; className?: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    QRCode.toDataURL(text, { width: size * 2, margin: 1, color: { dark: color }, errorCorrectionLevel: "M" }).then(setUrl);
  }, [text, size, color]);
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="QR 코드" width={size} height={size} className={className} /> : <div style={{ width: size, height: size }} className={`animate-pulse rounded-xl bg-ink-line ${className}`} />;
}

export function Stat(props: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${props.accent ? "border-transparent bg-[var(--ev)] text-white" : "border-ink-line bg-white"}`}>
      <p className={`text-xs font-bold ${props.accent ? "text-white/80" : "text-ink-muted"}`}>{props.label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums">{props.value}</p>
      {props.sub && <p className={`mt-0.5 text-xs ${props.accent ? "text-white/80" : "text-ink-muted"}`}>{props.sub}</p>}
    </div>
  );
}

export async function api<T>(url: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "잠시 뒤 다시 시도해 주세요.");
  return data;
}
