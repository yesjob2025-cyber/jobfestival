/** 포스터의 색종이 장식 — 위치를 고정해 두어 매번 같은 모양으로 그려집니다. */
const PIECES = [
  { x: 4, y: 8, w: 10, h: 26, r: 25, c: "#FFD21E" },
  { x: 12, y: 30, w: 14, h: 14, r: 40, c: "#E4457A" },
  { x: 22, y: 6, w: 8, h: 22, r: -30, c: "#ffffff" },
  { x: 36, y: 16, w: 12, h: 12, r: 15, c: "#9BE15D" },
  { x: 48, y: 4, w: 9, h: 24, r: 60, c: "#B983FF" },
  { x: 58, y: 22, w: 13, h: 13, r: -20, c: "#FFD21E" },
  { x: 68, y: 8, w: 10, h: 26, r: -45, c: "#E4457A" },
  { x: 80, y: 18, w: 12, h: 12, r: 30, c: "#ffffff" },
  { x: 90, y: 6, w: 9, h: 24, r: 20, c: "#FFD21E" },
  { x: 95, y: 34, w: 12, h: 12, r: -15, c: "#B983FF" },
  { x: 3, y: 58, w: 12, h: 12, r: 35, c: "#9BE15D" },
  { x: 8, y: 82, w: 9, h: 22, r: -25, c: "#FFD21E" },
  { x: 46, y: 62, w: 10, h: 10, r: 45, c: "#ffffff" },
  { x: 93, y: 70, w: 10, h: 24, r: 50, c: "#E4457A" },
  { x: 62, y: 88, w: 12, h: 12, r: -35, c: "#FFD21E" },
] as const;

export function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-[3px] opacity-90"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.w,
            height: p.h,
            background: p.c,
            transform: `rotate(${p.r}deg)`,
          }}
        />
      ))}
    </div>
  );
}
