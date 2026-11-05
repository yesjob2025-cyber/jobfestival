"use client";

// 관리자 화면 공통 머리글 (운영자 콘솔 · 기관 관리)

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SERVICE } from "@/lib/service";
import { api } from "./ui";

export function AdminShell(props: { who: string; nav?: { href: string; label: string }[]; children: React.ReactNode; wide?: boolean }) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-ink-bg" style={{ ["--ev" as string]: "#13399A" }}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1F4D] text-white">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-kdu-yellow text-xs font-black text-[#0B1F4D]">JF</span>
            {SERVICE.name}
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1 text-sm">
            {props.nav?.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 font-bold text-white/80 hover:bg-white/10 hover:text-white">
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="text-xs font-bold text-white/70">{props.who}</span>
          <button
            type="button"
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/20"
            onClick={async () => {
              await api("/api/jf/logout", {});
              router.push("/login");
              router.refresh();
            }}
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className={`mx-auto px-4 py-6 ${props.wide === false ? "max-w-xl" : "max-w-6xl"}`}>{props.children}</main>
    </div>
  );
}
