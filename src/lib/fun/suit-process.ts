// 정장 사진 다듬기 (브라우저) — 배경 지우기 · 여백 자르기 · 목 위치 · 어깨 폭 재기
//
// 배경: 네 귀퉁이가 투명하면 그대로, 초록이면 크로마키, 그 밖의 단색이면 귀퉁이 색과 가까운 곳을 지웁니다.

export interface ProcessedSuit {
  canvas: HTMLCanvasElement;
  neck: [number, number];
  shoulder: number;
}

const MAX_W = 900;

export async function processSuit(src: string): Promise<ProcessedSuit> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const k = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.round(img.naturalWidth * k);
  const H = Math.round(img.naturalHeight * k);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H);
  const d = data.data;

  // 귀퉁이 색
  const corner = [0, W - 1, (H - 1) * W, H * W - 1].map((i) => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]]);
  const transparent = corner.every((p) => p[3] < 20);
  const avg = [0, 1, 2].map((ch) => corner.reduce((s, p) => s + p[ch], 0) / 4);
  const green = avg[1] > avg[0] + 60 && avg[1] > avg[2] + 60;

  if (!transparent) {
    for (let i = 0; i < W * H; i++) {
      const r = d[i * 4];
      const g = d[i * 4 + 1];
      const b = d[i * 4 + 2];
      let a: number;
      if (green) {
        // 초록이 다른 색보다 얼마나 센지 — 세면 투명, 경계는 반투명 + 초록 빛 번짐 빼기
        const spill = g - Math.max(r, b);
        a = spill > 70 ? 0 : spill > 25 ? 1 - (spill - 25) / 45 : 1;
        if (spill > 0) d[i * 4 + 1] = Math.max(r, b) + Math.min(spill, 8);
      } else {
        const dist = Math.hypot(r - avg[0], g - avg[1], b - avg[2]);
        a = dist < 28 ? 0 : dist < 60 ? (dist - 28) / 32 : 1;
      }
      d[i * 4 + 3] = Math.round(Math.min(d[i * 4 + 3], a * 255));
    }
    ctx.putImageData(data, 0, 0);
  }

  // 보이는 부분 상자
  let x0 = W;
  let x1 = 0;
  let y0 = H;
  let y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (d[(y * W + x) * 4 + 3] > 128) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 <= x0 || y1 <= y0) throw new Error("정장 부분을 찾지 못했어요. 배경이 단색인 사진을 써 주세요.");

  // 여백 2% 두고 자르기 + 최대 폭 맞추기
  const pad = Math.round((x1 - x0) * 0.02);
  const cx0 = Math.max(0, x0 - pad);
  const cy0 = Math.max(0, y0 - pad);
  const cw = Math.min(W, x1 + pad) - cx0;
  const ch = Math.min(H, y1 + pad) - cy0;
  const s = Math.min(1, MAX_W / cw);
  const out = document.createElement("canvas");
  out.width = Math.round(cw * s);
  out.height = Math.round(ch * s);
  const octx = out.getContext("2d", { willReadFrequently: true })!;
  octx.drawImage(c, cx0, cy0, cw, ch, 0, 0, out.width, out.height);

  // 목 · 어깨 재기
  const od = octx.getImageData(0, 0, out.width, out.height).data;
  const ow = out.width;
  const oh = out.height;
  const solid = (x: number, y: number) => od[(y * ow + x) * 4 + 3] > 128;
  // 어깨 폭: 위쪽 40% 안에서 가장 넓은 줄
  let shoulder = 0;
  for (let y = 0; y < Math.round(oh * 0.4); y++) {
    let l = -1;
    let r = -1;
    for (let x = 0; x < ow; x++)
      if (solid(x, y)) {
        if (l < 0) l = x;
        r = x;
      }
    if (l >= 0) shoulder = Math.max(shoulder, r - l);
  }
  // 목: 가운데 띠(폭 10%)에서 가장 위에 있는 옷 부분
  const mid = Math.round(ow / 2);
  const band = Math.round(ow * 0.05);
  let neckY = 0;
  outer: for (let y = 0; y < oh; y++)
    for (let x = mid - band; x <= mid + band; x++)
      if (solid(x, y)) {
        neckY = y;
        break outer;
      }
  return { canvas: out, neck: [mid, neckY], shoulder: Math.max(shoulder, Math.round(ow * 0.6)) };
}
