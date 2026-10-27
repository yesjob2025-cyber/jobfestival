import Link from "next/link";
import { Confetti } from "@/components/kdu/confetti";
import { KDU_BENEFITS, KDU_EXPO, KDU_PROGRAMS } from "@/lib/kdu";

export default function KduHomePage() {
  return (
    <>
      <Hero />
      <Info />
      {/* 포스터 하단의 네이비 물결 */}
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="-mb-px block h-12 w-full sm:h-20" aria-hidden>
        <path d="M0 70 C 300 10 620 20 900 50 S 1300 80 1440 20 L1440 90 L0 90 Z" fill="#0B2A78" />
      </svg>
    </>
  );
}

// ── 첫 화면: 포스터 제목 + 마스코트 ─────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-kdu-sky via-[#3EC3FE] to-kdu-sky-light">
      <Confetti />
      <div className="wrap relative grid items-center gap-4 pb-12 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-14">
        <div className="text-center lg:text-left">
          <p className="inline-block -rotate-2 rounded-xl bg-kdu-navy px-5 py-2.5 font-jua text-xl text-white shadow-[0_6px_0_#0B2A78] sm:px-7 sm:text-3xl">
            당신의 미래, <span className="text-kdu-yellow">즐겁게</span> 준비하자!
          </p>
          <br />
          <p className="mt-5 inline-block -rotate-1 rounded-2xl border-[3px] border-kdu-navy bg-white px-5 py-1.5 font-jua text-3xl text-kdu-navy-deep shadow-[0_6px_0_#0B2A78] sm:text-5xl">
            2026학년도 경동대학교
          </p>

          <h1 className="mt-6 font-fun text-[clamp(3.6rem,11.5vw,6.6rem)] font-bold leading-[1] tracking-tight">
            <span className="sr-only">{KDU_EXPO.title}</span>
            <span aria-hidden className="kdu-3d block">
              <span className="text-kdu-yellow">Fun</span> <span className="text-white">Fun</span>
            </span>
            <span aria-hidden className="kdu-3d block">
              <span className="text-white">Job</span> <span className="text-kdu-yellow">Festival</span>
            </span>
          </h1>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/kdu/future-card"
              className="btn bg-kdu-yellow px-7 py-4 font-jua text-xl font-normal text-kdu-navy-deep shadow-[0_6px_0_#0B2A78] transition hover:-translate-y-0.5 hover:bg-sun-deep"
            >
              📸 10년 후 미래 명함 만들기
            </Link>
            <a
              href="#info"
              className="btn border-[3px] border-kdu-navy bg-white px-7 py-4 font-jua text-xl font-normal text-kdu-navy shadow-[0_6px_0_#0B2A78] transition hover:-translate-y-0.5"
            >
              행사 안내 보기
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-6 w-[min(72vw,340px)] lg:mt-0 lg:w-full">
          <SpeechBubble className="absolute -left-6 -top-6 z-10 sm:-left-16 lg:-left-24" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kdu/lion.webp"
            alt="경동대학교 마스코트 사자"
            width={509}
            height={741}
            className="kdu-float relative w-full drop-shadow-[0_18px_20px_rgba(11,42,120,0.35)]"
          />
        </div>
      </div>
    </section>
  );
}

function SpeechBubble({ className = "" }: { className?: string }) {
  return (
    <div className={`rotate-[-6deg] ${className}`}>
      <div className="relative rounded-[50%] bg-kdu-navy px-7 py-5 text-center font-hand text-2xl leading-tight text-white shadow-[0_6px_0_#0B2A78] sm:px-9 sm:py-6 sm:text-[1.7rem]">
        즐거운 취업,
        <br />
        여기 다 있<span className="text-kdu-yellow">JOB!</span>
        <span className="absolute -bottom-3 right-10 h-7 w-7 rotate-45 bg-kdu-navy" />
      </div>
    </div>
  );
}

// ── 행사 안내 ─────────────────────────────────────────────────

