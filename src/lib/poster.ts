import fs from "node:fs";
import path from "node:path";

/**
 * public/ 에 올려둔 포스터 파일을 찾아 경로와 크기를 돌려준다.
 * 파일이 없으면 null → 코드로 그린 포스터가 대신 표시된다.
 * (정적 생성 시점에 1회 실행되므로 런타임 파일 접근이 없다)
 */
export interface PosterInfo {
  src: string;
  width: number;
  height: number;
}

const CANDIDATES = ["poster.jpg", "poster.jpeg", "poster.png", "poster.webp"];

export function findPoster(): PosterInfo | null {
  for (const file of CANDIDATES) {
    const full = path.join(process.cwd(), "public", file);
    if (!fs.existsSync(full)) continue;
    const size = readSize(fs.readFileSync(full));
    if (size) return { src: `/${file}`, ...size };
  }
  return null;
}

function readSize(buf: Buffer): { width: number; height: number } | null {
  // PNG
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // WebP (VP8X)
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    if (buf.toString("ascii", 12, 16) === "VP8X") {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
    return null;
  }
  // JPEG — SOF 마커에서 크기를 읽는다
  if (buf.length > 4 && buf.readUInt16BE(0) === 0xffd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1;
        continue;
      }
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xc3) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}
