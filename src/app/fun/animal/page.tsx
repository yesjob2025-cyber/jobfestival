import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { AnimalTest } from "./animal-test";

const event = funEvent("animal");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function AnimalPage() {
  return (
    <>
      <EventHero event={event} sub="눈매 · 얼굴형으로 보는 나의 동물상! 어울리는 직무와 찰떡 동료까지 (재미로 보는 테스트)" />
      <AnimalTest />
    </>
  );
}
