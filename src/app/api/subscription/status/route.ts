import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { TIER, PLAN_FEATURES, type PlanId } from "@/lib/tiers";

/**
 * GET /api/subscription/status?device_id=xxx
 *
 * Returns the full subscription + tier info for the Android app.
 * Response shape:
 *   {
 *     device_id: string,
 *     plan_id: "free" | "basic" | "pro" | "premium",
 *     tier_level: 0 | 1 | 2 | 3,
 *     status: "active" | "expired" | "cancelled" | "free",
 *     current_period_end: string | null,
 *     features: string[],
 *     ad_free: boolean,
 *     video_enabled: boolean,
 *     hosting_enabled: boolean,
 *     hosting_limit_gb: number | null,
 *   }
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("device_id");
  if (!deviceId) {
    return NextResponse.json({ error: "device_id required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("subscriptions")
      .select("id, plan_id, status, current_period_end, created_at")
      .eq("device_id", deviceId)
      .in("status", ["active", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // No subscription = free tier
    if (!data) {
      return NextResponse.json({
        device_id: deviceId,
        plan_id: "free",
        tier_level: TIER.free.level,
        status: "free",
        current_period_end: null,
        features: PLAN_FEATURES.free,
        ad_free: false,
        video_enabled: false,
        hosting_enabled: false,
        hosting_limit_gb: null,
      });
    }

    // Check if expired
    if (new Date(data.current_period_end) < new Date()) {
      await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", data.id);

      return NextResponse.json({
        device_id: deviceId,
        plan_id: "free",
        tier_level: TIER.free.level,
        status: "expired",
        current_period_end: data.current_period_end,
        features: PLAN_FEATURES.free,
        ad_free: false,
        video_enabled: false,
        hosting_enabled: false,
        hosting_limit_gb: null,
      });
    }

    const planId = data.plan_id as PlanId;
    const tier = TIER[planId] ?? TIER.free;
    const features = PLAN_FEATURES[planId] ?? PLAN_FEATURES.free;

    return NextResponse.json({
      device_id: deviceId,
      plan_id: data.plan_id,
      tier_level: tier.level,
      status: data.status,
      current_period_end: data.current_period_end,
      features,
      ad_free: features.includes("no-ads"),
      video_enabled: features.includes("video"),
      hosting_enabled: features.includes("cloud-sync"),
      hosting_limit_gb: features.includes("unlimited-hosting")
        ? null
        : features.includes("5gb-hosting")
        ? 5
        : 0,
    });
  } catch (error) {
    console.error("[subscription/status GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 },
    );
  }
}
