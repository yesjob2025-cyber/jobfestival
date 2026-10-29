import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { PalmReader } from "./palm-reader";

const event = funEvent("palm");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function PalmPage() {
  return (
    <>
      <EventHero event={event} sub="손바닥을 활짝 펴서 비춰 주세요! 진짜 손금 주름을 찾아 읽는 나의 직무 성향 (재미로 보는 손금)" />
      <PalmReader />
    </>
  );
}
