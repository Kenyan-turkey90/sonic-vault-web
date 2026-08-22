import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { LoginForm } from "@/app/admin/login-form";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getVaultStats, type VaultStats } from "@/lib/stats";

/**
 * Admin dashboard — /admin
 *
 * Gate: renders the password screen unless a valid session cookie exists
 * (see lib/admin-auth.ts). Stats are fetched server-side with the
 * service-role key and never exposed pre-auth.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-6">
        <LoginForm />
        <Link href="/" className="mt-8 text-xs text-zinc-600 transition hover:text-zinc-400">
          ← Back to Sonic Vault
        </Link>
      </main>
    );
  }

  let stats: VaultStats | null = null;
  let loadError: string | null = null;
  try {
    stats = await getVaultStats();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown error";
  }

  return (
    <main className="min-h-dvh bg-zinc-950">
      {/* ── top bar ─────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-900">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
              Vault Analytics
            </h1>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-zinc-400 transition hover:text-zinc-100">
              Site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-8">
        {loadError && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Could not load stats: {loadError}
          </p>
        )}

        {stats && (
          <>
            {/* ── headline cards ─────────────────────────────────────── */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Website visits" value={stats.totalVisits} tone="zinc" />
              <StatCard label="Total downloads" value={stats.totalDownloads} tone="emerald" />
              <StatCard label="Android" value={stats.androidDownloads} tone="emerald" hint="APK clicks" />
              <StatCard
                label="Conversion rate"
                value={
                  stats.totalVisits > 0
                    ? `${((stats.totalDownloads / stats.totalVisits) * 100).toFixed(1)}%`
                    : "—"
                }
                tone="amber"
                hint="visits → downloads"
              />
            </section>

            {/* ── 14-day activity chart ──────────────────────────────── */}
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-200">Last 14 days</h2>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <Legend colorClass="bg-zinc-600" label="Visits" />
                  <Legend colorClass="bg-emerald-500" label="Downloads" />
                </div>
              </div>
              <ActivityChart daily={stats.daily} />
            </section>

            {/* ── recent downloads table ─────────────────────────────── */}
            <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
              <h2 className="border-b border-zinc-800/80 px-6 py-4 text-sm font-semibold text-zinc-200">
                Recent downloads
              </h2>
              {stats.recentDownloads.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-zinc-500">
                  No downloads recorded yet — go click the big green button.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs tracking-wider text-zinc-500 uppercase">
                      <th className="px-6 py-3 font-medium">Platform</th>
                      <th className="px-6 py-3 font-medium">IP (anonymized)</th>
                      <th className="px-6 py-3 text-right font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {stats.recentDownloads.map((row) => (
                      <tr key={row.id} className="text-zinc-300">
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              row.platform === "android"
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/25 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {row.platform}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs text-zinc-500">
                          {row.ip_address ?? "unknown"}
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs text-zinc-400">
                          {timeAgo(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* ── presentational helpers ─────────────────────────────────────────── */

const CARD_TONES = {
  zinc: "text-zinc-100",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
} as const;

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  tone: keyof typeof CARD_TONES;
  hint?: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${CARD_TONES[tone]}`}>
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-600">{hint}</p>}
    </article>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-sm ${colorClass}`} />
      {label}
    </span>
  );
}

function ActivityChart({ daily }: { daily: VaultStats["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => Math.max(d.visits, d.downloads)));

  return (
    <div className="flex h-36 items-end justify-between gap-1.5 sm:gap-2.5">
      {daily.map((day) => (
        <div key={day.date} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <div className="flex h-full w-full items-end justify-center gap-1">
            <div
              title={`${day.date}: ${day.visits} visits`}
              style={{ height: `${(day.visits / max) * 100}%` }}
              className="w-full max-w-3 rounded-t-sm bg-zinc-600 transition group-hover:bg-zinc-500"
            />
            <div
              title={`${day.date}: ${day.downloads} downloads`}
              style={{ height: `${Math.max(day.downloads > 0 ? 6 : 0, (day.downloads / max) * 100)}%` }}
              className="w-full max-w-3 rounded-t-sm bg-emerald-500 transition group-hover:bg-emerald-400"
            />
          </div>
          <span className="text-[9px] whitespace-nowrap text-zinc-600 tabular-nums sm:text-[10px]">
            {day.date.slice(8)}
          </span>
        </div>
      ))}
    </div>
  );
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
