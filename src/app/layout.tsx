import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPassSession } from "@/lib/session";
import { FEST } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(FEST.siteUrl),
  title: {
    default: `${FEST.title} | ${FEST.dateLabel}`,
    template: `%s | ${FEST.title}`,
  },
  description: `${FEST.tagline} — ${FEST.dateLabel} ${FEST.timeLabel}, 기업관·직무관·홍보관·부대행사. ${FEST.hostLine}`,
  openGraph: {
    title: FEST.title,
    description: `${FEST.dateLabel} ${FEST.timeLabel} · 기업관 / 직무관 / 홍보관 / 부대행사`,
    siteName: FEST.title,
    locale: "ko_KR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pass = await getPassSession();
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <div className="fest-shell flex min-h-screen flex-col">
          <SiteHeader hasPass={Boolean(pass?.vid)} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
