import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { IdPhotoStudio } from "./id-photo-studio";

const event = funEvent("id-photo");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function IdPhotoPage() {
  return (
    <>
      <EventHero event={event} sub="평상복 그대로 찍어도 OK! 정장 · 배경색을 골라 3:4 증명사진으로 만들어 드려요" />
      <IdPhotoStudio />
    </>
  );
}
