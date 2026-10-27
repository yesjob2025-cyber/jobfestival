import type { Metadata } from "next";
import "./globals.css";
import { EXPO } from "@/lib/expo";

export const metadata: Metadata = {
  metadataBase: new URL(EXPO.siteUrl),
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
