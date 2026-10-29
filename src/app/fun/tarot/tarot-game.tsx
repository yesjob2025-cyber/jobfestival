"use client";

import { useEffect, useMemo, useState } from "react";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Title } from "@/components/fun/ui";
import { loadCardAssets } from "@/lib/fun/assets";
import { cardImage, POSITIONS, shuffledDeck, suitTheme, summaryOf, TAROT, TOPICS, type Drawn, type TopicId } from "@/lib/fun/tarot";
import { renderTarotResult } from "@/lib/fun/tarot-draw";

type Step = "topic" | "shuffle" | "pick" | "reveal";
const ROWS = 3;

export function TarotGame() {
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<TopicId>("job");
  const [name, setName] = useState("");
  const [deck, setDeck] = useState<Drawn[]>([]);
  const [picked, setPicked] = useState<number[]>([]);

  // 카드 그림 미리 받아 두기 (뒤집을 때 바로 보이게)
  useEffect(() => {
    if (step !== "pick") return;
    TAROT.forEach((c) => {
      const img = new Image();
      img.src = cardImage(c);
    });
  }, [step]);

  function start() {
    setDeck(shuffledDeck());
    setPicked([]);
    setStep("shuffle");
    setTimeout(() => setStep("pick"), 2200);
  }

  function pick(i: number) {
    if (picked.includes(i) || picked.length >= 3) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === 3) setTimeout(() => setStep("reveal"), 700);
  }

  function reset() {
    setStep("topic");
    setName("");
    setPicked([]);
    window.scrollTo({ top: 0 });
  }

  const drawn = picked.map((i) => deck[i]);

  return (
    <div className="wrap py-8 sm:py-10">
      {step === "topic" && (
        <div className="mx-auto max-w-2xl">
          <Title sub="가장 궁금한 운세를 고르고, 마음속으로 질문을 떠올려 주세요">무엇이 궁금한가요?</Title>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopic(t.id)}
                aria-pressed={topic === t.id}
                className={`rounded-3xl border-[3px] p-6 text-center transition ${
                  topic === t.id ? "border-kdu-navy bg-kdu-yellow shadow-[0_6px_0_#0B2A78]" : "border-kdu-navy/20 bg-white"
                }`}
              >
                <span className="block text-5xl">{t.emoji}</span>
                <span className="mt-2 block font-jua text-2xl text-kdu-navy-deep">{t.name}</span>
              </button>
            ))}
          </div>
          <label className="mt-6 block">
            <span className="mb-1.5 block font-jua text-lg text-kdu-navy">이름 (선택)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} placeholder="결과 카드에 들어가요" className="field py-3 text-lg" />
          </label>
          <p className="mt-4 text-center text-sm text-ink-muted">라이더-웨이트 타로 78장 · 정방향과 역방향 · 재미로 보는 운세예요</p>
          <button type="button" onClick={start} className="fun-btn-navy mt-4 w-full py-5 text-2xl">
            🔮 카드 섞기
          </button>
        </div>
      )}

      {step === "shuffle" && (
        <div className="py-10 text-center">
          <Title sub="질문을 떠올리며 잠시 기다려 주세요">카드를 섞고 있어요…</Title>
          <div className="relative mx-auto h-72 w-48">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="absolute inset-0 animate-[tarot-riffle_1s_ease-in-out_2]"
                style={{ animationDelay: `${i * 0.06}s`, transform: `rotate(${(i - 6) * 1.5}deg)` }}
              >
                <CardBack />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "pick" && (
        <>
          <Title sub={`마음이 가는 카드를 ${3 - picked.length}장 더 골라 주세요 (78장)`}>카드 3장을 뽑아 주세요</Title>
          <Slots drawn={drawn} />
          <div className="mt-6 space-y-2 overflow-x-auto pb-4">
            {Array.from({ length: ROWS }, (_, r) => (
              <div key={r} className="flex justify-center px-6" style={{ minWidth: `${Math.ceil(deck.length / ROWS) * 28 + 80}px` }}>
                {deck.slice(r * 26, r * 26 + 26).map((_, k) => {
                  const i = r * 26 + k;
                  const chosen = picked.includes(i);
                  const mid = 12.5;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      aria-label={`${i + 1}번째 카드`}
                      className={`relative -ml-7 h-[112px] w-[64px] shrink-0 transition duration-300 first:ml-0 sm:h-[134px] sm:w-[76px] ${
                        chosen ? "pointer-events-none opacity-0" : ""
                      }`}
                      style={{ transform: `rotate(${(k - mid) * 1.6}deg) translateY(${Math.abs(k - mid) * 1.6}px)` }}
                    >
                      <CardBack />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {step === "reveal" && drawn.length === 3 && <Reveal drawn={drawn} topic={topic} name={name.trim()} onReset={reset} />}
    </div>
  );
}

function CardBack() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg border-[3px] border-kdu-yellow bg-kdu-navy-deep shadow-md">
      <div className="absolute inset-1 rounded border border-kdu-yellow/50 bg-[radial-gradient(circle,rgba(255,210,30,0.35)_1px,transparent_1.5px)] [background-size:10px_10px]" />
      <span className="absolute inset-0 flex items-center justify-center text-2xl text-kdu-yellow">✦</span>
    </div>
  );
}

/** 뽑은 카드가 놓일 세 자리 */
function Slots({ drawn }: { drawn: Drawn[] }) {
  return (
    <div className="mx-auto grid max-w-xl grid-cols-3 gap-4">
      {POSITIONS.map((p, i) => (
        <div key={p.name} className="text-center">
          <div className="relative mx-auto aspect-[300/527] w-full max-w-[120px] rounded-lg border-2 border-dashed border-kdu-navy/30 bg-white/60">
            {drawn[i] && <CardBack />}
          </div>
          <p className="mt-2 font-jua text-base text-kdu-navy">{p.name}</p>
        </div>
      ))}
    </div>
  );
}

function CardFace({ d }: { d: Drawn }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cardImage(d.card)}
      alt={`${d.card.ko} ${d.reversed ? "역방향" : "정방향"}`}
      className={`absolute inset-0 h-full w-full rounded-lg border-[3px] border-kdu-yellow bg-white object-cover shadow-xl [backface-visibility:hidden] ${
        d.reversed ? "[transform:rotateY(180deg)_rotate(180deg)]" : "[transform:rotateY(180deg)]"
      }`}
    />
  );
}

function Reveal({ drawn, topic, name, onReset }: { drawn: Drawn[]; topic: TopicId; name: string; onReset: () => void }) {
  const [revealed, setRevealed] = useState(0);
  const [ai, setAi] = useState<string | null | undefined>(undefined);
  const done = revealed >= 3;

  useEffect(() => {
    if (revealed >= 3) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 600 : 1500);
    return () => clearTimeout(t);
  }, [revealed]);

  // AI 자세한 풀이 (키가 없으면 null → 미리 쓴 종합 풀이)
  useEffect(() => {
    let alive = true;
    fetch("/api/fun/tarot-reading", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ topic, name, cards: drawn.map((d) => ({ id: d.card.id, reversed: d.reversed })) }),
    })
      .then((r) => r.json())
      .then((j: { reading: string | null }) => alive && setAi(j.reading))
      .catch(() => alive && setAi(null));
    return () => {
      alive = false;
    };
  }, [drawn, topic, name]);

  const summary = useMemo(() => summaryOf(drawn, topic), [drawn, topic]);

  return (
    <div className="mx-auto max-w-4xl">
      <Title sub="카드가 한 장씩 열려요">{name ? `${name}님의 카드는…` : "당신의 카드는…"}</Title>
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {drawn.map((d, i) => (
          <div key={d.card.id} className="text-center">
            <p className="mb-2 font-jua text-base text-kdu-sky sm:text-xl">{POSITIONS[i].name}</p>
            <div className="relative mx-auto aspect-[300/527] w-full max-w-[200px] [perspective:1000px]">
              <div className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] ${i < revealed ? "[transform:rotateY(180deg)]" : ""}`}>
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <CardBack />
                </div>
                <CardFace d={d} />
              </div>
            </div>
            <div className={`mt-3 transition-opacity duration-500 ${i < revealed ? "opacity-100" : "opacity-0"}`}>
              <p className="font-jua text-lg text-kdu-navy-deep sm:text-2xl">{d.card.ko}</p>
              <p className="text-xs font-bold text-ink-muted sm:text-sm">
                {d.card.en} · <span className={d.reversed ? "text-kdu-pink" : "text-kdu-sky"}>{d.reversed ? "역방향" : "정방향"}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div className="mt-10 space-y-5">
          {drawn.map((d, i) => (
            <article key={d.card.id} className="kdu-card flex gap-4 p-5 sm:p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardImage(d.card)} alt="" className={`h-32 w-auto shrink-0 rounded-md shadow sm:h-40 ${d.reversed ? "rotate-180" : ""}`} />
              <div>
                <p className="text-sm font-bold text-kdu-sky">
                  {i + 1}. {POSITIONS[i].name} — {POSITIONS[i].desc}
                </p>
                <h3 className="mt-1 font-jua text-2xl text-kdu-navy-deep">
                  {d.card.ko} <span className="text-base text-ink-muted">({d.reversed ? "역방향" : "정방향"} · {suitTheme(d.card.suit)})</span>
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.card.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-kdu-sky-pale px-3 py-1 text-xs font-bold text-kdu-navy">
                      #{k}
                    </span>
                  ))}
                </div>
                <p className="mt-3 leading-relaxed text-ink break-keep">{d.reversed ? d.card.rev : d.card.up}</p>
                {i === 2 && <p className="mt-2 font-bold text-kdu-pink break-keep">💡 {d.card.advice}</p>}
              </div>
            </article>
          ))}

          <article className="rounded-3xl border-[3px] border-kdu-navy bg-kdu-yellow/30 p-6">
            <h3 className="font-jua text-2xl text-kdu-navy-deep">🔮 종합 풀이{ai ? " (AI 리더)" : ""}</h3>
            {ai === undefined ? (
              <p className="mt-3 animate-pulse font-bold text-kdu-navy">카드를 이어서 읽고 있어요…</p>
            ) : (
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink break-keep">{ai ?? summary}</p>
            )}
          </article>

          <Result drawn={drawn} topic={topic} name={name} summary={summary} onReset={onReset} />
        </div>
      )}
    </div>
  );
}

function Result({ drawn, topic, name, summary, onReset }: { drawn: Drawn[]; topic: TopicId; name: string; summary: string; onReset: () => void }) {
  const [url, setUrl] = useState("");
  const key = useMemo(() => drawn.map((d) => d.card.id + (d.reversed ? "r" : "")).join("-") + topic + name, [drawn, topic, name]);
  const getImage = async () => {
    await loadCardAssets(drawn.map((d) => d.card.ko + d.card.keywords.join("")).join("") + summary + name);
    return renderTarotResult(drawn, topic, name, summary);
  };

  useEffect(() => {
    let alive = true;
    getImage().then((c) => alive && setUrl(c.toDataURL("image/jpeg", 0.9)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="grid items-start gap-6 pt-4 md:grid-cols-[minmax(0,340px)_1fr]">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="취업 타로 결과 카드" className="w-full rounded-2xl shadow-2xl" />
      ) : (
        <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-white" />
      )}
      <div className="space-y-4">
        <QrSend kind="image" getImage={getImage} resetKey={key} />
        <RestartButton onClick={onReset} />
      </div>
    </div>
  );
}
