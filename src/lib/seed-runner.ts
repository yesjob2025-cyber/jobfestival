import "server-only";
import { buildFestivalSeed } from "./seed";
import { clear, count, insertMany, usingSupabase, type Collection } from "./data";

/** 부스 데이터(기업/직무/기관/부대행사/면접슬롯)만 채운다. 참가자·지원 데이터는 보존. */
const BOOTH_COLLECTIONS: Collection[] = [
  "festCompanies",
  "festJobs",
  "festPromos",
  "festEvents",
  "festInterviewSlots",
];

export async function seedBooths(
  force = false
): Promise<{ seeded: boolean; reason?: string; counts?: Record<string, number> }> {
  if (!usingSupabase) return { seeded: false, reason: "json-backend-auto-seeds" };
  if (!force && (await count("festCompanies")) > 0) {
    return { seeded: false, reason: "already-seeded" };
  }

  const d = buildFestivalSeed() as unknown as Record<string, Record<string, unknown>[]>;
  const counts: Record<string, number> = {};
  for (const c of BOOTH_COLLECTIONS) {
    if (force) await clear(c);
    const rows = d[c];
    await insertMany(c, rows);
    counts[c] = rows.length;
  }
  return { seeded: true, counts };
}
