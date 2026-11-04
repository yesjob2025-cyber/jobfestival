import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { FaceReading } from "./face-reading";

const event = funEvent("face");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function FacePage() {
  return (
    <>
      <EventHero event={event} sub="얼굴을 비추면 이마 · 눈 · 코 · 입 · 턱을 재서 직장운으로 풀이해 줘요. (재미로 보는 관상)" />
      <FaceReading />
    </>
  );
}
