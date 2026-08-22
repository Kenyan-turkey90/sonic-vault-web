/**
 * Subscription tier system for Sonic Vault.
 *
 * Tier hierarchy: free < basic < pro < premium
 *
 * Usage in app code:
 *   const tier = getTierFromPlan("pro");
 *   if (tier.level >= TIER.basic.level) { // has basic or above }
 *
 * Or use the convenience booleans:
 *   if (hasAccess(tier, "video")) { // can play video }
 */

export const TIER = {
  free:    { level: 0, label: "Free",    price: "$0",  priceCents: 0 },
  basic:   { level: 1, label: "Basic",   price: "$2",  priceCents: 200 },
  pro:     { level: 2, label: "Pro",     price: "$5",  priceCents: 500 },
  premium: { level: 3, label: "Premium", price: "$10", priceCents: 1000 },
} as const;

export type PlanId = keyof typeof TIER;
export type TierLevel = (typeof TIER)[PlanId];

/** Feature flags per plan (mirrors the plans table seed data). */
const PLAN_FEATURES: Record<PlanId, string[]> = {
  free:    ["audio", "ads", "basic-themes", "offline-queue"],
  basic:   ["audio", "no-ads", "lyrics", "equalizer", "offline-download"],
  pro:     ["audio", "video", "no-ads", "lyrics", "equalizer", "offline-download", "cloud-sync", "5gb-hosting"],
  premium: ["audio", "video", "no-ads", "lyrics", "equalizer", "offline-download", "cloud-sync", "unlimited-hosting", "custom-themes", "priority-support", "api-access"],
};

/** Get tier metadata from a plan ID string. */
export function getTierFromPlan(planId: string | null | undefined): TierLevel {
  if (planId && planId in TIER) return TIER[planId as PlanId];
  return TIER.free;
}

/** Check if a tier has a specific feature. */
export function hasAccess(tier: TierLevel, feature: string): boolean {
  const planId = Object.keys(TIER).find(
    (k) => TIER[k as PlanId].level === tier.level,
  ) as PlanId | undefined;
  if (!planId) return false;
  return PLAN_FEATURES[planId].includes(feature);
}

/** Check if a tier has ad-free playback. */
export function isAdFree(tier: TierLevel): boolean {
  return tier.level >= TIER.basic.level;
}

/** Check if a tier can play video. */
export function canPlayVideo(tier: TierLevel): boolean {
  return tier.level >= TIER.pro.level;
}

/** Check if a tier has hosting. */
export function hasHosting(tier: TierLevel): boolean {
  return tier.level >= TIER.pro.level;
}

/** Get the human-readable feature list for a plan. */
export function getPlanFeatures(planId: PlanId): string[] {
  return PLAN_FEATURES[planId];
}
