"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Spinner, Title } from "@/components/fun/ui";
import { countdown, useCamera } from "@/components/fun/use-camera";
import { loadCardAssets } from "@/lib/fun/assets";
import { FUN } from "@/lib/fun/config";
import { JOB_CHIPS, LIMITS, STRENGTH_CHIPS, type IntroInput } from "@/lib/fun/intro";
import { K, readyImage, roundRect, text } from "@/lib/future-card/draw";

type Step = "form" | "script" | "record" | "review";

const EMPTY: IntroInput = { name: "", job: "", strengths: [], experience: "", tone: "serious" };

export function IntroStudio() {
  const [step, setStep] = useState<Step>("form");
  const [input, setInput] = useState<IntroInput>(EMPTY);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [video, setVideo] = useState<Blob | null>(null);

  async function writeScript() {
    setLoading(true);
    try {
      const res = await fetch("/api/fun/intro-script", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as { script?: string };
      setScript(data.script ?? "");
      setStep("script");
    } catch {
      setScript("");
      setStep("script");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("form");
    setInput(EMPTY);
    setScript("");
    setVideo(null);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="wrap py-8">
      {step === "form" && (loading ? <Spinner text="AI가 대본을 쓰고 있어요… ✍️" sub="10초 정도 걸려요" /> : <Form input={input} setInput={setInput} onNext={writeScript} />)}
      {step === "script" && (
        <ScriptEditor
          script={script}
          setScript={setScript}
          loading={loading}
          onRewrite={writeScript}
          onBack={() => setStep("form")}
          onNext={() => setStep("record")}
        />
      )}
      {step === "record" && (
        <Recorder
          script={script}
          input={input}
          onBack={() => setStep("script")}
          onDone={(b) => {
            setVideo(b);
            setStep("review");
          }}
        />
      )}
      {step === "review" && video && <Review video={video} script={script} onRetake={() => setStep("record")} onReset={reset} />}
    </div>
  );
}

// ── 1. 입력 ─────────────────────────────────────────────────

function Form({ input, setInput, onNext }: { input: IntroInput; setInput: (i: IntroInput) => void; onNext: () => void }) {
  const set = <K extends keyof IntroInput>(k: K, v: IntroInput[K]) => setInput({ ...input, [k]: v });
  const toggle = (s: string) =>
    set("strengths", input.strengths.includes(s) ? input.strengths.filter((x) => x !== s) : [...input.strengths, s].slice(-LIMITS.strengths));
  const ready = input.job.trim() !== "" && input.strengths.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <Title sub="세 가지만 정하면 AI가 1분 대본을 써 드려요">나를 소개해 볼까요?</Title>
      <Field label="이름 (선택)">
        <input value={input.name} onChange={(e) => set("name", e.target.value)} maxLength={LIMITS.name} placeholder="김경동" className="field py-3 text-lg" />
      </Field>
      <Field label="① 희망 직무">
        <input value={input.job} onChange={(e) => set("job", e.target.value)} maxLength={LIMITS.job} placeholder="직접 입력하거나 아래에서 고르세요" className="field py-3 text-lg" />
        <div className="mt-2 flex flex-wrap gap-2">
          {JOB_CHIPS.map((j) => (
            <button key={j} type="button" onClick={() => set("job", j)} className={input.job === j ? "fun-chip-on" : "fun-chip-off"}>
              {j}
            </button>
          ))}
        </div>
      </Field>
      <Field label={`② 나의 장점 (최대 ${LIMITS.strengths}개)`}>
        <div className="flex flex-wrap gap-2">
          {STRENGTH_CHIPS.map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)} aria-pressed={input.strengths.includes(s)} className={input.strengths.includes(s) ? "fun-chip-on" : "fun-chip-off"}>
              {s}
            </button>
          ))}
        </div>
      </Field>
      <Field label="③ 기억에 남는 경험 한 줄 (선택)">
        <input
          value={input.experience}
          onChange={(e) => set("experience", e.target.value)}
          maxLength={LIMITS.experience}
          placeholder="예: 카페 아르바이트 2년, 축제 기획단 활동"
          className="field py-3 text-lg"
        />
      </Field>
      <Field label="분위기">
        <div className="flex gap-2">
          {(
            [
              ["serious", "🎩 진지하게"],
              ["bright", "😄 밝게"],
            ] as const
          ).map(([v, label]) => (
            <button key={v} type="button" onClick={() => set("tone", v)} className={input.tone === v ? "fun-chip-on" : "fun-chip-off"}>
              {label}
            </button>
          ))}
        </div>
      </Field>
      <button type="button" onClick={onNext} disabled={!ready} className="fun-btn-navy w-full py-5 text-2xl disabled:opacity-40">
        ✍️ AI 대본 만들기
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-jua text-xl text-kdu-navy">{label}</p>
      {children}
    </div>
  );
}

