// ─────────────────────────────────────────────────────────────
// 취업 손금 — 실제 손바닥 주름 찾기
//
// 1) 손 마디 좌표로 손바닥을 반듯하게 펴서(손바닥 좌표 a·b 격자로 다시 샘플링) 회색조로 만들고
// 2) "주변보다 어두운 가는 골" 지도(블랙햇: 크게 흐린 밝기 − 살짝 흐린 밝기)를 만든 뒤
// 3) 선마다 정해진 자리(템플릿) 근처 띠 안에서, 주름 지도를 가장 많이 지나는 매끄러운 길을
//    동적 계획법으로 찾습니다. 길 위 주름 세기로 선의 세기(1~3)와 실제 길이를 정합니다.
//
// 사진이 흐리거나 손등이면 주름이 약하게 나오므로 detected=false 로 알려 줍니다 (그때는 템플릿 선).
// ─────────────────────────────────────────────────────────────

import { linePath, palmFrame, type LineId, type Pt } from "./palm";

export interface Crease {
  /** 찾은 선 (손바닥 좌표 a·b 의 점들) — 짧으면 잘린 길이 */
  path: [number, number][];
  /** 1~3 */
  strength: number;
  /** 주름 세기 (손바닥 평균 대비) */
  score: number;
}

export interface CreaseResult {
  lines: Record<LineId, Crease>;
  /** 주름을 제대로 찾았는지 (흐린 사진 · 손등이면 false) */
  detected: boolean;
}


// 반듯하게 편 격자 — a: 엄지 쪽 −0.8 … 새끼 쪽 +0.8 (손바닥 폭), b: −0.05 … 1.05 (손목 … 중지 뿌리)
const A0 = -0.8;
const A1 = 0.8;
const B0 = -0.05;
const B1 = 1.05;
/** 손바닥 폭 하나에 격자 몇 칸 */
const PER_W = 140;

export function findCreases(photo: HTMLCanvasElement, lm: Pt[]): CreaseResult {
  const S = photo.width;
  const f = palmFrame(lm, S);
  const cols = Math.round((A1 - A0) * PER_W);
  // 세로 칸 크기를 가로 칸과 같은 픽셀 크기로
  const rows = Math.round(((B1 - B0) * f.L * PER_W) / f.W);

  const src = photo.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, S, photo.height).data;
  const H = photo.height;
  const gray = new Float32Array(cols * rows);
  const inside = new Uint8Array(cols * rows);
  const hull = palmHull(lm, S, f);

  for (let r = 0; r < rows; r++) {
    const b = B1 - (r / (rows - 1)) * (B1 - B0); // 위쪽 줄 = 손가락 쪽
    for (let c = 0; c < cols; c++) {
      const a = A0 + (c / (cols - 1)) * (A1 - A0);
      const p = f.at(a, b);
      const i = r * cols + c;
      if (p.x < 1 || p.y < 1 || p.x > S - 2 || p.y > H - 2) continue;
      // 주름은 초록 · 파랑에서 더 진하게 보입니다 (빨강은 피부 혈색이라 평평)
      const x0 = Math.floor(p.x);
      const y0 = Math.floor(p.y);
      const fx = p.x - x0;
      const fy = p.y - y0;
      let v = 0;
      for (const [dx, dy, w] of [
        [0, 0, (1 - fx) * (1 - fy)],
        [1, 0, fx * (1 - fy)],
        [0, 1, (1 - fx) * fy],
        [1, 1, fx * fy],
      ]) {
        const k = ((y0 + dy) * S + x0 + dx) * 4;
        v += w * (0.15 * src[k] + 0.6 * src[k + 1] + 0.25 * src[k + 2]);
      }
      gray[i] = v;
      inside[i] = hull(a, b) ? 1 : 0;
    }
  }

  // 블랙햇 — 가는 어두운 골만 남깁니다. 칸 크기가 손 크기에 맞춰져 있어 사진 해상도와 무관.
  const fine = blur(gray, cols, rows, 1);
  const wide = blur(gray, cols, rows, 3);
  const resp = new Float32Array(cols * rows);
  const vals: number[] = [];
  for (let i = 0; i < resp.length; i++) {
    if (!inside[i]) continue;
    // 어두운 곳은 골이 얕게 보이므로 밝기로 나눠 상대 깊이로
    const v = Math.max(0, (wide[i] - fine[i]) / Math.max(30, wide[i]));
    resp[i] = v;
    vals.push(v);
  }
  vals.sort((x, y) => x - y);
  const p50 = vals[Math.floor(vals.length * 0.5)] ?? 0;
  const p95 = vals[Math.floor(vals.length * 0.95)] ?? 0;
  // 정규화: 손바닥 상위 5% 주름 세기를 1로
  const norm = p95 > 1e-4 ? 1 / p95 : 0;
  // 사진 전체의 주름 대비 — 흐리거나 손등이면 낮음
  const contrast = p95;

  const at = (a: number, b: number) => {
    const c = Math.round(((a - A0) / (A1 - A0)) * (cols - 1));
    const r = Math.round(((B1 - b) / (B1 - B0)) * (rows - 1));
    if (c < 0 || r < 0 || c >= cols || r >= rows) return -0.5;
    const i = r * cols + c;
    return inside[i] ? resp[i] * norm : -0.5;
  };

  const lines = {} as Record<LineId, Crease>;
  // 두뇌선 · 감정선을 먼저 찾고, 생명선 · 운명선은 이미 찾은 선을 피해서 찾습니다.
  // (생명선은 두뇌선과 같은 곳에서 시작해 그대로 두뇌선을 따라가 버리기 쉬움)
  const taken: [number, number][] = [];
  const avoid = (a: number, b: number) => {
    const v = at(a, b);
    for (const [x, y] of taken) if (Math.abs(a - x) < 0.04 && Math.abs(b - y) < 0.04) return v - 0.8;
    return v;
  };
  for (const id of ["heart", "head", "life", "fate"] as LineId[]) {
    lines[id] = traceLine(id, id === "heart" || id === "head" ? at : avoid);
    // 생명선과 두뇌선이 만나는 시작 부분(앞 15%)은 비워 둡니다
    const p = lines[id].path;
    taken.push(...(id === "head" ? p.slice(Math.round(p.length * 0.15)) : p));
  }
  // 세 주요 선(생명 · 두뇌 · 감정)이 모두 또렷해야 "찾았다"고 봅니다 (운명선은 없는 사람도 많음)
  const main = (["life", "head", "heart"] as const).every((id) => lines[id].score > 0.7);
  return { lines, detected: norm > 0 && contrast > 0.012 && p95 > p50 * 2.2 && main };
}

