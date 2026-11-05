// ─────────────────────────────────────────────────────────────
// 이력서 사진 — 실사 정장 사진 목록
//
// 운영자 콘솔(/console → 정장 사진)에서 Gemini 로 만들거나 PNG 를 올리면
// 배경을 지우고(초록 배경) 목 위치 · 어깨 폭을 재서 저장소(Vercel Blob)에 저장합니다.
// 화면은 /api/fun/suits 로 목록을 받아 남성 · 여성으로 나눠 보여 줍니다.
// ─────────────────────────────────────────────────────────────

export type Gender = "m" | "f";

export interface SuitItem {
  id: string;
  name: string;
  gender: Gender;
  /** 그림 주소 */
  url: string;
  /** 그림 속 목 가운데 (px) */
  neck: [number, number];
  /** 양 어깨 끝 사이 폭 (px) */
  shoulder: number;
}

const BASE =
  "Professional e-commerce product photo of {garment}, displayed on an invisible ghost mannequin. " +
  "Front view, perfectly symmetric, shoulders level, upper body only from the collar down to the waist, clean tailored fit. " +
  "No person, no head, no neck, no hands, hollow neck opening visible. " +
  "Pure solid chroma-key green background (#00FF00) filling the whole frame, evenly lit studio light, no shadows on the background, no text, no logo.";

/** AI 로 만들 수 있는 정장 (운영자 콘솔) */
export const SUIT_PRESETS: { id: string; name: string; gender: Gender; garment: string }[] = [
  { id: "m-navy-tie", name: "네이비 정장 + 넥타이", gender: "m", garment: "a men's navy two-button business suit jacket with a crisp white dress shirt and a navy silk necktie" },
  { id: "m-charcoal-tie", name: "차콜 정장 + 넥타이", gender: "m", garment: "a men's charcoal gray two-button business suit jacket with a crisp white dress shirt and a burgundy silk necktie" },
  { id: "m-black-notie", name: "블랙 정장 (노타이)", gender: "m", garment: "a men's black two-button business suit jacket over a crisp white dress shirt with the top button open, no tie" },
  { id: "m-shirt-tie", name: "셔츠 + 넥타이", gender: "m", garment: "a men's crisp white long-sleeve dress shirt with a navy silk necktie, no jacket" },
  { id: "f-navy", name: "네이비 정장 + 블라우스", gender: "f", garment: "a women's navy tailored business suit jacket over a white round-neck blouse" },
  { id: "f-black", name: "블랙 정장 + 셔츠", gender: "f", garment: "a women's black tailored business suit jacket over a crisp white collared shirt" },
  { id: "f-beige", name: "베이지 정장", gender: "f", garment: "a women's beige tailored business suit jacket over a white blouse" },
  { id: "f-blouse", name: "화이트 블라우스", gender: "f", garment: "a women's elegant white collared business blouse, no jacket" },
];

export const suitPrompt = (garment: string) => BASE.replace("{garment}", garment);

export const SUIT_ID = /^[a-z0-9-]{2,40}$/;
