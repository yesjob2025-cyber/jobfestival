"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { draftOf, EventForm } from "@/components/ev/event-form";
import { api, Card, EvButton, Field, Shell } from "@/components/ev/ui";

interface Created {
  code: string;
  adminPin: string;
  staffPin: string;
}

export function HostHome() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [status, setStatus] = useState<{ db: boolean; create: boolean } | null>(null);

  useEffect(() => {
    api<{ db: boolean; create: boolean }>("/api/ev/create").then(setStatus).catch(() => setStatus({ db: false, create: false }));
  }, []);

  if (created) return <CreatedView c={created} />;

  return (
    <Shell title="행사 운영 시스템" sub="사전등록 → QR 입장 → 퇴장 설문 → 결과보고서">
      {status && !status.db && (
        <p className="mb-4 rounded-xl bg-[#FFF6D1] px-4 py-3 text-sm font-bold text-[#8A6A00]">
          데이터베이스가 아직 연결되지 않았어요. Vercel → Storage 에서 Postgres(Neon)를 연결해 주세요.
        </p>
      )}
      <Card>
        <h2 className="text-lg font-extrabold text-ink">내 행사 열기</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) router.push(`/host/${code.trim().toLowerCase()}`);
          }}
        >
          <input className="field py-3 text-base" value={code} onChange={(e) => setCode(e.target.value)} placeholder="행사 코드 (예: k7m2pq)" aria-label="행사 코드" />
          <EvButton type="submit" className="shrink-0">
            열기
          </EvButton>
        </form>
      </Card>

      <Card className="mt-5">
        <h2 className="text-lg font-extrabold text-ink">새 행사 만들기</h2>
        <p className="mb-5 mt-1 text-sm text-ink-muted">5분이면 끝나요. 만들고 나면 등록 페이지 · QR 포스터 · 스캐너 주소가 바로 나와요.</p>
        <EventForm
          initial={draftOf()}
          submitLabel="행사 만들기"
          extra={
            <Field label="개설 코드" required hint="서비스 담당자에게 받은 코드예요">
              <input className="field py-3" value={createCode} onChange={(e) => setCreateCode(e.target.value)} type="password" autoComplete="off" required />
            </Field>
          }
          onSubmit={async (d) => setCreated(await api<Created>("/api/ev/create", { ...d, createCode }))}
        />
      </Card>
    </Shell>
  );
}

function CreatedView({ c }: { c: Created }) {
  return (
    <Shell title="행사가 만들어졌어요 🎉" sub="아래 정보를 꼭 저장해 두세요">
      <Card>
        <dl className="grid gap-3">
          <Row label="행사 코드" value={c.code} />
          <Row label="관리자 PIN" value={c.adminPin} hint="현황 · 명단 · 보고서 · 설정 (담당자만)" />
          <Row label="스태프 PIN" value={c.staffPin} hint="입장 · 퇴장 스캐너, 현장등록 (현장 스태프에게 알려 주세요)" />
        </dl>
        <p className="mt-4 rounded-xl bg-[#FFF6D1] px-4 py-3 text-sm font-bold text-[#8A6A00]">
          ⚠️ PIN 은 지금 한 번만 보여요. 캡처하거나 적어 두세요. (잊으면 관리 화면에서 새로 발급할 수 있어요)
        </p>
        <a href={`/host/${c.code}`} className="mt-5 flex w-full items-center justify-center rounded-xl bg-[var(--ev)] px-5 py-4 text-lg font-bold text-white">
          관리 화면으로 →
        </a>
      </Card>
    </Shell>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-ink-line p-4">
      <dt className="text-xs font-bold text-ink-muted">{label}</dt>
      <dd className="mt-1 font-mono text-3xl font-extrabold tracking-widest text-ink">{value}</dd>
      {hint && <dd className="mt-1 text-xs text-ink-muted">{hint}</dd>}
    </div>
  );
}
