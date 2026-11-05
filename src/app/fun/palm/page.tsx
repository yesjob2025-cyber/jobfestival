import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { PalmReader } from "./palm-reader";

const event = funEvent("palm");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function PalmPage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <PalmReader />
    </>
  );
}
