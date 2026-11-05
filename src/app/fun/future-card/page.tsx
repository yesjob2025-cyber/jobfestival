import type { Metadata } from "next";
import { FutureCardStudio } from "@/components/future-card/studio";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";

const event = funEvent("future-card");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function FunFutureCardPage() {
  return (
    <div className="bg-white">
      <EventHero event={event} sub={event.sub} />
      <FutureCardStudio brand="kdu" />
    </div>
  );
}
