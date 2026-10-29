"use client";

import { useRouter } from "next/navigation";
import { draftOf, EventForm } from "@/components/ev/event-form";
import { api, Card, Shell } from "@/components/ev/ui";
import type { PublicEvent } from "@/lib/ev/shared";

export function SettingsForm({ event: ev }: { event: PublicEvent }) {
  const router = useRouter();
  return (
    <Shell color={ev.color} title="행사 설정" sub={ev.name} right={<a href={`/host/${ev.code}`} className="shrink-0 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold">← 관리 화면</a>}>
      <Card>
        <p className="mb-5 rounded-xl bg-ink-bg px-4 py-3 text-xs text-ink-muted">
          행사 중에 설문 문항 순서를 바꾸면 이미 받은 답과 문항이 어긋나요. 문항은 행사 전에 정해 주세요.
        </p>
        <EventForm
          initial={draftOf(ev)}
          submitLabel="저장하기"
          onSubmit={async (d) => {
            await api(`/api/ev/${ev.code}/settings`, d);
            router.push(`/host/${ev.code}`);
            router.refresh();
          }}
        />
      </Card>
    </Shell>
  );
}
