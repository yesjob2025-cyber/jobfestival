"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HourlyChart } from "@/components/ev/hourly-chart";
import { StatusBadge } from "@/components/ev/status-badge";
import { api, Card, EvButton, QrImage, Shell, Stat } from "@/components/ev/ui";
import { FUN_EVENTS } from "@/lib/fun/config";
import type { BoothStats, Stats } from "@/lib/ev/service";
import { dateRange, FIELD_OPTIONS, kst, SCALE, STAGE_LABEL, type FieldId, type PublicEvent, type Stage } from "@/lib/ev/shared";

type Tab = "overview" | "people" | "booths" | "survey" | "tools";

interface Person {
  id: string;
  name: string;
  phone: string;
  info: Record<string, string>;
  source: "pre" | "onsite";
  createdAt: string;
  enteredAt: string | null;
  exitedAt: string | null;
  surveyed: boolean;
  stamps: string[];
  stage: Stage;
}

interface Survey {
  composition: Partial<Record<FieldId, [string, number][]>>;
  survey: { question: string; dist: number[]; count: number; avg: number }[];
  comments: string[];
  purged: boolean;
}

const boothName = (s: string) => FUN_EVENTS.find((e) => e.slug === s)?.name ?? s;
const boothEmoji = (s: string) => FUN_EVENTS.find((e) => e.slug === s)?.emoji ?? "🎪";
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

/** 학교 · 기관 관리자 대시보드 */
export function Dashboard({ event: ev, role }: { event: PublicEvent; role: "admin" | "staff" }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [s, setS] = useState<Stats | null>(null);
  const [b, setB] = useState<BoothStats | null>(null);
  const [sv, setSv] = useState<Survey | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);

  const load = useCallback(async () => {
    const [a, c, d] = await Promise.all([
      api<Stats>(`/api/ev/${ev.code}/stats`),
      api<BoothStats>(`/api/ev/${ev.code}/booths`),
      api<Survey>(`/api/ev/${ev.code}/survey`),
    ]);
    setS(a);
    setB(c);
    setSv(d);
  }, [ev.code]);

  useEffect(() => {
    load().catch(() => {});
    const t = setInterval(() => document.visibilityState === "visible" && load().catch(() => {}), 15_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (tab === "people") api<Person[]>(`/api/ev/${ev.code}/attendees`).then(setPeople).catch(() => {});
  }, [tab, ev.code]);

  const tabs: [Tab, string][] = [
    ["overview", "📊 개요"],
    ["people", `👥 등록자 현황${s ? ` (${s.total})` : ""}`],
    ["booths", "🎪 부스별 참여"],
    ["survey", "💬 만족도"],
    ["tools", "🧰 운영 도구"],
  ];

  return (
    <Shell
      wide
      color={ev.color}
      title={ev.name}
      sub={`${dateRange(ev.startsOn, ev.endsOn)}${ev.place ? ` · ${ev.place}` : ""} · 코드 ${ev.code}`}
      right={
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={ev.status} />
          <a href="/manage" className="rounded-lg bg-white/15 px-3 py-2 text-sm font-bold">
            내 행사
          </a>
          <button
            type="button"
            className="rounded-lg bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"
            onClick={async () => {
              await api(`/api/ev/${ev.code}/logout`, {});
              await api("/api/jf/logout", {});
              router.push("/login");
            }}
          >
            로그아웃
          </button>
        </div>
      }
    >
      <nav className="-mx-1 mb-5 flex gap-1 overflow-x-auto pb-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-extrabold ${tab === id ? "bg-[var(--ev)] text-white" : "bg-white text-ink-soft"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <Overview s={s} b={b} sv={sv} ev={ev} onGo={setTab} />}
      {tab === "people" && <People ev={ev} people={people} />}
      {tab === "booths" && <Booths b={b} ev={ev} />}
      {tab === "survey" && <SurveyTab sv={sv} s={s} />}
      {tab === "tools" && <Tools ev={ev} role={role} />}
      <p className="mt-4 text-right text-xs text-ink-muted">15초마다 자동으로 새로 고쳐져요</p>
    </Shell>
  );
}

// ── 개요 ─────────────────────────────────────────────────────

