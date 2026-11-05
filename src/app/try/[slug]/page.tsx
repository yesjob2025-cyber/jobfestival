import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FUN_EVENTS } from "@/lib/fun/config";
import { SERVICE } from "@/lib/service";
import { TrialBooth } from "./trial-booth";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FUN_EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = FUN_EVENTS.find((x) => x.slug === slug);
  return e ? { title: `${e.name} 체험하기`, description: e.desc } : {};
}

export default async function TryPage({ params }: Props) {
  const { slug } = await params;
  const e = FUN_EVENTS.find((x) => x.slug === slug);
  if (!e) notFound();
  return <TrialBooth slug={e.slug} limit={SERVICE.trialLimit} />;
}