/** 템플릿 선 주변 띠에서 주름을 가장 많이 지나는 길 */
function traceLine(id: LineId, at: (a: number, b: number) => number): Crease {
  // 가장 긴 템플릿보다 조금 더 길게 펴서 찾고, 실제 주름이 끝나는 곳에서 자릅니다.
  const tpl = sampleQuad(linePath(id, 3.6), 48);
  const band = id === "fate" ? 0.16 : 0.13;
  const M = 27;
  const K = tpl.length;
  const offsets = Array.from({ length: M }, (_, j) => -band + (j / (M - 1)) * 2 * band);
  const normal = tpl.map((p, k) => {
    const q = tpl[Math.min(K - 1, k + 1)];
    const o = tpl[Math.max(0, k - 1)];
    const tx = q[0] - o[0];
    const ty = q[1] - o[1];
    const l = Math.hypot(tx, ty) || 1;
    return [-ty / l, tx / l] as const;
  });
  const point = (k: number, j: number): [number, number] => [tpl[k][0] + normal[k][0] * offsets[j], tpl[k][1] + normal[k][1] * offsets[j]];
  const score = (k: number, j: number) => at(...point(k, j));

  // DP: 이웃 칸으로만 이동 (|Δj| ≤ 2), 꺾임에 벌점, 템플릿에서 멀수록 약한 벌점
  const S = Array.from({ length: K }, (_, k) => Float32Array.from({ length: M }, (_, j) => score(k, j)));
  const best = Array.from({ length: K }, () => new Float32Array(M));
  const from = Array.from({ length: K }, () => new Int8Array(M));
  const pull = (j: number) => 0.2 * ((offsets[j] / band) ** 2);
  for (let j = 0; j < M; j++) best[0][j] = S[0][j] - pull(j);
  for (let k = 1; k < K; k++) {
    for (let j = 0; j < M; j++) {
      let v = -Infinity;
      let arg = 0;
      for (let d = -2; d <= 2; d++) {
        const jj = j + d;
        if (jj < 0 || jj >= M) continue;
        const c = best[k - 1][jj] - 0.12 * d * d;
        if (c > v) {
          v = c;
          arg = d;
        }
      }
      best[k][j] = v + S[k][j] - pull(j);
      from[k][j] = arg;
    }
  }
  let j = 0;
  for (let m = 1; m < M; m++) if (best[K - 1][m] > best[K - 1][j]) j = m;
  const js = new Array<number>(K);
  for (let k = K - 1; k >= 0; k--) {
    js[k] = j;
    j += from[k][j];
  }

  // 길 위 세기 (앞뒤 2칸 평균) — 시작점부터 세기가 이어지는 구간만 남깁니다.
  const raw = js.map((jj, k) => S[k][jj]);
  const smooth = raw.map((_, k) => {
    let s = 0;
    let n = 0;
    for (let d = -2; d <= 2; d++) {
      const v = raw[k + d];
      if (v !== undefined) {
        s += v;
        n++;
      }
    }
    return s / n;
  });
  // 최소 길이(템플릿의 45%)는 항상, 그 뒤는 세기가 0.45 아래로 4칸 넘게 떨어지면 끝
  const minK = Math.round(K * 0.45);
  let end = K;
  let low = 0;
  for (let k = minK; k < K; k++) {
    low = smooth[k] < 0.45 ? low + 1 : 0;
    if (low > 4) {
      end = k - 4;
      break;
    }
  }
  const kept = smooth.slice(0, end);
  const mean = kept.reduce((s, v) => s + v, 0) / kept.length;
  const lengthRatio = end / K;
  const strengthScore = mean * 0.7 + lengthRatio * 0.6;
  const strength = strengthScore > 1.05 ? 3 : strengthScore > 0.8 ? 2 : 1;
  const path = smoothPath(js.slice(0, end).map((jj, k) => point(k, jj)));
  return { path, strength, score: mean };
}

