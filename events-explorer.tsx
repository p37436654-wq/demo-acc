"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Btn, EmptyState } from "@/components/ui";
import { FilterChips } from "@/components/motion";
import { cn, formatDateLong } from "@/lib/utils";

export type ExplorerEvent = {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  description: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  priceInfo: string;
  registrationUrl: string;
  featured: boolean;
};

export default function EventsExplorer({ events, categories }: { events: ExplorerEvent[]; categories: string[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((event) => (category === "All" ? true : event.category === category))
      .filter((event) => (q ? `${event.title} ${event.description} ${event.location}`.toLowerCase().includes(q) : true))
      .reduce<Record<string, ExplorerEvent[]>>((acc, event) => {
        const key = event.date || "Coming soon";
        acc[key] = acc[key] ? [...acc[key], event] : [event];
        return acc;
      }, {});
  }, [events, category, query]);

  const dates = Object.keys(grouped).sort();

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips options={categories} value={category} onChange={setCategory} label="Event categories" />
        <div className="flex items-center gap-3 border border-line px-4 py-2.5 lg:w-72 focus-within:border-gold/50 rounded-[3px]">
          <span className="text-gold" aria-hidden>
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events…"
            className="w-full bg-transparent text-sm placeholder:text-mute focus:outline-none"
            aria-label="Search events"
          />
        </div>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          title="No events match"
          description="Try a different category or clear your search to see the full demo calendar."
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
        <div className="relative space-y-14">
          <div className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-gold/60 via-line to-transparent md:block" aria-hidden />
          {dates.map((date) => (
            <section key={date} className="relative md:pl-12">
              <div className="sticky top-24 z-10 -ml-12 mb-6 hidden md:block">
                <span className="grid size-[15px] place-items-center rounded-full border border-gold bg-ink" aria-hidden>
                  <span className="size-1.5 rounded-full bg-gold" />
                </span>
              </div>
              <p className="eyebrow mb-5 text-gold">{formatDateLong(date)}</p>
              <div className="grid gap-4 lg:grid-cols-2">
                {grouped[date].map((event, index) => (
                  <article
                    key={event.id}
                    className="group grid gap-0 overflow-hidden border border-line bg-ink-2/40 transition-all duration-700 hover:border-gold/40 sm:grid-cols-[200px_1fr] rounded-[3px]"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.image}
                        alt={event.title}
                        className="img-zoom size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="muted">{event.category}</Badge>
                        {event.featured ? <Badge tone="gold">Featured</Badge> : null}
                      </div>
                      <h3 className="text-lg leading-tight transition-colors group-hover:text-gold">{event.title}</h3>
                      <p className="text-xs text-bone/50">
                        {event.time} · {event.location}
                      </p>
                      <p className="line-clamp-2 text-xs leading-relaxed text-bone/55">{event.description}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <span className={cn("text-[10px] uppercase tracking-[0.2em]", event.priceInfo.toLowerCase().includes("free") ? "text-jade" : "text-gold")}>
                          {event.priceInfo}
                        </span>
                        <Link
                          href={`/events/${event.slug}`}
                          className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-gold-soft"
                        >
                          Details →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-14 border border-line bg-ink-2/40 p-8 text-center rounded-[3px]">
        <p className="eyebrow">Hosting something?</p>
        <h3 className="mt-3 text-2xl">Partner with the mall on your next event</h3>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Btn href="/leasing">Event partnerships</Btn>
          <Btn href="/contact" variant="outline">
            Contact the team
          </Btn>
        </div>
      </div>
    </div>
  );
}
