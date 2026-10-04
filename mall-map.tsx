"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Btn, EmptyState } from "@/components/ui";
import { FilterChips } from "@/components/motion";
import { cn, isOpenNow } from "@/lib/utils";

export type MapUnit = {
  id: number;
  name: string;
  slug: string;
  category: string;
  floor: string;
  unit: string;
  openingHours: string;
  kind: "store" | "dining";
};

export type MapAmenity = {
  label: string;
  icon: string;
  kind: string;
  x: number;
  y: number;
};

const FLOORS = [
  { id: "P1", label: "P1 · Parking" },
  { id: "L1", label: "Level 1 · Retail & Luxury" },
  { id: "L2", label: "Level 2 · Lifestyle" },
  { id: "L3", label: "Level 3 · Food Court" },
  { id: "L4", label: "Level 4 · Dining" },
  { id: "L5", label: "Level 5 · Entertainment" },
];

const AMENITIES: Record<string, MapAmenity[]> = {
  P1: [
    { label: "Parking Entrance A", icon: "⇥", kind: "Parking", x: 8, y: 12 },
    { label: "Parking Entrance B", icon: "⇥", kind: "Parking", x: 88, y: 84 },
    { label: "EV Charging", icon: "⚡", kind: "EV", x: 22, y: 78 },
    { label: "Lift Lobby", icon: "⌷", kind: "Elevator", x: 50, y: 8 },
    { label: "Accessible Bays", icon: "♿", kind: "Accessible", x: 78, y: 18 },
    { label: "Payment Kiosk", icon: "₹", kind: "ATM", x: 36, y: 86 },
  ],
  L1: [
    { label: "Information Desk", icon: "ℹ", kind: "Information desk", x: 50, y: 50 },
    { label: "North Entrance", icon: "⇥", kind: "Entrance", x: 50, y: 4 },
    { label: "Grand Portico", icon: "⇥", kind: "Entrance", x: 4, y: 50 },
    { label: "Restrooms", icon: "WC", kind: "Restrooms", x: 92, y: 30 },
    { label: "Elevator Core", icon: "⌷", kind: "Elevator", x: 92, y: 70 },
    { label: "Escalators", icon: "≋", kind: "Escalator", x: 30, y: 92 },
    { label: "ATM", icon: "₹", kind: "ATM", x: 12, y: 88 },
    { label: "Emergency Exit", icon: "⇧", kind: "Emergency exit", x: 70, y: 4 },
  ],
  L2: [
    { label: "Atrium Void", icon: "○", kind: "Atrium", x: 50, y: 50 },
    { label: "Escalators", icon: "≋", kind: "Escalator", x: 30, y: 92 },
    { label: "Restrooms", icon: "WC", kind: "Restrooms", x: 92, y: 30 },
    { label: "Elevator Core", icon: "⌷", kind: "Elevator", x: 92, y: 70 },
    { label: "Baby Care", icon: "🍼", kind: "Baby care", x: 8, y: 12 },
    { label: "Emergency Exit", icon: "⇧", kind: "Emergency exit", x: 70, y: 4 },
  ],
  L3: [
    { label: "Food Court", icon: "✦", kind: "Food court", x: 50, y: 50 },
    { label: "Restrooms", icon: "WC", kind: "Restrooms", x: 92, y: 30 },
    { label: "Elevator Core", icon: "⌷", kind: "Elevator", x: 92, y: 70 },
    { label: "Escalators", icon: "≋", kind: "Escalator", x: 30, y: 92 },
    { label: "Kids Play Area", icon: "◔", kind: "Entertainment", x: 10, y: 14 },
    { label: "Emergency Exit", icon: "⇧", kind: "Emergency exit", x: 70, y: 4 },
  ],
  L4: [
    { label: "Dining Mile", icon: "✦", kind: "Food court", x: 50, y: 50 },
    { label: "Terrace Access", icon: "⇥", kind: "Entrance", x: 4, y: 50 },
    { label: "Restrooms", icon: "WC", kind: "Restrooms", x: 92, y: 30 },
    { label: "Elevator Core", icon: "⌷", kind: "Elevator", x: 92, y: 70 },
    { label: "Escalators", icon: "≋", kind: "Escalator", x: 30, y: 92 },
    { label: "Emergency Exit", icon: "⇧", kind: "Emergency exit", x: 70, y: 4 },
  ],
  L5: [
    { label: "Cinema Foyer", icon: "▶", kind: "Cinema", x: 50, y: 50 },
    { label: "Gaming Zone", icon: "◎", kind: "Entertainment", x: 14, y: 22 },
    { label: "Arcade", icon: "◈", kind: "Entertainment", x: 84, y: 24 },
    { label: "Concessions", icon: "✦", kind: "Food court", x: 76, y: 80 },
    { label: "Elevator Core", icon: "⌷", kind: "Elevator", x: 92, y: 70 },
    { label: "Emergency Exit", icon: "⇧", kind: "Emergency exit", x: 70, y: 4 },
  ],
};

