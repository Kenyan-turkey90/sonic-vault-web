import { NextResponse, type NextRequest } from "next/server";

import {
  anonymizeIp,
  clamp,
  extractClientIp,
  isPlatform,
} from "@/lib/analytics";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/download?platform=android|ios   (also accepts form-encoded body)
 *
 * Records a download click in `app_downloads` (with an anonymized IP) and
 * then 302-redirects the visitor to the real download target:
 *
 *   android -> GitHub Releases "latest" APK asset (env: DOWNLOAD_URL_ANDROID)
 *   ios     -> App Store link                    (env: DOWNLOAD_URL_IOS)
 *
 * The landing page posts a native <form> here, so the redirect works even
 * with JavaScript disabled. Responses are never cached.
 */

export const dynamic = "force-dynamic";

const DEFAULT_ANDROID_URL =
  "https://github.com/Kenyan-turkey90/sonic-vault/releases/latest/download/app-gms-mobile-armeabi-release.apk";

// Placeholder until the iOS build ships — swap via env var.
const DEFAULT_IOS_URL =
  "https://github.com/Kenyan-turkey90/sonic-vault/releases";

/** Read an optional URL env var; blank/unset falls back to the default. */
function envUrl(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export async function POST(request: NextRequest) {
  const platform = await resolvePlatform(request);
  if (!isPlatform(platform)) {
    return NextResponse.json(
      { error: "platform must be 'android' or 'ios'" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // supabase-js returns errors instead of throwing — always inspect them.
    const { error } = await supabase.from("app_downloads").insert({
      platform,
      ip_address: anonymizeIp(extractClientIp(request.headers)),
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    // Log but still redirect: losing a stat beats blocking a download.
    console.error("[download] insert failed:", error);
  }

  const target =
    platform === "android"
      ? envUrl("DOWNLOAD_URL_ANDROID", DEFAULT_ANDROID_URL)
      : envUrl("DOWNLOAD_URL_IOS", DEFAULT_IOS_URL);

  return NextResponse.redirect(target, {
    status: 302,
    headers: { "cache-control": "no-store" },
  });
}

/**
 * Platform resolution order:
 *  1. ?platform= query param        (curl-friendly)
 *  2. urlencoded/multipart form body (the no-JS <form> on the landing page)
 */
async function resolvePlatform(request: NextRequest): Promise<string | null> {
  const fromQuery = request.nextUrl.searchParams.get("platform");
  if (fromQuery) return clamp(fromQuery)?.toLowerCase() ?? null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("form")) {
    const form = await request.formData();
    return clamp(form.get("platform") as string | null)?.toLowerCase() ?? null;
  }

  return null;
}