// ── 2. 대본 ─────────────────────────────────────────────────

function ScriptEditor(props: { script: string; setScript: (s: string) => void; loading: boolean; onRewrite: () => void; onBack: () => void; onNext: () => void }) {
  const seconds = Math.round(props.script.replace(/\s/g, "").length / 5);
  return (
    <div className="mx-auto max-w-2xl">
      <Title sub="마음에 안 드는 부분은 직접 고쳐도 돼요">📝 나의 1분 자기소개 대본</Title>
      <textarea
        value={props.script}
        onChange={(e) => props.setScript(e.target.value.slice(0, 1200))}
        rows={11}
        className="field text-lg leading-relaxed"
      />
      <p className="mt-2 text-right text-sm font-bold text-ink-muted">읽는 시간 약 {seconds}초</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" onClick={props.onBack} className="fun-btn-white py-4 text-xl">
          ← 다시 고르기
        </button>
        <button type="button" onClick={props.onRewrite} disabled={props.loading} className="fun-btn-white py-4 text-xl disabled:opacity-50">
          {props.loading ? "쓰는 중…" : "🔄 다른 대본"}
        </button>
      </div>
      <button type="button" onClick={props.onNext} disabled={!props.script.trim()} className="fun-btn-yellow mt-3 w-full py-5 text-2xl disabled:opacity-40">
        🎬 영상 찍으러 가기
      </button>
    </div>
  );
}

// ── 3. 촬영 ─────────────────────────────────────────────────

const VW = 720;
const VH = 960;
const MAX_SEC = 70;

function pickMime(): string {
  const options = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return options.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ?? "";
}

/** 녹화되는 화면 — 카메라 + ‘1분 자기소개’ 배지 + 이름 · 직무 자막 */
function drawVideoFrame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, input: IntroInput) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const ratio = VW / VH;
  const sw = Math.min(vw, vh * ratio);
  const sh = sw / ratio;
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, VW, VH);

  roundRect(ctx, 28, 28, 300, 66, 33);
  ctx.fillStyle = K.navy;
  ctx.fill();
  text(ctx, "🎤 1분 자기소개", 178, 74, { size: 32, weight: 400, color: "#fff", align: "center", family: "jua" });
  roundRect(ctx, VW - 128, 28, 100, 66, 18);
  ctx.fillStyle = K.yellow;
  ctx.fill();
  text(ctx, FUN.short, VW - 78, 74, { size: 34, weight: 700, color: K.navyDeep, align: "center", family: "fun" });

  const g = ctx.createLinearGradient(0, VH - 260, 0, VH);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, VH - 260, VW, 260);
  roundRect(ctx, 28, VH - 180, VW - 56, 128, 24);
  ctx.fillStyle = "rgba(19,57,154,0.92)";
  ctx.fill();
  ctx.fillStyle = K.yellow;
  ctx.fillRect(28, VH - 180, 14, 128);
  text(ctx, input.name || "지원자", 70, VH - 112, { size: 50, weight: 400, color: "#fff", family: "jua", maxW: VW - 140 });
  text(ctx, `희망 직무 · ${input.job}`, 70, VH - 70, { size: 28, weight: 700, color: K.yellow, maxW: VW - 140 });
  const lion = readyImage(FUN.mascot);
  if (lion) ctx.drawImage(lion, VW - 140, VH - 250, 100, (100 * lion.naturalHeight) / lion.naturalWidth);
}

