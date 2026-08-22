import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/subscriptions?device_id=xxx
 *   Returns the active subscription for a device (or free tier fallback).
 *
 * POST /api/subscriptions
 *   Body: { device_id, plan_id }
 *   Creates or upgrades a subscription. For free tier, sets status='active'
 *   with no payment. For paid tiers, a real Stripe checkout would go here;
 *   for now we activate immediately so the UI works end-to-end.
 *
 * DELETE /api/subscriptions?device_id=xxx
 *   Cancels the active subscription (sets status='cancelled').
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
        plan_id: "free",
        status: "active",
        features: ["audio", "ads", "basic-themes", "offline-queue"],
      });
    }

    // Check if expired
    if (new Date(data.current_period_end) < new Date()) {
      await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", data.id);
      return NextResponse.json({
        plan_id: "free",
        status: "active",
        features: ["audio", "ads", "basic-themes", "offline-queue"],
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[subscriptions GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_id, plan_id } = body;

    if (!device_id || !plan_id) {
      return NextResponse.json(
        { error: "device_id and plan_id required" },
        { status: 400 },
      );
    }

    const validPlans = ["free", "basic", "pro", "premium"];
    if (!validPlans.includes(plan_id)) {
      return NextResponse.json(
        { error: `plan_id must be one of: ${validPlans.join(", ")}` },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Cancel any existing active subscription for this device
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("device_id", device_id)
      .in("status", ["active", "past_due"]);

    // Free tier: just return (no row needed)
    if (plan_id === "free") {
      return NextResponse.json({
        plan_id: "free",
        status: "active",
        features: ["audio", "ads", "basic-themes", "offline-queue"],
      });
    }

    // Paid tier: create subscription (normally gated by Stripe webhook)
    // For demo purposes, activate immediately.
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        device_id,
        plan_id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select("id, plan_id, status, current_period_end")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[subscriptions POST]", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get("device_id");
  if (!deviceId) {
    return NextResponse.json({ error: "device_id required" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("device_id", deviceId)
      .in("status", ["active", "past_due"]);

    if (error) throw new Error(error.message);

    return NextResponse.json({ plan_id: "free", status: "active" });
  } catch (error) {
    console.error("[subscriptions DELETE]", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
