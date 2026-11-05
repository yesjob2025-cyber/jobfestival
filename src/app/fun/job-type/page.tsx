import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { JobTypeTest } from "./job-type-test";

const event = funEvent("job-type");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function JobTypePage() {
  return (
    <>
      <EventHero event={event} sub={event.sub} />
      <JobTypeTest />
    </>
  );
}
