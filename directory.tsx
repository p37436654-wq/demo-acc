"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, EmptyState, StatusDot } from "@/components/ui";
import { FilterChips } from "@/components/motion";
import { cn, isOpenNow } from "@/lib/utils";

export type DirectoryStore = {
  id: number;
  slug: string;
  name: string;
  category: string;
  floor: string;
  unit: string;
  coverImage: string;
  openingHours: string;
  tagline: string;
  featured: boolean;
  isNew: boolean;
  storeType: string;
};

export type DirectoryDining = {
  id: number;
  slug: string;
  name: string;
  type: string;
  cuisine: string;
  floor: string;
  coverImage: string;
  openingHours: string;
  priceLevel: string;
  tagline: string;
  featured: boolean;
};

type Props =
  | { variant: "stores"; items: DirectoryStore[]; categories: string[]; floors: string[] }
  | { variant: "dining"; items: DirectoryDining[]; categories: string[]; floors: string[] };

export default function Directory(props: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [floor, setFloor] = useState("All");
  const [letter, setLetter] = useState("All");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);

  const letters = useMemo(
    () => Array.from(new Set(props.items.map((item) => item.name[0]?.toUpperCase() ?? ""))).sort(),
    [props.items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return props.items.filter((item) => {
      if (q && !`${item.name} ${"category" in item ? item.category : item.cuisine} ${item.floor}`.toLowerCase().includes(q))
        return false;
      if (category !== "All") {
        const value = "category" in item ? item.category : item.type;
        if (value !== category) return false;
      }
      if (floor !== "All" && item.floor !== floor) return false;
      if (letter !== "All" && item.name[0]?.toUpperCase() !== letter) return false;
      if (onlyFeatured && !item.featured) return false;
      if (onlyOpen && !isOpenNow(item.openingHours)) return false;
      if (onlyNew && !("isNew" in item && item.isNew)) return false;
      return true;
    });
  }, [props.items, query, category, floor, letter, onlyFeatured, onlyNew, onlyOpen]);

  const reset =
    () => {
      setQuery("");
      setCategory("All");
      setFloor("All");
      setLetter("All");
      setOnlyFeatured(false);
      setOnlyNew(false);
      setOnlyOpen(false);
    };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 mb-10 border-y border-line bg-ink/95 px-5 py-4 backdrop-blur-xl md:top-20 md:-mx-10 md:px-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-1 items-center gap-3 border border-line px-4 py-2.5 focus-within:border-gold/50 rounded-[3px]">
              <span className="text-gold" aria-hidden>
                ⌕
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={props.variant === "stores" ? "Search stores, brands, units…" : "Search restaurants, cuisines…"}
                className="w-full bg-transparent text-sm placeholder:text-mute focus:outline-none"
                aria-label="Search directory"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="text-[10px] uppercase tracking-[0.2em] text-mute hover:text-gold">
                  Clear
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Toggle active={onlyFeatured} onClick={() => setOnlyFeatured((v) => !v)} label="Featured" />
              {props.variant === "stores" ? (
                <Toggle active={onlyNew} onClick={() => setOnlyNew((v) => !v)} label="New" />
              ) : null}
              <Toggle active={onlyOpen} onClick={() => setOnlyOpen((v) => !v)} label="Open now" />
            </div>
          </div>

          <FilterChips options={props.categories} value={category} onChange={setCategory} label="Category filter" />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <FilterChips options={props.floors} value={floor} onChange={setFloor} label="Floor filter" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-mute">
              {filtered.length} of {props.items.length} listed
            </p>
          </div>
        </div>
      </div>

      <div className="scroll-x mb-8 flex items-center gap-1 overflow-x-auto">
        {["All", ...letters].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLetter(item)}
            aria-pressed={letter === item}
            className={cn(
              "size-8 shrink-0 border text-[11px] transition-colors rounded-[2px]",
              letter === item
                ? "border-gold bg-gold text-ink"
                : "border-line text-bone/50 hover:border-bone/40 hover:text-bone",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matches found"
          description="Try a different category, floor or clear the filters to see the full directory."
          action={
            <button
              type="button"
              onClick={reset}
              className="mt-2 border border-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-ink rounded-[3px]"
            >
              Reset filters
            </button>
          }
        />
      ) : props.variant === "stores" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(filtered as DirectoryStore[]).map((store, index) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="group flex flex-col border border-line bg-ink-2/40 transition-all duration-700 hover:-translate-y-1 hover:border-gold/40 rounded-[3px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.coverImage}
                  alt={store.name}
                  className="img-zoom size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute left-2 top-2 flex gap-1.5">
                  {store.featured ? <Badge tone="gold">Featured</Badge> : null}
                  {store.isNew ? <Badge tone="new">New</Badge> : null}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="eyebrow">{store.category}</p>
                <h3 className="text-base leading-tight transition-colors group-hover:text-gold">{store.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
                  {store.floor} · {store.unit}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <StatusDot open={isOpenNow(store.openingHours)} />
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gold opacity-0 transition-opacity group-hover:opacity-100">
                    View store →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filtered as DirectoryDining[]).map((item, index) => (
            <Link
              key={item.id}
              href={`/dining/${item.slug}`}
              className="group flex flex-col border border-line bg-ink-2/40 transition-all duration-700 hover:-translate-y-1 hover:border-gold/40 rounded-[3px]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.coverImage}
                  alt={item.name}
                  className="img-zoom size-full object-cover"
                  loading="lazy"
                />
                <span className="absolute right-2 top-2 border border-gold/40 bg-ink/70 px-2 py-1 text-[10px] text-gold">
                  {item.priceLevel}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="eyebrow">{item.type}</p>
                <h3 className="text-base leading-tight transition-colors group-hover:text-gold">{item.name}</h3>
                <p className="text-xs text-bone/55">{item.cuisine}</p>
                <p className="mt-auto pt-3 text-[10px] uppercase tracking-[0.18em] text-mute">
                  {item.floor} · {item.openingHours}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-3.5 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 rounded-[3px]",
        active ? "border-gold bg-gold text-ink" : "border-line text-bone/60 hover:border-bone/40 hover:text-bone",
      )}
    >
      {label}
    </button>
  );
}
