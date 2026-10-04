"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Modal, Spinner, useToast } from "@/components/motion";
import { cn } from "@/lib/utils";
import type { FieldDef } from "@/lib/admin-schema";

/* ---------------- Navigation ---------------- */

const NAV: { group: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "◱" }],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/manage/stores", label: "Stores", icon: "⌗" },
      { href: "/admin/manage/dining", label: "Dining", icon: "✦" },
      { href: "/admin/manage/offers", label: "Offers", icon: "%" },
      { href: "/admin/manage/events", label: "Events", icon: "◈" },
      { href: "/admin/manage/entertainment", label: "Entertainment", icon: "◎" },
      { href: "/admin/manage/cinema", label: "Cinema", icon: "▶" },
      { href: "/admin/manage/services", label: "Services", icon: "☰" },
      { href: "/admin/manage/faqs", label: "FAQ", icon: "?" },
      { href: "/admin/manage/jobs", label: "Careers", icon: "☗" },
      { href: "/admin/manage/announcements", label: "Announcements", icon: "!"
      },
    ],
  },
  {
    group: "Site",
    items: [
      { href: "/admin/homepage", label: "Homepage builder", icon: "▤" },
      { href: "/admin/map", label: "Route map", icon: "➤" },
      { href: "/admin/media", label: "Media library", icon: "▦" },
      { href: "/admin/settings", label: "Settings & pages", icon: "⚙" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/messages", label: "Inbox", icon: "✉" },
      { href: "/admin/account", label: "Account", icon: "◍" },
    ],
  },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { push } = useToast();

  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    push("Signed out", "info");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-line bg-ink-2/60 backdrop-blur-xl transition-transform duration-500 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid size-8 place-items-center border border-gold/50 text-gold">
              <span className="font-display text-base leading-none">N</span>
            </span>
            <span className="leading-none">
              <span className="block font-display text-[13px] tracking-[0.14em]">NOVA CMS</span>
              <span className="mt-1 block text-[8px] tracking-[0.32em] text-mute">DEMO EXPERIENCE</span>
            </span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="text-mute lg:hidden" aria-label="Close menu">
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin">
          {NAV.map((section) => (
            <div key={section.group} className="mb-6">
              <p className="eyebrow mb-2 px-2">{section.group}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 text-[12px] transition-all duration-300 rounded-[3px]",
                          active ? "bg-gold/12 text-gold" : "text-bone/65 hover:bg-ink-3 hover:text-bone",
                        )}
                      >
                        <span className="w-4 text-center text-[13px] opacity-70" aria-hidden>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <p className="text-[11px]">{user.name}</p>
          <p className="truncate text-[10px] text-mute">{user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/"
              className="border border-line px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-bone/60 hover:border-gold/50 hover:text-gold rounded-[2px]"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="border border-clay/50 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-clay hover:bg-clay hover:text-ink rounded-[2px]"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/80 lg:hidden"
        />
      ) : null}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-ink/90 px-4 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="border border-line px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-bone/70 lg:hidden rounded-[3px]"
          >
            Menu
          </button>
          <p className="hidden text-[10px] uppercase tracking-[0.24em] text-mute lg:block">
            Demo experience — all content is fictional sample data
          </p>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-mute sm:inline">{user.role}</span>
            <span className="grid size-8 place-items-center border border-gold/40 text-[11px] text-gold">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

/* ---------------- Small building blocks ---------------- */

export function AdminHeading({
  title,
  blurb,
  actions,
}: {
  title: string;
  blurb?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl">{title}</h1>
        {blurb ? <p className="mt-2 max-w-2xl text-xs leading-relaxed text-mute">{blurb}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] rounded-[2px]",
        published ? "border-jade/50 text-jade" : "border-line text-mute",
      )}
    >
      <span className={cn("size-1 rounded-full", published ? "bg-jade" : "bg-mute")} aria-hidden />
      {status}
    </span>
  );
}

