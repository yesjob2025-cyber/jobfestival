"use client";

import { useEffect, useMemo, useState } from "react";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Title } from "@/components/fun/ui";
import { loadCardAssets } from "@/lib/fun/assets";
import { QUESTIONS, scoreOf, TYPES, type TypeId } from "@/lib/fun/job-type";
import { renderJobTypeResult } from "@/lib/fun/job-type-draw";

export function JobTypeTest() {
  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<TypeId[]>([]);
  const done = answers.length === QUESTIONS.length;

  function reset() {
    setStarted(false);
    setName("");
    setAnswers([]);
    window.scrollTo({ top: 0 });
  }

  if (!started) {
    return (
      <div className="wrap max-w-xl py-10">
        <Title sub="정답은 없어요. 끌리는 쪽을 빠르게 골라 주세요!">나는 어떤 직무 유형일까?</Title>
        <label className="block">
          <span className="mb-1.5 block font-jua text-lg text-kdu-navy">이름 (선택)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} placeholder="결과 카드에 들어가요" className="field py-3 text-lg" />
        </label>
        <button type="button" onClick={() => setStarted(true)} className="fun-btn-navy mt-6 w-full py-5 text-2xl">
          🧭 테스트 시작
        </button>
      </div>
    );
  }

  if (!done) {
    const q = QUESTIONS[answers.length];
    return (
      <div className="wrap max-w-2xl py-10">
        <div className="mb-6 h-3 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-kdu-sky transition-all" style={{ width: `${(answers.length / QUESTIONS.length) * 100}%` }} />
        </div>
        <p className="text-center font-fun text-xl font-bold text-kdu-sky">
          Q{answers.length + 1} / {QUESTIONS.length}
        </p>
        <Title>{q.q}</Title>
        <div className="grid gap-4">
          {[q.a, q.b].map((o) => (
            <button
              key={o.text}
              type="button"
              onClick={() => setAnswers([...answers, o.type])}
              className="rounded-3xl border-[3px] border-kdu-navy bg-white px-6 py-7 text-center font-jua text-2xl text-kdu-navy-deep shadow-[0_6px_0_#0B2A78] transition active:translate-y-1 active:shadow-[0_2px_0_#0B2A78]"
            >
              {o.text}
            </button>
          ))}
        </div>
        {answers.length > 0 && (
          <button type="button" onClick={() => setAnswers(answers.slice(0, -1))} className="mx-auto mt-6 block font-bold text-ink-muted underline">
            ← 이전 문항
          </button>
        )}
      </div>
    );
  }

  return <Result answers={answers} name={name.trim()} onReset={reset} />;
}

function Result({ answers, name, onReset }: { answers: TypeId[]; name: string; onReset: () => void }) {
  const { top, second, scores } = useMemo(() => scoreOf(answers), [answers]);
  const [url, setUrl] = useState("");
  const getImage = async () => {
    await loadCardAssets(Object.values(TYPES).map((t) => t.nick + t.name + t.desc + t.jobs.join("") + t.strengths.join("")).join("") + name);
    return renderJobTypeResult(top, second, scores, name);
  };
  useEffect(() => {
    let alive = true;
    getImage().then((c) => alive && setUrl(c.toDataURL("image/jpeg", 0.9)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, name]);

  return (
    <div className="wrap py-10">
      <Title sub={`홀랜드 ${top.name} · 두 번째로 강한 유형은 ${second.emoji} ${second.nick}`}>
        {top.emoji} {top.nick}
      </Title>
      <div className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="직무 유형 결과 카드" className="w-full rounded-2xl shadow-2xl" />
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-white" />
        )}
        <div className="space-y-4">
          <QrSend kind="image" getImage={getImage} resetKey={answers.join("") + name} />
          <RestartButton onClick={onReset} />
        </div>
      </div>
    </div>
  );
}
