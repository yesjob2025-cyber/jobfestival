import type { Config } from "tailwindcss";

/**
 * 2026 김해 JOB FESTIVAL 브랜드 토큰
 *  네이비 베이스 + 블루 포인트 + 라임 액센트
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fest: {
          navy: "#0A1B3D",
          navy2: "#122A5C",
          blue: "#1D6FF2",
          blue2: "#4A93FF",
          sky: "#E8F1FF",
          coral: "#FF6B4A",
          lime: "#B7F04A",
          violet: "#7C5CFF",
          emerald: "#12B886",
          amber: "#FFB020",
          ink: "#101828",
          muted: "#667085",
          line: "#E4E7EC",
          bg: "#F6F8FC",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "'Helvetica Neue'",
          "'Segoe UI'",
          "'Apple SD Gothic Neo'",
          "'Noto Sans KR'",
          "'Malgun Gothic'",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
