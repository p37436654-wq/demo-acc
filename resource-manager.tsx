"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminButton, AdminHeading, Field, StatusPill } from "@/components/admin/admin-ui";
import { Modal, Spinner, useToast } from "@/components/motion";
import { Badge, EmptyState } from "@/components/ui";
import { emptyRecord, type EntityConfig } from "@/lib/admin-schema";
import { cn } from "@/lib/utils";

type Row = Record<string, unknown>;

const PREVIEW: Record<string, (row: Row) => string> = {
  stores: (row) => `/stores/${String(row.slug ?? "")}`,
  dining: (row) => `/dining/${String(row.slug ?? "")}`,
  offers: (row) => `/offers/${String(row.slug ?? "")}`,
  events: (row) => `/events/${String(row.slug ?? "")}`,
  cinema: () => "/cinema",
  entertainment: () => "/entertainment",
  services: () => "/services",
  faqs: () => "/faq",
  announcements: () => "/whats-on",
  jobs: () => "/careers",
};

export default function ResourceManager({ config }: { config: EntityConfig }) {
  const { push } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editing, setEditing] = useState<Row | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${config.key}`, { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { records: Row[] };
      setRows(data.records ?? []);
    } catch {
      setError("Could not load records. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [config.key]);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    if (!config.categories) return [];
    return Array.from(new Set(rows.map((row) => String(row[config.categories!.field] ?? "")))).filter(Boolean);
  }, [rows, config.categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && String(row[config.statusField]) !== statusFilter) return false;
      if (config.categories && categoryFilter !== "All" && String(row[config.categories.field]) !== categoryFilter)
        return false;
      if (!q) return true;
      return config.subtitleFields
        .concat(config.titleField)
        .some((field) => String(row[field] ?? "").toLowerCase().includes(q));
    });
  }, [rows, query, statusFilter, categoryFilter, config]);

  const openNew = () => {
    setEditing(emptyRecord(config));
    setIsNew(true);
  };

  const save = async (statusOverride?: "draft" | "published") => {
    if (!editing) return;
    setSaving(true);
    const payload = { ...editing };
    if (statusOverride) payload[config.statusField] = statusOverride;
    try {
      const response = await fetch(
        isNew ? `/api/admin/${config.key}` : `/api/admin/${config.key}/${String(editing.id)}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as { record?: Row; error?: string };
      if (!response.ok) {
        push(data.error ?? "Could not save.", "error");
        return;
      }
      push(isNew ? `${config.singular} created` : `${config.singular} saved`, "success");
      setEditing(null);
      setIsNew(false);
      await load();
    } catch {
      push("Network error while saving.", "error");
    } finally {
      setSaving(false);
    }
  };

  const patch = async (row: Row, values: Row, message: string) => {
    try {
      const response = await fetch(`/api/admin/${config.key}/${String(row.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        push("Action failed.", "error");
        return;
      }
      push(message, "success");
      await load();
    } catch {
      push("Network error.", "error");
    }
  };

  const remove = async (row: Row) => {
    try {
      const response = await fetch(`/api/admin/${config.key}/${String(row.id)}`, { method: "DELETE" });
      if (!response.ok) {
        push("Delete failed.", "error");
        return;
      }
      push(`${config.singular} deleted`, "success");
      setConfirmDelete(null);
      await load();
    } catch {
      push("Network error.", "error");
    }
  };

  const publishedCount = rows.filter((row) => String(row[config.statusField]) === "published").length;

  return (
    <>
      <AdminHeading
        title={config.label}
        blurb={`${config.blurb} · ${publishedCount} published of ${rows.length} total. Drafts never appear on the public site until you publish them.`}
        actions={
          <>
            <AdminButton onClick={() => void load()}>Refresh</AdminButton>
            <AdminButton variant="primary" onClick={openNew}>
              Add {config.singular.toLowerCase()}
            </AdminButton>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3 border border-line bg-ink-2/50 px-3 py-2.5 focus-within:border-gold/50 rounded-[3px]">
          <span className="text-gold" aria-hidden>
            ⌕
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}…`}
            className="w-full bg-transparent text-xs placeholder:text-mute focus:outline-none"
            aria-label={`Search ${config.label}`}
          />
        </div>
        <div className="flex gap-1 border border-line p-1 rounded-[3px]">
          {(["all", "published", "draft"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              aria-pressed={statusFilter === value}
              className={cn(
                "px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] rounded-[2px]",
                statusFilter === value ? "bg-gold text-ink" : "text-mute hover:text-bone",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {config.categories && categories.length > 0 ? (
        <div className="scroll-x mb-6 flex gap-2 overflow-x-auto">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              aria-pressed={categoryFilter === category}
              className={cn(
                "shrink-0 border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] rounded-[2px]",
                categoryFilter === category ? "border-gold text-gold" : "border-line text-mute hover:text-bone",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="skeleton h-16 w-full rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Something went wrong"
          description={error}
          action={<AdminButton onClick={() => void load()}>Try again</AdminButton>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${config.label.toLowerCase()} found`}
          description="Adjust the filters or create your first record."
          action={
            <AdminButton variant="primary" onClick={openNew}>
              Add {config.singular.toLowerCase()}
            </AdminButton>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => {
            const image = config.imageField ? String(row[config.imageField] ?? "") : "";
            const status = String(row[config.statusField] ?? "draft");
            return (
              <li
                key={String(row.id)}
                className="flex flex-col gap-4 border border-line bg-ink-2/40 p-4 transition-colors hover:border-gold/30 md:flex-row md:items-center rounded-[3px]"
              >
                {config.imageField ? (
                  <div className="size-16 shrink-0 overflow-hidden border border-line bg-ink-3">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="size-full object-cover" loading="lazy" />
                    ) : (
                      <span className="grid size-full place-items-center text-[10px] text-mute">No image</span>
                    )}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm">{String(row[config.titleField] ?? "Untitled")}</p>
                    <StatusPill status={status} />
                    {row.featured ? <Badge tone="gold">Featured</Badge> : null}
                    {row.isNew ? <Badge tone="new">New</Badge> : null}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-mute">
                    {config.subtitleFields.map((field) => String(row[field] ?? "")).filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton onClick={() => { setEditing(row); setIsNew(false); }}>Edit</AdminButton>
                  {status === "published" ? (
                    <AdminButton onClick={() => void patch(row, { [config.statusField]: "draft" }, "Moved to draft")}>
                      Unpublish
                    </AdminButton>
                  ) : (
                    <AdminButton
                      variant="primary"
                      onClick={() => void patch(row, { [config.statusField]: "published" }, "Published — live on site")}
                    >
                      Publish
                    </AdminButton>
                  )}
                  {PREVIEW[config.key] ? (
                    <AdminButton href={PREVIEW[config.key](row)}>Preview</AdminButton>
                  ) : null}
                  <AdminButton variant="danger" onClick={() => setConfirmDelete(row)}>
                    Delete
                  </AdminButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Editor */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={isNew ? `New ${config.singular}` : `Edit ${config.singular}`} side="right">
        {editing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="grid gap-5 sm:grid-cols-2"
          >
            {config.fields.map((field) => (
              <Field
                key={field.name}
                field={field}
                value={editing[field.name]}
                onChange={(value) => setEditing((current) => ({ ...(current as Row), [field.name]: value }))}
              />
            ))}

            <div className="sm:col-span-2 sticky bottom-0 -mx-6 mt-4 border-t border-line bg-ink-2 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 border border-gold bg-gold px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink disabled:opacity-50 rounded-[3px]"
                >
                  {saving ? <Spinner /> : null} Save draft
                </button>
                <AdminButton onClick={() => void save("published")} disabled={saving}>
                  Publish
                </AdminButton>
                {!isNew && PREVIEW[config.key] ? (
                  <AdminButton href={PREVIEW[config.key](editing)}>Preview</AdminButton>
                ) : null}
                <AdminButton variant="ghost" onClick={() => setEditing(null)}>
                  Close
                </AdminButton>
              </div>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Delete confirm */}
      <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title={`Delete ${config.singular.toLowerCase()}`}>
        <p className="text-sm text-bone/70">
          This permanently removes “{confirmDelete ? String(confirmDelete[config.titleField]) : ""}”. This cannot be
          undone.
        </p>
        <div className="mt-6 flex gap-2">
          <AdminButton variant="danger" onClick={() => confirmDelete && void remove(confirmDelete)}>
            Delete permanently
          </AdminButton>
          <AdminButton variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </AdminButton>
        </div>
      </Modal>
    </>
  );
}
