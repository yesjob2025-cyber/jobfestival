"use client";

// 1분 자기소개 앞단계 — 직무 유형 진단 → 강점 고르기 → 희망 직무 → 강점 ↔ 역량 매칭

import { useState } from "react";
import { Title } from "@/components/fun/ui";
import { COMPS, recommendJobs, TRAITS, type Match, type Trait } from "@/lib/fun/career-match";
import { LIMITS, type IntroInput } from "@/lib/fun/intro";
import { QUESTIONS, scoreOf, TYPES, type TypeId } from "@/lib/fun/job-type";

// ── 진단 ─────────────────────────────────────────────────────

export function Diagnose({ onDone, onSkip }: { onDone: (top: TypeId, second: TypeId) => void; onSkip: () => void }) {
  const [answers, setAnswers] = useState<TypeId[]>([]);
  const q = QUESTIONS[answers.length];

  function pick(t: TypeId) {
    const next = [...answers, t];
    if (next.length === QUESTIONS.length) {
      const r = scoreOf(next);
      onDone(r.top.id, r.second.id);
    } else setAnswers(next);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-kdu-sky transition-all" style={{ width: `${(answers.length / QUESTIONS.length) * 100}%` }} />
      </div>
      <p className="text-center font-fun text-xl font-bold text-kdu-sky">
        STEP 1 · 직무 유형 진단 Q{answers.length + 1} / {QUESTIONS.length}
      </p>
      <Title>{q.q}</Title>
      <div className="grid gap-4">
        {[q.a, q.b].map((o) => (
          <button
            key={o.text}
            type="button"
            onClick={() => pick(o.type)}
            className="rounded-3xl border-[3px] border-kdu-navy bg-white px-6 py-7 text-center font-jua text-2xl text-kdu-navy-deep shadow-[0_6px_0_#0B2A78] transition active:translate-y-1 active:shadow-[0_2px_0_#0B2A78]"
          >
            {o.text}
          </button>
        ))}
      </div>
      <div className="mt-6 flex justify-between text-sm font-bold text-ink-muted">
        <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} disabled={!answers.length} className="disabled:opacity-30">
          ← 이전 문항
        </button>
        <button type="button" onClick={onSkip} className="underline">
          진단 없이 바로 대본 만들기
        </button>
      </div>
    </div>
  );
}

// ── 강점 고르기 ───────────────────────────────────────────────

export function PickStrengths(props: { top: TypeId; second: TypeId; picked: string[]; setPicked: (ids: string[]) => void; onNext: () => void }) {
  const { top, second, picked } = props;
  const [more, setMore] = useState(false);
  const t1 = TYPES[top];
  const t2 = TYPES[second];
  const others = (Object.keys(TRAITS) as TypeId[]).filter((id) => id !== top && id !== second);
  const toggle = (id: string) =>
    props.setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : picked.length < LIMITS.strengths ? [...picked, id] : [...picked.slice(1), id]);

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-center font-fun text-xl font-bold text-kdu-sky">STEP 2 · 나의 유형과 강점</p>
      <div className="mx-auto mt-4 max-w-2xl rounded-3xl border-[3px] border-kdu-navy bg-white p-6 text-center shadow-[0_6px_0_#0B2A78]">
        <p className="text-6xl">{t1.emoji}</p>
        <p className="mt-2 font-jua text-4xl" style={{ color: t1.color }}>
          {t1.nick}
        </p>
        <p className="mt-1 text-sm font-bold text-ink-muted">
          홀랜드 {t1.name} · 2순위 {t2.emoji} {t2.nick}
        </p>
        <p className="mt-3 text-lg font-semibold text-ink break-keep">{t1.desc}</p>
      </div>

      <div className="mt-10">
        <Title sub={`내 유형의 특징 중 "이건 진짜 나다" 싶은 것을 ${LIMITS.strengths}개 골라 주세요`}>💪 나의 강점은?</Title>
      </div>
      <TraitGrid traits={[...TRAITS[top], ...TRAITS[second]]} picked={picked} onToggle={toggle} />
      <button type="button" onClick={() => setMore(!more)} className="mx-auto mt-4 block text-sm font-bold text-kdu-sky underline">
        {more ? "다른 유형 특징 접기" : "다른 유형의 특징도 보기"}
      </button>
      {more && (
        <div className="mt-4">
          <TraitGrid traits={others.flatMap((id) => TRAITS[id])} picked={picked} onToggle={toggle} />
        </div>
      )}

      <div className="sticky bottom-3 z-10 mt-6">
        <button type="button" onClick={props.onNext} disabled={!picked.length} className="fun-btn-navy w-full py-5 text-2xl disabled:opacity-40">
          {picked.length ? `강점 ${picked.length}개 선택 · 희망 직무 고르기 →` : "강점을 골라 주세요"}
        </button>
      </div>
    </div>
  );
}

