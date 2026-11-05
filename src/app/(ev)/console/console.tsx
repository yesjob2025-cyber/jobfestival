"use client";

// 운영자 콘솔 — 도입 문의 확인 → 기관 계정 발급(아이디 · 비밀번호) → 행사 만들기 → 확정

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/ev/admin-shell";
import { draftOf, EventForm } from "@/components/ev/event-form";
import { StatusBadge } from "@/components/ev/status-badge";
import { api, Card, ErrorText, EvButton, Field } from "@/components/ev/ui";
import { FUN_EVENTS } from "@/lib/fun/config";
import { dateRange, kst, type PublicEvent } from "@/lib/ev/shared";

type Tab = "inquiries" | "orgs" | "events";
interface Org {
  id: string;
  name: string;
  login_id: string;
  contact: string;
  created_at: string;
  last_login: string | null;
  events: string;
}
type Ev = PublicEvent & { orgId: string | null; orgName: string; total: number; entered: number };
interface Inquiry {
  id: string;
  org: string;
  name: string;
  phone: string;
  email: string;
  event_date: string;
  size: string;
  booths: string[];
  message: string;
  done: boolean;
  created_at: string;
}

const full = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" } as const;
const boothName = (s: string) => FUN_EVENTS.find((e) => e.slug === s)?.name ?? s;

