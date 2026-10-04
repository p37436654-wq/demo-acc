"use client";

import { useMemo, useState } from "react";
import { Accordion, FilterChips } from "@/components/motion";
import { EmptyState } from "@/components/ui";

export type FaqItem = { id: number; question: string; answer: string; category: string };

export default function FaqExplorer({ items, categories }: { items: FaqItem[]; categories: string[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (q && !`${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, category, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, FaqItem[]>>((acc, item) => {
      acc[item.category] = acc[item.category] ? [...acc[item.category], item] : [item];
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips options={categories} value={category} onChange={setCategory} label="FAQ categories" />
        <div className="flex items-center gap-3 border border-line px-4 py-2.5 lg:w-80 focus-within:border-gold/50 rounded-[3px]">
          <span className="text-gold" aria-hidden>
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search questions…"
            className="w-full bg-transparent text-sm placeholder:text-mute focus:outline-none"
            aria-label="Search FAQs"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No answers found"
          description="Try another category or a shorter search term, or send the question to guest services."
          action={
            <button
              type="button"
              onClick={() => {
                setCategory("All");
                setQuery("");
              }}
              className="mt-2 border border-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-ink rounded-[3px]"
            >
              Reset
            </button>
          }
        />
      ) : (
        <div className="space-y-14">
          {Object.entries(grouped).map(([group, groupItems]) => (
            <section key={group}>
              <p className="eyebrow mb-5 text-gold">
                {group} · {groupItems.length}
              </p>
              <Accordion
                items={groupItems.map((item) => ({ id: item.id, question: item.question, answer: item.answer }))}
              />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
