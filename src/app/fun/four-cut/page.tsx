import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { FourCutBooth } from "./four-cut-booth";

const event = funEvent("four-cut");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function FourCutPage() {
  return (
    <>
      <EventHero event={event} sub="5초마다 한 컷씩, 네 번 찍어요! 프레임 · 배경 · 필터는 찍은 뒤에 골라요" />
      <FourCutBooth />
    </>
  );
}