export function AdminButton({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  href?: string;
}) {
  const variants: Record<string, string> = {
    default: "border border-line text-bone/80 hover:border-gold/50 hover:text-gold",
    primary: "bg-gold text-ink hover:bg-gold-soft border border-gold",
    danger: "border border-clay/60 text-clay hover:bg-clay hover:text-ink",
    ghost: "text-mute hover:text-gold border border-transparent",
  };
  const classes = cn(
    "inline-flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-40 rounded-[3px]",
    variants[variant],
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

/* ---------------- Media picker ---------------- */

type MediaItem = { id: number; title: string; url: string; mimeType: string; tags: string; folder: string };

export function MediaPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/media");
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { items: MediaItem[] };
      setItems(data.items ?? []);
    } catch {
      setError("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name.replace(/\.[^.]+$/, ""));
    try {
      const response = await fetch("/api/media", { method: "POST", body: form });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.url);
      await load();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    if (!urlDraft.trim()) return;
    onChange(urlDraft.trim());
    setUrlDraft("");
    setOpen(false);
  };

  const filtered = items.filter((item) =>
    search ? `${item.title} ${item.tags} ${item.folder}`.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <div>
      <label className="eyebrow mb-2 block">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative size-20 overflow-hidden border border-line bg-ink-3">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-[10px] text-mute">No image</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Image URL or pick from library"
            className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
          />
          <div className="flex flex-wrap gap-2">
            <AdminButton onClick={() => setOpen(true)}>Library</AdminButton>
            <AdminButton onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Spinner /> : null} Upload
            </AdminButton>
            {value ? <AdminButton variant="ghost" onClick={() => onChange("")}>Clear</AdminButton> : null}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {error ? <p className="mt-2 text-[11px] text-clay">{error}</p> : null}

      <Modal open={open} onClose={() => setOpen(false)} title="Media library">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search media…"
              className="flex-1 border border-line bg-ink px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
            />
            <AdminButton onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Spinner /> : null} Upload
            </AdminButton>
          </div>
          <div className="flex gap-2">
            <input
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              placeholder="…or paste an image URL"
              className="flex-1 border border-line bg-ink px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
            />
            <AdminButton onClick={addUrl}>Use URL</AdminButton>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="skeleton aspect-square w-full rounded-sm" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-mute">
              No media yet — upload an image to build the library.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setOpen(false);
                  }}
                  className="group border border-line text-left transition-colors hover:border-gold"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.title} className="aspect-square w-full object-cover" loading="lazy" />
                  <span className="block truncate px-2 py-2 text-[10px] text-mute group-hover:text-gold">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Field renderer ---------------- */

export function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `field-${field.name}`;
  const wrapper = field.full ? "md:col-span-2" : "";

  if (field.type === "image") {
    return (
      <div className={wrapper}>
        <MediaPicker label={field.label} value={String(value ?? "")} onChange={onChange} />
        {field.help ? <p className="mt-2 text-[10px] text-mute">{field.help}</p> : null}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={cn("flex items-center gap-3", wrapper)}>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 accent-[#c8a96a]"
        />
        <label htmlFor={id} className="text-xs text-bone/80">
          {field.label}
        </label>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {field.label}
        {field.required ? <span className="text-gold"> *</span> : null}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={5}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
        >
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "lines" ? (
        <textarea
          id={id}
          rows={4}
          value={Array.isArray(value) ? (value as string[]).join("\n") : String(value ?? "")}
          onChange={(event) => onChange(event.target.value.split("\n"))}
          placeholder={field.help}
          className="w-full border border-line bg-ink-2/60 px-3 py-2.5 font-mono text-[11px] focus:border-gold/60 focus:outline-none rounded-[3px]"
        />
      ) : (
        <input
          id={id}
          type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)}
          placeholder={field.placeholder}
          className="w-full border border-line bg-ink-2/60 px-3 py-2.5 text-xs focus:border-gold/60 focus:outline-none rounded-[3px]"
        />
      )}
      {field.help && field.type !== "lines" ? <p className="mt-2 text-[10px] text-mute">{field.help}</p> : null}
    </div>
  );
}
