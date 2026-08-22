import { NextResponse } from "next/server";

import { clamp } from "@/lib/analytics";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/track-visit
 *
 * Landing-page visit beacon. Called once per page load by <VisitTracker />.
 * Records the visitor's User-Agent and Referer into `website_visits`.
 *
 * Design notes:
 *  - force-dynamic so Next never caches the response (each visit counts).
 *  - Always answers 204 quickly and swallows DB errors: analytics must
 *    never break the page that loads it.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();

    // supabase-js returns errors instead of throwing — always inspect them.
    const { error } = await supabase.from("website_visits").insert({
      user_agent: clamp(request.headers.get("user-agent")),
      referrer: clamp(request.headers.get("referer")),
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    // Never surface analytics failures to the client.
    console.error("[track-visit] insert failed:", error);
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}
