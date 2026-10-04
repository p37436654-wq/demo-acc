import "server-only";
import { and, asc, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { ENTITY_CONFIGS } from "@/lib/admin-schema";
import { ENTITY_TABLES, SEARCHABLE, type EntityKey } from "@/lib/entities";
import { slugify } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function sanitizePayload(entity: EntityKey, input: Record<string, unknown>): Record<string, unknown> {
  const config = ENTITY_CONFIGS[entity];
  const out: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (!(field.name in input)) continue;
    const raw = input[field.name];
    switch (field.type) {
      case "checkbox":
        out[field.name] = raw === true || raw === "true" || raw === "on" || raw === 1;
        break;
      case "number": {
        const value = Number(raw);
        out[field.name] = Number.isFinite(value) ? Math.trunc(value) : 0;
        break;
      }
      case "lines":
        out[field.name] = Array.isArray(raw)
          ? raw.map((item) => String(item).trim()).filter(Boolean)
          : String(raw ?? "")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean);
        break;
      case "date":
        out[field.name] = typeof raw === "string" ? raw.slice(0, 10) : "";
        break;
      default:
        out[field.name] = typeof raw === "string" ? raw : raw == null ? "" : String(raw);
    }
  }

  const hasSlugField = config.fields.some((field) => field.name === "slug");
  if (hasSlugField) {
    const currentSlug = typeof out.slug === "string" ? out.slug.trim() : "";
    const titleValue = out[config.titleField];
    const source = currentSlug || (typeof titleValue === "string" ? titleValue : "");
    if (source) out.slug = slugify(source);
  }
  return out;
}

export async function listRecords(
  entity: EntityKey,
  options: { q?: string; status?: string } = {},
): Promise<Record<string, unknown>[]> {
  const table = ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>;
  const filters: SQL[] = [];
  const q = options.q?.trim();
  if (q) {
    const columns = SEARCHABLE[entity]
      .map((name) => table[name])
      .filter((column): column is PgColumn => Boolean(column));
    const clause = columns.map((column) => ilike(column, `%${q}%`));
    const combined = or(...clause);
    if (combined) filters.push(combined);
  }
  if (options.status && options.status !== "all") {
    const statusColumn = (ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>).status;
    if (statusColumn) filters.push(eq(statusColumn, options.status));
  }

  const sortColumn = (ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>).sortOrder;
  const nameColumn = (ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>).sortOrder
    ? null
    : (ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>).id;

  const base = db.select().from(ENTITY_TABLES[entity] as never);
  const filtered = filters.length > 0 ? base.where(and(...filters)) : base;
  const ordered =
    sortColumn && !nameColumn
      ? await filtered.orderBy(asc(sortColumn), asc((ENTITY_TABLES[entity] as any).id))
      : await filtered.orderBy(desc((ENTITY_TABLES[entity] as any).id));
  return ordered as Record<string, unknown>[];
}

export async function getRecord(entity: EntityKey, id: number): Promise<Record<string, unknown> | null> {
  const table = ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>;
  const rows = await db.select().from(ENTITY_TABLES[entity] as never).where(eq(table.id, id)).limit(1);
  return (rows[0] as Record<string, unknown>) ?? null;
}

export async function createRecord(entity: EntityKey, payload: Record<string, unknown>) {
  const values = sanitizePayload(entity, payload);
  const rows = await db
    .insert(ENTITY_TABLES[entity] as never)
    .values(values as never)
    .returning();
  return rows[0] as Record<string, unknown>;
}

export async function updateRecord(entity: EntityKey, id: number, payload: Record<string, unknown>) {
  const table = ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>;
  const values = sanitizePayload(entity, payload);
  const rows = await db
    .update(ENTITY_TABLES[entity] as never)
    .set({ ...values, updatedAt: new Date() } as never)
    .where(eq(table.id, id))
    .returning();
  return rows[0] as Record<string, unknown>;
}

export async function deleteRecord(entity: EntityKey, id: number) {
  const table = ENTITY_TABLES[entity] as unknown as Record<string, PgColumn>;
  await db.delete(ENTITY_TABLES[entity] as never).where(eq(table.id, id));
}
