"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminButton, AdminHeading, MediaPicker } from "@/components/admin/admin-ui";
import { Modal, Spinner, Tabs, useToast } from "@/components/motion";
import { Badge, EmptyState } from "@/components/ui";
import { cn, formatDate } from "@/lib/utils";
import type { LocationSettings, MallSettings, ParkingSettings } from "@/lib/queries";

type LineField = { key: string; label: string; type: "text" | "textarea" | "lines" | "image" };

function FieldRows({
  fields,
  value,
  onChange,
}: {
  fields: LineField[];
  value: Record<string, unknown>;
  onChange: (key: string, next: unknown) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.key} className={field.type === "textarea" || field.type === "lines" || field.type === "image" ? "sm:col-span-2" : ""}>
          {field.type === "image" ? (
            <MediaPicker
              label={field.label}
              value={String(value[field.key] ?? "")}
              onChange={(next) => onChange(field.key, next)}
            />
          ) : (
            <>
              <label className="eyebrow mb-2 block" htmlFor={`sf-${field.key}`}>
                {field.label}
              </label>
              {field.type === "textarea" || field.type === "lines" ? (
                <textarea
                  id={`sf-${field.key}`}
                  rows={field.type === "lines" ? 6 : 4}
                  value={Array.isArray(value[field.key]) ? (value[field.key] as string[]).join("\n") : String(value[field.key] ?? "")}
                  onChange={(event) =>
                    onChange(
                      field.key,
                      field.type === "lines"
                        ? event.target.value.split("\n").filter((line) => line.trim().length > 0)
                        : event.target.value,
                    )
                  }
                  className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
                />
              ) : (
                <input
                  id={`sf-${field.key}`}
                  value={String(value[field.key] ?? "")}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const SCHEMAS: Record<string, { label: string; blurb: string; fields: LineField[] }> = {
  mall: {
    label: "Mall information",
    blurb: "Name, contact details, opening hours, transport notes and social links used across the site.",
    fields: [
      { key: "name", label: "Mall name", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "addressLine", label: "Address line", type: "text" },
      { key: "city", label: "City", type: "text" },
      { key: "region", label: "Region / postcode", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "hoursWeekdays", label: "Hours — Mon to Fri", type: "text" },
      { key: "hoursWeekend", label: "Hours — Sat & Sun", type: "text" },
      { key: "hoursFoodCourt", label: "Hours — food court", type: "text" },
      { key: "hoursCinema", label: "Hours — cinema", type: "text" },
      { key: "instagram", label: "Instagram URL", type: "text" },
      { key: "facebook", label: "Facebook URL", type: "text" },
      { key: "youtube", label: "YouTube URL", type: "text" },
      { key: "transport", label: "Transport notes (one per line)", type: "lines" },
    ],
  },
  parking: {
    label: "Parking",
    blurb: "Everything shown on the Parking screen — keep values clearly labelled as demo data.",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "hours", label: "Parking hours", type: "text" },
      { key: "intro", label: "Intro", type: "textarea" },
      { key: "carLevels", label: "Car levels", type: "text" },
      { key: "carSpaces", label: "Car spaces", type: "text" },
      { key: "twoWheelerSpaces", label: "Two-wheeler bays", type: "text" },
      { key: "accessibleSpaces", label: "Accessible bays", type: "text" },
      { key: "evCharging", label: "EV charging", type: "text" },
      { key: "entrances", label: "Entrances (one per line)", type: "lines" },
      { key: "rates", label: "Rates (one per line)", type: "lines" },
      { key: "rules", label: "Rules (one per line)", type: "lines" },
    ],
  },
  location: {
    label: "Location",
    blurb: "Getting-here copy, map caption and sample landmarks.",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "mapCaption", label: "Map caption", type: "text" },
      { key: "intro", label: "Intro", type: "textarea" },
      { key: "landmarks", label: "Sample landmarks (one per line)", type: "lines" },
    ],
  },
};

const PAGE_SLUGS = [
  "about",
  "sustainability",
  "accessibility",
  "privacy",
  "terms",
  "cookies",
  "leasing",
  "careers",
];

export function SettingsEditor({
  mall,
  parking,
  location,
  pages,
}: {
  mall: MallSettings;
  parking: ParkingSettings;
  location: LocationSettings;
  pages: Record<string, { title: string; eyebrow: string; heroImage: string; intro: string; body: string }>;
}) {
  const { push } = useToast();
  const [tab, setTab] = useState("mall");
  const [data, setData] = useState<Record<string, Record<string, unknown>>>({
    mall: mall as unknown as Record<string, unknown>,
    parking: parking as unknown as Record<string, unknown>,
    location: location as unknown as Record<string, unknown>,
  });
  const [pageSlug, setPageSlug] = useState(PAGE_SLUGS[0]);
  const [pageDraft, setPageDraft] = useState(pages[PAGE_SLUGS[0]] ?? {
    title: "",
    eyebrow: "",
    heroImage: "",
    intro: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);

  const tabs = [
    ...Object.entries(SCHEMAS).map(([id, schema]) => ({ id, label: schema.label })),
    { id: "pages", label: "Long-form pages" },
  ];

  const selectPage = (slug: string) => {
    setPageSlug(slug);
    setPageDraft(
      pages[slug] ?? { title: "", eyebrow: "", heroImage: "", intro: "", body: "## Heading\nWrite the content here." },
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      if (tab === "pages") {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "pages", value: { [pageSlug]: pageDraft } }),
        });
        if (!response.ok) {
          push("Could not publish the page.", "error");
          return;
        }
        push("Page published", "success");
        return;
      }
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: tab, value: data[tab] }),
      });
      if (!response.ok) {
        push("Could not publish settings.", "error");
        return;
      }
      push("Settings published — the public site is updated", "success");
    } catch {
      push("Network error while publishing.", "error");
    } finally {
      setSaving(false);
    }
  };

  const schema = SCHEMAS[tab];

  return (
    <>
      <AdminHeading
        title="Settings & pages"
        blurb="Mall-wide information, parking, location and long-form pages. Publishing updates the public website immediately."
        actions={
          <>
            <AdminButton href="/">View site</AdminButton>
            <AdminButton variant="primary" onClick={() => void save()} disabled={saving}>
              {saving ? <Spinner /> : null} Publish changes
            </AdminButton>
          </>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-8" />

      {tab === "pages" ? (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="border border-line bg-ink-2/40 p-4 rounded-[3px]">
            <p className="eyebrow mb-3">Pages</p>
            <ul className="space-y-1">
              {PAGE_SLUGS.map((slug) => (
                <li key={slug}>
                  <button
                    type="button"
                    onClick={() => selectPage(slug)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-[11px] uppercase tracking-[0.16em] rounded-[3px]",
                      pageSlug === slug ? "bg-gold/12 text-gold" : "text-bone/60 hover:bg-ink-3 hover:text-bone",
                    )}
                  >
                    /{slug}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-2 block" htmlFor="p-title">
                  Title
                </label>
                <input
                  id="p-title"
                  value={pageDraft.title}
                  onChange={(event) => setPageDraft({ ...pageDraft, title: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block" htmlFor="p-eyebrow">
                  Eyebrow
                </label>
                <input
                  id="p-eyebrow"
                  value={pageDraft.eyebrow}
                  onChange={(event) => setPageDraft({ ...pageDraft, eyebrow: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
              <div className="sm:col-span-2">
                <MediaPicker
                  label="Hero image"
                  value={pageDraft.heroImage}
                  onChange={(next) => setPageDraft({ ...pageDraft, heroImage: next })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="eyebrow mb-2 block" htmlFor="p-intro">
                  Intro
                </label>
                <textarea
                  id="p-intro"
                  rows={3}
                  value={pageDraft.intro}
                  onChange={(event) => setPageDraft({ ...pageDraft, intro: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="eyebrow mb-2 block" htmlFor="p-body">
                  Body — use “## ” for headings, “- ” for bullets, blank line for a new paragraph
                </label>
                <textarea
                  id="p-body"
                  rows={16}
                  value={pageDraft.body}
                  onChange={(event) => setPageDraft({ ...pageDraft, body: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 font-mono text-[11px] rounded-[3px]"
                />
              </div>
            </div>
          </div>
        </div>
      ) : schema ? (
        <div className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <p className="eyebrow mb-5">{schema.blurb}</p>
          <FieldRows
            fields={schema.fields}
            value={data[tab] ?? {}}
            onChange={(key, next) =>
              setData((current) => ({ ...current, [tab]: { ...(current[tab] ?? {}), [key]: next } }))
            }
          />
        </div>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Inbox                                                               */
/* ------------------------------------------------------------------ */

type Inquiry = {
  id: number;
  kind: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  extra: Record<string, string>;
  handled: boolean;
  createdAt: string;
};

export function MessagesInbox() {
  const { push } = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState("all");
  const [open, setOpen] = useState<Inquiry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/inquiries", { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { items: Inquiry[] };
      setItems(data.items ?? []);
      setError(null);
    } catch {
      setError("Could not load the inbox.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (item: Inquiry) => {
    await fetch("/api/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, handled: !item.handled }),
    });
    push(item.handled ? "Marked as new" : "Marked as handled", "success");
    await load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" });
    push("Deleted", "success");
    setOpen(null);
    await load();
  };

  const filtered = items.filter((item) => (kind === "all" ? true : item.kind === kind));

  return (
    <>
      <AdminHeading
        title="Inbox"
        blurb="Contact, leasing and careers submissions from the public website. Enquiries are stored in PostgreSQL — no email is sent in this demo."
        actions={<AdminButton onClick={() => void load()}>Refresh</AdminButton>}
      />

      <div className="mb-6 flex gap-1 border border-line p-1 rounded-[3px]">
        {["all", "contact", "leasing", "careers"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            aria-pressed={kind === option}
            className={cn(
              "px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] rounded-[2px]",
              kind === option ? "bg-gold text-ink" : "text-mute hover:text-bone",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="skeleton h-16 w-full rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Inbox unavailable" description={error} action={<AdminButton onClick={() => void load()}>Retry</AdminButton>} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No enquiries yet" description="Submissions from the contact, leasing and careers forms appear here." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li key={item.id} className="border border-line bg-ink-2/40 p-4 rounded-[3px]">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={item.kind === "contact" ? "default" : item.kind === "leasing" ? "gold" : "new"}>
                  {item.kind}
                </Badge>
                <p className="text-sm">{item.name}</p>
                {item.handled ? <Badge tone="live">Handled</Badge> : <Badge tone="muted">New</Badge>}
                <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-mute">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-bone/60">{item.subject || item.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminButton onClick={() => setOpen(item)}>Open</AdminButton>
                <AdminButton onClick={() => void toggle(item)}>{item.handled ? "Mark new" : "Mark handled"}</AdminButton>
                <AdminButton href={`mailto:${item.email}`}>Reply by email</AdminButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title="Enquiry">
        {open ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="eyebrow mb-1">From</p>
                <p>{open.name}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Email</p>
                <p className="text-gold">{open.email}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Phone</p>
                <p>{open.phone || "—"}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Kind</p>
                <p>{open.kind}</p>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-1">Subject</p>
              <p>{open.subject || "—"}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Message</p>
              <p className="leading-relaxed text-bone/70">{open.message}</p>
            </div>
            {Object.keys(open.extra ?? {}).length > 0 ? (
              <div>
                <p className="eyebrow mb-1">Additional</p>
                <ul className="space-y-1 text-xs text-bone/60">
                  {Object.entries(open.extra).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              <AdminButton onClick={() => void toggle(open)}>{open.handled ? "Mark new" : "Mark handled"}</AdminButton>
              <AdminButton href={`mailto:${open.email}`}>Reply by email</AdminButton>
              <AdminButton variant="danger" onClick={() => void remove(open.id)}>
                Delete
              </AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Account                                                             */
/* ------------------------------------------------------------------ */

export function AccountPanel({ user }: { user: { name: string; email: string; role: string } }) {
  const { push } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not change the password.");
        return;
      }
      push("Password updated", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeading title="Account" blurb="Change your password. Sessions are stored server-side and expire after 7 days." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submit} className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <p className="eyebrow mb-5">Change password</p>
          <div className="space-y-4">
            <div>
              <label className="eyebrow mb-2 block" htmlFor="cp">
                Current password
              </label>
              <input
                id="cp"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block" htmlFor="np">
                New password
              </label>
              <input
                id="np"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block" htmlFor="np2">
                Confirm new password
              </label>
              <input
                id="np2"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            {error ? (
              <p role="alert" className="border border-clay/40 bg-clay/10 px-3 py-2 text-[11px] text-clay">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 border border-gold bg-gold px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink disabled:opacity-50 rounded-[3px]"
            >
              {saving ? <Spinner /> : null} Update password
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
            <p className="eyebrow mb-4">Signed in as</p>
            <p className="text-sm">{user.name}</p>
            <p className="text-xs text-mute">{user.email}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold">{user.role}</p>
          </div>
          <div className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
            <p className="eyebrow mb-3">Forgot your password?</p>
            <p className="text-xs leading-relaxed text-bone/60">
              Use “Forgot password” on the sign-in screen. Because no mail service is connected in this demo,
              a reset token is shown on screen instead of being emailed.
            </p>
            <div className="mt-4">
              <AdminButton href="/admin/login">Go to sign in</AdminButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
