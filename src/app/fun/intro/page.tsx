import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import type { TypeId } from "@/lib/fun/job-type";
import { IntroStudio } from "./intro-studio";

const event = funEvent("intro");

export const metadata: Metadata = { title: event.name, description: event.desc };

const IDS = ["R", "I", "A", "S", "E", "C"];

export default async function IntroPage({ searchParams }: { searchParams: Promise<{ type?: string; second?: string }> }) {
  // 직무 유형 테스트에서 넘어오면 진단을 건너뛰고 강점 고르기부터
  const q = await searchParams;
  const from = q.type && q.second && IDS.includes(q.type) && IDS.includes(q.second) && q.type !== q.second ? { type: q.type, second: q.second } : null;
  return (
    <>
      <EventHero event={event} sub="직무 유형을 진단하고, 내 강점을 희망 직무가 원하는 역량과 맞춰 AI가 1분 대본을 써 줘요. 대본을 읽으며 영상으로 찍어 가세요!" />
      <IntroStudio from={from as { type: TypeId; second: TypeId } | null} />
    </>
  );
}
