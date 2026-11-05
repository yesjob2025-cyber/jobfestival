import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { FourCutBooth } from "./four-cut-booth";

const event = funEvent("four-cut");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function FourCutPage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <FourCutBooth />
    </>
  );
}
