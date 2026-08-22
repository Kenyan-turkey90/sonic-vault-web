import Link from "next/link";

import { DownloadButton } from "@/components/download-button";
import { VisitTracker } from "@/components/visit-tracker";

/**
 * Public landing page.
 *  - <VisitTracker /> beacons GET /api/track-visit once on load.
 *  - The CTA is a native POST form to /api/download (works without JS).
 */
export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* ambient emerald glow behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"
      />

      <VisitTracker />

      {/* ── nav ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-zinc-900">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <VaultMark />
            Sonic Vault
          </Link>
          <div className="flex items-center gap-5 text-sm text-zinc-400">
            <a
              href="https://github.com/Kenyan-turkey90/sonic-vault"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-zinc-100"
            >
              GitHub
            </a>
            <Link href="/admin" className="transition hover:text-emerald-400">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* ── hero ────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-center md:py-32">
        <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          v14 · Now shipping on Android
        </p>

        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
          Your music.
          <br />
          Sealed in the{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
            vault
          </span>
          .
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
          Sonic Vault is a free, open-source player built for people who own their
          library. Offline-first playback, lyric-aware UI, and zero telemetry —
          everything stays on your device where it belongs.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <DownloadButton platform="android" />
          <a
            href="https://github.com/Kenyan-turkey90/sonic-vault"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
          >
            View source
          </a>
        </div>

        <p className="mt-6 text-xs tracking-wide text-zinc-500">
          Free &amp; open source · No account · No tracking
        </p>
      </section>

      {/* ── features ────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto grid w-full max-w-5xl gap-4 px-6 pb-20 sm:grid-cols-3">
        <FeatureCard
          title="Offline-first"
          body="Your entire library lives on-device. No cloud lock-in, no streaming fees, no dead playlists when the internet dies."
          icon={<DiscIcon />}
          tone="emerald"
        />
        <FeatureCard
          title="Vault-grade privacy"
          body="Zero analytics inside the app and nothing leaves your phone. This site collects a single anonymous visit counter — that's it."
          icon={<ShieldIcon />}
          tone="amber"
        />
        <FeatureCard
          title="Tuned by you"
          body="Adaptive themes, synced lyrics, tag editing, and an equalizer that respects your ears. Built in the open, shaped by its users."
          icon={<SlidersIcon />}
          tone="emerald"
        />
      </section>

      {/* ── footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Sonic Vault</span>
          <a
            href="https://github.com/Kenyan-turkey90/sonic-vault/issues"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-zinc-400"
          >
            Report an issue
          </a>
        </div>
      </footer>
    </main>
  );
}

/* ── small local pieces ──────────────────────────────────────────────── */

const TONES = {
  emerald: {
    ring: "border-emerald-500/15 bg-emerald-500/[0.06]",
    glyph: "text-emerald-400",
  },
  amber: {
    ring: "border-amber-500/15 bg-amber-500/[0.06]",
    glyph: "text-amber-400",
  },
} as const;

function FeatureCard({
  title,
  body,
  icon,
  tone,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  tone: keyof typeof TONES;
}) {
  return (
    <article className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition hover:border-zinc-700/80">
      <div
        className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg border ${TONES[tone].ring} ${TONES[tone].glyph}`}
      >
        {icon}
      </div>
      <h2 className="font-semibold text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
    </article>
  );
}

function VaultMark() {
  return (
    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
      {/* padlock / vault door mark */}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}

const ICON_CLASS = "size-5";

function DiscIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={ICON_CLASS} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3a9 9 0 0 1 9 9" opacity="0.45" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={ICON_CLASS} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={ICON_CLASS} aria-hidden="true">
      <path d="M5 21v-7m0-4V3m7 18v-9m0-4V3m7 18v-5m0-4V3" />
      <path d="M3 14h4m3-4h4m3 6h4" opacity="0.55" />
    </svg>
  );
}
