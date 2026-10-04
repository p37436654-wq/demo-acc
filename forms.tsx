"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Btn } from "@/components/ui";
import { Spinner } from "@/components/motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Public enquiry form (contact / leasing / careers)                   */
/* ------------------------------------------------------------------ */

export type FormKind = "contact" | "leasing" | "careers";

const FIELD_SETS: Record<FormKind, { name: string; label: string; type?: string; required?: boolean; options?: string[]; full?: boolean }[]> = {
  contact: [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email address", type: "email", required: true },
    { name: "phone", label: "Phone (optional)", type: "tel" },
    { name: "subject", label: "Subject", required: true, full: true },
    { name: "message", label: "Message", type: "textarea", required: true, full: true },
  ],
  leasing: [
    { name: "name", label: "Contact name", required: true },
    { name: "email", label: "Work email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    {
      name: "interest",
      label: "Area of interest",
      type: "select",
      options: ["Retail leasing", "Advertising", "Brand partnership", "Event partnership"],
      required: true,
    },
    { name: "brand", label: "Brand / company" },
    { name: "size", label: "Space required (sq ft)" },
    { name: "message", label: "Brief", type: "textarea", required: true, full: true },
  ],
  careers: [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email address", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: true },
    { name: "role", label: "Role applied for", required: true, full: true },
    { name: "portfolio", label: "LinkedIn / portfolio link" },
    { name: "message", label: "Why this role?", type: "textarea", required: true, full: true },
  ],
};

export function PublicForm({ kind, defaultSubject }: { kind: FormKind; defaultSubject?: string }) {
  const fields = FIELD_SETS[kind];
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.name] = field.type === "select" ? field.options?.[0] ?? "" : field.name === "subject" && defaultSubject ? defaultSubject : "";
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const update = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    fields.forEach((field) => {
      const value = values[field.name]?.trim() ?? "";
      if (field.required && value.length < 2) {
        next[field.name] = `${field.label} is required.`;
      }
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        next[field.name] = "Enter a valid email address.";
      }
      if (field.type === "tel" && value && value.replace(/[^0-9]/g, "").length < 7) {
        next[field.name] = "Enter a valid phone number.";
      }
      if (field.type === "textarea" && field.required && value.length < 10) {
        next[field.name] = "Please add at least 10 characters.";
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      setStatus("error");
      setServerMessage("Please correct the highlighted fields.");
      return;
    }
    setStatus("loading");
    setServerMessage("");
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: values.name,
          email: values.email,
          phone: values.phone ?? "",
          subject: values.subject || values.role || values.interest || `${kind} enquiry`,
          message: values.message,
          extra: Object.fromEntries(
            Object.entries(values).filter(([key]) => !["name", "email", "phone", "message", "subject"].includes(key)),
          ),
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setStatus("error");
        setServerMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setServerMessage(data.message ?? "Thank you — your enquiry has been recorded.");
      setValues((current) => Object.fromEntries(Object.keys(current).map((key) => [key, ""])));
    } catch {
      setStatus("error");
      setServerMessage("Network error — please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="border border-jade/40 bg-jade/5 p-8 rounded-[3px]">
        <Badge tone="live">Enquiry received</Badge>
        <h3 className="mt-5 text-2xl">Thank you</h3>
        <p className="mt-3 text-sm leading-relaxed text-bone/70">{serverMessage}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 border border-line px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-bone/70 hover:border-gold hover:text-gold rounded-[3px]"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className={cn(field.full || field.type === "textarea" ? "sm:col-span-2" : "")}>
          <label htmlFor={`${kind}-${field.name}`} className="eyebrow mb-2 block">
            {field.label}
            {field.required ? <span className="text-gold"> *</span> : null}
          </label>
          {field.type === "textarea" ? (
            <textarea
              id={`${kind}-${field.name}`}
              value={values[field.name] ?? ""}
              onChange={(event) => update(field.name, event.target.value)}
              rows={5}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${kind}-${field.name}-error` : undefined}
              className="w-full border border-line bg-ink-2/60 px-4 py-3 text-sm placeholder:text-mute/70 focus:border-gold/60 focus:outline-none rounded-[3px]"
            />
          ) : field.type === "select" ? (
            <select
              id={`${kind}-${field.name}`}
              value={values[field.name] ?? ""}
              onChange={(event) => update(field.name, event.target.value)}
              className="w-full border border-line bg-ink-2/60 px-4 py-3 text-sm focus:border-gold/60 focus:outline-none rounded-[3px]"
            >
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`${kind}-${field.name}`}
              type={field.type ?? "text"}
              value={values[field.name] ?? ""}
              onChange={(event) => update(field.name, event.target.value)}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${kind}-${field.name}-error` : undefined}
              className="w-full border border-line bg-ink-2/60 px-4 py-3 text-sm placeholder:text-mute/70 focus:border-gold/60 focus:outline-none rounded-[3px]"
            />
          )}
          {errors[field.name] ? (
            <p id={`${kind}-${field.name}-error`} className="mt-2 text-[11px] text-clay">
              {errors[field.name]}
            </p>
          ) : null}
        </div>
      ))}

      {status === "error" && serverMessage ? (
        <p role="alert" className="sm:col-span-2 border border-clay/40 bg-clay/10 px-4 py-3 text-xs text-clay">
          {serverMessage}
        </p>
      ) : null}

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 bg-gold px-6 py-3.5 text-[12px] uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-soft disabled:opacity-50 rounded-[3px]"
        >
          {status === "loading" ? <Spinner /> : null}
          {status === "loading" ? "Sending…" : "Send enquiry"}
        </button>
        <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
          Demo form — stored in the CMS inbox, no email is sent
        </p>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Cookie preferences (stored in a real browser cookie, not localStorage) */
