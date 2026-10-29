import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { TarotGame } from "./tarot-game";

const event = funEvent("tarot");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function TarotPage() {
  return (
    <>
      <EventHero event={event} sub="고민을 고르고 카드 3장을 뽑으면, 나의 취업운을 알려 드려요! (재미로 보는 운세)" />
      <TarotGame />
    </>
  );
}
