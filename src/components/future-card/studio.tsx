"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CameraCapture } from "./camera";
import { PropButtons, PropEditor } from "./prop-editor";
import {
  DEFAULT_PLACEMENT,
  DEFAULT_STYLE,
  FILTERS,
  PHOTO_SIZE,
  PROPS,
  applyFilter,
  composeFace,
  type FaceStyle,
  type Placement,
} from "@/lib/future-card/faces";
import { CARD_DESIGN_NAMES, ensureAssets, renderCard, type CardDesignId } from "@/lib/future-card/cards";
import { BRANDS, futureYear, type BrandId, type FutureCardBrand } from "@/lib/future-card/brand";
import { EMPTY_INFO, RANKS, randomInfo, type CardInfo } from "@/lib/future-card/presets";
import { uploadCard } from "@/lib/future-card/share";
import { preparePhoto, type PreparedPhoto } from "@/lib/future-card/vision";

const STEPS = ["사진 촬영", "얼굴 스타일", "명함 내용", "명함 디자인", "완성"] as const;

/** 행사(학교)별 설정 — 명함 문구 · 회사 목록 · 랜덤 추천 */
const BrandContext = createContext<FutureCardBrand>(BRANDS.kmou);
const useBrand = () => useContext(BrandContext);

/** 투명 배경 사진 뒤에 깔리는 미리보기 바탕 */
const BACKDROP = "bg-[linear-gradient(180deg,#E3F5FE,#BFE6FB)]";

