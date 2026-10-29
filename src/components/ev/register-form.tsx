"use client";

// 참가자 등록 양식 — 사전등록(/e/행사코드)과 현장등록(스태프 태블릿)이 같이 씁니다.

import { useState } from "react";
import { FIELD_OPTIONS, type PublicEvent } from "@/lib/ev/shared";
import { api, ErrorText, EvButton, Field } from "./ui";

export function RegisterForm(props: {
  event: PublicEvent;
  onsite?: boolean;
  onDone: (r: { token: string; existed: boolean; name: string }) => void;
}) {
  const ev = props.event;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [info, setInfo] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fields = FIELD_OPTIONS.filter((f) => ev.fields.includes(f.id));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ token: string; existed: boolean }>(`/api/ev/${ev.code}/register`, { name, phone, info, consent, onsite: !!props.onsite });
      props.onDone({ ...r, name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="이름" required>
        <input className="field py-3 text-base" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="name" required />
      </Field>
      <Field label="휴대폰 번호" required hint="입장 확인과 티켓 다시 찾기에만 써요">
        <input
          className="field py-3 text-base"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-1234-5678"
          maxLength={13}
          required
        />
      </Field>
      {fields.map((f) =>
        "options" in f ? (
          <Field key={f.id} label={f.label}>
            <div className="grid grid-cols-3 gap-2">
              {f.options.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setInfo({ ...info, [f.id]: info[f.id] === o ? "" : o })}
                  className={`rounded-xl border-2 px-2 py-2.5 text-sm font-bold transition ${
                    info[f.id] === o ? "border-[var(--ev)] bg-[var(--ev)] text-white" : "border-ink-line bg-white text-ink-soft"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </Field>
        ) : (
          <Field key={f.id} label={f.label}>
            <input
              className="field py-3 text-base"
              value={info[f.id] ?? ""}
              onChange={(e) => setInfo({ ...info, [f.id]: e.target.value })}
              placeholder={f.placeholder}
              maxLength={60}
              inputMode={f.id === "studentNo" ? "numeric" : f.id === "email" ? "email" : undefined}
            />
          </Field>
        ),
      )}

      <div className="rounded-xl bg-ink-bg p-4 text-xs leading-relaxed text-ink-soft">
        <p className="mb-1 font-bold text-ink">개인정보 수집 · 이용 안내</p>
        <p>
          · 수집 항목: 이름, 휴대폰 번호{fields.length ? `, ${fields.map((f) => f.label).join(", ")}` : ""}
          <br />· 목적: {ev.name} 출입 확인, 참여 현황 집계 · 결과 보고
          <br />· 보관: 행사 종료 {ev.retentionDays}일 뒤 이름 · 연락처를 지우고 통계만 남깁니다
          <br />· 동의하지 않으면 등록할 수 없지만, 현장 데스크에서 도움을 받을 수 있어요
        </p>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold text-ink">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="h-5 w-5 accent-[var(--ev)]" />
          위 내용에 동의합니다 (필수)
        </label>
      </div>

      <ErrorText>{error}</ErrorText>
      <EvButton type="submit" disabled={busy} className="w-full py-4 text-lg">
        {busy ? "등록 중…" : props.onsite ? "등록하고 바로 입장" : "등록하고 입장 QR 받기"}
      </EvButton>
    </form>
  );
}
