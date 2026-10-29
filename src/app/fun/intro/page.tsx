import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { IntroStudio } from "./intro-studio";

const event = funEvent("intro");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function IntroPage() {
  return (
    <>
      <EventHero event={event} sub="직무와 장점을 고르면 AI가 1분 대본을 써 줘요. 화면의 대본을 읽으며 영상으로 찍어 가세요!" />
      <IntroStudio />
    </>
  );
}
