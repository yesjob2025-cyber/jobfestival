"use client";

// 행사 정보 입력 — 새 행사 만들기와 설정 고치기가 같이 씁니다.

import { useState } from "react";
import { DEFAULT_FIELDS, DEFAULT_SURVEY, FIELD_OPTIONS, type FieldId, type PublicEvent } from "@/lib/ev/shared";
import { ErrorText, EvButton, Field } from "./ui";

const COLORS = ["#13399A", "#08A0F6", "#0B3A79", "#2E9E6A", "#E4457A", "#7A3FD0", "#F08C00", "#1F2937"];

export interface EventDraft {
  name: string;
  hostOrg: string;
  place: string;
  startsOn: string;
  endsOn: string;
  color: string;
  fields: FieldId[];
  survey: string[];
  notice: string;
  retentionDays: number;
}

export function draftOf(ev?: PublicEvent): EventDraft {
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  return {
    name: ev?.name ?? "",
    hostOrg: ev?.hostOrg ?? "",
    place: ev?.place ?? "",
    startsOn: ev?.startsOn ?? today,
    endsOn: ev?.endsOn ?? today,
    color: ev?.color ?? COLORS[0],
    fields: ev?.fields ?? DEFAULT_FIELDS,
    survey: ev?.survey ?? DEFAULT_SURVEY,
    notice: ev?.notice ?? "",
    retentionDays: ev?.retentionDays ?? 30,
  };
}

export function EventForm(props: {
  initial: EventDraft;
  submitLabel: string;
  extra?: React.ReactNode;
  onSubmit: (d: EventDraft) => Promise<void>;
}) {
  const [d, setD] = useState(props.initial);
  const [surveyText, setSurveyText] = useState(props.initial.survey.join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof EventDraft>(k: K, v: EventDraft[K]) => setD({ ...d, [k]: v });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await props.onSubmit({ ...d, survey: surveyText.split("\n").map((s) => s.trim()).filter(Boolean) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" style={{ ["--ev" as string]: d.color }}>
      {props.extra}
      <Field label="행사 이름" required>
        <input className="field py-3 text-base" value={d.name} onChange={(e) => set("name", e.target.value)} maxLength={60} placeholder="예) 2026 경동대학교 Fun Fun Job Festival" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="주최 · 주관">
          <input className="field py-3" value={d.hostOrg} onChange={(e) => set("hostOrg", e.target.value)} maxLength={60} placeholder="예) 경동대학교 대학일자리플러스센터" />
        </Field>
        <Field label="장소">
          <input className="field py-3" value={d.place} onChange={(e) => set("place", e.target.value)} maxLength={80} placeholder="예) 학생회관 2층 대강당" />
        </Field>
        <Field label="시작일" required>
          <input type="date" className="field py-3" value={d.startsOn} onChange={(e) => setD({ ...d, startsOn: e.target.value, endsOn: d.endsOn < e.target.value ? e.target.value : d.endsOn })} required />
        </Field>
        <Field label="종료일" required>
          <input type="date" className="field py-3" value={d.endsOn} min={d.startsOn} onChange={(e) => set("endsOn", e.target.value)} required />
        </Field>
      </div>

      <Field label="대표 색" hint="등록 페이지 · 티켓 · 보고서에 쓰여요">
        <div className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => set("color", c)}
              className={`h-10 w-10 rounded-full border-4 ${d.color === c ? "border-ink" : "border-white"} shadow`}
              style={{ background: c }}
            />
          ))}
          <input type="color" value={d.color} onChange={(e) => set("color", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-ink-line" aria-label="직접 고르기" />
        </div>
      </Field>

      <Field label="등록할 때 받을 항목" hint="이름 · 휴대폰 번호는 항상 받아요">
        <div className="flex flex-wrap gap-2">
          {FIELD_OPTIONS.map((f) => {
            const on = d.fields.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => set("fields", on ? d.fields.filter((x) => x !== f.id) : [...d.fields, f.id])}
                className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${on ? "border-[var(--ev)] bg-[var(--ev)] text-white" : "border-ink-line bg-white text-ink-soft"}`}
              >
                {on ? "✓ " : ""}
                {f.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="퇴장 설문 문항 (5점 척도, 한 줄에 하나 · 최대 8개)" hint="끝에 자유 의견 칸은 자동으로 붙어요">
        <textarea className="field min-h-32 py-3 leading-relaxed" value={surveyText} onChange={(e) => setSurveyText(e.target.value)} />
      </Field>

      <Field label="등록 페이지 안내문 (선택)">
        <textarea className="field min-h-20 py-3" value={d.notice} onChange={(e) => set("notice", e.target.value)} maxLength={500} placeholder="예) 입장 QR 을 보여 주시면 기념품 교환권을 드려요" />
      </Field>

      <Field label="개인정보 보관 기간" hint="행사 종료 후 이 기간이 지나면 이름 · 연락처 · 학번 · 이메일을 자동으로 지우고 통계만 남겨요">
        <select className="field py-3" value={d.retentionDays} onChange={(e) => set("retentionDays", Number(e.target.value))}>
          {[7, 14, 30, 60, 90, 180].map((n) => (
            <option key={n} value={n}>
              종료 후 {n}일
            </option>
          ))}
        </select>
      </Field>

      <ErrorText>{error}</ErrorText>
      <EvButton type="submit" disabled={busy} className="w-full py-4 text-lg">
        {busy ? "저장 중…" : props.submitLabel}
      </EvButton>
    </form>
  );
}
