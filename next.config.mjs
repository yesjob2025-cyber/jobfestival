/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // KMOU 취업박람회 페이지가 /kmou 아래로 옮겨졌습니다 (첫 화면은 잡페스티벌 서비스 안내)
  async redirects() {
    return [
      { source: "/companies", destination: "/kmou/companies", permanent: true },
      { source: "/companies/:id", destination: "/kmou/companies/:id", permanent: true },
      { source: "/program", destination: "/kmou/program", permanent: true },
      { source: "/future-card", destination: "/kmou/future-card", permanent: true },
      { source: "/host", destination: "/login", permanent: false },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
