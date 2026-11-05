"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, Card, ErrorText, EvButton, Field } from "@/components/ev/ui";
import { SERVICE } from "@/lib/service";

export function LoginForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ kind: "super" | "org" }>("/api/jf/login", { id, password });
      router.push(r.kind === "super" ? "/console" : "/manage");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인하지 못했어요.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(160deg,#0B1F4D,#13399A_60%,#08A0F6)] px-4" style={{ ["--ev" as string]: "#13399A" }}>
      <Card className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-kdu-yellow text-xs font-black text-[#0B1F4D]">JF</span>
          {SERVICE.name}
        </Link>
        <h1 className="mt-5 text-xl font-extrabold text-ink">학교 · 기관 관리자 로그인</h1>
        <p className="mt-1 text-sm text-ink-muted">발급받은 아이디와 비밀번호를 넣어 주세요.</p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="아이디">
            <input className="field py-3" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" autoCapitalize="none" required />
          </Field>
          <Field label="비밀번호">
            <input className="field py-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          <ErrorText>{error}</ErrorText>
          <EvButton type="submit" disabled={busy} className="w-full">
            {busy ? "확인 중…" : "로그인"}
          </EvButton>
        </form>
        <p className="mt-5 text-center text-xs text-ink-muted">
          아직 계정이 없나요?{" "}
          <Link href="/#contact" className="font-bold text-[var(--ev)] underline">
            도입 문의하기
          </Link>
        </p>
      </Card>
    </div>
  );
}
