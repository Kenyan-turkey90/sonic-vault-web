import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Read models powering the /admin dashboard.
 * All queries run server-side via the service-role client (RLS bypass).
 */

export type DayBucket = { date: string; visits: number; downloads: number };

export type RecentDownload = {
  id: number;
  platform: string;
  ip_address: string | null;
  created_at: string;
};

export type SubscriptionBreakdown = {
  plan_id: string;
  count: number;
  revenue: number;
};

export type VaultStats = {
  totalVisits: number;
  totalDownloads: number;
  androidDownloads: number;
  iosDownloads: number;
  daily: DayBucket[];
  recentDownloads: RecentDownload[];
  totalSubscriptions: number;
  activeSubscriptions: number;
  subscriptionBreakdown: SubscriptionBreakdown[];
  mrr: number;
};

const DAYS_SHOWN = 14;

/** Midnight (UTC) N days before today, as an ISO timestamp. */
function windowStartIso(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/** YYYY-MM-DD key for a timestamp (UTC, matches the bucket labels). */
function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

async function countRows(table: "website_visits" | "app_downloads"): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`${table} count failed: ${error.message}`);
  return count ?? 0;
}

export async function getVaultStats(): Promise<VaultStats> {
  const supabase = getSupabaseAdmin();

  // ── headline counters ────────────────────────────────────────────────
  const [totalVisits, totalDownloads] = await Promise.all([
    countRows("website_visits"),
    countRows("app_downloads"),
  ]);

  // ── per-platform split ───────────────────────────────────────────────
  const [androidRes, iosRes] = await Promise.all([
    supabase
      .from("app_downloads")
      .select("*", { count: "exact", head: true })
      .eq("platform", "android"),
    supabase
      .from("app_downloads")
      .select("*", { count: "exact", head: true })
      .eq("platform", "ios"),
  ]);
  if (androidRes.error || iosRes.error) {
    throw new Error(
      "platform split failed: " +
        (androidRes.error?.message ?? iosRes.error?.message ?? ""),
    );
  }

  // ── 14-day activity series ───────────────────────────────────────────
  const since = windowStartIso(DAYS_SHOWN - 1);
  const [visitSeries, downloadSeries] = await Promise.all([
    supabase.from("website_visits").select("created_at").gte("created_at", since),
    supabase.from("app_downloads").select("created_at").gte("created_at", since),
  ]);
  if (visitSeries.error || downloadSeries.error) {
    throw new Error(
      "series query failed: " +
        (visitSeries.error?.message ?? downloadSeries.error?.message ?? ""),
    );
  }

  // Pre-seed every day so the chart has no gaps.
  const buckets = new Map<string, DayBucket>();
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, visits: 0, downloads: 0 });
  }

  for (const row of visitSeries.data ?? []) {
    const b = buckets.get(dayKey(row.created_at));
    if (b) b.visits += 1;
  }
  for (const row of downloadSeries.data ?? []) {
    const b = buckets.get(dayKey(row.created_at));
    if (b) b.downloads += 1;
  }

  // ── most recent download events ──────────────────────────────────────
  const recent = await supabase
    .from("app_downloads")
    .select("id, platform, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (recent.error) throw new Error(`recent downloads failed: ${recent.error.message}`);

  // ── subscription stats ──────────────────────────────────────────────
  const [totalSubs, activeSubs] = await Promise.all([
    supabase.from("subscriptions").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);
  if (totalSubs.error || activeSubs.error) {
    throw new Error(
      "subscription stats failed: " +
        (totalSubs.error?.message ?? activeSubs.error?.message ?? ""),
    );
  }

  // Per-plan breakdown with revenue
  const PLAN_PRICES: Record<string, number> = {
    free: 0,
    basic: 2,
    pro: 5,
    premium: 10,
  };
  const planIds = ["free", "basic", "pro", "premium"];
  const breakdownResults = await Promise.all(
    planIds.map(async (pid) => {
      const { count } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("plan_id", pid)
        .eq("status", "active");
      return {
        plan_id: pid,
        count: count ?? 0,
        revenue: (count ?? 0) * (PLAN_PRICES[pid] ?? 0),
      };
    }),
  );

  const mrr = breakdownResults.reduce((sum, b) => sum + b.revenue, 0);

  return {
    totalVisits,
    totalDownloads,
    androidDownloads: androidRes.count ?? 0,
    iosDownloads: iosRes.count ?? 0,
    daily: [...buckets.values()],
    recentDownloads: (recent.data as RecentDownload[]) ?? [],
    totalSubscriptions: totalSubs.count ?? 0,
    activeSubscriptions: activeSubs.count ?? 0,
    subscriptionBreakdown: breakdownResults,
    mrr,
  };
}
