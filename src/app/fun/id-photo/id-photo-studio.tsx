"use client";

import { useFunDone } from "@/components/fun/mode";
import { useEffect, useMemo, useState } from "react";
import { CameraBox } from "@/components/fun/camera-box";
import { QrSend } from "@/components/fun/qr-send";
import { Options, RestartButton, Spinner, Title } from "@/components/fun/ui";
import {
  BACKGROUNDS,
  DEFAULT_ADJUST,
  DRAWN_BY_GENDER,
  loadSuitTemplates,
  outfitOverlay,
  type OutfitId,
  type OutfitLayer,
  DEFAULT_ID_OPTIONS,
  OUTFITS,
  renderIdPhoto,
  SUIT_COLORS,
  TIE_COLORS,
  type IdAdjust,
  type IdOptions,
} from "@/lib/fun/id-photo";
import { preloadVision, preparePhoto, type PreparedPhoto } from "@/lib/future-card/vision";
import { aiAvailable, aiTransform } from "@/lib/fun/ai-image";

type Templates = Awaited<ReturnType<typeof loadSuitTemplates>>;

export function IdPhotoStudio() {
  const [prepared, setPrepared] = useState<PreparedPhoto | null>(null);
  const [raw, setRaw] = useState<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [opts, setOpts] = useState<IdOptions>(DEFAULT_ID_OPTIONS);
  const [adj, setAdj] = useState<IdAdjust>(DEFAULT_ADJUST);
  // 촬영 전에 고르는 성별 · 옷 (실사 정장 id, 없으면 그림 정장)
  const [gender, setGender] = useState<"m" | "f">("m");
  const [tplId, setTplId] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    preloadVision().catch(() => {});
    loadSuitTemplates().then(setTemplates);
    aiAvailable().then(setAiOn);
  }, []);
  const [templates, setTemplates] = useState<Templates>([]);
  const [aiOn, setAiOn] = useState(false);

  // 실사 정장이 있으면 처음엔 그 성별의 첫 정장으로
  useEffect(() => {
    if (picked) return;
    setTplId(templates.find((t) => t.tpl.gender === gender)?.tpl.id ?? null);
  }, [templates, gender, picked]);

  const suit = { gender, tplId, templates, opts };
  const pick = {
    gender: (g: "m" | "f") => {
      setGender(g);
      setPicked(true);
      setTplId(templates.find((t) => t.tpl.gender === g)?.tpl.id ?? null);
      setOpts({ ...opts, outfit: g === "f" ? "suitW" : "suitTie" });
    },
    template: (id: string) => {
      setPicked(true);
      setTplId(id);
    },
    drawn: (o: OutfitId) => {
      setPicked(true);
      setTplId(null);
      setOpts({ ...opts, outfit: o });
    },
  };

  async function onCapture(c: HTMLCanvasElement) {
    setBusy(true);
    setRaw(c);
    setPrepared(await preparePhoto(c));
    setAdj(DEFAULT_ADJUST);
    setBusy(false);
  }

  function reset() {
    setPrepared(null);
    setGender("m");
    setPicked(false);
    setOpts(DEFAULT_ID_OPTIONS);
    setAdj(DEFAULT_ADJUST);
    window.scrollTo({ top: 0 });
  }

  if (busy) return <div className="wrap py-10"><Spinner text="배경을 지우고 있어요…" sub="처음 한 번은 몇 초 걸릴 수 있어요" /></div>;
  if (!prepared)
    return (
      <div className="wrap py-8">
        <Title sub="입고 싶은 정장을 고르고, 정면을 보고 머리부터 어깨까지 나오게 찍어 주세요">📸 증명사진 촬영</Title>
        <div className="mx-auto mb-5 max-w-xl">
          <SuitPicker {...suit} pick={pick} />
        </div>
        <CameraBox guide="bust" onCapture={onCapture} overlay={<SuitOverlay {...suit} />} />
      </div>
    );
  return (
    <Editor
      raw={raw}
      templates={templates}
      aiOn={aiOn}
      prepared={prepared}
      opts={opts}
      setOpts={setOpts}
      adj={adj}
      setAdj={setAdj}
      onRetake={() => setPrepared(null)}
      onReset={reset}
      tplId={tplId}
      picker={<SuitPicker {...suit} pick={pick} />}
    />
  );
}

