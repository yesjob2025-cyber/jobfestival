"use client";

import { useState } from "react";

export function SaveButtons({ src }: { src: string }) {
  const [msg, setMsg] = useState("");

  async function file(): Promise<File> {
    const res = await fetch(src);
    return new File([await res.blob()], "KDU-future-card.jpg", { type: "image/jpeg" });
  }

  async function save() {
    try {
      const url = URL.createObjectURL(await file());
      const a = document.createElement("a");
      a.href = url;
      a.download = "KDU-future-card.jpg";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setMsg("저장하지 못했어요. 이미지를 길게 눌러 저장해 주세요.");
    }
  }

  async function share() {
    try {
      const f = await file();
      if (navigator.canShare?.({ files: [f] })) {
        await navigator.share({ files: [f], title: "나의 미래 명함" });
      } else {
        await navigator.clipboard.writeText(location.href);
        setMsg("링크를 복사했어요. 카카오톡 등에 붙여넣어 보내세요.");
      }
    } catch {
      /* 공유 창을 닫은 경우 */
    }
  }

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={save} className="btn bg-kdu-navy py-4 font-jua text-xl font-normal text-white">
          ⬇️ 사진으로 저장
        </button>
        <button type="button" onClick={share} className="btn bg-kdu-yellow py-4 font-jua text-xl font-normal text-kdu-navy-deep">
          💬 카톡 · 문자로 보내기
        </button>
      </div>
      {msg && <p className="mt-3 text-center text-sm font-bold text-kdu-pink">{msg}</p>}
    </>
  );
}
