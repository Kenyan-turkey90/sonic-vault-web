/**
 * Shared helpers for the analytics API routes.
 */

/** Tables written to by the tracking endpoints. */
export type DownloadPlatform = "android" | "ios";

/** Max stored length for header-derived strings (defensive truncation). */
const MAX_TEXT_LENGTH = 512;

/** Truncate untrusted strings before persisting them. */
export function clamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, MAX_TEXT_LENGTH);
}

/**
 * Anonymize an IP address before it touches the database:
 *   IPv4 -> last octet zeroed        (203.0.113.45 -> 203.0.113.0)
 *   IPv6 -> zeroed beyond /64-ish    (approximate; never store a full address)
 * Returns null when no usable IP is present.
 */
export function anonymizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;

  // x-forwarded-for can be a chain: take the first (client) entry.
  const ip = raw.split(",")[0]?.trim().replace(/^\[|\]$/g, "");
  if (!ip) return null;

  // Plain IPv4
  if (ip.includes(".") && !ip.includes(":")) {
    const parts = ip.split(".");
    if (parts.length !== 4 || parts.some((p) => p === "")) return null;
    parts[3] = "0";
    return parts.join(".");
  }

  // IPv6: keep at most the first four meaningful hextets, drop the rest.
  // Approximation is intentional — privacy over precision.
  const kept = ip.split(":").filter((g) => g !== "").slice(0, 4);
  if (kept.length < 2) return null;
  return `${kept.join(":")}::`;
}

/**
 * Best-effort client IP extraction behind Vercel/CDN proxies.
 */
export function extractClientIp(headers: Headers): string | null {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for") ??
    headers.get("x-vercel-forwarded-for")
  );
}

export function isPlatform(value: unknown): value is DownloadPlatform {
  return value === "android" || value === "ios";
}
