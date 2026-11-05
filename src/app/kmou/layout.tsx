import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { EXPO } from "@/lib/expo";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: `${EXPO.title} | ${EXPO.dateLabel}`,
    template: `%s | ${EXPO.titleShort}`,
  },
  description: `${EXPO.dateLabel} ${EXPO.timeLabel} · ${EXPO.venue}. ${EXPO.boothSummary}, 채용설명회, 현직자 동문선배 멘토링, 부대 이벤트.`,
  openGraph: {
    title: EXPO.title,
    description: `${EXPO.dateLabel} ${EXPO.timeLabel} · ${EXPO.venue}`,
    siteName: EXPO.titleShort,
    locale: "ko_KR",
    type: "website",
  },
};

/** KMOU 취업박람회 페이지 공통 머리글 · 바닥글 */
export default function KmouLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
