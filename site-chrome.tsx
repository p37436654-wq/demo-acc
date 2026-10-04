"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Spinner } from "@/components/motion";

export const PRIMARY_NAV = [
  { href: "/stores", label: "Stores" },
  { href: "/dining", label: "Dining" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/offers", label: "Offers" },
  { href: "/events", label: "Events" },
  { href: "/whats-on", label: "What's On" },
  { href: "/plan-your-visit", label: "Plan Your Visit" },
  { href: "/location", label: "Location" },
];

export const SECONDARY_NAV = [
  { href: "/map", label: "Mall Map" },
  { href: "/cinema", label: "Cinema" },
  { href: "/parking", label: "Parking" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/sustainability", label: "Sustainability" },
  { href: "/careers", label: "Careers" },
  { href: "/leasing", label: "Leasing" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const POPULAR = ["Stores", "Food court", "Cinema showtimes", "Parking rates", "Events today", "Wheelchair"];

type Hit = { type: string; title: string; subtitle: string; href: string; image: string; category: string };

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="NOVA GRAND MALL home">
      <span className="grid size-9 place-items-center border border-gold/50 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
        <span className="font-display text-lg leading-none">N</span>
      </span>
      <span className="leading-none">
        <span className="block font-display text-[15px] tracking-[0.16em] text-bone">NOVA GRAND</span>
        <span className="mt-1 block text-[9px] tracking-[0.42em] text-mute">MALL · DEMO</span>
      </span>
      {!compact ? null : null}
    </Link>
  );
}

export function SiteHeader({
  announcement,
}: {
  announcement?: { title: string; message: string; linkLabel: string; linkUrl: string } | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ["INPUT", "TEXTAREA"].includes(target.tagName);
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {announcement ? (
        <div className="relative z-[60] border-b border-gold/20 bg-gold/10 text-gold">
          <div className="shell flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-[10px] uppercase tracking-[0.2em]">
            <span className="font-medium">{announcement.title}</span>
            <span className="hidden text-gold/60 sm:inline">{announcement.message}</span>
            {announcement.linkUrl ? (
              <Link href={announcement.linkUrl} className="underline decoration-gold/40 underline-offset-4 hover:text-gold-soft">
                {announcement.linkLabel || "Learn more"}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
          <Wordmark />

          <nav className="hidden items-center gap-6 xl:flex" aria-label="Primary">
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className={cn(
                    "link-underline text-[11px] uppercase tracking-[0.18em] transition-colors",
                    active ? "text-gold" : "text-bone/70 hover:text-bone",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 border border-line px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:border-gold/50 hover:text-gold rounded-[3px]"
              aria-label="Open search"
            >
              <span aria-hidden>⌕</span>
              <span className="hidden sm:inline">Search</span>
            </button>
            <Link
              href="/plan-your-visit"
              className="hidden bg-gold px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-soft rounded-[3px] lg:inline-block"
            >
              Plan your visit
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 border border-line px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-bone/70 transition-colors hover:border-gold/50 hover:text-gold rounded-[3px] xl:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile / tablet navigation */}
      <div
        className={cn(
          "fixed inset-0 z-[70] flex flex-col bg-ink transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] xl:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
      >
        <div className="shell flex h-16 items-center justify-between border-b border-line md:h-20">
          <Wordmark />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="text-[10px] uppercase tracking-[0.2em] text-mute hover:text-gold"
          >
            Close
          </button>
        </div>
        <div className="shell flex-1 overflow-y-auto py-8">
          <nav aria-label="Mobile" className="grid gap-1">
            {PRIMARY_NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-baseline justify-between border-b border-line py-4 font-display text-2xl transition-colors hover:text-gold"
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                {item.label}
                <span className="text-[10px] tracking-[0.2em] text-mute">0{index + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] uppercase tracking-[0.18em] text-bone/60 hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/plan-your-visit" className="bg-gold px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-ink">
              Plan your visit
            </Link>
            <Link href="/map" className="border border-line px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-bone">
              Mall map
            </Link>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { hits: Hit[] };
        setHits(data.hits ?? []);
      } catch (fetchError) {
        if ((fetchError as Error).name !== "AbortError") setError("Search is unavailable right now.");
      } finally {
        setLoading(false);
      }
    }, 260);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const submit = useCallback(
    (value: string) => {
      const term = value.trim();
      if (!term) return;
      setRecent((current) => [term, ...current.filter((item) => item !== term)].slice(0, 5));
      setQuery(term);
    },
    [],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex flex-col bg-ink/97 backdrop-blur-xl animate-rise" role="dialog" aria-modal="true" aria-label="Search the mall">
      <div className="shell flex h-16 items-center justify-between border-b border-line md:h-20">
        <span className="eyebrow">Search the mall</span>
        <button type="button" onClick={onClose} className="text-[10px] uppercase tracking-[0.2em] text-mute hover:text-gold">
          Close
        </button>
      </div>
      <div className="shell flex-1 overflow-y-auto py-8 md:py-12">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(query);
          }}
          className="flex items-center gap-4 border-b border-line pb-5"
        >
          <span className="font-display text-2xl text-gold" aria-hidden>
            ⌕
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stores, dining, offers, events, cinema…"
            className="w-full bg-transparent font-display text-2xl text-bone placeholder:text-mute/60 focus:outline-none md:text-4xl"
            aria-label="Search query"
          />
          {loading ? <Spinner className="text-gold" /> : null}
        </form>

        {query.trim().length < 2 ? (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <p className="eyebrow mb-4">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => submit(term)}
                    className="border border-line px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] text-bone/70 hover:border-gold/50 hover:text-gold rounded-[2px]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-4">Recent searches</p>
              {recent.length === 0 ? (
                <p className="text-sm text-mute">Your recent searches appear here during this visit.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => submit(term)}
                        className="text-sm text-bone/70 hover:text-gold"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : loading && hits.length === 0 ? (
          <div className="mt-10 space-y-3">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="skeleton h-16 w-full rounded-sm" />
            ))}
          </div>
        ) : error ? (
          <p className="mt-10 text-sm text-clay">{error}</p>
        ) : hits.length === 0 ? (
          <div className="mt-14 max-w-lg">
            <Badge tone="muted">No results</Badge>
            <h3 className="mt-5 text-2xl md:text-3xl">Nothing matches “{query}”</h3>
            <p className="mt-3 text-sm text-bone/60">
              Try a brand, a cuisine, a floor or a category — for example “jewellery”, “coffee”, “Level 4” or “kids”.
            </p>
          </div>
        ) : (
          <>
            <p className="eyebrow mt-10 mb-4">
              {hits.length} result{hits.length === 1 ? "" : "s"}
            </p>
            <ul className="grid gap-2">
              {hits.map((hit, index) => (
                <li key={`${hit.href}-${index}`}>
                  <Link
                    href={hit.href}
                    onClick={() => {
                      setRecent((current) => [query.trim(), ...current.filter((item) => item !== query.trim())].slice(0, 5));
                      onClose();
                    }}
                    className="group flex items-center gap-4 border border-line px-4 py-3 transition-colors hover:border-gold/40 hover:bg-ink-2"
                  >
                    {hit.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hit.image} alt="" className="size-12 shrink-0 object-cover" loading="lazy" />
                    ) : (
                      <span className="grid size-12 shrink-0 place-items-center border border-line text-gold" aria-hidden>
                        ✦
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-bone group-hover:text-gold">{hit.title}</span>
                      <span className="block truncate text-xs text-mute">{hit.subtitle}</span>
                    </span>
                    <Badge tone="muted" className="hidden sm:inline-flex">
                      {hit.type}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export function IntroSequence() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 620),
      setTimeout(() => setPhase(2), 1180),
      setTimeout(() => setDone(true), 2050),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-ink transition-opacity duration-700"
      style={{ opacity: phase === 2 ? 0 : 1, pointerEvents: phase === 2 ? "none" : "auto" }}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <span className="grid size-16 place-items-center border border-gold/40 text-gold">
          <span className="font-display text-3xl">N</span>
        </span>
        <span
          className="font-display text-2xl tracking-[0.3em] text-bone transition-all duration-700 md:text-3xl"
          style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(10px)" }}
        >
          NOVA GRAND MALL
        </span>
        <span
          className="text-[9px] tracking-[0.42em] text-gold transition-opacity duration-700"
          style={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          SHOP. DINE. PLAY. EXPERIENCE.
        </span>
        <button
          type="button"
          onClick={() => setDone(true)}
          className="mt-4 text-[9px] uppercase tracking-[0.3em] text-mute hover:text-bone"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
