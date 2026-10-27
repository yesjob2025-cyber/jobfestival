// MediaPipe(배경 제거 · 얼굴 위치) 실행 파일을 public/mediapipe 로 복사합니다.
// 용량이 커서(약 23MB) 저장소에 넣지 않고 dev · build 때마다 node_modules 에서 가져옵니다.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const dest = join(root, "public/mediapipe");

mkdirSync(dest, { recursive: true });
for (const name of [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
]) {
  copyFileSync(join(src, name), join(dest, name));
}
console.log("mediapipe wasm → public/mediapipe");
