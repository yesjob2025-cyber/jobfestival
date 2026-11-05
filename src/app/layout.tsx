import type { Metadata } from "next";
import "./globals.css";
import { EXPO } from "@/lib/expo";
import { SERVICE } from "@/lib/service";

export const metadata: Metadata = {
  metadataBase: new URL(EXPO.siteUrl),
  title: {
    default: `${SERVICE.name} | ${SERVICE.tagline}`,
    template: `%s | ${SERVICE.name}`,
  },
  description: SERVICE.description,
  openGraph: {
    title: `${SERVICE.name} — ${SERVICE.tagline}`,
    description: SERVICE.description,
    siteName: SERVICE.name,
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
