"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminHeading, MediaPicker } from "@/components/admin/admin-ui";
import { Spinner, useToast } from "@/components/motion";
import type { Banner, HomepageSettings, Stat } from "@/lib/queries";

type Option = { slug: string; name: string };

export default function HomepageEditor({ initial }: { initial: HomepageSettings }) {
  const { push } = useToast();
  const [value, setValue] = useState<HomepageSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<{ stores: Option[]; offers: Option[]; events: Option[]; dining: Option[] }>({
    stores: [],
    offers: [],
    events: [],
    dining: [],
  });
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stores, offers, events, dining] = await Promise.all([
          fetch("/api/admin/stores?status=published").then((r) => r.json()),
          fetch("/api/admin/offers?status=published").then((r) => r.json()),
          fetch("/api/admin/events?status=published").then((r) => r.json()),
          fetch("/api/admin/dining?status=published").then((r) => r.json()),
        ]);
        setOptions({
          stores: (stores.records ?? []).map((row: Record<string, unknown>) => ({ slug: String(row.slug), name: String(row.name) })),
          offers: (offers.records ?? []).map((row: Record<string, unknown>) => ({ slug: String(row.slug), name: String(row.title) })),
          events: (events.records ?? []).map((row: Record<string, unknown>) => ({ slug: String(row.slug), name: String(row.title) })),
          dining: (dining.records ?? []).map((row: Record<string, unknown>) => ({ slug: String(row.slug), name: String(row.name) })),
        });
      } catch {
        push("Could not load published content lists.", "error");
      } finally {
        setLoadingLists(false);
      }
    };
    void load();
  }, [push]);

  const set = <K extends keyof HomepageSettings>(key: K, next: HomepageSettings[K]) =>
    setValue((current) => ({ ...current, [key]: next }));

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "homepage", value }),
      });
      if (!response.ok) {
        push("Could not publish homepage changes.", "error");
        return;
      }
      push("Homepage published — the public site is updated", "success");
    } catch {
      push("Network error while publishing.", "error");
    } finally {
      setSaving(false);
    }
  };

  const text = (label: string, key: keyof HomepageSettings, full = false) => (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="eyebrow mb-2 block">{label}</label>
      <input
        value={String(value[key] ?? "")}
        onChange={(event) => set(key, event.target.value as never)}
        className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
      />
    </div>
  );

  const picker = (label: string, key: "heroImage") => (
    <div className="md:col-span-2">
      <MediaPicker
        label={label}
        value={value[key]}
        onChange={(next) => set(key, next)}
      />
    </div>
  );

  const toggleSlug = (key: "featuredStoreSlugs" | "featuredOfferSlugs" | "featuredEventSlugs" | "featuredDiningSlugs", slug: string) => {
    const current = value[key];
    set(key, current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
  };

  const multi = (
    label: string,
    key: "featuredStoreSlugs" | "featuredOfferSlugs" | "featuredEventSlugs" | "featuredDiningSlugs",
    list: Option[],
  ) => (
    <div className="md:col-span-2 border border-line bg-ink-2/40 p-4 rounded-[3px]">
      <p className="eyebrow mb-3">{label}</p>
      {loadingLists ? (
        <Spinner className="text-gold" />
      ) : list.length === 0 ? (
        <p className="text-[11px] text-mute">No published records yet.</p>
      ) : (
        <div className="grid max-h-52 gap-1.5 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {list.map((option) => (
            <label key={option.slug} className="flex items-center gap-2 text-[11px] text-bone/70">
              <input
                type="checkbox"
                checked={value[key].includes(option.slug)}
                onChange={() => toggleSlug(key, option.slug)}
                className="size-3.5 accent-[#c8a96a]"
              />
              {option.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <AdminHeading
        title="Homepage builder"
        blurb="Control the hero, statistics, featured content, campaign banners and announcement. Publishing here updates the public homepage immediately."
        actions={
          <>
            <AdminButton href="/">View homepage</AdminButton>
            <AdminButton variant="primary" onClick={() => void save()} disabled={saving}>
              {saving ? <Spinner /> : null} Publish changes
            </AdminButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <p className="eyebrow mb-5">Hero</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {picker("Hero image", "heroImage")}
            {text("Hero video URL (optional)", "heroVideo", true)}
            {text("Eyebrow", "eyebrow")}
            {text("Hero title", "heroTitle")}
            {text("Tagline", "heroTagline", true)}
            {text("Description", "heroDescription", true)}
            {text("Primary CTA label", "ctaPrimaryLabel")}
            {text("Primary CTA link", "ctaPrimaryHref")}
            {text("Secondary CTA label", "ctaSecondaryLabel")}
            {text("Secondary CTA link", "ctaSecondaryHref")}
          </div>
        </section>

        <section className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <div className="mb-5 flex items-center justify-between">
            <p className="eyebrow">Statistics</p>
            <AdminButton
              onClick={() =>
                set("stats", [...value.stats, { value: "100", suffix: "+", label: "New statistic" } satisfies Stat])
              }
            >
              Add statistic
            </AdminButton>
          </div>
          <div className="space-y-3">
            {value.stats.map((stat, index) => (
              <div key={index} className="grid grid-cols-[1fr_70px_1fr_auto] gap-2">
                <input
                  value={stat.value}
                  onChange={(event) => {
                    const next = [...value.stats];
                    next[index] = { ...stat, value: event.target.value };
                    set("stats", next);
                  }}
                  className="border border-line bg-ink px-3 py-2 text-xs rounded-[3px]"
                  aria-label="Value"
                />
                <input
                  value={stat.suffix}
                  onChange={(event) => {
                    const next = [...value.stats];
                    next[index] = { ...stat, suffix: event.target.value };
                    set("stats", next);
                  }}
                  className="border border-line bg-ink px-3 py-2 text-xs rounded-[3px]"
                  aria-label="Suffix"
                />
                <input
                  value={stat.label}
                  onChange={(event) => {
                    const next = [...value.stats];
                    next[index] = { ...stat, label: event.target.value };
                    set("stats", next);
                  }}
                  className="border border-line bg-ink px-3 py-2 text-xs rounded-[3px]"
                  aria-label="Label"
                />
                <AdminButton variant="ghost" onClick={() => set("stats", value.stats.filter((_, i) => i !== index))}>
                  ✕
                </AdminButton>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-mute">
            Demo figures — keep them clearly fictional
          </p>
        </section>

        <section className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <div className="mb-5 flex items-center justify-between">
            <p className="eyebrow">Campaign banners</p>
            <AdminButton
              onClick={() =>
                set("campaignBanners", [
                  ...value.campaignBanners,
                  { title: "New campaign", subtitle: "Season", image: "", href: "/whats-on" } satisfies Banner,
                ])
              }
            >
              Add banner
            </AdminButton>
          </div>
          <div className="space-y-5">
            {value.campaignBanners.map((banner, index) => (
              <div key={index} className="border border-line bg-ink p-4 rounded-[3px]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={banner.title}
                    onChange={(event) => {
                      const next = [...value.campaignBanners];
                      next[index] = { ...banner, title: event.target.value };
                      set("campaignBanners", next);
                    }}
                    placeholder="Title"
                    className="border border-line bg-ink-2/60 px-3 py-2 text-xs rounded-[3px]"
                    aria-label="Banner title"
                  />
                  <input
                    value={banner.subtitle}
                    onChange={(event) => {
                      const next = [...value.campaignBanners];
                      next[index] = { ...banner, subtitle: event.target.value };
                      set("campaignBanners", next);
                    }}
                    placeholder="Subtitle"
                    className="border border-line bg-ink-2/60 px-3 py-2 text-xs rounded-[3px]"
                    aria-label="Banner subtitle"
                  />
                  <input
                    value={banner.href}
                    onChange={(event) => {
                      const next = [...value.campaignBanners];
                      next[index] = { ...banner, href: event.target.value };
                      set("campaignBanners", next);
                    }}
                    placeholder="Link"
                    className="border border-line bg-ink-2/60 px-3 py-2 text-xs rounded-[3px]"
                    aria-label="Banner link"
                  />
                  <MediaPicker
                    label="Banner image"
                    value={banner.image}
                    onChange={(next) => {
                      const banners = [...value.campaignBanners];
                      banners[index] = { ...banner, image: next };
                      set("campaignBanners", banners);
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <AdminButton
                    variant="danger"
                    onClick={() => set("campaignBanners", value.campaignBanners.filter((_, i) => i !== index))}
                  >
                    Remove banner
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <p className="eyebrow mb-5">Editorial block</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("Title", "editorialTitle", true)}
            <div className="md:col-span-2">
              <label className="eyebrow mb-2 block">Body</label>
              <textarea
                rows={6}
                value={value.editorialBody}
                onChange={(event) => set("editorialBody", event.target.value)}
                className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
              />
            </div>
          </div>
        </section>

        <section className="border border-line bg-ink-2/40 p-6 md:col-span-2 rounded-[3px]">
          <p className="eyebrow mb-5">Featured content</p>
          <div className="grid gap-5 sm:grid-cols-2">
            {multi("Featured stores", "featuredStoreSlugs", options.stores)}
            {multi("Featured offers", "featuredOfferSlugs", options.offers)}
            {multi("Featured events", "featuredEventSlugs", options.events)}
            {multi("Featured dining", "featuredDiningSlugs", options.dining)}
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <AdminButton variant="primary" onClick={() => void save()} disabled={saving}>
          {saving ? <Spinner /> : null} Publish changes
        </AdminButton>
        <AdminButton href="/">View public homepage</AdminButton>
      </div>
    </>
  );
}
