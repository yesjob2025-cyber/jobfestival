"use client";

// 운영자 콘솔 — 이력서 사진용 실사 정장 사진 만들기 · 올리기

import { useCallback, useEffect, useState } from "react";
import { api, Card, ErrorText, EvButton } from "@/components/ev/ui";
import { processSuit, type ProcessedSuit } from "@/lib/fun/suit-process";
import { SUIT_PRESETS, type Gender, type SuitItem } from "@/lib/fun/suits";

interface Draft extends ProcessedSuit {
  id: string;
  name: string;
  gender: Gender;
}

export function Suits() {
  const [list, setList] = useState<SuitItem[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const load = useCallback(() => api<SuitItem[]>("/api/fun/suits").then(setList).catch(() => {}), []);
  useEffect(() => {
    load();
  }, [load]);

  async function generate(p: (typeof SUIT_PRESETS)[number]) {
    setBusy(p.id);
    setError("");
    try {
      const r = await api<{ image: string }>("/api/fun/suit-gen", { preset: p.id });
      setDraft({ ...(await processSuit(r.image)), id: p.id, name: p.name, gender: p.gender });
    } catch (e) {
      setError(e instanceof Error ? e.message : "만들지 못했어요.");
    } finally {
      setBusy(null);
    }
  }

  async function upload(file: File, gender: Gender) {
    setBusy("upload");
    setError("");
    try {
      const url = URL.createObjectURL(file);
      const p = await processSuit(url);
      URL.revokeObjectURL(url);
      const name = file.name.replace(/\.[^.]+$/, "").slice(0, 30) || "정장";
      setDraft({ ...p, id: `${gender}-up-${Date.now().toString(36)}`, name, gender });
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오지 못했어요.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!draft) return;
    setBusy("save");
    setError("");
    try {
      await api("/api/fun/suits", {
        id: draft.id,
        name: draft.name,
        gender: draft.gender,
        image: draft.canvas.toDataURL("image/png"),
        neck: draft.neck,
        shoulder: draft.shoulder,
      });
      setDraft(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-lg font-extrabold text-ink">👔 실사 정장 사진</h2>
        <p className="mt-1 text-sm text-ink-muted">
          이력서 사진 촬영 화면의 남성 · 여성 정장 목록이에요. Gemini 로 만들거나(GEMINI_API_KEY 필요), 배경이 투명 · 단색인 정장 사진을 올리면 배경을 지우고 목 위치 · 어깨 폭을 재서 저장해요.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(["m", "f"] as const).map((g) => (
            <div key={g}>
              <p className="mb-2 text-sm font-extrabold text-ink">{g === "m" ? "🙋‍♂️ 남성" : "🙋‍♀️ 여성"}</p>
              <div className="flex flex-wrap gap-2">
                {SUIT_PRESETS.filter((p) => p.gender === g).map((p) => (
                  <EvButton key={p.id} tone="line" className="py-2 text-sm" disabled={!!busy} onClick={() => generate(p)}>
                    {busy === p.id ? "만드는 중… (20초)" : `✨ ${p.name}`}
                  </EvButton>
                ))}
                <label className="inline-flex cursor-pointer items-center rounded-xl border-2 border-dashed border-ink-line px-4 py-2 text-sm font-bold text-ink-soft">
                  📁 이미지 올리기
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={!!busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], g)} />
                </label>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
      </Card>

      {draft && (
        <Card>
          <h3 className="font-extrabold text-ink">미리 보기 — 노란 점이 목 위치, 파란 선이 어깨 폭이에요</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,320px)_1fr]">
            <Preview d={draft} />
            <div className="space-y-3">
              <label className="block text-sm font-bold">
                이름
                <input className="field mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={30} />
              </label>
              <div className="flex gap-2 text-sm font-bold">
                {(["m", "f"] as const).map((g) => (
                  <button key={g} type="button" onClick={() => setDraft({ ...draft, gender: g })} className={`rounded-full border-2 px-3 py-1.5 ${draft.gender === g ? "border-[var(--ev)] bg-[var(--ev)] text-white" : "border-ink-line"}`}>
                    {g === "m" ? "남성" : "여성"}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-bold">
                목 높이 조정 (px)
                <input
                  type="range"
                  min={0}
                  max={Math.round(draft.canvas.height * 0.4)}
                  value={draft.neck[1]}
                  onChange={(e) => setDraft({ ...draft, neck: [draft.neck[0], Number(e.target.value)] })}
                  className="mt-1 w-full"
                />
              </label>
              <label className="block text-sm font-bold">
                어깨 폭 조정 (px)
                <input
                  type="range"
                  min={Math.round(draft.canvas.width * 0.4)}
                  max={draft.canvas.width}
                  value={draft.shoulder}
                  onChange={(e) => setDraft({ ...draft, shoulder: Number(e.target.value) })}
                  className="mt-1 w-full"
                />
              </label>
              <div className="flex gap-2">
                <EvButton onClick={save} disabled={busy === "save"}>
                  {busy === "save" ? "저장 중…" : "저장하기"}
                </EvButton>
                <EvButton tone="ghost" onClick={() => setDraft(null)}>
                  버리기
                </EvButton>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="mb-3 font-extrabold text-ink">저장된 정장 ({list.length})</h3>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">아직 없어요 — 위에서 만들거나 올려 주세요. 없으면 촬영 화면은 그림 정장을 보여 줘요.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {list.map((s) => (
              <li key={s.id} className="rounded-2xl border border-ink-line p-2 text-center">
                <div className="flex aspect-square items-end justify-center rounded-xl bg-[linear-gradient(180deg,#DCEBF7,#C9DFF2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.url} alt="" className="max-h-full max-w-full" />
                </div>
                <p className="mt-1 text-xs font-bold text-ink">
                  {s.gender === "m" ? "남" : "여"} · {s.name}
                </p>
                <button
                  type="button"
                  className="text-xs font-bold text-ink-muted underline"
                  onClick={async () => {
                    if (!confirm(`${s.name} 을(를) 지울까요?`)) return;
                    await api("/api/fun/suits", { id: s.id, remove: true });
                    load();
                  }}
                >
                  지우기
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Preview({ d }: { d: Draft }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = d.canvas.width;
    c.height = d.canvas.height;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, "#DCEBF7");
    g.addColorStop(1, "#C9DFF2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(d.canvas, 0, 0);
    ctx.strokeStyle = "#08A0F6";
    ctx.lineWidth = 4;
    const y = d.neck[1] + c.height * 0.12;
    ctx.beginPath();
    ctx.moveTo(d.neck[0] - d.shoulder / 2, y);
    ctx.lineTo(d.neck[0] + d.shoulder / 2, y);
    ctx.stroke();
    ctx.fillStyle = "#FFD21E";
    ctx.beginPath();
    ctx.arc(d.neck[0], d.neck[1], 10, 0, Math.PI * 2);
    ctx.fill();
    setUrl(c.toDataURL("image/png"));
  }, [d]);
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt="정장 미리 보기" className="w-full rounded-2xl" /> : null;
}