function Overview({ s, b, sv, ev, onGo }: { s: Stats | null; b: BoothStats | null; sv: Survey | null; ev: PublicEvent; onGo: (t: Tab) => void }) {
  const avg = sv && sv.survey.some((q) => q.count) ? sv.survey.reduce((a, q) => a + q.avg, 0) / sv.survey.filter((q) => q.count).length : 0;
  const plays = b?.booths.reduce((a, x) => a + x.plays, 0) ?? 0;
  const stamped = b?.perPerson.reduce((a, x) => a + x.n, 0) ?? 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="등록" value={s?.total ?? "–"} sub={s ? `사전 ${s.pre} · 현장 ${s.onsite}` : undefined} />
        <Stat label="입장" value={s?.entered ?? "–"} sub={s ? `등록 대비 ${pct(s.entered, s.total)}` : undefined} accent />
        <Stat label="지금 행사장 안" value={s?.inside ?? "–"} sub="입장 − 퇴장" />
        <Stat label="부스 참여" value={stamped} sub={`스탬프 받은 사람 · 체험 ${plays}회`} />
        <Stat label="만족도" value={avg ? avg.toFixed(2) : "–"} sub={s ? `5점 만점 · 응답 ${s.surveyed}명` : undefined} />
        <Stat label="평균 머문 시간" value={s?.stayMin != null ? `${s.stayMin}분` : "–"} sub="퇴장한 분 기준" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">시간대별 입장 · 퇴장</h2>
          {s && s.hourly.length ? <HourlyChart data={s.hourly} color={ev.color} /> : <p className="py-8 text-center text-sm text-ink-muted">아직 입장 기록이 없어요</p>}
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink">부스 인기 순위</h2>
            <button type="button" onClick={() => onGo("booths")} className="text-sm font-bold text-[var(--ev)] underline">
              자세히
            </button>
          </div>
          <BoothBars b={b} />
        </Card>
      </div>
    </div>
  );
}

