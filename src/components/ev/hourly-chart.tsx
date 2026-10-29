// 시간대별 입장 · 퇴장 막대그래프 (SVG — 화면 · 인쇄 같이 씀)

type Row = { day: string; hour: number; ins: number; outs: number };

export function HourlyChart({ data, color }: { data: Row[]; color: string }) {
  const days = [...new Set(data.map((d) => d.day))];
  return (
    <div className="space-y-6">
      {days.map((day) => (
        <Day key={day} label={days.length > 1 ? day.slice(5).replace("-", "/") : undefined} rows={data.filter((d) => d.day === day)} color={color} />
      ))}
      <div className="flex gap-4 text-xs font-bold text-ink-soft">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm" style={{ background: color }} /> 입장
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm bg-[#A3AEC2]" /> 퇴장
        </span>
      </div>
    </div>
  );
}

function Day({ label, rows, color }: { label?: string; rows: Row[]; color: string }) {
  // 앞뒤로 한 시간씩, 적어도 6칸은 보이게
  let from = Math.max(0, Math.min(...rows.map((r) => r.hour)) - 1);
  let to = Math.min(23, Math.max(...rows.map((r) => r.hour)) + 1);
  while (to - from < 5) {
    if (to < 23) to++;
    if (to - from < 5 && from > 0) from--;
  }
  const hours = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const max = Math.max(1, ...rows.flatMap((r) => [r.ins, r.outs]));
  const W = 640;
  const H = 200;
  const pad = { l: 34, r: 8, t: 16, b: 26 };
  const slot = (W - pad.l - pad.r) / hours.length;
  const bw = Math.min(26, slot * 0.36);
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const ticks = [0, Math.round(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <figure>
      {label && <figcaption className="mb-1 text-sm font-bold text-ink-soft">{label}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} className="max-h-72 w-full" role="img" aria-label="시간대별 입장 · 퇴장 인원">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#E5EAF2" />
            <text x={pad.l - 6} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#6B7A96">
              {t}
            </text>
          </g>
        ))}
        {hours.map((h, i) => {
          const r = rows.find((x) => x.hour === h);
          const x0 = pad.l + i * slot + slot / 2;
          return (
            <g key={h}>
              {r && r.ins > 0 && (
                <>
                  <rect x={x0 - bw - 1} y={y(r.ins)} width={bw} height={y(0) - y(r.ins)} rx="3" fill={color} />
                  <text x={x0 - bw / 2 - 1} y={y(r.ins) - 4} fontSize="11" textAnchor="middle" fill="#12203A" fontWeight="700">
                    {r.ins}
                  </text>
                </>
              )}
              {r && r.outs > 0 && (
                <>
                  <rect x={x0 + 1} y={y(r.outs)} width={bw} height={y(0) - y(r.outs)} rx="3" fill="#A3AEC2" />
                  <text x={x0 + bw / 2 + 1} y={y(r.outs) - 4} fontSize="11" textAnchor="middle" fill="#3D4C68">
                    {r.outs}
                  </text>
                </>
              )}
              <text x={x0} y={H - 8} fontSize="11" textAnchor="middle" fill="#6B7A96">
                {h}시
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
