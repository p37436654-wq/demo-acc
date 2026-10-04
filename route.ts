import { NextResponse } from "next/server";
import { z } from "zod";
import {
  changePassword,
  completePasswordReset,
  getCurrentUser,
  login,
  logout,
  requestPasswordReset,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Use at least 8 characters."),
});

const resetRequestSchema = z.object({ email: z.string().email() });
const resetCompleteSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8, "Use at least 8 characters."),
});

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (action === "login") {
    const parsed = credentialsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const user = await login(parsed.data.email, parsed.data.password);
    if (!user) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    return NextResponse.json({ user });
  }

  if (action === "logout") {
    await logout();
    return NextResponse.json({ ok: true });
  }

  if (action === "password") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    const parsed = changeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const result = await changePassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "reset-request") {
    const parsed = resetRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    const result = await requestPasswordReset(parsed.data.email);
    if (!result.ok) {
      return NextResponse.json({ error: "No administrator account uses that email." }, { status: 404 });
    }
    // No mail transport is configured for this demo, so the token is returned
    // directly to the requester instead of being emailed.
    return NextResponse.json({ ok: true, token: result.token, delivery: "on-screen" });
  }

  if (action === "reset-complete") {
    const parsed = resetCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
    }
    const ok = await completePasswordReset(parsed.data.token, parsed.data.newPassword);
    if (!ok) return NextResponse.json({ error: "This reset link has expired." }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 404 });
}