function TraitGrid({ traits, picked, onToggle }: { traits: Trait[]; picked: string[]; onToggle: (id: string) => void }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {traits.map((t) => {
        const on = picked.includes(t.id);
        const type = TYPES[t.type];
        return (
          <li key={t.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(t.id)}
              className={`h-full w-full rounded-2xl border-[3px] p-4 text-left transition ${on ? "border-kdu-navy bg-kdu-navy text-white shadow-[0_5px_0_#0B2A78]" : "border-ink-line bg-white hover:border-kdu-sky"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-jua text-xl">{t.name}</span>
                <span className="text-lg">{on ? "✅" : type.emoji}</span>
              </span>
              <span className={`mt-1 block text-sm break-keep ${on ? "text-white/85" : "text-ink-soft"}`}>{t.desc}</span>
              <span className="mt-2 flex flex-wrap gap-1">
                {t.comps.map((c) => (
                  <span key={c} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${on ? "bg-white/20 text-white" : "bg-kdu-sky-pale text-kdu-navy"}`}>
                    #{COMPS[c]}
                  </span>
                ))}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ── 희망 직무 ────────────────────────────────────────────────

export function PickJob(props: { top: TypeId; second: TypeId; onPick: (jobId: string | null, custom: string) => void }) {
  const [custom, setCustom] = useState("");
  const jobs = recommendJobs(props.top, props.second);
  const recommended = new Set(jobs.slice(0, 6).map((j) => j.id));

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-center font-fun text-xl font-bold text-kdu-sky">STEP 3 · 희망 직무</p>
      <Title sub="⭐ 표시는 내 유형과 잘 맞는 추천 직무예요">🎯 어떤 일을 하고 싶나요?</Title>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {jobs.map((j) => (
          <li key={j.id}>
            <button
              type="button"
              onClick={() => props.onPick(j.id, "")}
              className={`relative flex h-full w-full flex-col items-center gap-1 rounded-2xl border-[3px] bg-white p-4 text-center transition hover:-translate-y-0.5 ${recommended.has(j.id) ? "border-kdu-yellow shadow-[0_5px_0_#F5B800]" : "border-ink-line"}`}
            >
              {recommended.has(j.id) && <span className="absolute -top-3 right-2 rounded-full bg-kdu-yellow px-2 py-0.5 text-xs font-extrabold text-kdu-navy-deep">⭐ 추천</span>}
              <span className="text-4xl">{j.emoji}</span>
              <span className="font-jua text-lg text-kdu-navy-deep break-keep">{j.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mx-auto mt-6 flex max-w-xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) props.onPick(null, custom.trim());
        }}
      >
        <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={LIMITS.job} placeholder="목록에 없으면 직접 입력" className="field py-3 text-lg" />
        <button type="submit" disabled={!custom.trim()} className="fun-btn-white shrink-0 px-5 text-lg disabled:opacity-40">
          선택
        </button>
      </form>
    </div>
  );
}

// ── 매칭 결과 + 마무리 입력 ─────────────────────────────────────

export function MatchView(props: { input: IntroInput; setInput: (i: IntroInput) => void; match: Match; onBack: () => void; onNext: () => void }) {
  const { input, match } = props;
  const set = <K extends keyof IntroInput>(k: K, v: IntroInput[K]) => props.setInput({ ...input, [k]: v });
  const type = input.type ? TYPES[input.type] : null;
  const gaps = match.pairs.filter((p) => !p.trait);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-center font-fun text-xl font-bold text-kdu-sky">STEP 4 · 강점 ↔ 직무 매칭</p>
      <div className="mt-4 rounded-3xl border-[3px] border-kdu-navy bg-white p-6 shadow-[0_6px_0_#0B2A78]">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <Gauge value={match.score} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-ink-muted">{type ? `${type.emoji} ${type.nick}` : "나"} × 🎯 {input.job}</p>
            <p className="mt-1 font-jua text-3xl text-kdu-navy-deep">
              {match.score >= 85 ? "찰떡궁합이에요! 🎉" : match.score >= 70 ? "잘 어울려요! 👍" : "강점으로 충분히 도전할 만해요 💪"}
            </p>
            {match.typeFit && <p className="mt-1 text-sm font-bold text-[#1F7A47]">✅ 내 유형이 이 직무와 잘 맞아요</p>}
          </div>
        </div>

        <h3 className="mt-6 font-jua text-xl text-kdu-navy">이 직무가 원하는 역량 ← 나의 강점</h3>
        <ol className="mt-3 space-y-2">
          {match.pairs.map((p, i) => (
            <li key={p.comp} className="grid grid-cols-[auto_1fr] items-center gap-3 sm:grid-cols-[180px_auto_1fr]">
              <span className="rounded-xl bg-kdu-navy px-3 py-2 text-center font-bold text-white">
                <span className="mr-1 text-kdu-yellow">{i + 1}</span>
                {COMPS[p.comp]}
              </span>
              <span className="hidden text-2xl text-kdu-sky sm:block">{p.trait ? "⟵" : "·"}</span>
              <span
                className={`col-span-2 rounded-xl px-3 py-2 text-sm font-bold sm:col-span-1 ${p.trait ? "bg-kdu-sky-pale text-kdu-navy-deep" : "border-2 border-dashed border-ink-line text-ink-muted"}`}
              >
                {p.trait ? `💪 ${p.trait.name}` : "🌱 보완 포인트 — 입사 후 키울 역량"}
              </span>
            </li>
          ))}
        </ol>
        {gaps.length > 0 && (
          <p className="mt-3 text-xs text-ink-muted">보완 포인트는 대본에서 약점으로 말하지 않고 “배우며 키우겠다”는 각오로만 담아요.</p>
        )}
      </div>

      <div className="mt-6 space-y-5 rounded-3xl bg-white p-6">
        <label className="block">
          <span className="mb-1.5 block font-jua text-lg text-kdu-navy">이름 (선택)</span>
          <input value={input.name} onChange={(e) => set("name", e.target.value)} maxLength={LIMITS.name} placeholder="김경동" className="field py-3 text-lg" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-jua text-lg text-kdu-navy">강점을 보여 준 경험 한 줄 (선택 · 있으면 훨씬 좋아져요)</span>
          <input
            value={input.experience}
            onChange={(e) => set("experience", e.target.value)}
            maxLength={LIMITS.experience}
            placeholder="예: 카페 아르바이트 2년, 축제 기획단 활동"
            className="field py-3 text-lg"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-jua text-lg text-kdu-navy">분위기</span>
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
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
        <button type="button" onClick={props.onBack} className="fun-btn-white px-5 py-4 text-xl">
          ← 직무
        </button>
        <button type="button" onClick={props.onNext} className="fun-btn-navy py-5 text-2xl">
          ✍️ 매칭 결과로 AI 대본 만들기
        </button>
      </div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#E3F5FE" strokeWidth="14" />
        <circle cx="64" cy="64" r={r} fill="none" stroke="#08A0F6" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(c * value) / 100} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-fun text-4xl font-bold text-kdu-navy-deep">{value}%</span>
        <span className="text-xs font-bold text-ink-muted">적합도</span>
      </div>
    </div>
  );
}
