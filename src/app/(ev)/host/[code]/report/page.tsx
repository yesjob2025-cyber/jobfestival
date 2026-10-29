import type { Metadata } from "next";
import { HourlyChart } from "@/components/ev/hourly-chart";
import { reportData, stats } from "@/lib/ev/service";
import { dateRange, FIELD_OPTIONS, kst, SCALE, shade } from "@/lib/ev/shared";
import { guard } from "../guard";
import { PrintBar } from "./print-bar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "결과보고서" };

/** 결과보고서 — A4 로 인쇄 · PDF 저장 (실적 증빙용 숫자 · 그래프 · 만족도) */
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const g = await guard(code, "admin", "관리자 로그인");
  if ("view" in g) return g.view;
  const ev = g.ev;
  const [s, r] = await Promise.all([stats(code), reportData(code)]);
  const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "–");
  const avgAll = r.survey.length && r.survey.some((q) => q.count) ? r.survey.reduce((a, q) => a + q.avg, 0) / r.survey.filter((q) => q.count).length : 0;
  const now = kst(new Date(), { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-ink-line/40 py-6 print:bg-white print:py-0">
      <style>{`@page { size: A4; margin: 14mm 12mm } @media print { .no-print { display: none } .sheet { box-shadow: none !important; padding: 0 !important } }`}</style>
      <PrintBar back={`/host/${code}`} />
      <article className="sheet mx-auto w-full max-w-[210mm] bg-white p-[12mm] text-ink shadow-xl" style={{ ["--ev" as string]: ev.color }}>
        <header className="rounded-2xl p-6 text-white" style={{ background: `linear-gradient(140deg, ${ev.color}, ${shade(ev.color, -40)})` }}>
          <p className="text-sm font-bold opacity-80">행사 결과보고</p>
          <h1 className="mt-1 text-2xl font-extrabold">{ev.name}</h1>
          <p className="mt-2 text-sm opacity-90">
            {dateRange(ev.startsOn, ev.endsOn)}
            {ev.place && ` · ${ev.place}`}
            {ev.hostOrg && ` · ${ev.hostOrg}`}
          </p>
        </header>

        <Section n="1" title="참여 현황">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {[
                ["총 등록 인원", `${s.total}명`, `사전등록 ${s.pre}명 · 현장등록 ${s.onsite}명`],
                ["실제 입장 인원", `${s.entered}명`, `등록 대비 입장률 ${pct(s.entered, s.total)}`],
                ["퇴장 확인 인원", `${s.exited}명`, `입장 대비 ${pct(s.exited, s.entered)}`],
                ["만족도 설문 응답", `${s.surveyed}명`, `입장 대비 응답률 ${pct(s.surveyed, s.entered)}`],
                ["평균 머문 시간", s.stayMin != null ? `${s.stayMin}분` : "–", "입장 ~ 퇴장 시각 기준"],
              ].map(([k, v, d]) => (
                <tr key={k} className="border-b border-ink-line">
                  <th className="w-36 bg-ink-bg px-3 py-2.5 text-left font-bold">{k}</th>
                  <td className="w-28 px-3 py-2.5 text-lg font-extrabold tabular-nums">{v}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section n="2" title="시간대별 입장 · 퇴장">
          {s.hourly.length ? <HourlyChart data={s.hourly} color={ev.color} /> : <Empty />}
        </Section>

        <Section n="3" title="참가자 구성 (입장 기준)">
          {r.purged ? (
            <p className="text-sm text-ink-muted">보관 기간이 지나 학번 · 이메일 등은 지워졌어요. 학교 · 학과 · 학년 통계는 남아 있어요.</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            {FIELD_OPTIONS.filter((f) => ev.fields.includes(f.id) && f.id !== "studentNo" && f.id !== "email").map((f) => {
              const rows = r.composition[f.id] ?? [];
              const total = rows.reduce((a, [, n]) => a + n, 0);
              const top = rows.slice(0, 8);
              return (
                <div key={f.id} className="break-inside-avoid rounded-xl border border-ink-line p-3">
                  <p className="mb-2 text-sm font-extrabold">{f.label}</p>
                  {top.length ? (
                    <ul className="space-y-1.5">
                      {top.map(([label, n]) => (
                        <li key={label} className="text-xs">
                          <div className="flex justify-between gap-2">
                            <span className="truncate">{label}</span>
                            <span className="shrink-0 font-bold tabular-nums">
                              {n}명 ({pct(n, total)})
                            </span>
                          </div>
                          <div className="mt-0.5 h-1.5 rounded-full bg-ink-bg">
                            <div className="h-1.5 rounded-full" style={{ width: `${(n / top[0][1]) * 100}%`, background: ev.color }} />
                          </div>
                        </li>
                      ))}
                      {rows.length > top.length && <li className="text-xs text-ink-muted">외 {rows.length - top.length}개</li>}
                    </ul>
                  ) : (
                    <Empty />
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <Section n="4" title={`만족도 조사 (응답 ${s.surveyed}명${avgAll ? ` · 전체 평균 ${avgAll.toFixed(2)}점 / 5점` : ""})`}>
          {s.surveyed ? (
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-ink-bg">
                  <th className="px-2 py-2 text-left">문항</th>
                  {SCALE.map((l) => (
                    <th key={l} className="w-12 whitespace-pre-line px-1 py-2 text-center font-bold">
                      {l.replace("매우 ", "매우\n")}
                    </th>
                  ))}
                  <th className="w-14 px-1 py-2 text-center">평균</th>
                </tr>
              </thead>
              <tbody>
                {r.survey.map((q, i) => (
                  <tr key={i} className="border-b border-ink-line">
                    <td className="px-2 py-2">
                      {i + 1}. {q.question}
                    </td>
                    {q.dist.map((n, k) => (
                      <td key={k} className="px-1 py-2 text-center tabular-nums">
                        {n}
                        <span className="block text-[10px] text-ink-muted">{pct(n, q.count)}</span>
                      </td>
                    ))}
                    <td className="px-1 py-2 text-center text-sm font-extrabold tabular-nums" style={{ color: ev.color }}>
                      {q.count ? q.avg.toFixed(2) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Empty />
          )}
        </Section>

        <Section n="5" title={`참가자 의견 (${r.comments.length}건)`}>
          {r.comments.length ? (
            <ul className="space-y-1.5 text-sm">
              {r.comments.slice(0, 60).map((c, i) => (
                <li key={i} className="break-inside-avoid rounded-lg bg-ink-bg px-3 py-2">
                  “{c}”
                </li>
              ))}
              {r.comments.length > 60 && <li className="text-xs text-ink-muted">외 {r.comments.length - 60}건 — 전체는 참가자 명단(엑셀)에서 볼 수 있어요</li>}
            </ul>
          ) : (
            <Empty />
          )}
        </Section>

        <footer className="mt-8 border-t border-ink-line pt-3 text-right text-xs text-ink-muted">작성 {now} · 입장 · 퇴장 QR 기록 자동 집계</footer>
      </article>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 break-inside-avoid">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ev)] text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="py-4 text-center text-sm text-ink-muted">아직 기록이 없어요</p>;
}