type Pick = { gender: (g: "m" | "f") => void; template: (id: string) => void; drawn: (o: OutfitId) => void };

/** 남성 · 여성 → 실사 정장(있으면) + 그림 정장 고르기 */
function SuitPicker({ gender, tplId, templates, opts, pick }: { gender: "m" | "f"; tplId: string | null; templates: Templates; opts: IdOptions; pick: Pick }) {
  const real = templates.filter((t) => t.tpl.gender === gender);
  const drawn = DRAWN_BY_GENDER[gender];
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const o of drawn) next[o] = outfitOverlay(160, { kind: "drawn" }, { ...opts, outfit: o }).toDataURL("image/png");
    for (const t of real) next[t.tpl.id] = outfitOverlay(160, { kind: "template", tpl: t.tpl, img: t.img }, opts).toDataURL("image/png");
    setThumbs(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender, templates, opts.suit, opts.tie]);

  const card = (key: string, name: string, on: boolean, onClick: () => void, badge?: string) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative overflow-hidden rounded-2xl border-[3px] bg-[linear-gradient(180deg,#DCEBF7,#C9DFF2)] text-center transition ${on ? "border-kdu-navy shadow-[0_4px_0_#0B2A78]" : "border-white"}`}
    >
      {badge && <span className="absolute left-1.5 top-1.5 rounded-full bg-kdu-yellow px-2 py-0.5 text-[10px] font-extrabold text-kdu-navy-deep">{badge}</span>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {thumbs[key] ? <img src={thumbs[key]} alt="" className="aspect-square w-full" /> : <div className="aspect-square w-full" />}
      <span className="block truncate bg-white px-1 py-1.5 text-xs font-bold text-kdu-navy-deep">{name}</span>
    </button>
  );

  return (
    <section>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {(["m", "f"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => pick.gender(g)}
            aria-pressed={gender === g}
            className={gender === g ? "fun-btn-navy py-3 text-xl" : "fun-btn-white py-3 text-xl"}
          >
            {g === "m" ? "🙋‍♂️ 남성" : "🙋‍♀️ 여성"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {real.map((t) => card(t.tpl.id, t.tpl.name, tplId === t.tpl.id, () => pick.template(t.tpl.id), "실사"))}
        {drawn.map((o) => card(o, OUTFITS.find((x) => x.id === o)!.name, !tplId && opts.outfit === o, () => pick.drawn(o)))}
      </div>
    </section>
  );
}

/** 촬영 화면 위 고른 정장 (자세 맞추기용) */
function SuitOverlay({ tplId, templates, opts }: { gender: "m" | "f"; tplId: string | null; templates: Templates; opts: IdOptions }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const t = templates.find((x) => x.tpl.id === tplId);
    setUrl(outfitOverlay(480, t ? { kind: "template", tpl: t.tpl, img: t.img } : { kind: "drawn" }, opts).toDataURL("image/png"));
  }, [tplId, templates, opts]);
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="" className="pointer-events-none absolute inset-0 h-full w-full opacity-90" /> : null;
}

function Editor(props: {
  raw: HTMLCanvasElement | null;
  templates: Templates;
  aiOn: boolean;
  prepared: PreparedPhoto;
  opts: IdOptions;
  setOpts: (o: IdOptions) => void;
  adj: IdAdjust;
  setAdj: (a: IdAdjust) => void;
  onRetake: () => void;
  onReset: () => void;
  tplId: string | null;
  picker: React.ReactNode;
}) {
  useFunDone("id-photo");
  const { opts, adj, templates } = props;
  const [url, setUrl] = useState("");
  // 옷: 그림 정장(기본) · 실사 템플릿 id(촬영 전에 고름) · AI 실사 정장
  const { tplId } = props;
  const [ai, setAi] = useState<{ prepared: PreparedPhoto; key: string } | null>(null);
  const [aiUse, setAiUse] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const aiKey = `${opts.outfit}-${opts.suit}-${opts.tie}`;
  // 실사 정장을 고르면 AI 사진 대신 그 정장으로
  useEffect(() => {
    if (tplId) setAiUse(false);
  }, [tplId]);
  const usingAi = aiUse && !!ai;
  const prepared = usingAi ? ai.prepared : props.prepared;
  const tpl = templates.find((t) => t.tpl.id === tplId);
  const layer: OutfitLayer = useMemo(
    () => (usingAi ? { kind: "none" } : tpl ? { kind: "template", tpl: tpl.tpl, img: tpl.img } : { kind: "drawn" }),
    [usingAi, tpl],
  );

  async function makeAi() {
    if (!props.raw || aiBusy) return;
    if (ai && ai.key === aiKey) return setAiUse(true);
    setAiBusy(true);
    setAiError("");
    try {
      const out = await aiTransform(props.raw, { kind: "suit", outfit: opts.outfit, suit: opts.suit, tie: opts.tie });
      setAi({ prepared: await preparePhoto(out), key: aiKey });
      setAiUse(true);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI 이미지를 만들지 못했어요.");
    } finally {
      setAiBusy(false);
    }
  }
  const set = <K extends keyof IdOptions>(k: K, v: IdOptions[K]) => props.setOpts({ ...opts, [k]: v });
  const nudge = (d: Partial<IdAdjust>) =>
    props.setAdj({
      zoom: Math.min(1.5, Math.max(0.7, adj.zoom * (d.zoom ?? 1))),
      outfitY: Math.min(0.15, Math.max(-0.15, adj.outfitY + (d.outfitY ?? 0))),
      outfitScale: Math.min(1.6, Math.max(0.6, adj.outfitScale * (d.outfitScale ?? 1))),
    });

  useEffect(() => {
    setUrl(renderIdPhoto(prepared.photo, prepared.geom, opts, adj, 0.5, layer).toDataURL("image/jpeg", 0.9));
  }, [prepared, opts, adj, layer]);

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
            {!usingAi && (
              <>
                <button type="button" className={btn} onClick={() => nudge({ outfitY: -0.01 })}>👔 옷 위로</button>
                <button type="button" className={btn} onClick={() => nudge({ outfitY: 0.01 })}>👔 옷 아래로</button>
                <button type="button" className={btn} onClick={() => nudge({ outfitScale: 1.05 })}>👔 옷 크게</button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="mb-2 font-jua text-xl text-kdu-navy">👔 옷</p>
            {props.picker}
          </div>
          {!tpl && (
            <>
              {opts.outfit !== "shirtTie" && <Options title="🎨 정장 색" items={SUIT_COLORS} value={opts.suit} onPick={(v) => set("suit", v)} />}
              {hasTie && <Options title="👔 넥타이" items={TIE_COLORS} value={opts.tie} onPick={(v) => set("tie", v)} />}
            </>
          )}
          {props.aiOn && props.raw && !tpl && (
            <section className="rounded-2xl border-2 border-dashed border-ocean/40 bg-white/70 p-4">
              <h3 className="text-lg font-extrabold text-navy">✨ AI 실사 정장 (Google Gemini)</h3>
              <p className="mt-1 text-xs text-ink-muted">
                위에서 고른 옷 · 색 그대로 진짜 정장을 입은 사진으로 바꿔 줘요. 사진이 Google 서버로 전송돼요 (이 사이트는 저장하지 않아요). 10~20초 걸려요.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={aiBusy} onClick={makeAi} className="fun-btn-navy py-3 text-lg disabled:opacity-60">
                  {aiBusy ? "AI가 정장을 입히는 중…" : usingAi && ai?.key === aiKey ? "✅ AI 실사 정장 사용 중" : ai && ai.key !== aiKey ? "✨ 이 옷으로 다시 만들기" : "✨ AI 실사 정장 입히기"}
                </button>
                {usingAi && (
                  <button type="button" disabled={aiBusy} onClick={() => setAiUse(false)} className="fun-btn-white py-3 text-lg">
                    🎨 그림 정장으로 돌아가기
                  </button>
                )}
              </div>
              {usingAi && ai.key !== aiKey && <p className="mt-2 text-xs font-bold text-[#8A6A00]">옷을 바꿨어요 — 미리보기는 이전 AI 사진이에요. 다시 만들기를 눌러 주세요.</p>}
              {aiError && <p className="mt-2 rounded-xl bg-sun/20 px-3 py-2 text-sm font-bold text-[#8A6A00]">{aiError}</p>}
            </section>
          )}
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
            getImage={async () => renderIdPhoto(prepared.photo, prepared.geom, opts, adj, 1, layer)}
            resetKey={JSON.stringify(opts) + JSON.stringify(adj) + (tplId ?? "") + (usingAi ? ai.key : "")}
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
