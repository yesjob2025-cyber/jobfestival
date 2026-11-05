import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbConfigured } from "@/lib/ev/db";
import { getEvent } from "@/lib/ev/service";
import { RegisterPage } from "./register-page";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!dbConfigured()) return {};
  const ev = await getEvent((await params).code);
  return ev ? { title: `${ev.name} 사전등록` } : {};
}

export default async function Page({ params }: Props) {
  if (!dbConfigured()) return <p className="p-10 text-center">데이터베이스가 아직 연결되지 않았어요.</p>;
  const ev = await getEvent((await params).code);
  if (!ev) notFound();
  return <RegisterPage event={ev} />;
}
