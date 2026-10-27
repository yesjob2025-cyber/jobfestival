// 미래 명함 QR 받기 — 서버 쪽 Vercel Blob 공통 (API 라우트에서만 사용)

const ID = /^[a-z0-9]{20}$/;

/** 저장소 연결 여부 — 토큰 방식(BLOB_READ_WRITE_TOKEN) 또는 OIDC 방식(BLOB_STORE_ID) */
export const blobConfigured = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const newCardId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 20);
export const isCardId = (id: string) => ID.test(id);
export const cardPath = (id: string) => `cards/${id}.jpg`;
