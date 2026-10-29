"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { uploadPresigned } from "@vercel/blob/client";
import { FUN } from "@/lib/fun/config";

type State = "idle" | "sending" | "done" | "error" | "off";

/**
 * 결과를 서버에 올리고 QR 을 보여 줍니다 → 방문객이 자기 휴대폰 카메라로 찍어 받기.
 *  · 이미지: /api/card 로 JPEG 업로드 → /fun/r?id=
 *  · 영상:  브라우저에서 저장소로 바로 업로드 (용량 큼) → /fun/v?id=
 * `resetKey` 가 바뀌면 (결과가 달라지면) QR 을 지우고 다시 보내게 합니다.
 */
export function QrSend(
  props: ({ kind: "image"; getImage: () => Promise<HTMLCanvasElement> } | { kind: "video"; video: Blob; script?: string }) & {
    resetKey?: unknown;
    label?: string;
  },
) {
  const [state, setState] = useState<State>("idle");
  const [qr, setQr] = useState("");

  useEffect(() => {
    setState("idle");
    setQr("");
  }, [props.resetKey]);

  async function send() {
    setState("sending");
    try {
      const link = props.kind === "image" ? await sendImage(await props.getImage()) : await sendVideo(props.video, props.script);
      setQr(await QRCode.toDataURL(link, { width: 480, margin: 1, color: { dark: "#0B2A78" } }));
      setState("done");
    } catch (e) {
      setState(e instanceof Error && e.message === "not-configured" ? "off" : "error");
    }
  }

  return (
    <div className="rounded-3xl border-2 border-kdu-navy/20 bg-kdu-sky-pale p-5 text-center sm:p-6">
      {state === "done" ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="결과 받기 QR 코드" className="h-56 w-56 shrink-0 rounded-2xl bg-white p-3 shadow-lg" />
          <div>
            <p className="font-jua text-3xl text-kdu-navy-deep">📱 휴대폰 카메라로 QR을 찍으세요!</p>
            <p className="mt-2 text-sm font-semibold text-ink-soft">
              열린 페이지에서 ‘저장’이나 ‘카톡 · 문자로 보내기’를 누르면 내 휴대폰에 가져갈 수 있어요.
            </p>
            <p className="mt-2 text-xs text-ink-muted">{FUN.keepDays}일 뒤 자동으로 지워집니다.</p>
          </div>
        </div>
      ) : (
        <>
          <button type="button" onClick={send} disabled={state === "sending"} className="fun-btn-navy w-full py-5 text-2xl disabled:opacity-60">
            {state === "sending" ? "QR 만드는 중…" : (props.label ?? "📱 내 휴대폰으로 받기 (QR)")}
          </button>
          {state === "error" && (
            <p className="mt-3 text-sm font-bold text-[#C0392B]">보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.</p>
          )}
          {state === "off" && (
            <p className="mt-3 text-sm font-bold text-[#C0392B]">QR 받기가 아직 설정되지 않았어요. 부스 담당자에게 알려 주세요.</p>
          )}
          <p className="mt-3 text-xs text-ink-muted">누르면 결과가 서버에 올라가며, {FUN.keepDays}일 뒤 자동으로 지워집니다.</p>
        </>
      )}
    </div>
  );
}

async function sendImage(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  if (!blob) throw new Error("encode");
  const res = await fetch("/api/card", { method: "POST", body: blob, headers: { "content-type": "image/jpeg" } });
  if (res.status === 503) throw new Error("not-configured");
  if (!res.ok) throw new Error(`upload ${res.status}`);
  const { id } = (await res.json()) as { id: string };
  return `${location.origin}/fun/r?id=${id}`;
}

async function sendVideo(video: Blob, script?: string): Promise<string> {
  const check = await fetch("/api/fun/video");
  if (!check.ok || !((await check.json()) as { configured: boolean }).configured) throw new Error("not-configured");
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  const ext = video.type.includes("mp4") ? "mp4" : "webm";
  await uploadPresigned(`videos/${id}.${ext}`, video, {
    access: "private",
    handleUploadUrl: "/api/fun/video",
    contentType: video.type.split(";")[0],
    clientPayload: script?.slice(0, 1500),
  });
  return `${location.origin}/fun/v?id=${id}.${ext}`;
}
