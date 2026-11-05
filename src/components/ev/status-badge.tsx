/** 행사 상태 — 준비 중 · 확정 */
export function StatusBadge({ status }: { status: "draft" | "confirmed" }) {
  return status === "confirmed" ? (
    <span className="shrink-0 rounded-full bg-[#E6F8EE] px-2.5 py-1 text-xs font-extrabold text-[#1F7A47]">✅ 확정</span>
  ) : (
    <span className="shrink-0 rounded-full bg-[#FFF6D1] px-2.5 py-1 text-xs font-extrabold text-[#8A6A00]">준비 중</span>
  );
}
