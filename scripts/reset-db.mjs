// 로컬 JSON 스토어 초기화 — 다음 실행 시 시드 데이터가 다시 생성됩니다.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), ".data");
if (fs.existsSync(dir)) {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("✔ .data 삭제 완료 — 다음 실행 시 시드가 재생성됩니다.");
} else {
  console.log("· .data 가 없습니다. 이미 초기 상태입니다.");
}
