import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

/**
 * Placeholder admin auth for the /admin dashboard.
 *
 * Stage 1 (this file): a single shared password from ADMIN_PASSWORD is
 * checked by a server action; success sets an httpOnly cookie holding
 * sha256("sv:"+password). The dashboard only renders when the cookie value
 * matches — the password itself never reaches the browser bundle.
 *
 * Stage 2 (production): swap for Supabase Auth / OAuth without touching UI.
 */

export const ADMIN_COOKIE = "sv_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/** Deterministic session token derived from the configured password. */
export function deriveAdminToken(password: string): string {
  return createHash("sha256").update(`sv:${password}`).digest("hex");
}

/** True when the request carries a valid admin session cookie. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const store = await cookies();
  const cookie = store.get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;

  const expectedToken = deriveAdminToken(expected);
  return safeEqual(cookie, expectedToken);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
