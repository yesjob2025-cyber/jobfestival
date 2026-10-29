"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, Card, ErrorText, EvButton } from "./ui";

/** 관리자 · 스태프 PIN 로그인 — 맞으면 화면을 새로 그립니다 */
export function LoginBox({ code, what }: { code: string; what: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(`/api/ev/${code}/login`, { pin });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인하지 못했어요.");
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-ink">🔒 {what}</h2>
          <p className="mt-1 text-sm text-ink-muted">행사를 만들 때 받은 6자리 PIN 을 넣어 주세요. 스태프 PIN 은 스캐너 · 현장등록만 쓸 수 있어요.</p>
        </div>
        <input
          className="field py-4 text-center text-2xl tracking-[0.5em]"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          aria-label="PIN"
          autoFocus
        />
        <ErrorText>{error}</ErrorText>
        <EvButton type="submit" disabled={busy || pin.length !== 6} className="w-full">
          {busy ? "확인 중…" : "들어가기"}
        </EvButton>
      </form>
    </Card>
  );
}