const AMENITY_FILTERS = [
  "Restrooms",
  "ATM",
  "Elevator",
  "Escalator",
  "Information desk",
  "Emergency exit",
  "Food court",
  "Entertainment",
  "Parking",
  "Cinema",
];

/** Deterministic perimeter layout so every unit gets a stable, architectural position. */
function position(index: number, total: number) {
  const t = total === 0 ? 0 : index / total;
  const perimeter = (t * 4) % 4;
  const inset = 12;
  let x = 0;
  let y = 0;
  if (perimeter < 1) {
    x = inset + perimeter * (100 - inset * 2);
    y = inset;
  } else if (perimeter < 2) {
    x = 100 - inset;
    y = inset + (perimeter - 1) * (100 - inset * 2);
  } else if (perimeter < 3) {
    x = 100 - inset - (perimeter - 2) * (100 - inset * 2);
    y = 100 - inset;
  } else {
    x = inset;
    y = 100 - inset - (perimeter - 3) * (100 - inset * 2);
  }
  return { x, y };
}

export default function MallMap({ units }: { units: MapUnit[] }) {
  const [floor, setFloor] = useState("L1");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showAmenities, setShowAmenities] = useState(true);
  const [selected, setSelected] = useState<MapUnit | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(units.map((unit) => unit.category))).sort(),
    [units],
  );

  const floorUnits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return units
      .filter((unit) => (floor === "P1" ? unit.floor.toLowerCase().includes("parking") || unit.kind === "dining" : unit.floor.toLowerCase().includes(floor.toLowerCase())))
      .filter((unit) => (category === "All" ? true : unit.category === category))
      .filter((unit) => (q ? `${unit.name} ${unit.category} ${unit.unit}`.toLowerCase().includes(q) : true));
  }, [units, floor, category, query]);

  const amenities = AMENITIES[floor] ?? [];
  const visibleAmenities = query
    ? amenities.filter((amenity) => amenity.label.toLowerCase().includes(query.toLowerCase()) || amenity.kind.toLowerCase().includes(query.toLowerCase()))
    : amenities;

  return (
    <div className="relative">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Control panel */}
        <aside className="space-y-5">
          <div className="border border-line bg-ink-2/50 p-5 rounded-[3px]">
            <p className="eyebrow mb-3">Search location</p>
            <div className="flex items-center gap-3 border border-line px-3 py-2.5 focus-within:border-gold/50 rounded-[3px]">
              <span className="text-gold" aria-hidden>
                ⌕
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Store, amenity, unit…"
                className="w-full bg-transparent text-sm placeholder:text-mute focus:outline-none"
                aria-label="Search the map"
              />
            </div>
          </div>

          <div className="border border-line bg-ink-2/50 p-5 rounded-[3px]">
            <p className="eyebrow mb-3">Floor selector</p>
            <div className="grid gap-1">
              {FLOORS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setFloor(option.id);
                    setSelected(null);
                  }}
                  aria-pressed={floor === option.id}
                  className={cn(
                    "flex items-center justify-between border px-3 py-2.5 text-[11px] uppercase tracking-[0.16em] transition-all duration-500 rounded-[3px]",
                    floor === option.id
                      ? "border-gold bg-gold text-ink"
                      : "border-line text-bone/60 hover:border-bone/40 hover:text-bone",
                  )}
                >
                  {option.label}
                  <span className="text-[9px] opacity-70">{option.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border border-line bg-ink-2/50 p-5 rounded-[3px]">
            <p className="eyebrow mb-3">Category filter</p>
            <FilterChips options={categories} value={category} onChange={setCategory} label="Map categories" />
            <button
              type="button"
              onClick={() => setShowAmenities((value) => !value)}
              aria-pressed={showAmenities}
              className={cn(
                "mt-4 w-full border px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors rounded-[3px]",
                showAmenities ? "border-gold text-gold" : "border-line text-mute hover:text-bone",
              )}
            >
              {showAmenities ? "Amenities visible" : "Amenities hidden"}
            </button>
          </div>

          <div className="border border-line bg-ink-2/50 p-5 text-[10px] uppercase tracking-[0.18em] text-mute rounded-[3px]">
            <p className="mb-2 text-gold">Legend</p>
            <ul className="space-y-1.5">
              <li>▢ Retail / dining unit</li>
              <li>◉ Amenity marker</li>
              <li>○ Atrium &amp; circulation</li>
            </ul>
            <p className="mt-4 normal-case tracking-normal text-bone/40">
              DEMO MAP — SAMPLE DATA. Layout, unit numbers and routes are fictional.
            </p>
          </div>
        </aside>

        {/* Canvas */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-[linear-gradient(0deg,rgba(200,169,106,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(200,169,106,0.05)_1px,transparent_1px)] bg-[size:40px_40px] rounded-[3px]">
            <div className="absolute inset-[8%] rounded-[50%] border border-gold/20" aria-hidden />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="font-display text-lg text-gold/50">{FLOORS.find((f) => f.id === floor)?.label}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-mute">Demo plan</p>
            </div>

            {floorUnits.map((unit, index) => {
              const point = position(index, floorUnits.length);
              const active = selected?.id === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelected(unit)}
                  aria-label={`${unit.name}, ${unit.floor}, unit ${unit.unit}`}
                  className={cn(
                    "group absolute -translate-x-1/2 -translate-y-1/2 animate-rise border px-2 py-1 text-[9px] uppercase tracking-[0.12em] transition-all duration-500 hover:z-20 hover:scale-110",
                    active
                      ? "z-20 border-gold bg-gold text-ink"
                      : unit.kind === "dining"
                        ? "border-jade/50 bg-ink-3/90 text-bone/80 hover:border-jade"
                        : "border-line bg-ink-3/90 text-bone/70 hover:border-gold",
                  )}
                  style={{ left: `${point.x}%`, top: `${point.y}%`, animationDelay: `${index * 24}ms` }}
                >
                  {unit.unit}
                  <span className="ml-1 hidden opacity-60 sm:inline">{unit.name.split(" ")[0]}</span>
                </button>
              );
            })}

            {showAmenities
              ? visibleAmenities.map((amenity, index) => (
                  <span
                    key={amenity.label}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 animate-rise"
                    style={{ left: `${amenity.x}%`, top: `${amenity.y}%`, animationDelay: `${index * 40}ms` }}
                  >
                    <span className="grid size-7 place-items-center rounded-full border border-gold/40 bg-ink text-[10px] text-gold shadow-[0_0_0_4px_rgba(200,169,106,0.08)]">
                      {amenity.icon}
                    </span>
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap border border-line bg-ink px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-bone/80 opacity-0 transition-opacity group-hover:opacity-100">
                      {amenity.label}
                    </span>
                  </span>
                ))
              : null}

            {floorUnits.length === 0 ? (
              <div className="absolute inset-0 grid place-items-center p-6">
                <EmptyState title="Nothing on this floor" description="Try another level or clear the filters." />
              </div>
            ) : null}
          </div>

          {/* Floating detail panel */}
          <div
            className={cn(
              "pointer-events-none absolute inset-x-3 bottom-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:inset-x-auto md:right-4 md:w-80",
              selected ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
            aria-live="polite"
          >
            {selected ? (
              <div className="pointer-events-auto border border-gold/30 bg-ink-2/95 p-5 backdrop-blur-xl rounded-[3px]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone="gold">{selected.category}</Badge>
                    <h3 className="mt-3 text-xl leading-tight">{selected.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-mute">
                      {selected.floor} · Unit {selected.unit}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-[10px] uppercase tracking-[0.2em] text-mute hover:text-gold"
                    aria-label="Close location details"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-4 text-xs text-bone/60">
                  Opening hours · {selected.openingHours}
                </p>
                <p className="mt-1 text-xs text-bone/60">
                  Status · {isOpenNow(selected.openingHours) ? "Open now" : "Closed"}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Btn href={selected.kind === "dining" ? `/dining/${selected.slug}` : `/stores/${selected.slug}`} size="sm">
                    View store
                  </Btn>
                  <Btn href="/location" variant="outline" size="sm">
                    Get directions
                  </Btn>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleAmenities.map((amenity) => (
          <div key={amenity.label} className="flex items-center gap-3 border border-line px-4 py-3 text-xs text-bone/70 rounded-[3px]">
            <span className="text-gold" aria-hidden>
              {amenity.icon}
            </span>
            <span>{amenity.label}</span>
            <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-mute">{amenity.kind}</span>
          </div>
        ))}
        <Link
          href="/plan-your-visit"
          className="flex items-center justify-between gap-3 border border-gold/40 px-4 py-3 text-xs text-gold transition-colors hover:bg-gold hover:text-ink rounded-[3px]"
        >
          Plan your route
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
