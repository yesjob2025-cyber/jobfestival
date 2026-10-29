import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "행사 운영", template: "%s" },
  robots: { index: false, follow: false },
};

/** 행사 운영 (등록 · 티켓 · 담당자 화면) — 각 페이지가 행사 색으로 머리글을 그립니다 */
export default function EvLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
