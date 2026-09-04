import type { Config } from "tailwindcss";

/** 2026 KMOU 취업박람회 — 포스터 기준 브랜드 토큰 (네이비 · 오션블루 · 옐로) */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B3A79",
          deep: "#062A5C",
          soft: "#14509B",
        },
        ocean: {
          DEFAULT: "#1B6FC4",
          light: "#3E9BE0",
          pale: "#9ED8F5",
          mist: "#DCEEFB",
        },
        sun: {
          DEFAULT: "#FFD200",
          deep: "#F5B800",
        },
        ink: {
          DEFAULT: "#12203A",
          soft: "#3D4C68",
          muted: "#6B7A96",
          line: "#DCE3ED",
          bg: "#F4F8FC",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "'Apple SD Gothic Neo'",
          "'Noto Sans KR'",
          "'Malgun Gothic'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
