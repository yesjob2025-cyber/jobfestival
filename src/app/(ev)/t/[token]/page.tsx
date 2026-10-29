import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dbConfigured } from "@/lib/ev/db";
import { getTicket } from "@/lib/ev/service";
import { TicketView } from "./ticket-view";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }>; searchParams: Promise<{ again?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!dbConfigured()) return {};
  const t = await getTicket((await params).token);
  return t ? { title: `${t.event.name} 입장 QR` } : {};
}

export default async function Page({ params, searchParams }: Props) {
  if (!dbConfigured()) return <p className="p-10 text-center">데이터베이스가 아직 연결되지 않았어요.</p>;
  const t = await getTicket((await params).token);
  if (!t) notFound();
  return <TicketView initial={t} again={(await searchParams).again === "1"} />;
}
