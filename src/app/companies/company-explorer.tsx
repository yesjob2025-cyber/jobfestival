"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORY_ORDER, type ExpoCompany } from "@/lib/expo";

export function CompanyExplorer({ companies }: { companies: ExpoCompany[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("전체");

  const categories = useMemo(() => {
    const used = new Set(companies.map((c) => c.category));
    return ["전체", ...CATEGORY_ORDER.filter((c) => used.has(c))];
  }, [companies]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return companies.filter((c) => {
      if (category !== "전체" && c.category !== category) return false;
      if (!keyword) return true;
      return `${c.name} ${c.category} ${c.industry} ${c.boothNo}`.toLowerCase().includes(keyword);
    });
  }, [companies, q, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                category === c
                  ? "bg-navy text-white"
                  : "border border-ink-line bg-white text-ink hover:border-ocean/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="field sm:max-w-xs"
          placeholder="기업명 · 업종 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="기업 검색"
        />
      </div>

      <p className="mt-6 text-sm font-bold text-ink-muted">
        총 <span className="text-ocean">{filtered.length}</span>개사
      </p>

      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <li key={c.id}>
            <Link href={`/companies/${c.id}`} className="card-link flex h-full flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-black text-sun">
                  {c.boothNo.split(",")[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold leading-snug text-navy">{c.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">부스 {c.boothNo}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{c.industry}</p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-line pt-3">
                <span className="chip-ocean">{c.category}</span>
                <span className="text-xs font-bold text-ocean">상세보기 →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="card mt-4 px-6 py-16 text-center text-sm text-ink-muted">
          조건에 맞는 기업이 없습니다. 검색어나 분류를 바꿔보세요.
        </p>
      )}
    </div>
  );
}
