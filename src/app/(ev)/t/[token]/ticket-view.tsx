"use client";

import { useEffect, useState } from "react";
import { api, Card, ErrorText, EvButton, QrImage, Shell } from "@/components/ev/ui";
import { dateRange, kst, SCALE, type Ticket } from "@/lib/ev/shared";

/** 참가자 티켓 — 입장 QR → (입장하면) 만족도 설문 → 퇴장 QR → 끝 */
export function TicketView({ initial, again }: { initial: Ticket; again: boolean }) {
  const [t, setT] = useState(initial);
  const ev = t.event;
  const link = typeof window === "undefined" ? `/t/${t.token}` : `${location.origin}/t/${t.token}`;

  // 스태프가 스캔하면 화면이 저절로 바뀌도록 몇 초마다 확인
  useEffect(() => {
    if (t.stage === "exited") return;
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      api<Ticket>(`/api/ev/ticket/${t.token}`).then(setT).catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [t.token, t.stage]);

  const qr = (caption: string) => (
    <div className="flex flex-col items-center">
      <div className="rounded-3xl border-4 border-[var(--ev)] bg-white p-3">
        <QrImage text={link} size={240} color="#111827" />
      </div>
      <p className="mt-3 text-center text-sm font-bold text-ink-soft">{caption}</p>
    </div>
  );

  return (
    <Shell color={ev.color} title={ev.name} sub={[dateRange(ev.startsOn, ev.endsOn), ev.place].filter(Boolean).join(" · ")}>
      <Card className="text-center">
        <p className="text-sm font-bold text-ink-muted">참가자</p>
        <p className="mt-0.5 text-3xl font-extrabold text-ink">{t.name}</p>
        {again && t.stage === "registered" && <p className="mt-2 text-sm font-bold text-[var(--ev)]">이미 등록된 번호예요 — 기존 입장 QR 이에요</p>}

        <Steps stage={t.stage} />

        {t.stage === "registered" && (
          <div className="mt-6">
            {qr("행사장 입구에서 이 QR 을 보여 주세요")}
            <p className="mt-4 rounded-xl bg-ink-bg px-4 py-3 text-xs text-ink-muted">
              💡 이 화면을 캡처하거나 주소를 저장해 두세요. 화면 밝기를 높이면 더 빨리 읽혀요.
            </p>
          </div>
        )}

        {t.stage === "entered" && (
          <div className="mt-6 text-left">
            <p className="rounded-xl bg-[#E6F8EE] px-4 py-3 text-center font-bold text-[#1F7A47]">✅ {kst(t.enteredAt)} 입장 완료 — 즐거운 시간 보내세요!</p>
            <Survey ticket={t} onDone={setT} />
            <details className="mt-5 text-center">
              <summary className="cursor-pointer text-sm font-bold text-ink-muted">설문 없이 퇴장 QR 보기</summary>
              <div className="mt-4">{qr("출구에서 이 QR 을 보여 주세요")}</div>
            </details>
          </div>
        )}

        {t.stage === "surveyed" && (
          <div className="mt-6">
            <p className="mb-5 rounded-xl bg-[#FFF6D1] px-4 py-3 font-bold text-[#8A6A00]">🎁 설문 감사합니다! 출구에서 QR 을 보여 주시면 기념품을 드려요</p>
            {qr("출구에서 이 QR 을 보여 주세요")}
          </div>
        )}

        {t.stage === "exited" && (
          <div className="mt-6 space-y-2">
            <p className="text-5xl">🙌</p>
            <p className="text-lg font-extrabold text-ink">참여해 주셔서 감사합니다</p>
            <p className="text-sm text-ink-muted">
              입장 {kst(t.enteredAt)} · 퇴장 {kst(t.exitedAt)}
            </p>
            {!t.surveyDone && <Survey ticket={t} onDone={setT} />}
          </div>
        )}
      </Card>
    </Shell>
  );
}

function Steps({ stage }: { stage: Ticket["stage"] }) {
  const order = ["registered", "entered", "surveyed", "exited"] as const;
  const at = order.indexOf(stage);
  const names = ["등록", "입장", "설문", "퇴장"];
  return (
    <ol className="mx-auto mt-5 grid max-w-xs grid-cols-4 gap-1">
      {names.map((n, i) => (
        <li key={n} className="flex flex-col items-center gap-1">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${i <= at ? "bg-[var(--ev)] text-white" : "bg-ink-line text-ink-muted"}`}>
            {i <= at ? "✓" : i + 1}
          </span>
          <span className={`text-xs font-bold ${i <= at ? "text-ink" : "text-ink-muted"}`}>{n}</span>
        </li>
      ))}
    </ol>
  );
}

function Survey({ ticket, onDone }: { ticket: Ticket; onDone: (t: Ticket) => void }) {
  const qs = ticket.event.survey;
  const [scores, setScores] = useState<number[]>(qs.map(() => 0));
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const left = scores.filter((s) => !s).length;

  async function submit() {
    setBusy(true);
    setError("");
    try {
      onDone(await api<Ticket>(`/api/ev/ticket/${ticket.token}`, { scores, comment }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-ink-line p-4 text-left">
      <h3 className="text-lg font-extrabold text-ink">📝 퇴장 전 만족도 설문 (1분)</h3>
      <p className="mb-4 text-sm text-ink-muted">참여하면 출구에서 기념품을 받을 수 있어요</p>
      <div className="space-y-5">
        {qs.map((question, i) => (
          <fieldset key={i}>
            <legend className="mb-2 text-[15px] font-bold text-ink">
              {i + 1}. {question}
            </legend>
            <div className="grid grid-cols-5 gap-1.5">
              {SCALE.map((label, k) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setScores(scores.map((s, j) => (j === i ? k + 1 : s)))}
                  className={`whitespace-pre-line rounded-xl border-2 px-0.5 py-2 text-[11px] font-bold leading-tight transition ${
                    scores[i] === k + 1 ? "border-[var(--ev)] bg-[var(--ev)] text-white" : "border-ink-line bg-white text-ink-soft"
                  }`}
                  aria-pressed={scores[i] === k + 1}
                >
                  <span className="block text-lg">{["😞", "🙁", "😐", "🙂", "😍"][k]}</span>
                  {label.replace("매우 ", "매우\n")}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <label className="block">
          <span className="mb-1.5 block text-[15px] font-bold text-ink">하고 싶은 말 (선택)</span>
          <textarea className="field min-h-20" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} />
        </label>
      </div>
      <div className="mt-4 space-y-3">
        <ErrorText>{error}</ErrorText>
        <EvButton onClick={submit} disabled={busy || left > 0} className="w-full py-4 text-lg">
          {busy ? "보내는 중…" : left ? `${left}개 문항이 남았어요` : "설문 제출하기"}
        </EvButton>
      </div>
    </div>
  );
}