function Info() {
  return (
    <section id="info" className="scroll-mt-20 bg-gradient-to-b from-kdu-sky-light to-kdu-sky-pale">
      <div className="wrap grid gap-12 py-14 sm:py-20 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="space-y-12 xl:col-start-1">
          <dl className="space-y-4">
            <InfoRow icon={<CalendarIcon />} label="날짜">
              2026. <b className="text-2xl font-black sm:text-3xl">10. 28</b> (수) {KDU_EXPO.timeLabel}
            </InfoRow>
            <InfoRow icon={<PinIcon />} label="장소">
              {KDU_EXPO.venue}
            </InfoRow>
            <InfoRow icon={<BuildingIcon />} label="주관">
              {KDU_EXPO.host}
            </InfoRow>
          </dl>

          <div className="kdu-card relative px-5 pb-6 pt-10 sm:px-8">
            <span className="kdu-pill absolute -top-5 left-1/2 -translate-x-1/2">프로그램</span>
            <ul className="grid gap-6 sm:grid-cols-2 sm:divide-x-2 sm:divide-dashed sm:divide-kdu-navy/25">
              {KDU_PROGRAMS.map((p, i) => (
                <li key={p.name} className={`flex items-center gap-4 ${i ? "sm:pl-6" : ""}`}>
                  <span
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ${
                      i ? "bg-kdu-pink/15" : "bg-kdu-navy/10"
                    }`}
                  >
                    {p.icon}
                  </span>
                  <span>
                    <span className="block font-jua text-2xl text-kdu-navy-deep">{p.name}</span>
                    <span className="mt-1 block text-[15px] font-semibold text-ink-soft break-keep">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border-[3px] border-kdu-pink bg-white px-5 pb-6 pt-10 shadow-[0_10px_0_-2px_rgba(228,69,122,0.25)] sm:px-8">
            <span className="kdu-pill absolute -top-5 left-1/2 -translate-x-1/2 bg-kdu-pink">혜택</span>
            <ul className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x-2 sm:divide-dashed sm:divide-kdu-navy/20">
              {KDU_BENEFITS.map((b) => (
                <li key={b.name} className="flex flex-col items-center gap-2 text-center">
                  <span className="text-5xl">{b.icon}</span>
                  <span className="text-base font-bold text-ink">{b.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 좁은 화면: 안내 → 미래 명함 → 포스터 / 넓은 화면: 왼쪽 안내 · 포스터, 오른쪽 미래 명함 */}
        <div className="xl:sticky xl:top-24 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-start">
          <FutureCardPromo />
        </div>

        <div className="xl:col-start-1">
          <a
            href="/kdu/poster.jpg"
            target="_blank"
            rel="noreferrer"
            className="group mx-auto block max-w-xs overflow-hidden rounded-3xl border-[3px] border-kdu-navy bg-white shadow-[0_10px_0_-2px_rgba(11,42,120,0.25)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kdu/poster.jpg" alt={`${KDU_EXPO.title} 포스터`} className="w-full transition group-hover:scale-[1.02]" />
            <span className="block py-3 text-center font-jua text-lg text-kdu-navy">행사 포스터 크게 보기 ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b-2 border-dotted border-kdu-navy/30 pb-4 sm:flex-row sm:items-center sm:gap-5">
      <dt className="flex w-fit shrink-0 items-center gap-2 rounded-full bg-kdu-navy py-1.5 pl-1.5 pr-6 font-jua text-xl text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-kdu-navy">{icon}</span>
        {label}
      </dt>
      <dd className="text-lg font-bold text-kdu-navy-deep break-keep sm:text-xl">{children}</dd>
    </div>
  );
}

/** 이벤트관 — 미래 명함 만들기 소개 */
function FutureCardPromo() {
  return (
    <div className="relative overflow-hidden rounded-3xl border-[3px] border-kdu-navy bg-kdu-yellow p-6 shadow-[0_10px_0_-2px_rgba(11,42,120,0.3)] sm:p-8">
      <span className="inline-flex rounded-full bg-kdu-navy px-4 py-1.5 font-jua text-base text-white">이벤트관 · 부스 체험</span>
      <h2 className="mt-4 font-jua text-3xl leading-tight text-kdu-navy-deep sm:text-4xl">
        10년 후, 나는
        <br />
        어떤 명함을 갖고 있을까?
      </h2>
      <p className="mt-3 text-[15px] font-semibold text-kdu-navy-deep/80 break-keep">
        사진 한 장 찍고 회사 · 직무 · 직급을 정하면, 2036년의 내 명함이 완성돼요!
      </p>

      {/* 명함 예시 */}
      <div className="my-7 flex justify-center">
        <div className="relative flex aspect-[9/5] w-full max-w-[340px] rotate-[-4deg] items-center gap-4 rounded-xl bg-kdu-navy-deep p-4 text-white shadow-2xl">
          <span className="absolute left-4 top-4 font-jua text-sm text-kdu-yellow">KDU 라이언스 벤처스</span>
          <div className="mt-6 flex-1">
            <p className="text-[11px] font-bold text-kdu-sky-light">CEO · 사장</p>
            <p className="font-jua text-3xl">김경동</p>
            <p className="mt-1 text-[10px] text-white/70">“즐거운 취업, 여기 다 있JOB!”</p>
          </div>
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-kdu-yellow bg-kdu-sky">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kdu/lion.webp" alt="" className="mt-1 w-full scale-[1.6] object-cover object-top" />
          </div>
          <span className="absolute bottom-3 right-4 font-fun text-[11px] font-bold text-kdu-yellow">KDU · 2036</span>
        </div>
      </div>

      <ol className="flex flex-wrap justify-center gap-1.5 text-sm font-bold text-kdu-navy-deep">
        {["사진 촬영", "얼굴 스타일 10종", "명함 내용", "디자인 6종", "완성!"].map((s, i) => (
          <li key={s} className="rounded-full bg-white/70 px-3 py-1">
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <Link
        href="/kdu/future-card"
        className="btn mt-6 w-full bg-kdu-navy py-4 font-jua text-xl font-normal text-white shadow-[0_5px_0_#0B2A78] hover:bg-kdu-navy-deep"
      >
        지금 만들어 보기 →
      </Link>
    </div>
  );
}

// ── 아이콘 ───────────────────────────────────────────────────

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth="3" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M2 21h20M9 21v-5h6v5M8 11h.01M12 11h.01M16 11h.01" />
    </svg>
  );
}
