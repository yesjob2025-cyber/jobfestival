import type { Metadata } from "next";
import { EventHero } from "@/components/fun/ui";
import { funEvent } from "@/lib/fun/config";
import { JobTypeTest } from "./job-type-test";

const event = funEvent("job-type");

export const metadata: Metadata = { title: event.name, description: event.desc };

export default function JobTypePage() {
  return (
    <>
      <EventHero event={event} sub="12문항 · 1분! 홀랜드 직업 흥미 유형으로 나에게 맞는 직무를 찾아요" />
      <JobTypeTest />
    </>
  );
}
