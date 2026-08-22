import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { TIER, type PlanId } from "@/lib/tiers";

/**
 * GET /api/ads/config?device_id=xxx
 *
 * Returns ad-serving configuration for the Android app.
 * Free tier sees ads; paid tiers get ad-free playback.
 *
 * Response shape:
 *   {
 *     device_id: string,
 *     show_ads: boolean,
 *     ad_provider: "google_admob" | null,
 *     ad_unit_id: string | null,          // AdMob unit ID
 *     interstitial_frequency: number,      // show interstitial every N tracks
 *     banner_enabled: boolean,
 *     rewarded_enabled: boolean,           // allow rewarded ads for extra features
 *     tier_level: number,
 *   }
 */

export const dynamic = "force-dynamic";

// AdMob unit IDs — replace with real IDs before production
const ADMOB_APP_ID = "ca-app-pub-3940256099942544~3347511713"; // test ID
const ADMOB_BANNER = "ca-app-pub-3940256099942544/6300978111";   // test ID
const ADMOB_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712"; // test ID
const ADMOB_REWARDED = "ca-app-pub-3940256099942544/5224354917";  // test ID

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("device_id");
  if (!deviceId) {
    return NextResponse.json({ error: "device_id required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan_id, status, current_period_end")
      .eq("device_id", deviceId)
      .in("status", ["active", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);

    let planId: PlanId = "free";
    let tierLevel = 0;
    let showAds = true;

    if (data) {
      const isExpired = new Date(data.current_period_end) < new Date();
      if (!isExpired) {
        planId = (data.plan_id as PlanId) ?? "free";
        tierLevel = TIER[planId]?.level ?? 0;
        showAds = tierLevel === 0; // free tier only
      }
    }

    // Free tier: show banner + interstitial every 5 tracks, allow rewarded ads
    // Paid tiers: no ads at all
    return NextResponse.json({
      device_id: deviceId,
      show_ads: showAds,
      ad_provider: showAds ? "google_admob" : null,
      app_id: showAds ? ADMOB_APP_ID : null,
      ad_unit_id: showAds ? ADMOB_BANNER : null,
      interstitial_ad_unit_id: showAds ? ADMOB_INTERSTITIAL : null,
      rewarded_ad_unit_id: showAds ? ADMOB_REWARDED : null,
      interstitial_frequency: showAds ? 5 : 0,   // every 5 tracks
      banner_enabled: showAds,
      rewarded_enabled: showAds,                   // rewarded ads for free users to unlock temp ad-free
      tier_level: tierLevel,
      plan_id: planId,
    });
  } catch (error) {
    console.error("[ads/config GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch ad config" },
      { status: 500 },
    );
  }
}