function BoothBars({ b }: { b: BoothStats | null }) {
  if (!b || !b.booths.length) return <p className="py-6 text-center text-sm text-ink-muted">부대행사가 없거나 아직 기록이 없어요</p>;
  const rows = [...b.booths].sort((x, y) => y.stamps + y.plays / 100 - (x.stamps + x.plays / 100));
  const max = Math.max(1, ...rows.map((r) => r.stamps));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.booth}>
          <div className="flex justify-between text-sm font-bold">
            <span>
              {boothEmoji(r.booth)} {boothName(r.booth)}
            </span>
            <span className="tabular-nums text-ink-soft">
              {r.stamps}명 · 체험 {r.plays}회
            </span>
          </div>
          <div className="mt-1 h-2.5 rounded-full bg-ink-bg">
            <div className="h-2.5 rounded-full bg-[var(--ev)]" style={{ width: `${(r.stamps / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── 등록자 현황 ───────────────────────────────────────────────

function People({ ev, people }: { ev: PublicEvent; people: Person[] | null }) {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<"all" | Stage | "inside">("all");
  const fields = FIELD_OPTIONS.filter((f) => ev.fields.includes(f.id));
  const list = useMemo(() => {
    if (!people) return [];
    const t = q.trim();
    return people.filter((p) => {
      if (stage === "inside" ? !(p.enteredAt && !p.exitedAt) : stage !== "all" && p.stage !== stage) return false;
      if (!t) return true;
      return p.name.includes(t) || p.phone.replace(/-/g, "").includes(t.replace(/-/g, "")) || Object.values(p.info).some((v) => v.includes(t));
    });
  }, [people, q, stage]);
  const filters: [typeof stage, string][] = [
    ["all", "전체"],
    ["registered", "입장 전"],
    ["inside", "행사장 안"],
    ["exited", "퇴장"],
  ];
  const full = { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" } as const;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <input className="field max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 · 번호 · 학교 · 학과 찾기" aria-label="찾기" />
        {filters.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStage(id)}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${stage === id ? "border-[var(--ev)] bg-[var(--ev)] text-white" : "border-ink-line text-ink-soft"}`}
          >
            {label}
          </button>
        ))}
        <a href={`/api/ev/${ev.code}/export`} className="ml-auto rounded-xl border-2 border-[var(--ev)] px-4 py-2 text-sm font-bold text-[var(--ev)]">
          📥 엑셀(CSV) 내려받기
        </a>
      </div>
      {!people ? (
        <p className="py-10 text-center text-sm text-ink-muted">불러오는 중…</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b-2 border-ink-line text-left text-xs text-ink-muted">
                <th className="py-2">이름</th>
                <th>휴대폰</th>
                {fields.map((f) => (
                  <th key={f.id}>{f.label}</th>
                ))}
                <th>등록</th>
                <th>입장</th>
                <th>퇴장</th>
                <th>스탬프</th>
                <th>설문</th>
              </tr>
            </thead>
            <tbody>
              {list.slice(0, 500).map((p) => (
                <tr key={p.id} className="border-b border-ink-line">
                  <td className="py-2 font-bold text-ink">
                    {p.name}
                    {p.source === "onsite" && <span className="ml-1 rounded bg-ink-bg px-1 text-[10px] text-ink-muted">현장</span>}
                  </td>
                  <td className="tabular-nums">{p.phone}</td>
                  {fields.map((f) => (
                    <td key={f.id}>{p.info[f.id] ?? ""}</td>
                  ))}
                  <td className="text-xs text-ink-muted">{kst(p.createdAt, full)}</td>
                  <td className="text-xs">{kst(p.enteredAt)}</td>
                  <td className="text-xs">{kst(p.exitedAt)}</td>
                  <td title={p.stamps.map(boothName).join(", ")}>{p.stamps.length ? `${p.stamps.length}개` : ""}</td>
                  <td>{p.surveyed ? "✅" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-muted">
            {list.length}명{list.length > 500 ? " (앞 500명만 표시 — 전체는 엑셀로)" : ""} · 상태: {STAGE_LABEL.registered} / 입장 / 퇴장
          </p>
        </div>
      )}
    </Card>
  );
}

// ── 부스별 참여 ───────────────────────────────────────────────

function Booths({ b, ev }: { b: BoothStats | null; ev: PublicEvent }) {
  if (!b) return <Card className="text-center text-ink-muted">불러오는 중…</Card>;
  const hours = [...new Set(b.hourly.map((h) => h.hour))].sort((x, y) => x - y);
  const maxCell = Math.max(1, ...b.hourly.map((h) => h.n));
  const people = b.perPerson.reduce((a, x) => a + x.n, 0);
  const done = b.goal ? b.perPerson.filter((x) => x.k >= b.goal).reduce((a, x) => a + x.n, 0) : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="부스 체험 (결과 수)" value={b.booths.reduce((a, x) => a + x.plays, 0)} sub="부스 태블릿에서 결과가 나온 횟수" />
        <Stat label="스탬프 찍은 사람" value={people} sub="한 부스 이상 참여" accent />
        <Stat label="스탬프 총 개수" value={b.booths.reduce((a, x) => a + x.stamps, 0)} />
        <Stat label="스탬프 투어 완성" value={b.goal ? done : "–"} sub={b.goal ? `${b.goal}개 이상 · 참여자 대비 ${pct(done, people)}` : "목표 없음 (설정에서)"} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">부스별 참여</h2>
          <BoothBars b={b} />
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">한 사람이 몇 부스를 돌았나</h2>
          {b.perPerson.length ? (
            <ul className="space-y-2">
              {b.perPerson.map((x) => (
                <li key={x.k} className="grid grid-cols-[70px_1fr_60px] items-center gap-2 text-sm font-bold">
                  <span>{x.k}개 부스</span>
                  <span className="h-3 rounded-full bg-ink-bg">
                    <span className="block h-3 rounded-full bg-[var(--ev)]" style={{ width: `${(x.n / Math.max(...b.perPerson.map((y) => y.n))) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{x.n}명</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-ink-muted">아직 스탬프 기록이 없어요</p>
          )}
        </Card>
      </div>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">시간대별 부스 참여 (스탬프)</h2>
        {hours.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-ink-muted">
                  <th className="py-1 text-left">부스</th>
                  {hours.map((h) => (
                    <th key={h} className="px-1">
                      {h}시
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.booths.map((r) => (
                  <tr key={r.booth}>
                    <td className="whitespace-nowrap py-1 pr-2 font-bold">
                      {boothEmoji(r.booth)} {boothName(r.booth)}
                    </td>
                    {hours.map((h) => {
                      const n = b.hourly.find((x) => x.booth === r.booth && x.hour === h)?.n ?? 0;
                      return (
                        <td key={h} className="p-0.5">
                          <span
                            className="flex h-8 min-w-10 items-center justify-center rounded-md text-xs font-bold"
                            style={{ background: n ? ev.color : "#F1F4F9", opacity: n ? 0.25 + (0.75 * n) / maxCell : 1, color: n ? "#fff" : "#9AA6BC" }}
                          >
                            {n || ""}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-ink-muted">아직 기록이 없어요</p>
        )}
      </Card>
    </div>
  );
}

// ── 만족도 ───────────────────────────────────────────────────

function SurveyTab({ sv, s }: { sv: Survey | null; s: Stats | null }) {
  if (!sv) return <Card className="text-center text-ink-muted">불러오는 중…</Card>;
  const answered = sv.survey.filter((q) => q.count);
  const avg = answered.length ? answered.reduce((a, q) => a + q.avg, 0) / answered.length : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="전체 만족도" value={avg ? avg.toFixed(2) : "–"} sub="5점 만점" accent />
        <Stat label="응답" value={s?.surveyed ?? "–"} sub={s ? `입장 대비 ${pct(s.surveyed, s.entered)}` : undefined} />
        <Stat label="의견" value={sv.comments.length} sub="자유 의견 남긴 분" />
      </div>
      <Card>
        <h2 className="mb-4 text-lg font-extrabold text-ink">문항별 결과</h2>
        <div className="space-y-5">
          {sv.survey.map((q, i) => (
            <div key={i}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold text-ink">
                  {i + 1}. {q.question}
                </p>
                <p className="text-lg font-extrabold text-[var(--ev)]">{q.count ? q.avg.toFixed(2) : "–"}</p>
              </div>
              <div className="mt-2 flex h-7 overflow-hidden rounded-lg bg-ink-bg text-[11px] font-bold text-white">
                {q.dist.map((n, k) =>
                  n ? (
                    <span
                      key={k}
                      className="flex items-center justify-center"
                      style={{ width: `${(n / q.count) * 100}%`, background: ["#D6334C", "#F08C00", "#A3AEC2", "#3E9BE0", "#1F7A47"][k] }}
                      title={`${SCALE[k]} ${n}명`}
                    >
                      {(n / q.count) * 100 >= 8 ? `${Math.round((n / q.count) * 100)}%` : ""}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3 text-xs font-bold text-ink-soft">
            {SCALE.map((l, k) => (
              <span key={l} className="flex items-center gap-1">
                <i className="inline-block h-3 w-3 rounded-sm" style={{ background: ["#D6334C", "#F08C00", "#A3AEC2", "#3E9BE0", "#1F7A47"][k] }} /> {l}
              </span>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">참가자 의견</h2>
        {sv.comments.length ? (
          <ul className="space-y-2">
            {sv.comments.map((c, i) => (
              <li key={i} className="rounded-xl bg-ink-bg px-4 py-2.5 text-sm text-ink">
                “{c}”
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-ink-muted">아직 의견이 없어요</p>
        )}
      </Card>
    </div>
  );
}

// ── 운영 도구 ────────────────────────────────────────────────

function Tools({ ev, role }: { ev: PublicEvent; role: "admin" | "staff" }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [newPin, setNewPin] = useState<{ which: string; pin: string } | null>(null);
  useEffect(() => setOrigin(location.origin), []);
  const home = `${origin}/e/${ev.code}`;

  async function pin(which: "admin" | "staff") {
    if (!confirm(`${which === "admin" ? "관리자" : "스태프"} PIN 을 새로 발급할까요? 이전 PIN 은 더 이상 쓸 수 없어요.`)) return;
    setNewPin(await api<{ which: string; pin: string }>(`/api/ev/${ev.code}/pin`, { which }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-extrabold text-ink">① 참가자 안내 · 사전등록</h2>
        <p className="mt-1 text-sm text-ink-muted">행사 전용 페이지 주소예요. 홍보물 · 문자 · SNS 에 올려 주세요.</p>
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          {origin && <QrImage text={home} size={140} />}
          <div className="w-full min-w-0 space-y-2">
            <p className="break-all rounded-xl bg-ink-bg px-3 py-2.5 font-mono text-sm text-ink">{home || "…"}</p>
            <div className="grid grid-cols-2 gap-2">
              <EvButton
                tone="line"
                className="py-2.5 text-sm"
                onClick={() => {
                  navigator.clipboard?.writeText(home);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "복사했어요 ✓" : "주소 복사"}
              </EvButton>
              <a href={`/host/${ev.code}/poster`} target="_blank" className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--ev)] px-3 py-2.5 text-sm font-bold text-[var(--ev)]">
                QR 포스터 인쇄
              </a>
            </div>
            <a href={home} target="_blank" className="block text-center text-sm font-bold text-ink-muted underline">
              행사 페이지 미리 보기
            </a>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-extrabold text-ink">② 행사 당일 · ③ 끝난 뒤</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ToolLink href={`/host/${ev.code}/scan`} emoji="📷" title="입장 · 퇴장 · 스탬프 스캐너" desc="입구 · 출구 · 부스 기기에서 (스태프 PIN)" />
          <ToolLink href={`/host/${ev.code}/onsite`} emoji="📝" title="현장 등록" desc="사전등록 안 한 분 — 등록하면 바로 입장" />
          <ToolLink href={`/host/${ev.code}/report`} emoji="📑" title="결과보고서" desc="통계 · 부스 · 만족도 — PDF 로 저장" />
          <ToolLink href={`/host/${ev.code}/settings`} emoji="⚙️" title="행사 설정 · 디자인" desc="이름 · 색 · 로고 · 부대행사 · 설문" />
        </div>
        {role === "admin" && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-line pt-4 text-sm">
            <span className="font-bold text-ink-muted">스태프 PIN:</span>
            <button type="button" className="font-bold text-[var(--ev)] underline" onClick={() => pin("staff")}>
              새로 발급
            </button>
          </div>
        )}
        {newPin && (
          <p className="mt-3 rounded-xl bg-[#FFF6D1] px-4 py-3 text-sm font-bold text-[#8A6A00]">
            새 스태프 PIN: <span className="font-mono text-xl tracking-widest">{newPin.pin}</span> (지금만 보여요 — 현장 스태프에게 알려 주세요)
          </p>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="text-lg font-extrabold text-ink">🎪 부스 태블릿</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {ev.status === "confirmed" ? "부스마다 태블릿에서 아래 주소를 열고 스태프 PIN 으로 로그인하세요. 결과물에 행사 이름 · 로고가 들어가고, 체험 수 · 스탬프가 자동으로 집계돼요." : "행사가 확정되면 부스 태블릿 주소가 열려요."}
        </p>
        {ev.booths.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ev.booths.map((b) => (
              <li key={b} className="flex items-center gap-3 rounded-2xl border border-ink-line p-3">
                {origin && <QrImage text={`${origin}/e/${ev.code}/fun/${b}`} size={72} />}
                <span className="min-w-0">
                  <span className="block font-extrabold text-ink">
                    {boothEmoji(b)} {boothName(b)}
                  </span>
                  <a href={`/e/${ev.code}/fun/${b}`} target="_blank" className="block truncate text-xs font-bold text-[var(--ev)] underline">
                    /e/{ev.code}/fun/{b}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">고른 부대행사가 없어요. 행사 설정에서 골라 주세요.</p>
        )}
      </Card>
    </div>
  );
}

function ToolLink(props: { href: string; emoji: string; title: string; desc: string }) {
  return (
    <a href={props.href} className="flex items-start gap-3 rounded-xl border border-ink-line p-3.5 transition hover:border-[var(--ev)] hover:bg-ink-bg">
      <span className="text-2xl">{props.emoji}</span>
      <span>
        <span className="block font-bold text-ink">{props.title}</span>
        <span className="block text-xs text-ink-muted">{props.desc}</span>
      </span>
    </a>
  );
}