function Recorder({ script, input, onBack, onDone }: { script: string; input: IntroInput; onBack: () => void; onDone: (b: Blob) => void }) {
  const { videoRef, stream, ready, error } = useCamera({ facing: "user", audio: true });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const rafRef = useRef(0);
  const [phase, setPhase] = useState<"ready" | "count" | "rec">("ready");
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [scroll, setScroll] = useState(0);
  const duration = Math.min(MAX_SEC - 5, Math.max(35, script.replace(/\s/g, "").length / 5)) / speed;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  async function start() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !stream) return;
    await loadCardAssets(input.name + input.job + "1분 자기소개 희망 직무 지원자");
    setPhase("count");
    await countdown(3, setCount);

    const ctx = canvas.getContext("2d")!;
    const out = canvas.captureStream(30);
    stream.getAudioTracks().forEach((t) => out.addTrack(t));
    const mimeType = pickMime();
    const rec = new MediaRecorder(out, { mimeType: mimeType || undefined, videoBitsPerSecond: 2_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => onDone(new Blob(chunks, { type: (mimeType || rec.mimeType || "video/webm").split(";")[0] }));
    recRef.current = rec;

    const t0 = performance.now();
    const loop = () => {
      drawVideoFrame(ctx, video, input);
      const sec = (performance.now() - t0) / 1000;
      setElapsed(sec);
      if (sec >= MAX_SEC) return stop();
      rafRef.current = requestAnimationFrame(loop);
    };
    drawVideoFrame(ctx, video, input);
    rec.start(1000);
    setPhase("rec");
    // 대본이 화면 위로 천천히 올라가게 (끝 문장이 보일 만큼)
    const box = promptRef.current;
    if (box) setScroll(Math.max(0, box.scrollHeight - box.parentElement!.clientHeight * 0.5));
    loop();
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    if (recRef.current?.state === "recording") recRef.current.stop();
  }

  return (
    <div className="mx-auto max-w-xl">
      <Title sub={phase === "rec" ? "대본을 보며 카메라를 보고 또박또박!" : "버튼을 누르면 3초 뒤 녹화가 시작돼요 (최대 70초)"}>
        {phase === "rec" ? `🔴 녹화 중 ${Math.floor(elapsed)}초` : "🎬 자기소개 촬영"}
      </Title>
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-kdu-navy-deep">
        <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        {/* 프롬프터 — 카메라 가까이(위쪽)에 두어 시선이 카메라를 향하게 */}
        <div className="absolute inset-x-0 top-0 h-[45%] overflow-hidden bg-gradient-to-b from-black/75 via-black/55 to-transparent px-6 pt-5">
          <div
            ref={promptRef}
            className="whitespace-pre-line text-center text-[1.35rem] font-bold leading-relaxed text-white drop-shadow break-keep sm:text-2xl"
            style={{
              transform: phase === "rec" ? `translateY(-${scroll}px)` : "none",
              transition: phase === "rec" ? `transform ${duration}s linear` : "none",
            }}
          >
            {script}
          </div>
        </div>
        {phase === "count" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9rem] font-black text-white drop-shadow-lg">{count}</span>
          </div>
        )}
        {phase === "rec" && <span className="absolute bottom-4 right-4 h-5 w-5 animate-pulse rounded-full bg-red-500 ring-4 ring-white/70" />}
        {!ready && !error && <p className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/80">카메라 · 마이크를 켜는 중…</p>}
        {error && <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-bold text-white">{error}</p>}
      </div>
      {/* 녹화용 캔버스 (화면 밖) */}
      <canvas ref={canvasRef} width={VW} height={VH} className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden />

      {phase === "rec" ? (
        <button type="button" onClick={stop} className="fun-btn-navy mt-5 w-full py-5 text-2xl">
          ⏹️ 녹화 끝내기
        </button>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="font-jua text-lg text-kdu-navy">대본 속도</span>
            {[
              [0.8, "느리게"],
              [1, "보통"],
              [1.25, "빠르게"],
            ].map(([v, label]) => (
              <button key={label} type="button" onClick={() => setSpeed(v as number)} className={speed === v ? "fun-chip-on" : "fun-chip-off"}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr] gap-3">
            <button type="button" onClick={onBack} disabled={phase !== "ready"} className="fun-btn-white px-5 py-4 text-xl">
              ← 대본
            </button>
            <button type="button" onClick={start} disabled={!ready || phase !== "ready"} className="fun-btn-yellow py-5 text-2xl disabled:opacity-50">
              🔴 녹화 시작 (3초 후)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── 4. 확인 · 받기 ──────────────────────────────────────────

function Review({ video, script, onRetake, onReset }: { video: Blob; script: string; onRetake: () => void; onReset: () => void }) {
  const url = useMemo(() => URL.createObjectURL(video), [video]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const mb = (video.size / 1024 / 1024).toFixed(1);
  return (
    <div className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,340px)_1fr]">
      <video src={url} controls playsInline className="w-full rounded-3xl bg-black shadow-2xl" />
      <div className="space-y-4">
        <Title sub={`영상 ${mb}MB · 대본도 함께 받아요`}>🎉 자기소개 영상 완성!</Title>
        <QrSend kind="video" video={video} script={script} resetKey={video} />
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onRetake} className="fun-btn-white py-4 text-xl">
            🎬 다시 찍기
          </button>
          <RestartButton onClick={onReset} label="🙋 다음 분 (처음으로)" />
        </div>
      </div>
    </div>
  );
}
