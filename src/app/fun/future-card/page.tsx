import type { Metadata } from "next";
import { FutureCardStudio } from "@/components/future-card/studio";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";

const event = funEvent("future-card");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function FunFutureCardPage() {
  return (
    <div className="bg-white">
      <EventHero event={event} sub="사진 촬영 → 필터 · 소품 → 명함 내용 → 디자인, 1분이면 완성!" />
      <FutureCardStudio brand="kdu" />
    </div>
  );
}