/* ------------------------------------------------------------------ */

export function CookiePreferences() {
  const [state, setState] = useState<"essential" | "all">("essential");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/nova_cookie_pref=(essential|all)/);
    if (match) setState(match[1] as "essential" | "all");
  }, []);

  const save = (value: "essential" | "all") => {
    setState(value);
    document.cookie = `nova_cookie_pref=${value}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <div className="border border-line bg-ink p-6 rounded-[3px]">
        <p className="text-sm">Strictly necessary</p>
        <p className="mt-2 text-xs leading-relaxed text-bone/55">
          One http-only session cookie that keeps administrators signed in. Always active.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-jade">Always on</p>
      </div>
      <div className="border border-line bg-ink p-6 rounded-[3px]">
        <p className="text-sm">Preference &amp; analytics</p>
        <p className="mt-2 text-xs leading-relaxed text-bone/55">
          This demo runs no advertising or tracking cookies. You may allow a single preference cookie that
          remembers your choice.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => save("essential")}
            aria-pressed={state === "essential"}
            className={cn(
              "border px-4 py-2 text-[10px] uppercase tracking-[0.2em] rounded-[2px]",
              state === "essential" ? "border-gold bg-gold text-ink" : "border-line text-bone/60 hover:text-bone",
            )}
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => save("all")}
            aria-pressed={state === "all"}
            className={cn(
              "border px-4 py-2 text-[10px] uppercase tracking-[0.2em] rounded-[2px]",
              state === "all" ? "border-gold bg-gold text-ink" : "border-line text-bone/60 hover:text-bone",
            )}
          >
            Allow preferences
          </button>
        </div>
        {saved ? <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-jade">Preference saved</p> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Full search screen                                                  */
/* ------------------------------------------------------------------ */

type Hit = { type: string; title: string; subtitle: string; href: string; image: string; category: string };

const POPULAR = ["Stores", "Coffee", "Cinema", "Parking", "Kids", "Jewellery", "Offers"];

export function SearchExplorer({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const data = (await response.json()) as { hits: Hit[] };
        setHits(data.hits ?? []);
      } catch (searchError) {
        if ((searchError as Error).name !== "AbortError") setError("Search is temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const groups = hits.reduce<Record<string, Hit[]>>((acc, hit) => {
    acc[hit.type] = acc[hit.type] ? [...acc[hit.type], hit] : [hit];
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-line pb-5">
        <span className="font-display text-2xl text-gold" aria-hidden>
          ⌕
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stores, dining, offers, events, cinema, services, FAQs…"
          className="w-full bg-transparent font-display text-2xl placeholder:text-mute/60 focus:outline-none md:text-4xl"
          aria-label="Search the mall"
        />
        {loading ? <Spinner className="text-gold" /> : null}
      </div>

      {query.trim().length < 2 ? (
        <div className="mt-12">
          <p className="eyebrow mb-4">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="border border-line px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-bone/70 hover:border-gold/50 hover:text-gold rounded-[2px]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : loading && hits.length === 0 ? (
        <div className="mt-12 space-y-3">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="skeleton h-16 w-full rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-12 text-sm text-clay">{error}</p>
      ) : hits.length === 0 ? (
        <div className="mt-14 max-w-lg">
          <Badge tone="muted">No results</Badge>
          <h3 className="mt-5 text-2xl md:text-3xl">Nothing matches “{query}”</h3>
          <p className="mt-3 text-sm text-bone/60">
            Try a brand, cuisine, floor, category or service — for example “beauty”, “Level 4”, “arcade” or “wheelchair”.
          </p>
          <Btn href="/stores" variant="outline" className="mt-6">
            Browse the directory
          </Btn>
        </div>
      ) : (
        <div className="mt-12 space-y-12">
          {Object.entries(groups).map(([type, items]) => (
            <section key={type}>
              <p className="eyebrow mb-4 text-gold">
                {type} · {items.length}
              </p>
              <ul className="grid gap-2 md:grid-cols-2">
                {items.map((hit, index) => (
                  <li key={`${hit.href}-${index}`}>
                    <Link
                      href={hit.href}
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
                        <span className="block truncate text-sm group-hover:text-gold">{hit.title}</span>
                        <span className="block truncate text-xs text-mute">{hit.subtitle}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