export function Console() {
  const [tab, setTab] = useState<Tab>("inquiries");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [notice, setNotice] = useState<React.ReactNode>(null);

  const load = useCallback(async () => {
    const [o, e, i] = await Promise.all([api<Org[]>("/api/jf/orgs"), api<Ev[]>("/api/jf/events"), api<Inquiry[]>("/api/jf/inquiries")]);
    setOrgs(o);
    setEvents(e);
    setInquiries(i);
  }, []);
  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const open = inquiries.filter((i) => !i.done).length;
  const tabs: [Tab, string][] = [
    ["inquiries", `📮 도입 문의${open ? ` (${open})` : ""}`],
    ["orgs", `🏫 기관 계정 (${orgs.length})`],
    ["events", `🎪 행사 (${events.length})`],
  ];

  return (
    <AdminShell who="운영자">
      <h1 className="text-2xl font-extrabold text-ink">운영자 콘솔</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-extrabold ${tab === id ? "bg-[#0B1F4D] text-white" : "bg-white text-ink-soft"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {notice && (
        <div className="mt-4 rounded-2xl border-2 border-kdu-yellow bg-[#FFF6D1] p-4 text-sm font-bold text-[#6B5200]">
          {notice}
          <button type="button" className="ml-3 underline" onClick={() => setNotice(null)}>
            닫기
          </button>
        </div>
      )}

      <div className="mt-5">
        {tab === "inquiries" && (
          <div className="space-y-3">
            {inquiries.length === 0 && <Card className="text-center text-ink-muted">아직 문의가 없어요.</Card>}
            {inquiries.map((i) => (
              <Card key={i.id} className={i.done ? "opacity-60" : ""}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold text-ink">{i.org}</p>
                    <p className="text-sm text-ink-soft">
                      {i.name} · {[i.phone, i.email].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs text-ink-muted">{kst(i.created_at, full)}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {i.event_date && `📅 ${i.event_date} `}
                  {i.size && `· 👥 ${i.size} `}
                  {i.booths.length > 0 && `· 🎪 ${i.booths.map(boothName).join(", ")}`}
                </p>
                {i.message && <p className="mt-2 whitespace-pre-line rounded-xl bg-ink-bg p-3 text-sm text-ink">{i.message}</p>}
                <div className="mt-3 flex gap-2">
                  <EvButton
                    tone="line"
                    className="py-2 text-sm"
                    onClick={async () => {
                      await api("/api/jf/inquiry-done", { id: i.id, done: !i.done });
                      load();
                    }}
                  >
                    {i.done ? "다시 열기" : "처리 완료"}
                  </EvButton>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "orgs" && <Orgs orgs={orgs} onChange={load} onNotice={setNotice} />}
        {tab === "events" && <Events orgs={orgs} events={events} onChange={load} onNotice={setNotice} />}
      </div>
    </AdminShell>
  );
}

function Orgs({ orgs, onChange, onNotice }: { orgs: Org[]; onChange: () => void; onNotice: (n: React.ReactNode) => void }) {
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const r = await api<{ loginId: string; password: string }>("/api/jf/org-create", { name, loginId, contact });
      onNotice(<Issued name={name} loginId={r.loginId} password={r.password} />);
      setName("");
      setLoginId("");
      setContact("");
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "만들지 못했어요.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
      <Card>
        <h2 className="text-lg font-extrabold text-ink">기관 계정 발급</h2>
        <form onSubmit={create} className="mt-4 space-y-3">
          <Field label="학교 · 기관 이름" required>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 경동대학교 대학일자리플러스센터" required />
          </Field>
          <Field label="아이디" required hint="영문 소문자 · 숫자 4자 이상">
            <input className="field" value={loginId} onChange={(e) => setLoginId(e.target.value.toLowerCase())} placeholder="예) kdu-career" required />
          </Field>
          <Field label="담당자 · 연락처 (메모)">
            <input className="field" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="예) 홍길동 033-000-0000" />
          </Field>
          <ErrorText>{error}</ErrorText>
          <EvButton type="submit" className="w-full">
            계정 만들기 (비밀번호 자동 발급)
          </EvButton>
        </form>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold text-ink">기관 목록</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-line text-left text-xs text-ink-muted">
              <th className="py-2">기관</th>
              <th>아이디</th>
              <th>행사</th>
              <th>최근 로그인</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-ink-line">
                <td className="py-2.5">
                  <b className="text-ink">{o.name}</b>
                  {o.contact && <span className="block text-xs text-ink-muted">{o.contact}</span>}
                </td>
                <td className="font-mono">{o.login_id}</td>
                <td>{o.events}</td>
                <td className="text-xs text-ink-muted">{o.last_login ? kst(o.last_login, full) : "–"}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="text-xs font-bold text-[var(--ev)] underline"
                    onClick={async () => {
                      if (!confirm(`${o.name} 비밀번호를 새로 발급할까요? 이전 비밀번호는 더 이상 쓸 수 없어요.`)) return;
                      const r = await api<{ password: string }>("/api/jf/org-password", { id: o.id });
                      onNotice(<Issued name={o.name} loginId={o.login_id} password={r.password} />);
                    }}
                  >
                    비밀번호 재발급
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orgs.length === 0 && <p className="py-6 text-center text-sm text-ink-muted">아직 기관이 없어요</p>}
      </Card>
    </div>
  );
}

function Issued({ name, loginId, password }: { name: string; loginId: string; password: string }) {
  return (
    <span>
      🔑 {name} — 아이디 <span className="font-mono text-base">{loginId}</span> · 비밀번호 <span className="font-mono text-base">{password}</span>
      <span className="mt-1 block text-xs font-semibold">비밀번호는 지금만 보여요. 기관 담당자에게 전달해 주세요. (로그인 주소: {typeof location !== "undefined" ? location.origin : ""}/login)</span>
    </span>
  );
}

function Events({ orgs, events, onChange, onNotice }: { orgs: Org[]; events: Ev[]; onChange: () => void; onNotice: (n: React.ReactNode) => void }) {
  const [creating, setCreating] = useState(false);
  const [orgId, setOrgId] = useState("");

  return (
    <div className="space-y-4">
      {creating ? (
        <Card>
          <h2 className="mb-4 text-lg font-extrabold text-ink">새 행사</h2>
          <EventForm
            initial={draftOf()}
            submitLabel="행사 만들기"
            extra={
              <Field label="기관" hint="이 기관 계정으로 로그인하면 행사 대시보드를 볼 수 있어요">
                <select className="field py-3" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                  <option value="">(나중에 연결)</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </Field>
            }
            onSubmit={async (d) => {
              const r = await api<{ code: string; staffPin: string }>("/api/jf/event-create", { ...d, orgId });
              onNotice(
                <span>
                  🎪 행사 코드 <span className="font-mono text-base">{r.code}</span> · 스태프 PIN <span className="font-mono text-base">{r.staffPin}</span>
                  <span className="mt-1 block text-xs font-semibold">스태프 PIN 은 지금만 보여요 (행사 대시보드에서 재발급 가능). 확정하면 행사 전용 페이지에 부대행사가 열려요.</span>
                </span>,
              );
              setCreating(false);
              onChange();
            }}
          />
          <button type="button" className="mt-3 text-sm font-bold text-ink-muted underline" onClick={() => setCreating(false)}>
            취소
          </button>
        </Card>
      ) : (
        <EvButton onClick={() => setCreating(true)}>+ 새 행사 만들기</EvButton>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {events.map((e) => (
          <Card key={e.code}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-extrabold text-ink">{e.name}</p>
                <p className="text-sm text-ink-muted">
                  {dateRange(e.startsOn, e.endsOn)} · 코드 <span className="font-mono">{e.code}</span>
                </p>
              </div>
              <StatusBadge status={e.status} />
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              등록 {e.total} · 입장 {e.entered} · 부대행사 {e.booths.length ? e.booths.map(boothName).join(", ") : "없음"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                className="field w-auto py-2 text-sm"
                value={e.orgId ?? ""}
                onChange={async (x) => {
                  await api("/api/jf/event-org", { code: e.code, orgId: x.target.value });
                  onChange();
                }}
                aria-label="기관 연결"
              >
                <option value="">기관 없음</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <EvButton
                tone={e.status === "confirmed" ? "line" : "main"}
                className="py-2 text-sm"
                onClick={async () => {
                  await api("/api/jf/event-status", { code: e.code, status: e.status === "confirmed" ? "draft" : "confirmed" });
                  onChange();
                }}
              >
                {e.status === "confirmed" ? "확정 취소" : "✅ 확정하기"}
              </EvButton>
              <a href={`/host/${e.code}`} className="text-sm font-bold text-[var(--ev)] underline">
                대시보드
              </a>
              <a href={`/e/${e.code}`} target="_blank" className="text-sm font-bold text-[var(--ev)] underline">
                행사 페이지
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
