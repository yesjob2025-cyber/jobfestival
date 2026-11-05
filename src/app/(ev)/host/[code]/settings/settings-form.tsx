"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { draftOf, EventForm } from "@/components/ev/event-form";
import { api, Card, ErrorText, Shell } from "@/components/ev/ui";
import type { PublicEvent } from "@/lib/ev/shared";

export function SettingsForm({ event: ev }: { event: PublicEvent }) {
  const router = useRouter();
  return (
    <Shell color={ev.color} title="행사 설정" sub={ev.name} right={<a href={`/host/${ev.code}`} className="shrink-0 rounded-lg bg-white/15 px-3 py-2 text-sm font-bold">← 관리 화면</a>}>
      <LogoUpload event={ev} />
      <Card className="mt-5">
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

/** 로고 — 행사 페이지 · 부스 화면 · 결과 카드 구석에 들어가요 (투명 배경 PNG 추천) */
function LogoUpload({ event: ev }: { event: PublicEvent }) {
  const [logo, setLogo] = useState(ev.logo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File) {
    setBusy(true);
    setError("");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await img.decode();
      const k = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      const r = await api<{ logo: string }>(`/api/ev/${ev.code}/logo`, { image: c.toDataURL("image/png") });
      setLogo(r.logo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "올리지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-extrabold text-ink">로고</h2>
      <p className="mt-1 text-sm text-ink-muted">행사 페이지 · 부스 화면 · 결과 카드 구석에 들어가요. 투명 배경 PNG 를 추천해요.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex h-24 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-ink-line bg-white">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="행사 로고" className="max-h-20 max-w-36" />
          ) : (
            <span className="text-xs text-ink-muted">로고 없음</span>
          )}
        </div>
        <label className="btn-outline cursor-pointer">
          {busy ? "올리는 중…" : "이미지 고르기"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
        </label>
        {logo && (
          <button
            type="button"
            className="text-sm font-bold text-ink-muted underline"
            onClick={async () => {
              await api(`/api/ev/${ev.code}/logo`, { remove: true });
              setLogo("");
            }}
          >
            로고 지우기
          </button>
        )}
      </div>
      <div className="mt-3">
        <ErrorText>{error}</ErrorText>
      </div>
    </Card>
  );
}
