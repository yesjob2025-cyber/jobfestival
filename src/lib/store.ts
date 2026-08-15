import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { FestivalDatabase } from "./types";
import { buildFestivalSeed } from "./seed";

// ─────────────────────────────────────────────────────────────
// 개발/데모용 JSON 파일 스토어.
// 외부 서비스 없이 즉시 구동됩니다. 운영에서는 Supabase 로 전환하세요.
//
// 서버리스(Vercel 등)는 작업 디렉터리가 읽기전용이므로 os.tmpdir() 사용.
// tmp 는 인스턴스 수명 동안만 유지되는 휘발성 저장소라 데모용으로만 적합합니다.
// ─────────────────────────────────────────────────────────────

const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), "jobfestival-data")
  : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

type Cache = { db: FestivalDatabase | null };
const g = globalThis as unknown as { __festStore?: Cache };
if (!g.__festStore) g.__festStore = { db: null };
const cache = g.__festStore;

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // 읽기전용 FS — 메모리 캐시로만 동작
  }
}

/** 신규 컬렉션이 추가돼도 기존 db.json 이 깨지지 않도록 보정 */
function normalize(db: Partial<FestivalDatabase>): FestivalDatabase {
  const empty = buildFestivalSeed();
  for (const key of Object.keys(empty) as (keyof FestivalDatabase)[]) {
    if (!Array.isArray(db[key])) {
      (db as Record<string, unknown>)[key] = empty[key];
    }
  }
  return db as FestivalDatabase;
}

function load(): FestivalDatabase {
  if (cache.db) return cache.db;
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      cache.db = normalize(JSON.parse(fs.readFileSync(DB_FILE, "utf8")));
      return cache.db;
    } catch {
      // 손상 시 재시드
    }
  }
  cache.db = buildFestivalSeed();
  persist();
  return cache.db;
}

export function persist() {
  if (!cache.db) return;
  ensureDir();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(cache.db, null, 2), "utf8");
  } catch {
    // 읽기전용 FS(서버리스) — 저장 실패해도 메모리 캐시로 계속 동작
  }
}

/** 현재 DB(가변 객체) 반환 */
export function db(): FestivalDatabase {
  return load();
}

/** 강제 재시드 (스크립트/관리용) */
export function reseed(): FestivalDatabase {
  cache.db = buildFestivalSeed();
  persist();
  return cache.db;
}
