"use client";

import { useEffect, useMemo, useState } from "react";
import { QrSend } from "@/components/fun/qr-send";
import { RestartButton, Title } from "@/components/fun/ui";
import { loadCardAssets } from "@/lib/fun/assets";
import { POSITIONS, ROMAN, shuffled, TOPICS, type TarotCard, type TopicId } from "@/lib/fun/tarot";
import { renderTarotResult } from "@/lib/fun/tarot-draw";

type Step = "topic" | "pick" | "reveal" | "result";
const SPREAD = 12;

export function TarotGame() {
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<TopicId>("job");
  const [name, setName] = useState("");
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const cards = picked.map((i) => deck[i]);

  function start() {
    setDeck(shuffled().slice(0, SPREAD));
    setPicked([]);
    setRevealed(0);
    setShuffling(true);
    setStep("pick");
    setTimeout(() => setShuffling(false), 1400);
  }

  function pick(i: number) {
    if (shuffling || picked.includes(i) || picked.length >= 3) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === 3) setTimeout(() => setStep("reveal"), 600);
  }

  // 한 장씩 뒤집기
  useEffect(() => {
    if (step !== "reveal" || revealed >= 3) return;
    const t = setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 500 : 1300);
    return () => clearTimeout(t);
  }, [step, revealed]);

  function reset() {
    setStep("topic");
    setName("");
    setPicked([]);
    setRevealed(0);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="wrap py-8 sm:py-10">
      {step === "topic" && (
        <div className="mx-auto max-w-2xl">
          <Title sub="가장 궁금한 운세를 골라 주세요">무엇이 궁금한가요?</Title>
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
          <button type="button" onClick={start} className="fun-btn-navy mt-6 w-full py-5 text-2xl">
            🔮 카드 섞기
          </button>
        </div>
      )}

      {step === "pick" && (
        <>
          <Title sub={shuffling ? "카드를 섞고 있어요…" : `마음이 가는 카드를 ${3 - picked.length}장 더 골라 주세요`}>카드 3장을 뽑아 주세요</Title>
          <div className="mx-auto grid max-w-3xl grid-cols-4 gap-3 sm:grid-cols-6">
            {deck.map((_, i) => {
              const order = picked.indexOf(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={shuffling}
                  className={`relative aspect-[5/8] transition duration-300 ${shuffling ? "animate-[tarot-shuffle_0.7s_ease-in-out_2]" : ""} ${
                    order >= 0 ? "-translate-y-3 scale-105" : "hover:-translate-y-1"
                  }`}
                  style={shuffling ? { animationDelay: `${(i % 6) * 0.05}s` } : undefined}
                >
                  <CardBack highlight={order >= 0} />
                  {order >= 0 && (
                    <span className="absolute -top-3 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-kdu-pink font-fun text-lg font-bold text-white shadow">
                      {order + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {(step === "reveal" || step === "result") && cards.length === 3 && (
        <Reveal cards={cards} revealed={step === "result" ? 3 : revealed} onDone={() => setStep("result")} showDone={step === "reveal" && revealed >= 3} />
      )}

      {step === "result" && cards.length === 3 && <Result cards={cards} topic={topic} name={name.trim()} onReset={reset} />}
    </div>
  );
}

function CardBack({ highlight }: { highlight?: boolean }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden rounded-xl border-[3px] bg-kdu-navy-deep shadow-md ${
        highlight ? "border-kdu-pink ring-4 ring-kdu-pink/30" : "border-kdu-yellow"
      }`}
    >
      <div className="absolute inset-1.5 rounded-lg border border-kdu-yellow/50 bg-[radial-gradient(circle,rgba(255,210,30,0.35)_1px,transparent_1.5px)] [background-size:12px_12px]" />
      <span className="absolute inset-0 flex items-center justify-center font-fun text-sm font-bold text-kdu-yellow sm:text-base">✦ KDU ✦</span>
    </div>
  );
}

function CardFront({ card }: { card: TarotCard }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between rounded-xl border-[3px] border-kdu-yellow bg-gradient-to-b from-kdu-navy to-kdu-navy-deep p-2 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <span className="font-fun text-sm font-bold text-kdu-yellow">{ROMAN[card.no]}</span>
      <span className="text-5xl sm:text-6xl">{card.emoji}</span>
      <span>
        <span className="block font-jua text-base leading-tight sm:text-xl">{card.name}</span>
        <span className="block font-fun text-[9px] text-white/60 sm:text-[10px]">{card.tarot}</span>
      </span>
    </div>
  );
}

function Reveal({ cards, revealed, onDone, showDone }: { cards: TarotCard[]; revealed: number; onDone: () => void; showDone: boolean }) {
  const texts = [cards[0].now, cards[1].chance, cards[2].advice];
  return (
    <div className="mx-auto max-w-4xl">
      <Title sub="카드가 한 장씩 열려요">당신의 카드는…</Title>
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {cards.map((c, i) => (
          <div key={c.no} className="text-center">
            <p className="mb-2 font-jua text-base text-kdu-sky sm:text-xl">{POSITIONS[i]}</p>
            <div className="relative mx-auto aspect-[5/8] w-full max-w-[200px] [perspective:900px]">
              <div
                className={`absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d] ${i < revealed ? "[transform:rotateY(180deg)]" : ""}`}
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <CardBack />
                </div>
                <CardFront card={c} />
              </div>
            </div>
            <div className={`mt-3 transition-opacity duration-500 ${i < revealed ? "opacity-100" : "opacity-0"}`}>
              <p className="font-jua text-lg text-kdu-navy sm:text-2xl">{c.keyword}</p>
              <p className="mt-1 text-xs font-semibold text-ink-soft break-keep sm:text-[15px]">{texts[i]}</p>
            </div>
          </div>
        ))}
      </div>
      {showDone && (
        <button type="button" onClick={onDone} className="fun-btn-navy mt-8 w-full py-5 text-2xl">
          ✨ 결과 카드 받기
        </button>
      )}
    </div>
  );
}

function Result({ cards, topic, name, onReset }: { cards: TarotCard[]; topic: TopicId; name: string; onReset: () => void }) {
  const [url, setUrl] = useState("");
  const key = useMemo(() => cards.map((c) => c.no).join("-") + topic + name, [cards, topic, name]);
  const getImage = async () => {
    await loadCardAssets(cards.map((c) => c.name + c.now + c.chance + c.advice + c.job).join("") + name);
    return renderTarotResult(cards, topic, name);
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
    <div className="mx-auto mt-10 grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,360px)_1fr]">
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
