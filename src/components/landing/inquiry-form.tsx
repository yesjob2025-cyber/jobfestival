"use client";

import { useState } from "react";
import { FUN_EVENTS } from "@/lib/fun/config";

/** 첫 화면 도입 문의 — 운영자 콘솔에서 확인합니다 */
export function InquiryForm() {
  const [f, setF] = useState({ org: "", name: "", phone: "", email: "", eventDate: "", size: "", message: "" });
  const [booths, setBooths] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/jf/inquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, booths }) }).catch(() => null);
    const body = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : { error: "보내지 못했어요. 잠시 뒤 다시 시도해 주세요." };
    if (!res?.ok) {
      setError(body.error ?? "보내지 못했어요.");
      setState("idle");
      return;
    }
    setState("done");
  }

  if (state === "done")
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-5xl">📮</p>
        <p className="mt-3 text-2xl font-extrabold text-ink">문의가 접수됐어요</p>
        <p className="mt-2 text-ink-soft">남겨 주신 연락처로 곧 연락드릴게요. 감사합니다!</p>
      </div>
    );

  const input = "w-full rounded-xl border border-ink-line bg-white px-4 py-3 text-base text-ink focus:border-[#13399A] focus:outline-none focus:ring-2 focus:ring-[#13399A]/20";
  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-bold text-ink">학교 · 기관 이름 *</span>
          <input className={input} value={f.org} onChange={set("org")} placeholder="예) ○○대학교 대학일자리플러스센터" required maxLength={60} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">담당자 이름 *</span>
          <input className={input} value={f.name} onChange={set("name")} required maxLength={30} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">전화번호</span>
          <input className={input} value={f.phone} onChange={set("phone")} inputMode="tel" placeholder="010-0000-0000" maxLength={20} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">이메일</span>
          <input className={input} value={f.email} onChange={set("email")} type="email" maxLength={80} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-ink">행사 예정일</span>
          <input className={input} value={f.eventDate} onChange={set("eventDate")} placeholder="예) 2027년 5월 중순" maxLength={40} />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-bold text-ink">예상 참가 인원</span>
          <input className={input} value={f.size} onChange={set("size")} placeholder="예) 500명, 부스 30개" maxLength={40} />
        </label>
      </div>
      <div>
        <p className="mb-2 text-sm font-bold text-ink">관심 있는 부대행사</p>
        <div className="flex flex-wrap gap-2">
          {FUN_EVENTS.map((e) => {
            const on = booths.includes(e.slug);
            return (
              <button
                key={e.slug}
                type="button"
                aria-pressed={on}
                onClick={() => setBooths(on ? booths.filter((x) => x !== e.slug) : [...booths, e.slug])}
                className={`rounded-full border-2 px-3.5 py-2 text-sm font-bold transition ${on ? "border-[#13399A] bg-[#13399A] text-white" : "border-ink-line text-ink-soft"}`}
              >
                {e.emoji} {e.name}
              </button>
            );
          })}
        </div>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-ink">문의 내용</span>
        <textarea className={`${input} min-h-28`} value={f.message} onChange={set("message")} maxLength={1000} placeholder="행사 규모, 원하는 일정, 궁금한 점을 자유롭게 적어 주세요" />
      </label>
      {error && <p className="rounded-xl bg-[#FDECEF] px-4 py-3 text-sm font-bold text-[#B4234F]">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="w-full rounded-2xl bg-[#13399A] py-4 text-lg font-extrabold text-white shadow-[0_5px_0_#0B2A78] transition hover:bg-[#0B2A78] disabled:opacity-60">
        {state === "sending" ? "보내는 중…" : "도입 문의 보내기"}
      </button>
      <p className="text-center text-xs text-ink-muted">남겨 주신 정보는 상담 연락에만 써요.</p>
    </form>
  );
}
