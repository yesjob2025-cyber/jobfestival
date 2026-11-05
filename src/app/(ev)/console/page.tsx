import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { session } from "@/lib/ev/auth";
import { dbConfigured } from "@/lib/ev/db";
import { Console } from "./console";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "운영자 콘솔" };

export default async function Page() {
  if (!dbConfigured()) return <p className="p-10 text-center">데이터베이스가 아직 연결되지 않았어요.</p>;
  if (!(await session()).super) redirect("/login");
  return <Console />;
}
