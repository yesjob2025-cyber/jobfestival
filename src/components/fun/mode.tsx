"use client";

// 부대행사 화면이 어디서 열렸는지 — /fun(경동대 · 제한 없음) · 체험판(/try) · 행사 전용 부스(/e/코드/fun)
// 결과가 나오면 useFunDone 이 알려 주고, 체험판은 횟수를 세고 행사 부스는 참여 수를 기록합니다.

import { createContext, useContext, useEffect, useRef } from "react";

export type FunMode = { kind: "public" } | { kind: "trial" } | { kind: "event"; code: string };

const ModeContext = createContext<FunMode>({ kind: "public" });

export function FunModeProvider({ mode, children }: { mode: FunMode; children: React.ReactNode }) {
  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>;
}

export const useFunMode = () => useContext(ModeContext);

/** 결과 화면이 처음 보일 때 한 번 부릅니다 */
export function useFunDone(slug: string) {
  const mode = useFunMode();
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    if (mode.kind === "trial") addTrial(slug);
    if (mode.kind === "event") {
      fetch(`/api/ev/${mode.code}/play`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ booth: slug }),
      }).catch(() => {});
    }
  }, [mode, slug]);
}

// ── 체험판 횟수 (이 기기 기준 — localStorage 와 쿠키 중 큰 값) ─────────────

const key = (slug: string) => `jf-trial-${slug}`;

export function trialCount(slug: string): number {
  let a = 0;
  let b = 0;
  try {
    a = Number(localStorage.getItem(key(slug)) ?? 0) || 0;
  } catch {}
  const m = new RegExp(`(?:^|; )${key(slug)}=(\\d+)`).exec(document.cookie);
  if (m) b = Number(m[1]);
  return Math.max(a, b);
}

function addTrial(slug: string) {
  const n = trialCount(slug) + 1;
  try {
    localStorage.setItem(key(slug), String(n));
  } catch {}
  document.cookie = `${key(slug)}=${n}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  window.dispatchEvent(new CustomEvent("jf-trial", { detail: { slug, n } }));
}