export function FutureCardStudio({ brand = "kmou" }: { brand?: BrandId }) {
  const firstDesign = BRANDS[brand].designs[0];
  const [step, setStep] = useState(0);
  const [prepared, setPrepared] = useState<PreparedPhoto | null>(null);
  const [processing, setProcessing] = useState(false);
  const [faceStyle, setFaceStyle] = useState<FaceStyle>(DEFAULT_STYLE);
  const [place, setPlace] = useState<Placement>(DEFAULT_PLACEMENT);
  const [info, setInfo] = useState<CardInfo>(EMPTY_INFO);
  const [design, setDesign] = useState<CardDesignId>(firstDesign);

  // 필터는 무거워서 따로 기억해 두고, 소품을 옮길 때는 소품만 다시 그립니다.
  const filtered = useMemo(
    () => (prepared ? applyFilter(prepared.photo, faceStyle.filter, PHOTO_SIZE) : null),
    [prepared, faceStyle.filter],
  );
  const face = useMemo(
    () => (prepared && filtered ? composeFace(filtered, faceStyle.prop, prepared.geom, place) : null),
    [prepared, filtered, faceStyle.prop, place],
  );

  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** 다음 방문객을 위해 모든 입력을 지웁니다. */
  function reset() {
    setPrepared(null);
    setFaceStyle(DEFAULT_STYLE);
    setPlace(DEFAULT_PLACEMENT);
    setInfo(EMPTY_INFO);
    setDesign(firstDesign);
    go(0);
  }

  /** 찍은 사진의 배경을 지우고 얼굴 위치를 찾은 뒤 2단계로 */
  async function onCapture(c: HTMLCanvasElement) {
    setProcessing(true);
    const p = await preparePhoto(c);
    setPrepared(p);
    setPlace(DEFAULT_PLACEMENT);
    setProcessing(false);
    go(1);
  }

  return (
    <BrandContext.Provider value={BRANDS[brand]}>
      <div className="wrap py-8 sm:py-10">
        <Stepper step={step} onJump={go} />

        <div className="mt-8">
          {step === 0 &&
            (processing ? (
              <div className="mx-auto flex aspect-square max-w-xl flex-col items-center justify-center gap-4 rounded-3xl bg-ocean-mist text-center">
                <span className="h-14 w-14 animate-spin rounded-full border-[6px] border-ocean/30 border-t-ocean" />
                <p className="text-lg font-extrabold text-navy">배경을 지우고 있어요…</p>
                <p className="text-sm text-ink-muted">처음 한 번은 몇 초 걸릴 수 있어요</p>
              </div>
            ) : (
              <CameraCapture onCapture={onCapture} />
            ))}

          {step === 1 && prepared && face && (
            <FaceStep
              prepared={prepared}
              face={face}
              style={faceStyle}
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
  prepared: PreparedPhoto;
  face: HTMLCanvasElement;
  style: FaceStyle;
  place: Placement;
  onStyle: (s: FaceStyle) => void;
  onPlace: (p: Placement) => void;
  onRetake: () => void;
  onNext: () => void;
}) {
  const { prepared, face, style, place, onStyle, onPlace } = props;
  // 필터 견본은 소품 없이, 소품 견본은 지금 필터 위에 (작게 만든 사진으로)
  const filterThumbs = useMemo(
    () => FILTERS.map((f) => ({ ...f, url: applyFilter(prepared.photo, f.id, 180).toDataURL("image/png") })),
    [prepared],
  );
  const smallBase = useMemo(() => applyFilter(prepared.photo, style.filter, 180), [prepared, style.filter]);
  // 소품을 고르면 위치가 처음으로 돌아가므로 견본도 처음 위치로 (끌 때마다 다시 그리지 않음)
  const propThumbs = useMemo(
    () =>
      PROPS.map((p) => ({ ...p, url: composeFace(smallBase, p.id, prepared.geom, DEFAULT_PLACEMENT).toDataURL("image/png") })),
    [smallBase, prepared],
  );
  const hasProp = style.prop !== "none";

  return (
    <>
      <StepTitle
        label="Step 2"
        title="필터와 소품을 골라 주세요"
        desc={`필터 ${FILTERS.length}가지 × 소품 ${PROPS.length}가지 — 소품은 사진 위에서 직접 끌어 맞출 수 있어요.`}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div className="mx-auto w-full max-w-md lg:sticky lg:top-24 lg:max-w-none lg:self-start">
          <PropEditor
            face={face}
            place={place}
            onPlace={onPlace}
            editable={hasProp}
            className={`aspect-square w-full rounded-3xl shadow-lg ${BACKDROP}`}
          />
          {hasProp && (
            <p className="mt-2 rounded-xl bg-ocean-mist px-3 py-2 text-center text-xs font-bold text-navy">
              ☝️ 소품을 끌어서 옮기고, ✌️ 두 손가락으로 크기 · 각도를 맞추세요
            </p>
          )}
          {hasProp && !prepared.faceFound && (
            <p className="mt-2 rounded-xl bg-sun/20 px-3 py-2 text-xs font-bold text-[#8A6A00]">
              얼굴을 찾지 못해 소품이 기본 위치에 있어요. 끌어서 맞추거나 정면으로 다시 찍어 주세요.
            </p>
          )}
          {!prepared.cutout && (
            <p className="mt-2 rounded-xl bg-sun/20 px-3 py-2 text-xs font-bold text-[#8A6A00]">
              배경을 지우지 못했어요. 인터넷 연결을 확인하고 다시 찍어 주세요.
            </p>
          )}
          {hasProp && (
            <div className="card mt-3 p-3">
              <PropButtons place={place} onPlace={onPlace} />
            </div>
          )}
          <button type="button" onClick={props.onRetake} className="btn-outline mt-3 w-full">
            📸 다시 찍기
          </button>
        </div>

        <div className="space-y-8">
          <ThumbGrid
            title="🎨 필터"
            items={filterThumbs.map((f) => ({ key: f.id, url: f.url, name: f.name, desc: f.desc }))}
            selected={style.filter}
            onPick={(id) => onStyle({ ...style, filter: id as FaceStyle["filter"] })}
          />
          <ThumbGrid
            title="🎩 소품"
            items={propThumbs.map((p) => ({ key: p.id, url: p.url, name: `${p.emoji} ${p.name}` }))}
            selected={style.prop}
            onPick={(id) => {
              onStyle({ ...style, prop: id as FaceStyle["prop"] });
              // 소품마다 맞는 자리가 달라 바꿀 때는 처음 위치에서 시작
              onPlace(DEFAULT_PLACEMENT);
            }}
          />
          <NavButtons onNext={props.onNext} nextLabel="다음 · 명함 내용 입력 →" />
        </div>
      </div>
    </>
  );
}

function ThumbGrid(props: {
  title: string;
  items: { key: string; url: string; name: string; desc?: string }[];
  selected: string;
  onPick: (key: string) => void;
}) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-extrabold text-navy">{props.title}</h3>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-6">
        {props.items.map((it) => {
          const on = it.key === props.selected;
          return (
            <li key={it.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => props.onPick(it.key)}
                className={`w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition ${
                  on ? "border-ocean ring-4 ring-ocean/20" : "border-ink-line hover:border-ocean/50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt="" className={`aspect-square w-full ${BACKDROP}`} />
                <span className="block px-2 py-1.5">
                  <span className="block truncate text-[13px] font-extrabold text-navy">{it.name}</span>
                  {it.desc && <span className="block truncate text-[10px] text-ink-muted">{it.desc}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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

          <Field label="부서 · 직무" value={info.dept} onChange={set("dept")} placeholder={brand.depts[0]} />

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

          <Field label="나의 한마디" value={info.slogan} onChange={set("slogan")} placeholder={brand.slogans[0]} maxLength={30} />

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
  const brand = useBrand();
  return (
    <>
      <StepTitle label="Step 4" title="명함 디자인을 골라 주세요" desc={`${brand.designs.length}가지 디자인 중 마음에 드는 것을 고르세요.`} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <CardPreview face={props.face} info={props.info} design={props.design} scale={0.6} className="shadow-xl" />
          <NavButtons onBack={props.onBack} onNext={props.onNext} nextLabel="✨ 명함 만들기" />
        </div>
        <ul className="grid grid-cols-2 gap-3 self-start">
          {brand.designs.map((id) => {
            const on = id === props.design;
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => props.onDesign(id)}
                  className={`w-full rounded-2xl border-2 bg-white p-2 text-left transition ${
                    on ? "border-ocean ring-4 ring-ocean/20" : "border-ink-line hover:border-ocean/50"
                  }`}
                >
                  <CardPreview face={props.face} info={props.info} design={id} scale={0.25} />
                  <span className="mt-2 block px-1 text-sm font-extrabold text-navy">{CARD_DESIGN_NAMES[id]}</span>
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
      {/* 휴대폰으로 받는 행사는 저장 · 인쇄 없이 QR 만 */}
      {!brand.receivePath && (
        <style>{`@media print {
        @page { size: 90mm 50mm; margin: 0; }
        body * { visibility: hidden !important; }
        #future-card-print, #future-card-print * { visibility: visible !important; }
        #future-card-print { position: fixed; top: 0; left: 0; width: 90mm; height: 50mm; }
      }`}</style>
      )}

      <div className="mx-auto max-w-4xl">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img id="future-card-print" src={url} alt={`${props.info.name}님의 미래 명함`} className="w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="aspect-[9/5] w-full animate-pulse rounded-2xl bg-ink-bg" />
        )}

        {brand.receivePath && <SendToPhone {...props} receivePath={brand.receivePath} />}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {!brand.receivePath && (
            <>
              <button type="button" onClick={download} disabled={!url} className="btn-primary py-4 text-base">
                ⬇️ 이미지 저장 (PNG)
              </button>
              <button type="button" onClick={() => window.print()} disabled={!url} className="btn-outline py-4 text-base">
                🖨️ 인쇄하기 (90×50mm)
              </button>
            </>
          )}
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

/** 완성 명함을 올리고 QR 을 보여 줍니다 → 방문객이 자기 휴대폰 카메라로 찍어 받기 */
function SendToPhone(props: { face: HTMLCanvasElement; info: CardInfo; design: CardDesignId; receivePath: string }) {
  const brand = useBrand();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error" | "off">("idle");
  const [qr, setQr] = useState("");

  // 디자인이나 내용이 바뀌면 다시 보내야 합니다.
  useEffect(() => {
    setState("idle");
    setQr("");
  }, [props.face, props.info, props.design]);

  async function send() {
    setState("sending");
    try {
      await ensureAssets(props.info, brand);
      const link = await uploadCard(renderCard(props.face, props.info, props.design, brand, 1), props.receivePath);
      setQr(await QRCode.toDataURL(link, { width: 480, margin: 1, color: { dark: "#0B2A78" } }));
      setState("done");
    } catch (e) {
      setState(e instanceof Error && e.message === "not-configured" ? "off" : "error");
    }
  }

  return (
    <div className="mt-8 rounded-3xl border-2 border-ocean/30 bg-ocean-mist p-5 text-center sm:p-6">
      {state === "done" ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="명함 받기 QR 코드" className="h-56 w-56 shrink-0 rounded-2xl bg-white p-3 shadow-lg" />
          <div>
            <p className="text-2xl font-black text-navy">📱 휴대폰 카메라로 QR을 찍으세요!</p>
            <p className="mt-2 text-sm font-semibold text-ink-soft">
              열린 페이지에서 ‘사진으로 저장’이나 ‘카톡 · 문자로 보내기’를 누르면 내 명함을 가져갈 수 있어요.
            </p>
            <p className="mt-2 text-xs text-ink-muted">명함 이미지는 3일 뒤 자동으로 지워집니다.</p>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={send}
            disabled={state === "sending"}
            className="btn-primary w-full py-5 text-lg disabled:opacity-60"
          >
            {state === "sending" ? "QR 만드는 중…" : "📱 내 휴대폰으로 받기 (QR)"}
          </button>
          {state === "error" && (
            <p className="mt-3 text-sm font-bold text-[#C0392B]">보내지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.</p>
          )}
          {state === "off" && (
            <p className="mt-3 text-sm font-bold text-[#C0392B]">
              QR 받기가 아직 설정되지 않았어요. 부스 담당자에게 알려 주세요. (Vercel Blob 저장소 연결 필요)
            </p>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            누르면 완성된 명함 이미지가 서버에 올라가며, 3일 뒤 자동으로 지워집니다.
          </p>
        </>
      )}
    </div>
  );
}

// ── 공통 ────────────────────────────────────────────────────

function useCardUrl(face: HTMLCanvasElement, info: CardInfo, design: CardDesignId, scale: number) {
  const brand = useBrand();
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    ensureAssets(info, brand).then(() => {
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
