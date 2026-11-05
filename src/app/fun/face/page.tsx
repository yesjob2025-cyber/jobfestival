import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { FaceReading } from "./face-reading";

const event = funEvent("face");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function FacePage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <FaceReading />
    </>
  );
}
