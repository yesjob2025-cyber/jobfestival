"use client";

import { useEffect, useState } from "react";
import { RegisterForm } from "@/components/ev/register-form";
import { Card, EvButton, QrImage, Shell } from "@/components/ev/ui";
import type { PublicEvent } from "@/lib/ev/shared";

const RESET_SEC = 30;

/**
 * 현장 등록 (스태프 태블릿) — 등록하면 바로 입장 처리되고,
 * 화면의 QR 을 참가자가 자기 휴대폰으로 찍어 티켓(퇴장 · 설문용)을 가져갑니다. 30초 뒤 처음 화면으로.
 */
export function Onsite({ event: ev }: { event: PublicEvent }) {
  const [done, setDone] = useState<{ token: string; name: string; existed: boolean } | null>(null);
  const [round, setRound] = useState(0);
  const [left, setLeft] = useState(RESET_SEC);

  useEffect(() => {
    if (!done) return;
    setLeft(RESET_SEC);
    const t = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (done && left <= 0) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, done]);

  function next() {
    setDone(null);
    setRound((r) => r + 1);
    window.scrollTo({ top: 0 });
  }

  return (
    <Shell
      color={ev.color}
      title="현장 등록"
      sub={ev.name}
      right={
        <a href={`/host/${ev.code}/scan`} className="shrink-0 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold">
          스캐너
        </a>
      }
    >
      {done ? (
        <Card className="text-center">
          <p className="text-5xl">✅</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{done.name}님 입장 완료</p>
          {done.existed && <p className="mt-1 text-sm font-bold text-[var(--ev)]">이미 등록된 분이라 기존 티켓으로 입장했어요</p>}
          <p className="mt-5 font-bold text-ink-soft">📱 휴대폰 카메라로 찍어 티켓을 저장하세요</p>
          <p className="text-sm text-ink-muted">나갈 때 설문 · 퇴장 확인에 필요해요</p>
          <div className="mt-4 inline-block rounded-3xl border-4 border-[var(--ev)] p-3">
            <QrImage text={`${location.origin}/t/${done.token}`} size={240} color="#111827" />
          </div>
          <EvButton onClick={next} className="mt-6 w-full py-4 text-lg">
            다음 분 등록 ({left}초 뒤 자동)
          </EvButton>
        </Card>
      ) : (
        <Card>
          <h2 className="mb-5 text-lg font-extrabold text-ink">정보를 입력해 주세요</h2>
          <RegisterForm key={round} event={ev} onsite onDone={setDone} />
        </Card>
      )}
    </Shell>
  );
}
