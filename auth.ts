import "server-only";
import { cookies } from "next/headers";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, activityLog } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const SESSION_COOKIE = "nova_admin_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== derived.length) return false;
  return timingSafeEqual(derived, keyBuffer);
}

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export async function login(email: string, password: string): Promise<AdminUser | null> {
  await ensureSeed();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  const user = rows[0];
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: token, userId: user.id, expiresAt });
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function requireApiUser(): Promise<AdminUser | null> {
  return getCurrentUser();
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user) return { ok: false, error: "Account not found." };
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return { ok: false, error: "Current password is incorrect." };
  }
  await db
    .update(users)
    .set({ passwordHash: hashPassword(newPassword) })
    .where(eq(users.id, userId));
  return { ok: true };
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: boolean; token?: string }> {
  await ensureSeed();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  const user = rows[0];
  if (!user) return { ok: false };
  const token = randomBytes(18).toString("hex");
  await db
    .update(users)
    .set({ resetToken: token, resetTokenExpiresAt: new Date(Date.now() + 3600_000) })
    .where(eq(users.id, user.id));
  return { ok: true, token };
}

export async function completePasswordReset(
  token: string,
  newPassword: string,
): Promise<boolean> {
  const rows = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);
  const user = rows[0];
  if (!user) return false;
  if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
    return false;
  }
  await db
    .update(users)
    .set({ passwordHash: hashPassword(newPassword), resetToken: null, resetTokenExpiresAt: null })
    .where(eq(users.id, user.id));
  return true;
}

export async function logActivity(
  user: AdminUser | null,
  action: string,
  entity: string,
  entityLabel = "",
): Promise<void> {
  try {
    await db.insert(activityLog).values({
      userId: user?.id ?? null,
      actorName: user?.name ?? "system",
      action,
      entity,
      entityLabel,
    });
  } catch {
    /* logging must never break a request */
  }
}
