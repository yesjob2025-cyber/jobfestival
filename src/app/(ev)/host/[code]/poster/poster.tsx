"use client";

import { useEffect, useState } from "react";
import { QrImage, shade } from "@/components/ev/ui";
import { dateRange, type PublicEvent } from "@/lib/ev/shared";

/** A4 한 장짜리 사전등록 · 현장 안내 포스터 — 인쇄하거나 PDF 로 저장 */
export function Poster({ event: ev }: { event: PublicEvent }) {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(`${location.origin}/e/${ev.code}`), [ev.code]);

  return (
    <div className="min-h-screen bg-ink-line/40 py-6 print:bg-white print:py-0">
      <style>{`@page { size: A4; margin: 0 } @media print { .no-print { display: none } }`}</style>
      <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-end gap-2 px-4">
        <button type="button" onClick={() => print()} className="rounded-xl bg-ink px-5 py-3 font-bold text-white">
          🖨️ 인쇄 · PDF 저장
        </button>
      </div>
      <article className="mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-white shadow-xl print:shadow-none">
        <header className="px-[18mm] pb-[14mm] pt-[18mm] text-white" style={{ background: `linear-gradient(140deg, ${ev.color}, ${shade(ev.color, -40)})` }}>
          {ev.hostOrg && <p className="text-[5mm] font-bold opacity-80">{ev.hostOrg}</p>}
          <h1 className="mt-[3mm] text-[12mm] font-extrabold leading-tight">{ev.name}</h1>
          <p className="mt-[4mm] text-[5.5mm] font-bold opacity-90">
            {dateRange(ev.startsOn, ev.endsOn)}
            {ev.place && ` · ${ev.place}`}
          </p>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-[18mm] text-center">
          <p className="text-[9mm] font-extrabold text-ink">📱 사전등록하고 입장 QR 받기</p>
          <p className="mt-[2mm] text-[5mm] text-ink-soft">휴대폰 카메라로 아래 QR 을 찍어 주세요</p>
          <div className="mt-[8mm] rounded-[8mm] border-[2mm] p-[5mm]" style={{ borderColor: ev.color }}>
            {url && <QrImage text={url} size={300} color="#111827" />}
          </div>
          <p className="mt-[4mm] font-mono text-[4.5mm] text-ink-muted">{url.replace(/^https?:\/\//, "")}</p>
          <ol className="mt-[10mm] grid w-full grid-cols-3 gap-[4mm] text-[4.5mm]">
            {[
              ["1", "QR 찍고 등록", "1분이면 끝나요"],
              ["2", "입구에서 QR 보여 주기", "빠르게 입장!"],
              ["3", "나갈 때 설문 · 기념품", "출구에서 QR 한 번 더"],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-[4mm] bg-ink-bg p-[4mm]">
                <span className="mx-auto flex h-[9mm] w-[9mm] items-center justify-center rounded-full text-[5mm] font-extrabold text-white" style={{ background: ev.color }}>
                  {n}
                </span>
                <p className="mt-[2mm] font-extrabold text-ink">{t}</p>
                <p className="text-[3.8mm] text-ink-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
        <footer className="px-[18mm] pb-[10mm] text-center text-[3.5mm] text-ink-muted">현장 등록도 가능해요 · 등록 데스크로 와 주세요</footer>
      </article>
    </div>
  );
}
