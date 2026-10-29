"use client";

import { useEffect, useState } from "react";
import { CameraBox } from "@/components/fun/camera-box";
import { QrSend } from "@/components/fun/qr-send";
import { Options, RestartButton, Spinner, Title } from "@/components/fun/ui";
import {
  BACKGROUNDS,
  DEFAULT_ADJUST,
  DEFAULT_ID_OPTIONS,
  OUTFITS,
  renderIdPhoto,
  SUIT_COLORS,
  TIE_COLORS,
  type IdAdjust,
  type IdOptions,
} from "@/lib/fun/id-photo";
import { preloadVision, preparePhoto, type PreparedPhoto } from "@/lib/future-card/vision";

export function IdPhotoStudio() {
  const [prepared, setPrepared] = useState<PreparedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState<IdOptions>(DEFAULT_ID_OPTIONS);
  const [adj, setAdj] = useState<IdAdjust>(DEFAULT_ADJUST);

  useEffect(() => {
    preloadVision().catch(() => {});
  }, []);

  async function onCapture(c: HTMLCanvasElement) {
    setBusy(true);
    setPrepared(await preparePhoto(c));
    setAdj(DEFAULT_ADJUST);
    setBusy(false);
  }

  function reset() {
    setPrepared(null);
    setOpts(DEFAULT_ID_OPTIONS);
    setAdj(DEFAULT_ADJUST);
    window.scrollTo({ top: 0 });
  }

  if (busy) return <div className="wrap py-10"><Spinner text="배경을 지우고 있어요…" sub="처음 한 번은 몇 초 걸릴 수 있어요" /></div>;
  if (!prepared)
    return (
      <div className="wrap py-8">
        <Title sub="정면을 보고, 머리부터 어깨까지 나오게 찍어 주세요">📸 증명사진 촬영</Title>
        <CameraBox guide="bust" onCapture={onCapture} />
      </div>
    );
  return <Editor prepared={prepared} opts={opts} setOpts={setOpts} adj={adj} setAdj={setAdj} onRetake={() => setPrepared(null)} onReset={reset} />;
}

function Editor(props: {
  prepared: PreparedPhoto;
  opts: IdOptions;
  setOpts: (o: IdOptions) => void;
  adj: IdAdjust;
  setAdj: (a: IdAdjust) => void;
  onRetake: () => void;
  onReset: () => void;
}) {
  const { prepared, opts, adj } = props;
  const [url, setUrl] = useState("");
  const set = <K extends keyof IdOptions>(k: K, v: IdOptions[K]) => props.setOpts({ ...opts, [k]: v });
  const nudge = (d: Partial<IdAdjust>) =>
    props.setAdj({
      zoom: Math.min(1.5, Math.max(0.7, adj.zoom * (d.zoom ?? 1))),
      outfitY: Math.min(0.15, Math.max(-0.15, adj.outfitY + (d.outfitY ?? 0))),
      outfitScale: Math.min(1.6, Math.max(0.6, adj.outfitScale * (d.outfitScale ?? 1))),
    });

  useEffect(() => {
    setUrl(renderIdPhoto(prepared.photo, prepared.geom, opts, adj, 0.5).toDataURL("image/jpeg", 0.9));
  }, [prepared, opts, adj]);

  const hasTie = opts.outfit === "suitTie" || opts.outfit === "shirtTie";
  const btn = "fun-btn-white px-3 py-3 text-base";

  return (
    <div className="wrap py-8">
      <div className="mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-[minmax(0,340px)_1fr]">
        <div className="md:sticky md:top-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url && <img src={url} alt="이력서 사진 미리보기" className="w-full rounded-2xl border-4 border-white shadow-2xl" />}
          {!prepared.cutout && <p className="mt-2 text-sm font-bold text-[#C0392B]">배경을 지우지 못했어요. 다시 찍어 주세요.</p>}
          {!prepared.faceFound && <p className="mt-2 text-sm font-bold text-[#8A6A00]">얼굴을 찾지 못했어요. 정면으로 다시 찍으면 더 잘 맞아요.</p>}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button type="button" className={btn} onClick={() => nudge({ zoom: 1.05 })}>🔍 얼굴 크게</button>
            <button type="button" className={btn} onClick={() => nudge({ zoom: 1 / 1.05 })}>🔍 얼굴 작게</button>
            <button type="button" className={btn} onClick={() => props.setAdj(DEFAULT_ADJUST)}>↩︎ 처음대로</button>
            <button type="button" className={btn} onClick={() => nudge({ outfitY: -0.01 })}>👔 옷 위로</button>
            <button type="button" className={btn} onClick={() => nudge({ outfitY: 0.01 })}>👔 옷 아래로</button>
            <button type="button" className={btn} onClick={() => nudge({ outfitScale: 1.05 })}>👔 옷 크게</button>
          </div>
        </div>

        <div className="space-y-6">
          <Options title="👔 옷" items={OUTFITS} value={opts.outfit} onPick={(v) => set("outfit", v)} />
          {opts.outfit !== "shirtTie" && <Options title="🎨 정장 색" items={SUIT_COLORS} value={opts.suit} onPick={(v) => set("suit", v)} />}
          {hasTie && <Options title="👔 넥타이" items={TIE_COLORS} value={opts.tie} onPick={(v) => set("tie", v)} />}
          <Options title="🖼️ 배경색" items={BACKGROUNDS} value={opts.bg} onPick={(v) => set("bg", v)} />
          <Options
            title="✨ 보정"
            items={[
              { id: "plain", name: "자연스럽게" },
              { id: "bright", name: "화사하게" },
            ]}
            value={opts.bright ? "bright" : "plain"}
            onPick={(v) => set("bright", v === "bright")}
          />
          <QrSend
            kind="image"
            getImage={async () => renderIdPhoto(prepared.photo, prepared.geom, opts, adj, 1)}
            resetKey={JSON.stringify(opts) + JSON.stringify(adj)}
          />
          <p className="text-xs text-ink-muted">3:4 비율(900×1200)로 저장돼요. 공식 서류용이 아닌 이력서 · 프로필용 참고 사진이에요.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={props.onRetake} className="fun-btn-white py-4 text-xl">📸 다시 찍기</button>
            <RestartButton onClick={props.onReset} label="🙋 다음 분 (처음으로)" />
          </div>
        </div>
      </div>
    </div>
  );
}
