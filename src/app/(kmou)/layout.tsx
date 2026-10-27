import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
