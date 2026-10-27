"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CameraCapture } from "./camera";
import {
  DEFAULT_PLACEMENT,
  FACE_STYLES,
  PHOTO_SIZE,
  hasAccessory,
  renderFace,
  type FaceStyleId,
  type Placement,
} from "@/lib/future-card/faces";
import { CARD_DESIGNS, ensureFonts, renderCard, type CardDesignId } from "@/lib/future-card/cards";
import { BRANDS, futureYear, type BrandId, type FutureCardBrand } from "@/lib/future-card/brand";
import { EMPTY_INFO, RANKS, randomInfo, type CardInfo } from "@/lib/future-card/presets";

const STEPS = ["사진 촬영", "얼굴 스타일", "명함 내용", "명함 디자인", "완성"] as const;

/** 행사(학교)별 설정 — 명함 문구 · 회사 목록 · 랜덤 추천 */
const BrandContext = createContext<FutureCardBrand>(BRANDS.kmou);
const useBrand = () => useContext(BrandContext);

export function FutureCardStudio({ brand = "kmou" }: { brand?: BrandId }) {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<HTMLCanvasElement | null>(null);
  const [faceStyle, setFaceStyle] = useState<FaceStyleId>("natural");
  const [place, setPlace] = useState<Placement>(DEFAULT_PLACEMENT);
  const [info, setInfo] = useState<CardInfo>(EMPTY_INFO);
  const [design, setDesign] = useState<CardDesignId>("navy");

  const face = useMemo(
    () => (photo ? renderFace(photo, faceStyle, PHOTO_SIZE, place) : null),
    [photo, faceStyle, place],
  );

  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** 다음 방문객을 위해 모든 입력을 지웁니다. */
  function reset() {
    setPhoto(null);
    setFaceStyle("natural");
    setPlace(DEFAULT_PLACEMENT);
    setInfo(EMPTY_INFO);
    setDesign("navy");
    go(0);
  }

  return (
    <BrandContext.Provider value={BRANDS[brand]}>
      <div className="wrap py-8 sm:py-10">
        <Stepper step={step} onJump={go} />

        <div className="mt-8">
          {step === 0 && (
            <CameraCapture
              onCapture={(c) => {
                setPhoto(c);
                setPlace(DEFAULT_PLACEMENT);
                go(1);
              }}
            />
          )}

          {step === 1 && photo && face && (
            <FaceStep
              photo={photo}
              face={face}
              styleId={faceStyle}
              place={place}
              onStyle={setFaceStyle}
              onPlace={setPlace}
              onRetake={() => go(0)}
              onNext={() => go(2)}
            />
          )}

          {step === 2 && face && (
            <InfoStep face={face} info={info} design={design} onChange={setInfo} onBack={() => go(1)} onNext={() => go(3)} />
          )}

          {step === 3 && face && (
            <DesignStep face={face} info={info} design={design} onDesign={setDesign} onBack={() => go(2)} onNext={() => go(4)} />
          )}

          {step === 4 && face && <ResultStep face={face} info={info} design={design} onBack={() => go(3)} onReset={reset} />}
        </div>
      </div>
    </BrandContext.Provider>
  );
}

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="grid grid-cols-5 gap-1.5 sm:gap-3">
      {STEPS.map((label, i) => {
        const state = i === step ? "now" : i < step ? "done" : "todo";
        return (
          <li key={label}>
            <button
              type="button"
              disabled={i >= step}
              onClick={() => onJump(i)}
              className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center transition sm:flex-row sm:justify-center sm:gap-2 ${
                state === "now"
                  ? "bg-navy text-white"
                  : state === "done"
                    ? "bg-ocean-mist text-navy hover:bg-ocean-pale/60"
                    : "bg-ink-bg text-ink-muted"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  state === "now" ? "bg-sun text-navy-deep" : state === "done" ? "bg-navy text-white" : "bg-white text-ink-muted"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span className="text-[11px] font-bold leading-tight break-keep sm:text-sm">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function StepTitle({ label, title, desc }: { label: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <p className="label">{label}</p>
      <h2 className="h-section mt-1.5">{title}</h2>
      {desc && <p className="mt-2 text-sm text-ink-muted">{desc}</p>}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel, disabled }: { onBack?: () => void; onNext: () => void; nextLabel: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex gap-3">
      {onBack && (
        <button type="button" onClick={onBack} className="btn-outline py-4">
          ← 이전
        </button>
      )}
      <button type="button" onClick={onNext} disabled={disabled} className="btn-primary flex-1 py-4 text-base disabled:opacity-40">
        {nextLabel}
      </button>
    </div>
  );
}

// ── 2단계: 얼굴 스타일 ─────────────────────────────────────────

function FaceStep(props: {
  photo: HTMLCanvasElement;
  face: HTMLCanvasElement;
  styleId: FaceStyleId;
  place: Placement;
  onStyle: (id: FaceStyleId) => void;
  onPlace: (p: Placement) => void;
  onRetake: () => void;
  onNext: () => void;
}) {
  const { photo, face, styleId, place, onStyle, onPlace } = props;
  const faceUrl = useMemo(() => face.toDataURL("image/jpeg", 0.9), [face]);
  const thumbs = useMemo(
    () => FACE_STYLES.map((s) => ({ ...s, url: renderFace(photo, s.id, 200, place).toDataURL("image/jpeg", 0.85) })),
    [photo, place],
  );
  const nudge = (d: Partial<Placement>) =>
    onPlace({
      dy: clampNum(place.dy + (d.dy ?? 0), -0.18, 0.18),
      scale: clampNum(place.scale + (d.scale ?? 0), 0.7, 1.4),
    });

  return (
    <>
      <StepTitle label="Step 2" title="얼굴 스타일을 골라 주세요" desc="10가지 중 하나를 고르면 왼쪽 미리보기에 바로 반영됩니다." />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faceUrl} alt="선택한 스타일 미리보기" className="aspect-square w-full rounded-3xl object-cover shadow-lg" />
          <button type="button" onClick={props.onRetake} className="btn-outline mt-3 w-full">
            📸 다시 찍기
          </button>

          {hasAccessory(styleId) && (
            <div className="card mt-3 p-4">
              <p className="text-sm font-bold text-navy">액세서리 위치 맞추기</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <button type="button" className="btn-outline btn-sm py-3" onClick={() => nudge({ dy: -0.015 })}>
                  ▲ 위로
                </button>
                <button type="button" className="btn-outline btn-sm py-3" onClick={() => nudge({ dy: 0.015 })}>
                  ▼ 아래로
                </button>
                <button type="button" className="btn-outline btn-sm py-3" onClick={() => nudge({ scale: -0.05 })}>
                  － 작게
                </button>
                <button type="button" className="btn-outline btn-sm py-3" onClick={() => nudge({ scale: 0.05 })}>
                  ＋ 크게
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {thumbs.map((s) => {
              const on = s.id === styleId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onStyle(s.id)}
                    className={`w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition ${
                      on ? "border-ocean ring-4 ring-ocean/20" : "border-ink-line hover:border-ocean/50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.url} alt="" className="aspect-square w-full object-cover" />
                    <span className="block px-2.5 py-2">
                      <span className="block text-sm font-extrabold text-navy">{s.name}</span>
                      <span className="block truncate text-[11px] text-ink-muted">{s.desc}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <NavButtons onNext={props.onNext} nextLabel="다음 · 명함 내용 입력 →" />
        </div>
      </div>
    </>
  );
}

// ── 3단계: 명함 내용 ──────────────────────────────────────────

function InfoStep(props: {
  face: HTMLCanvasElement;
  info: CardInfo;
  design: CardDesignId;
  onChange: (info: CardInfo) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { info, onChange } = props;
  const brand = useBrand();
  const set = (key: keyof CardInfo) => (value: string) => onChange({ ...info, [key]: value });
  const ready = info.name.trim() !== "" && info.company.trim() !== "";
  const preview = useMemo(() => withPlaceholders(info), [info]);

  return (
    <>
      <StepTitle
        label="Step 3"
        title={`${futureYear(brand)}년, 10년 후 나의 명함`}
        desc="이름과 회사는 꼭 입력해 주세요. 나머지는 ‘랜덤 추천’으로 채워도 됩니다."
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,520px)]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="이름 *" value={info.name} onChange={set("name")} placeholder="홍길동" />
            <Field label="영문 이름" value={info.nameEn} onChange={set("nameEn")} placeholder="Gildong Hong" />
          </div>

          <div>
            <Field label="회사 *" value={info.company} onChange={set("company")} placeholder="회사 이름을 입력하거나 아래에서 고르세요" />
            <select
              className="field mt-2"
              value=""
              onChange={(e) => e.target.value && set("company")(e.target.value)}
              aria-label={brand.companiesLabel}
            >
              <option value="">{brand.companiesLabel}</option>
              {brand.companies.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <Field label="부서 · 직무" value={info.dept} onChange={set("dept")} placeholder="해운영업본부" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Field label="직급" value={info.rank} onChange={set("rank")} placeholder="부장" />
              <Chips options={RANKS} value={info.rank} onPick={set("rank")} />
            </div>
            <div>
              <Field label="직책" value={info.position} onChange={set("position")} placeholder="팀장" />
              <Chips options={brand.positions} value={info.position} onPick={set("position")} />
            </div>
          </div>

          <Field label="나의 한마디" value={info.slogan} onChange={set("slogan")} placeholder="바다처럼 넓게, 파도처럼 힘차게" maxLength={30} />

          <button type="button" onClick={() => onChange(randomInfo(brand, info))} className="btn-sun w-full py-3.5">
            🎲 회사 · 직무 · 직급 랜덤 추천
          </button>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-xs font-bold text-ink-muted">미리보기</p>
          <CardPreview face={props.face} info={preview} design={props.design} scale={0.4} className="shadow-xl" />
          <NavButtons onBack={props.onBack} onNext={props.onNext} nextLabel="다음 · 디자인 고르기 →" disabled={!ready} />
        </div>
      </div>
    </>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-navy">{props.label}</span>
      <input
        className="field py-3 text-base"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        maxLength={props.maxLength ?? 40}
        autoComplete="off"
      />
    </label>
  );
}

function Chips({ options, value, onPick }: { options: readonly string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
            o === value ? "border-navy bg-navy text-white" : "border-ink-line bg-white text-ink-soft hover:border-ocean/50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── 4단계: 명함 디자인 ─────────────────────────────────────────

function DesignStep(props: {
  face: HTMLCanvasElement;
  info: CardInfo;
  design: CardDesignId;
  onDesign: (id: CardDesignId) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <StepTitle label="Step 4" title="명함 디자인을 골라 주세요" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <CardPreview face={props.face} info={props.info} design={props.design} scale={0.6} className="shadow-xl" />
          <NavButtons onBack={props.onBack} onNext={props.onNext} nextLabel="✨ 명함 만들기" />
        </div>
        <ul className="grid grid-cols-2 gap-3 self-start">
          {CARD_DESIGNS.map((d) => {
            const on = d.id === props.design;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => props.onDesign(d.id)}
                  className={`w-full rounded-2xl border-2 bg-white p-2 text-left transition ${
                    on ? "border-ocean ring-4 ring-ocean/20" : "border-ink-line hover:border-ocean/50"
                  }`}
                >
                  <CardPreview face={props.face} info={props.info} design={d.id} scale={0.25} />
                  <span className="mt-2 block px-1 text-sm font-extrabold text-navy">{d.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

// ── 5단계: 완성 ──────────────────────────────────────────────

function ResultStep(props: { face: HTMLCanvasElement; info: CardInfo; design: CardDesignId; onBack: () => void; onReset: () => void }) {
  const brand = useBrand();
  const url = useCardUrl(props.face, props.info, props.design, 1);

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    // 한글 파일명은 일부 브라우저에서 "download" 로 바뀌므로 영문으로 저장합니다.
    a.download = `${brand.short}-future-card-${futureYear(brand)}-${Date.now() % 100000}.png`;
    a.click();
  }

  return (
    <>
      <StepTitle label="Step 5" title={`${props.info.name}님의 ${futureYear(brand)}년 명함이 나왔어요! 🎉`} />
      <style>{`@media print {
        @page { size: 90mm 50mm; margin: 0; }
        body * { visibility: hidden !important; }
        #future-card-print, #future-card-print * { visibility: visible !important; }
        #future-card-print { position: fixed; top: 0; left: 0; width: 90mm; height: 50mm; }
      }`}</style>

      <div className="mx-auto max-w-4xl">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img id="future-card-print" src={url} alt={`${props.info.name}님의 미래 명함`} className="w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="aspect-[9/5] w-full animate-pulse rounded-2xl bg-ink-bg" />
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={download} disabled={!url} className="btn-primary py-4 text-base">
            ⬇️ 이미지 저장 (PNG)
          </button>
          <button type="button" onClick={() => window.print()} disabled={!url} className="btn-outline py-4 text-base">
            🖨️ 인쇄하기 (90×50mm)
          </button>
          <button type="button" onClick={props.onBack} className="btn-outline py-4">
            ← 디자인 다시 고르기
          </button>
          <button type="button" onClick={props.onReset} className="btn-sun py-4 text-base">
            🙋 다음 분 시작하기 (처음으로)
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-ink-muted">
          ‘다음 분 시작하기’를 누르면 사진과 입력 내용이 모두 지워집니다.
        </p>
      </div>
    </>
  );
}

// ── 공통 ────────────────────────────────────────────────────

function useCardUrl(face: HTMLCanvasElement, info: CardInfo, design: CardDesignId, scale: number) {
  const brand = useBrand();
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    ensureFonts(info, brand).then(() => {
      if (alive) setUrl(renderCard(face, info, design, brand, scale).toDataURL("image/png"));
    });
    return () => {
      alive = false;
    };
  }, [face, info, design, brand, scale]);
  return url;
}

function CardPreview(props: { face: HTMLCanvasElement; info: CardInfo; design: CardDesignId; scale: number; className?: string }) {
  const url = useCardUrl(props.face, props.info, props.design, props.scale);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="명함 미리보기" className={`aspect-[9/5] w-full rounded-xl ${props.className ?? ""}`} />
  ) : (
    <div className={`aspect-[9/5] w-full rounded-xl bg-ink-bg ${props.className ?? ""}`} />
  );
}

function withPlaceholders(info: CardInfo): CardInfo {
  return { ...info, name: info.name || "홍길동", company: info.company || "회사명" };
}

function clampNum(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
