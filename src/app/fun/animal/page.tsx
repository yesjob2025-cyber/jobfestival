import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { AnimalTest } from "./animal-test";

const event = funEvent("animal");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function AnimalPage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <AnimalTest />
    </>
  );
}
