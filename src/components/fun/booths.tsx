"use client";

// 부대행사 9가지를 slug 로 고르는 목록 — 체험판(/try) · 행사 전용 부스(/e/코드/fun) 가 같이 씁니다.
// 각 부스 화면은 필요할 때만 받도록 나눠 둡니다.

import dynamic from "next/dynamic";
import { Spinner } from "./ui";

const loading = () => (
  <div className="wrap py-10">
    <Spinner text="준비하고 있어요…" />
  </div>
);

export const BOOTHS: Record<string, React.ComponentType> = {
  "future-card": dynamic(() => import("@/components/future-card/studio").then((m) => () => <m.FutureCardStudio brand="kdu" />), { ssr: false, loading }),
  tarot: dynamic(() => import("@/app/fun/tarot/tarot-game").then((m) => m.TarotGame), { ssr: false, loading }),
  face: dynamic(() => import("@/app/fun/face/face-reading").then((m) => m.FaceReading), { ssr: false, loading }),
  palm: dynamic(() => import("@/app/fun/palm/palm-reader").then((m) => m.PalmReader), { ssr: false, loading }),
  animal: dynamic(() => import("@/app/fun/animal/animal-test").then((m) => m.AnimalTest), { ssr: false, loading }),
  "four-cut": dynamic(() => import("@/app/fun/four-cut/four-cut-booth").then((m) => m.FourCutBooth), { ssr: false, loading }),
  "id-photo": dynamic(() => import("@/app/fun/id-photo/id-photo-studio").then((m) => m.IdPhotoStudio), { ssr: false, loading }),
  intro: dynamic(() => import("@/app/fun/intro/intro-studio").then((m) => () => <m.IntroStudio />), { ssr: false, loading }),
  "job-type": dynamic(() => import("@/app/fun/job-type/job-type-test").then((m) => m.JobTypeTest), { ssr: false, loading }),
};