/** 2차 곡선(시작 · 가운데 지나는 점 · 끝)을 n 개 점으로 */
function sampleQuad([a, b, c]: [number, number][], n: number): [number, number][] {
  const ctrl = [b[0] * 2 - (a[0] + c[0]) / 2, b[1] * 2 - (a[1] + c[1]) / 2];
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * ctrl[0] + t * t * c[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * c[1]];
  });
}

function smoothPath(p: [number, number][]): [number, number][] {
  return p.map((_, i) => {
    let x = 0;
    let y = 0;
    let n = 0;
    for (let d = -3; d <= 3; d++) {
      const q = p[i + d];
      if (!q) continue;
      x += q[0];
      y += q[1];
      n++;
    }
    return [x / n, y / n];
  });
}

/** 손바닥 안쪽인지 (손목 · 엄지 뿌리 · 손가락 뿌리를 이은 볼록 껍질, 가장자리 조금 안쪽) */
function palmHull(lm: Pt[], S: number, f: ReturnType<typeof palmFrame>) {
  const ids = [0, 1, 2, 5, 9, 13, 17];
  // 사진 좌표 → 손바닥 좌표 (at 의 역변환)
  const w = f.at(0, 0);
  const u = f.at(0, 1);
  const s = f.at(1, 0);
  const up = { x: u.x - w.x, y: u.y - w.y };
  const side = { x: (s.x - w.x) / f.W, y: (s.y - w.y) / f.W };
  const toAB = (p: Pt) => {
    const dx = p.x * S - w.x;
    const dy = p.y * S - w.y;
    return [(dx * side.x + dy * side.y) / f.W, (dx * up.x + dy * up.y) / (f.L * f.L)] as [number, number];
  };
  const pts = ids.map((i) => toAB(lm[i]));
  // 새끼 쪽 손바닥 아래(손날)는 마디가 없어 껍질 밖으로 빠지므로 점 하나 보탭니다
  const p17 = pts[6];
  pts.push([p17[0] + 0.02, 0.15]);
  const hull = convexHull(pts);
  const cx = hull.reduce((s2, p) => s2 + p[0], 0) / hull.length;
  const cy = hull.reduce((s2, p) => s2 + p[1], 0) / hull.length;
  // 가장자리 6% 안쪽으로 (손 테두리 그림자를 주름으로 잡지 않게)
  const shrunk = hull.map(([x, y]) => [cx + (x - cx) * 0.94, cy + (y - cy) * 0.94] as [number, number]);
  return (a: number, b: number) => {
    for (let i = 0; i < shrunk.length; i++) {
      const [x1, y1] = shrunk[i];
      const [x2, y2] = shrunk[(i + 1) % shrunk.length];
      if ((x2 - x1) * (b - y1) - (y2 - y1) * (a - x1) < 0) return false;
    }
    return true;
  };
}

/** 반시계 방향 볼록 껍질 */
function convexHull(points: [number, number][]): [number, number][] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: [number, number][] = [];
  for (const q of p.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** 가로 · 세로 상자 흐림 3번 (≈ 가우시안) */
function blur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  let a = src.slice();
  let b = new Float32Array(a.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      let s = 0;
      const row = y * w;
      for (let x = -r; x <= r; x++) s += a[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[row + x] = s / (2 * r + 1);
        s += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    [a, b] = [b, a];
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += a[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        b[y * w + x] = s / (2 * r + 1);
        s += a[Math.min(h - 1, y + r + 1) * w + x] - a[Math.max(0, y - r) * w + x];
      }
    }
    [a, b] = [b, a];
  }
  return a;
}
