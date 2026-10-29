import type { Metadata } from "next";
import { get, head, issueSignedToken, presignUrl } from "@vercel/blob";
import { SaveButtons } from "@/components/fun/save-buttons";
import { FUN } from "@/lib/fun/config";
import { blobConfigured } from "@/lib/future-card/blob";
import { BackLink, NotFound } from "@/components/fun/receive";

export const metadata: Metadata = {
  title: "내 자기소개 영상 받기",
  robots: { index: false, follow: false },
};

const ID = /^[a-z0-9]{20}\.(mp4|webm)$/;

/** 1분 자기소개 영상 받기 — 비공개 저장소의 영상을 1시간짜리 서명 주소로 보여 줍니다 (아이폰 재생에 필요한 구간 요청 지원). */
export default async function ReceiveVideoPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const found = id && ID.test(id) && blobConfigured() ? await load(id) : null;

  return (
    <section className="wrap max-w-2xl py-10">
      {found ? (
        <>
          <p className="text-center font-fun text-lg font-bold text-kdu-sky">{FUN.festival}</p>
          <h1 className="mt-1 text-center font-jua text-3xl text-kdu-navy-deep sm:text-4xl">내 1분 자기소개 영상 🎤</h1>
          <video src={found.url} controls playsInline className="mt-8 w-full rounded-2xl bg-black shadow-2xl" />
          <SaveButtons src={found.url} filename={`${FUN.short}-intro-${id}`} type={found.type} />
          {found.script && (
            <div className="kdu-card mt-8 p-6">
              <p className="font-jua text-xl text-kdu-navy">📝 내 자기소개 대본</p>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{found.script}</p>
            </div>
          )}
          <p className="mt-4 text-center text-sm text-ink-muted">{FUN.keepDays}일 뒤 자동으로 지워져요. 미리 저장해 두세요!</p>
        </>
      ) : (
        <NotFound />
      )}
      <BackLink />
    </section>
  );
}

async function load(id: string) {
  const pathname = `videos/${id}`;
  try {
    // 영상이 실제로 있는지 확인 (없으면 오류 → 찾을 수 없음 화면)
    await head(pathname);
    const token = await issueSignedToken({ pathname, operations: ["get"], validUntil: Date.now() + 60 * 60 * 1000 });
    const { presignedUrl } = await presignUrl(token, { operation: "get", pathname, access: "private" });
    const txt = await get(pathname.replace(/\.(mp4|webm)$/, ".txt"), { access: "private" }).catch(() => null);
    const script = txt?.statusCode === 200 ? await new Response(txt.stream).text() : "";
    return { url: presignedUrl, type: id.endsWith(".mp4") ? "video/mp4" : "video/webm", script };
  } catch {
    return null;
  }
}
