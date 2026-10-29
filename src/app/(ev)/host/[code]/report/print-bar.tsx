"use client";

export function PrintBar({ back }: { back: string }) {
  return (
    <div className="no-print mx-auto mb-4 flex max-w-[210mm] justify-between gap-2 px-4">
      <a href={back} className="rounded-xl bg-white px-5 py-3 font-bold text-ink shadow">
        ← 관리 화면
      </a>
      <button type="button" onClick={() => print()} className="rounded-xl bg-ink px-5 py-3 font-bold text-white">
        🖨️ 인쇄 · PDF 저장
      </button>
    </div>
  );
}
