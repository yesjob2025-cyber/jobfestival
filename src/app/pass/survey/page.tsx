import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getPassSession } from "@/lib/session";
import { getSurvey } from "@/lib/repo";
import { SurveyForm } from "./survey-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "만족도 설문",
};

export default async function SurveyPage() {
  const pass = await getPassSession();
  if (!pass?.vid) redirect("/pass/find");

  const existing = await getSurvey(pass.vid);

  return (
    <>
      <PageHero
        eyebrow="Survey"
        title="만족도 설문"
        description="참여해 주셔서 감사합니다. 설문 결과는 다음 행사 기획에 직접 반영됩니다. (약 1분 소요)"
      />
      <div className="fest-container py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <div className="fest-card p-6 sm:p-8">
            <SurveyForm existing={existing} />
          </div>
        </div>
      </div>
    </>
  );
}
