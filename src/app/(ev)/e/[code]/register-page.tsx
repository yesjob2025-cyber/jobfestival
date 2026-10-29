"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/ev/register-form";
import { Card, Shell } from "@/components/ev/ui";
import { dateRange, type PublicEvent } from "@/lib/ev/shared";

/** 이 기기에서 등록한 티켓을 기억해 두고, 다시 오면 바로 보여 줍니다 */
const key = (code: string) => `ev-ticket-${code}`;

export function RegisterPage({ event: ev }: { event: PublicEvent }) {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSaved(localStorage.getItem(key(ev.code)));
    } catch {}
  }, [ev.code]);

  return (
    <Shell color={ev.color} title={ev.name} sub={[ev.hostOrg, dateRange(ev.startsOn, ev.endsOn), ev.place].filter(Boolean).join(" · ")}>
      {saved && (
        <a href={`/t/${saved}`} className="mb-4 block rounded-2xl border-2 border-[var(--ev)] bg-white p-4 text-center font-bold text-[var(--ev)]">
          🎫 이미 등록하셨어요 — 내 입장 QR 보기 →
        </a>
      )}
      <Card>
        <h2 className="text-lg font-extrabold text-ink">사전등록</h2>
        <p className="mb-5 mt-1 text-sm text-ink-muted">등록하면 휴대폰에 입장 QR 이 생겨요. 행사장 입구에서 보여 주세요.</p>
        {ev.notice && <p className="mb-5 whitespace-pre-line rounded-xl bg-ink-bg p-4 text-sm text-ink-soft">{ev.notice}</p>}
        <RegisterForm
          event={ev}
          onDone={({ token, existed }) => {
            try {
              localStorage.setItem(key(ev.code), token);
            } catch {}
            router.push(`/t/${token}${existed ? "?again=1" : ""}`);
          }}
        />
      </Card>
    </Shell>
  );
}
