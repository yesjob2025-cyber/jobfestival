// 실사 정장 목록 저장소 (서버 전용) — Vercel Blob 의 suits/manifest.json + suits/{id}.png

import { get, put, del } from "@vercel/blob";
import { blobConfigured } from "@/lib/future-card/blob";
import type { SuitItem } from "./suits";

type Stored = Omit<SuitItem, "url"> & { v: string };

const MANIFEST = "suits/manifest.json";

export async function readSuits(): Promise<Stored[]> {
  if (!blobConfigured()) return [];
  try {
    const r = await get(MANIFEST, { access: "private" });
    if (!r || r.statusCode !== 200 || !r.stream) return [];
    return JSON.parse(await new Response(r.stream).text()) as Stored[];
  } catch {
    return [];
  }
}

async function writeSuits(list: Stored[]) {
  await put(MANIFEST, JSON.stringify(list), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}

export async function saveSuit(item: Omit<Stored, "v">, png: Buffer) {
  await put(`suits/${item.id}.png`, png, { access: "private", contentType: "image/png", addRandomSuffix: false, allowOverwrite: true });
  const list = (await readSuits()).filter((s) => s.id !== item.id);
  list.push({ ...item, v: Date.now().toString(36) });
  await writeSuits(list);
}

export async function removeSuit(id: string) {
  await writeSuits((await readSuits()).filter((s) => s.id !== id));
  await del(`suits/${id}.png`).catch(() => {});
}

export const toItem = (s: Stored): SuitItem => ({ id: s.id, name: s.name, gender: s.gender, neck: s.neck, shoulder: s.shoulder, url: `/api/fun/suits/${s.id}?v=${s.v}` });
