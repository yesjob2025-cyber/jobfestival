"use client";

import { useState } from "react";

/** 받기 페이지 — 휴대폰에 저장 · 카톡 등으로 공유 */
export function SaveButtons({ src, filename, type }: { src: string; filename: string; type: string }) {
  const [msg, setMsg] = useState("");
  const isVideo = type.startsWith("video/");

  async function file(): Promise<File> {
    const res = await fetch(src);
    return new File([await res.blob()], filename, { type });
  }

  async function save() {
    try {
      const f = await file();
      // iPhone 은 공유 창의 ‘이미지/비디오 저장’이 사진 앱으로 바로 저장됩니다.
      if (navigator.canShare?.({ files: [f] }) && /iPhone|iPad/.test(navigator.userAgent)) {
        await navigator.share({ files: [f] });
        return;
      }
      const url = URL.createObjectURL(f);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setMsg(isVideo ? "저장하지 못했어요. 다시 눌러 주세요." : "저장하지 못했어요. 이미지를 길게 눌러 저장해 주세요.");
    }
  }

  async function share() {
    try {
      const f = await file();
      if (navigator.canShare?.({ files: [f] })) {
        await navigator.share({ files: [f] });
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
          ⬇️ {isVideo ? "영상 저장" : "사진으로 저장"}
        </button>
        <button type="button" onClick={share} className="btn bg-kdu-yellow py-4 font-jua text-xl font-normal text-kdu-navy-deep">
          💬 카톡 · 문자로 보내기
        </button>
      </div>
      {msg && <p className="mt-3 text-center text-sm font-bold text-kdu-pink">{msg}</p>}
    </>
  );
}
