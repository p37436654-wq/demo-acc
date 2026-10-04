"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AdminButton, AdminHeading, StatusPill } from "@/components/admin/admin-ui";
import { Modal, Spinner, useToast } from "@/components/motion";
import { Badge, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Route map manager                                                   */
/* ------------------------------------------------------------------ */

type MapItem = {
  id: number;
  title: string;
  caption: string;
  status: string;
  hasImage: boolean;
  externalUrl: string;
  updatedAt: string;
  publishedAt: string | null;
  imageUrl: string;
};

export function MapManager() {
  const { push } = useToast();
  const [items, setItems] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("NOVA GRAND MALL — Demo Route Map");
  const [caption, setCaption] = useState("DEMO MAP — SAMPLE DATA. Not a representation of a real location.");
  const [externalUrl, setExternalUrl] = useState("");
  const [preview, setPreview] = useState<MapItem | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/route-map", { cache: "no-store" });
      const data = (await response.json()) as { items: MapItem[] };
      setItems(data.items ?? []);
      setError(null);
    } catch {
      setError("Could not load the route map library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file?: File) => {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("title", title);
    form.append("caption", caption);
    if (file) form.append("file", file);
    else form.append("externalUrl", externalUrl);
    try {
      const response = await fetch("/api/route-map", { method: "POST", body: form });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      push("Map uploaded as a draft", "success");
      setExternalUrl("");
      await load();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const act = async (id: number, action: "publish" | "unpublish") => {
    const response = await fetch("/api/route-map", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    if (!response.ok) {
      push("Action failed.", "error");
      return;
    }
    push(action === "publish" ? "Route map published — live on the site" : "Route map unpublished", "success");
    await load();
  };

  const remove = async (id: number) => {
    const response = await fetch(`/api/route-map?id=${id}`, { method: "DELETE" });
    if (!response.ok) {
      push("Delete failed.", "error");
      return;
    }
    push("Map deleted", "success");
    await load();
  };

  return (
    <>
      <AdminHeading
        title="Location → Route map"
        blurb="Upload, preview, replace, delete and publish the demo route map. The published version appears on the homepage, Mall Map and Location screens."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="border border-line bg-ink-2/40 p-6 rounded-[3px]">
          <p className="eyebrow mb-4">Upload / replace</p>
          <div className="space-y-4">
            <div>
              <label className="eyebrow mb-2 block" htmlFor="map-title">
                Title
              </label>
              <input
                id="map-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block" htmlFor="map-caption">
                Caption
              </label>
              <input
                id="map-caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block" htmlFor="map-file">
                Map image (max 6 MB)
              </label>
              <input
                id="map-file"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block" htmlFor="map-url">
                …or image URL
              </label>
              <input
                id="map-url"
                value={externalUrl}
                onChange={(event) => setExternalUrl(event.target.value)}
                placeholder="https://…"
                className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminButton variant="primary" onClick={() => void upload()} disabled={uploading || !externalUrl}>
                {uploading ? <Spinner /> : null} Upload draft
              </AdminButton>
              <AdminButton onClick={() => fileRef.current?.click()} disabled={uploading}>
                Choose file
              </AdminButton>
            </div>
            {error ? <p className="text-[11px] text-clay">{error}</p> : null}
            <p className="text-[10px] uppercase tracking-[0.18em] text-mute">
              Uploading creates a draft. Publish to make it live.
            </p>
          </div>
        </section>

        <section>
          {loading ? (
            <div className="skeleton aspect-[4/3] w-full rounded-sm" />
          ) : items.length === 0 ? (
            <EmptyState
              title="No route maps yet"
              description="Upload a map image to replace the placeholder on the public site."
            />
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="border border-line bg-ink-2/40 p-4 rounded-[3px]">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="w-full overflow-hidden border border-line bg-ink-3 sm:w-48">
                      {item.hasImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.title} className="aspect-[4/3] w-full object-contain" />
                      ) : (
                        <span className="grid aspect-[4/3] place-items-center text-[10px] text-mute">No image</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm">{item.title}</p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-mute">{item.caption}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-mute">
                        Updated {formatDate(item.updatedAt)}
                        {item.publishedAt ? ` · published ${formatDate(item.publishedAt)}` : ""}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <AdminButton onClick={() => setPreview(item)}>Preview</AdminButton>
                        {item.status === "published" ? (
                          <AdminButton onClick={() => void act(item.id, "unpublish")}>Unpublish</AdminButton>
                        ) : (
                          <AdminButton variant="primary" onClick={() => void act(item.id, "publish")}>
                            Publish
                          </AdminButton>
                        )}
                        <AdminButton variant="danger" onClick={() => void remove(item.id)}>
                          Delete
                        </AdminButton>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border border-gold/30 bg-gold/5 p-5 rounded-[3px]">
            <Badge tone="gold">Demo map</Badge>
            <p className="mt-3 text-xs leading-relaxed text-bone/70">
              Whatever is published here replaces the map on the homepage, Mall Map and Location screens
              instantly — no code changes or redeploy required.
            </p>
          </div>
        </section>
      </div>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.title ?? "Preview"}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.imageUrl} alt={preview.title} className="w-full object-contain" />
        ) : null}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

type MediaRow = {
  id: number;
  title: string;
  alt: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  tags: string;
  folder: string;
  createdAt: string;
  url: string;
};

export function MediaManager() {
  const { push } = useToast();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [replacing, setReplacing] = useState<MediaRow | null>(null);
  const replaceRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/media", { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { items: MediaRow[] };
      setItems(data.items ?? []);
      setError(null);
    } catch {
      setError("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("title", file.name.replace(/\.[^.]+$/, ""));
        form.append("alt", file.name.replace(/\.[^.]+$/, ""));
        form.append("folder", folder === "All" ? "general" : folder);
        const response = await fetch("/api/media", { method: "POST", body: form });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          push(data.error ?? "Upload failed.", "error");
        }
      }
      push("Upload complete", "success");
      await load();
    } catch {
      push("Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const saveMeta = async () => {
    if (!editing) return;
    const response = await fetch(`/api/media/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editing.title, alt: editing.alt, tags: editing.tags, folder: editing.folder }),
    });
    if (!response.ok) {
      push("Could not save metadata.", "error");
      return;
    }
    push("Metadata saved", "success");
    setEditing(null);
    await load();
  };

  const replace = async (file: File) => {
    if (!replacing) return;
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`/api/media/${replacing.id}/replace`, { method: "POST", body: form });
    if (!response.ok) {
      push("Replace failed.", "error");
      return;
    }
    push("Image replaced", "success");
    setReplacing(null);
    await load();
  };

  const remove = async (id: number) => {
    const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (!response.ok) {
      push("Delete failed.", "error");
      return;
    }
    push("Media deleted", "success");
    await load();
  };

  const folders = Array.from(new Set(items.map((item) => item.folder).filter(Boolean)));
  const filtered = items.filter((item) => {
    if (folder !== "All" && item.folder !== folder) return false;
    if (!search) return true;
    return `${item.title} ${item.tags} ${item.fileName}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <AdminHeading
        title="Media library"
        blurb="Upload, preview, search, replace, edit metadata and reuse imagery across the site. Files are stored in the database so they persist across devices and deployments."
        actions={
          <>
            <label className="inline-flex cursor-pointer items-center gap-2 border border-gold bg-gold px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] text-ink rounded-[3px]">
              {uploading ? <Spinner /> : null} Upload images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => event.target.files && void upload(event.target.files)}
              />
            </label>
            <AdminButton onClick={() => void load()}>Refresh</AdminButton>
          </>
        }
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 border border-line bg-ink-2/50 px-3 py-2.5 focus-within:border-gold/50 rounded-[3px]">
          <span className="text-gold" aria-hidden>
            ⌕
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, tag or file name…"
            className="w-full bg-transparent text-xs placeholder:text-mute focus:outline-none"
            aria-label="Search media"
          />
        </div>
        <div className="flex gap-1 border border-line p-1 rounded-[3px]">
          {["All", ...folders].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFolder(option)}
              aria-pressed={folder === option}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] rounded-[2px] ${
                folder === option ? "bg-gold text-ink" : "text-mute hover:text-bone"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="skeleton aspect-square w-full rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Media unavailable" description={error} action={<AdminButton onClick={() => void load()}>Retry</AdminButton>} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No media found"
          description="Upload images to build the library, or paste an image URL from any content field."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((item) => (
            <li key={item.id} className="group border border-line bg-ink-2/40 rounded-[3px]">
              <div className="relative aspect-square overflow-hidden bg-ink-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt || item.title} className="size-full object-cover" loading="lazy" />
              </div>
              <div className="p-3">
                <p className="truncate text-[11px]">{item.title}</p>
                <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.16em] text-mute">
                  {item.folder} · {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <AdminButton onClick={() => setEditing(item)}>Edit</AdminButton>
                  <AdminButton
                    onClick={() => {
                      setReplacing(item);
                      replaceRef.current?.click();
                    }}
                  >
                    Replace
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => void remove(item.id)}>
                    Delete
                  </AdminButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void replace(file);
        }}
      />

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Media metadata">
        {editing ? (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={editing.url} alt={editing.alt} className="max-h-72 w-full object-contain" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-2 block" htmlFor="m-title">
                  Title
                </label>
                <input
                  id="m-title"
                  value={editing.title}
                  onChange={(event) => setEditing({ ...editing, title: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block" htmlFor="m-alt">
                  Alt text
                </label>
                <input
                  id="m-alt"
                  value={editing.alt}
                  onChange={(event) => setEditing({ ...editing, alt: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block" htmlFor="m-tags">
                  Tags
                </label>
                <input
                  id="m-tags"
                  value={editing.tags}
                  onChange={(event) => setEditing({ ...editing, tags: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
              <div>
                <label className="eyebrow mb-2 block" htmlFor="m-folder">
                  Folder
                </label>
                <input
                  id="m-folder"
                  value={editing.folder}
                  onChange={(event) => setEditing({ ...editing, folder: event.target.value })}
                  className="w-full border border-line bg-ink px-3 py-2.5 text-xs rounded-[3px]"
                />
              </div>
            </div>
            <div className="border border-line bg-ink px-3 py-2.5 text-[10px] text-mute">
              Reusable URL: <span className="text-gold">{editing.url}</span>
            </div>
            <div className="flex gap-2">
              <AdminButton variant="primary" onClick={() => void saveMeta()}>
                Save metadata
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </AdminButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
