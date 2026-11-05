import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { TarotGame } from "./tarot-game";

const event = funEvent("tarot");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function TarotPage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <TarotGame />
    </>
  );
}
