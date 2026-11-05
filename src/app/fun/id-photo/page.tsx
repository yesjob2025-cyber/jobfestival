import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { IdPhotoStudio } from "./id-photo-studio";

const event = funEvent("id-photo");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function IdPhotoPage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <IdPhotoStudio />
    </>
  );
}
