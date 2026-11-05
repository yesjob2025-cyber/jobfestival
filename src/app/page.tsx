import Link from "next/link";
import { FunFonts } from "@/components/fun/fun-fonts";
import { InquiryForm } from "@/components/landing/inquiry-form";
import { CORNERS, FUN_EVENTS } from "@/lib/fun/config";
import { SERVICE } from "@/lib/service";

/** 잡페스티벌 첫 화면 — 행사 운영 시스템 + 부대행사 소개 → 체험하기 → 도입 문의 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <FunFonts />
      <header className="sticky top-0 z-50 border-b border-ink-line/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-4 px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#13399A] text-xs font-black text-kdu-yellow">JF</span>
            {SERVICE.name}
          </Link>
          <nav className="ml-auto hidden items-center gap-1 text-sm font-bold text-ink-soft md:flex">
            <a href="#system" className="rounded-lg px-3 py-2 hover:bg-ink-bg">행사 운영</a>
            <a href="#booths" className="rounded-lg px-3 py-2 hover:bg-ink-bg">부대행사</a>
            <a href="#how" className="rounded-lg px-3 py-2 hover:bg-ink-bg">도입 절차</a>
            <a href="#contact" className="rounded-lg px-3 py-2 hover:bg-ink-bg">도입 문의</a>
          </nav>
          <Link href="/login" className="ml-auto rounded-xl border-2 border-[#13399A] px-4 py-2 text-sm font-extrabold text-[#13399A] md:ml-2">
            기관 로그인
          </Link>
        </div>
      </header>

      {/* 첫 화면 */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0B1F4D_0%,#13399A_55%,#08A0F6_100%)] text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-kdu-yellow/10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div>
            <p className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">🎪 취업박람회 · 채용 행사 담당자를 위한</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              등록부터 결과보고서까지,
              <br />
              <span className="text-kdu-yellow">행사 운영을 한 번에</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85 break-keep">
              사전등록 · QR 입장 · 부스 스탬프 · 퇴장 설문이 자동으로 쌓이고, 행사가 끝나면 결과보고서가 바로 나와요. 학생들이 줄 서는 부대행사도 태블릿 한 대로.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#booths" className="rounded-2xl bg-kdu-yellow px-6 py-4 text-lg font-extrabold text-[#0B1F4D] shadow-[0_5px_0_#B98A00]">
                부대행사 체험하기
              </a>
              <a href="#contact" className="rounded-2xl border-2 border-white/70 px-6 py-4 text-lg font-extrabold text-white">
                도입 문의
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">체험은 부대행사마다 {SERVICE.trialLimit}번까지 해 볼 수 있어요.</p>
          </div>
          <FlowCard />
        </div>
      </section>

      {/* 행사 운영 시스템 */}
      <section id="system" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <SectionTitle kicker="행사 운영 시스템" title="참가자는 QR 하나로, 담당자는 대시보드 하나로" />
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {[
            ["📝", "사전등록", "행사 전용 페이지에서 1분 등록 — 휴대폰에 입장 QR"],
            ["🟢", "QR 입장", "입구에서 스캔 한 번. 현장등록도 바로 입장"],
            ["🎪", "부스 스탬프", "부스마다 QR 을 찍어 참여 기록 · 스탬프 투어"],
            ["💬", "퇴장 설문", "나갈 때 만족도 설문 → 기념품 안내까지 자동"],
            ["📑", "결과보고서", "참여 인원 · 시간대 · 부스 · 만족도를 PDF 로"],
          ].map(([e, t, d], i) => (
            <li key={t} className="relative rounded-3xl border border-ink-line bg-ink-bg p-5">
              <span className="absolute right-4 top-4 font-fun text-2xl font-bold text-ink-line">{i + 1}</span>
              <span className="text-4xl">{e}</span>
              <p className="mt-3 text-lg font-extrabold">{t}</p>
              <p className="mt-1 text-sm text-ink-soft break-keep">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["👥 등록자 현황", "실시간 등록 · 입장 · 행사장 안 · 퇴장 인원, 학교 · 학과 · 학년 구성, 엑셀 내려받기"],
            ["🎪 부스별 참여 현황", "부스마다 참여 인원 · 체험 횟수, 시간대별 붐비는 정도, 스탬프 투어 완성 인원"],
            ["💬 만족도 결과", "문항별 평균 · 분포, 참가자 의견 모음 — 실적 증빙 자료로 바로"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-3xl bg-[#0B1F4D] p-6 text-white">
              <p className="text-lg font-extrabold">{t}</p>
              <p className="mt-2 text-sm text-white/75 break-keep">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 부대행사 */}
      <section id="booths" className="scroll-mt-20 bg-kdu-sky-pale py-20">
        <div className="mx-auto max-w-6xl px-5">
          <SectionTitle kicker="부대행사" title="학생들이 줄 서는 부스, 태블릿 한 대로" sub={`결과는 모두 QR 로 학생 휴대폰에. 행사 이름 · 로고가 결과물에 들어가요. 지금 바로 체험해 보세요 (부대행사마다 ${SERVICE.trialLimit}회).`} />
          <div className="mt-10 space-y-10">
            {CORNERS.map((c) => (
              <div key={c.id}>
                <div className="mb-4 flex flex-wrap items-end gap-3">
                  <h3 className="rounded-2xl px-5 py-2 font-jua text-2xl text-white shadow-[0_5px_0_#0B2A78]" style={{ background: c.color }}>
                    {c.emoji} {c.name}
                  </h3>
                  <p className="pb-1 font-jua text-lg text-kdu-navy-deep">{c.desc}</p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {FUN_EVENTS.filter((e) => e.corner === c.id).map((e) => (
                    <li key={e.slug}>
                      <Link
                        href={`/try/${e.slug}`}
                        className="group flex h-full flex-col rounded-3xl border-[3px] border-kdu-navy bg-white p-5 shadow-[0_6px_0_#0B2A78] transition hover:-translate-y-1"
                      >
                        <span className="text-5xl">{e.emoji}</span>
                        <span className="mt-3 font-jua text-2xl text-kdu-navy-deep">{e.name}</span>
                        <span className="mt-1 flex-1 text-sm font-semibold text-ink-soft break-keep">{e.desc}</span>
                        <span className="mt-4 inline-flex w-fit rounded-full bg-kdu-yellow px-4 py-1.5 text-sm font-extrabold text-kdu-navy-deep group-hover:bg-sun-deep">
                          체험하기 →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 도입 절차 */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <SectionTitle kicker="도입 절차" title="문의부터 행사 당일까지" />
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ["도입 문의", "아래 양식으로 행사 일정 · 규모 · 원하는 부대행사를 알려 주세요."],
            ["계정 발급 · 세팅", "학교 · 기관 관리자 아이디 · 비밀번호를 드려요. 행사 이름 · 색 · 로고 · 부대행사 · 설문을 고르면 끝."],
            ["행사 확정 · 오픈", "확정되면 행사 전용 페이지에 사전등록 · 부대행사 버튼이 열리고, QR 포스터가 나와요."],
            ["당일 운영 · 보고서", "스캐너 · 부스 태블릿으로 운영하고, 대시보드에서 실시간 확인 → 결과보고서 PDF."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-3xl border-2 border-ink-line p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13399A] font-extrabold text-white">{i + 1}</span>
              <p className="mt-4 text-lg font-extrabold">{t}</p>
              <p className="mt-1 text-sm text-ink-soft break-keep">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl bg-ink-bg p-5 text-sm">
          <span className="font-extrabold">운영 사례</span>
          <Link href="/kmou" className="rounded-full bg-white px-4 py-2 font-bold text-ink-soft hover:text-ink">
            ⚓ 국립한국해양대학교 취업박람회
          </Link>
          <Link href="/kdu" className="rounded-full bg-white px-4 py-2 font-bold text-ink-soft hover:text-ink">
            🦁 경동대학교 Fun Fun Job Festival
          </Link>
        </div>
      </section>

      {/* 도입 문의 */}
      <section id="contact" className="scroll-mt-16 bg-[linear-gradient(160deg,#0B1F4D,#13399A)] py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1fr_1.3fr]">
          <div className="text-white">
            <p className="text-sm font-bold text-kdu-yellow">도입 문의</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">우리 행사에도 들여올까요?</h2>
            <p className="mt-4 text-white/80 break-keep">행사 규모와 원하는 부대행사를 알려 주시면, 운영 방식과 견적을 안내해 드려요. 이미 계정이 있다면 오른쪽 위 ‘기관 로그인’으로 들어가세요.</p>
            <ul className="mt-6 space-y-2 text-white/85">
              <li>✅ 행사 이름 · 색 · 로고가 모든 화면과 결과물에</li>
              <li>✅ 필요한 부대행사만 골라서</li>
              <li>✅ 개인정보는 행사 후 정한 기간 뒤 자동 삭제</li>
            </ul>
          </div>
          <InquiryForm />
        </div>
      </section>

      <footer className="bg-[#081536] py-8 text-center text-xs text-white/60">
        {SERVICE.name} ({SERVICE.nameEn}) · {SERVICE.tagline}
      </footer>
    </div>
  );
}

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-extrabold text-kdu-sky">{kicker}</p>
      <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl break-keep">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-2xl text-ink-soft break-keep">{sub}</p>}
    </div>
  );
}

/** 첫 화면 오른쪽 — 참가자 흐름 미리 보기 */
function FlowCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rotate-2 rounded-[2rem] bg-white p-5 text-ink shadow-2xl">
        <p className="text-xs font-bold text-ink-muted">참가자</p>
        <p className="text-2xl font-extrabold">김경동</p>
        <ol className="mx-auto mt-4 grid grid-cols-4 gap-1 text-center text-xs font-bold">
          {["등록", "입장", "설문", "퇴장"].map((s, i) => (
            <li key={s}>
              <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${i < 2 ? "bg-[#13399A] text-white" : "bg-ink-line text-ink-muted"}`}>{i < 2 ? "✓" : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-2xl bg-ink-bg p-3">
          <p className="text-xs font-extrabold">🎪 부스 스탬프 3 / 4</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-lg">
            {["✅", "✅", "✅", "🎞️"].map((x, i) => (
              <span key={i} className={`rounded-lg border-2 py-1 ${x === "✅" ? "border-[#13399A] bg-white" : "border-dashed border-ink-line opacity-50"}`}>
                {x}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-6 -rotate-3 rounded-2xl bg-kdu-yellow px-4 py-3 text-sm font-extrabold text-[#0B1F4D] shadow-xl">
        📊 입장 1,284명 · 만족도 4.6
      </div>
    </div>
  );
}
