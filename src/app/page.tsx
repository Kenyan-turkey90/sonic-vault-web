import Link from "next/link";

import { DownloadButton } from "@/components/download-button";
import { VisitTracker } from "@/components/visit-tracker";
import { VaultDial } from "@/components/vault-dial";
import { SpecPlaque } from "@/components/spec-plaque";
import { DepositLedger } from "@/components/deposit-ledger";

/**
 * Landing page — the vault door.
 *
 * Composition:
 *  - Asymmetric hero: left = oversized engraved headline + mono eyebrow
 *    + download CTA; right = interactive brass vault dial.
 *  - Below hero: riveted spec-plaque data plate.
 *  - Features: deposit ledger (ruled bank-paper table).
 *  - Footer: brass rule + mono legal plate.
 *
 * Functional requirements (from original brief, preserved):
 *  - VisitTracker fires GET /api/track-visit on load.
 *  - DownloadButton is a native <form> POSTing /api/download.
 */
export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <VisitTracker />

      {/* ── nav ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-[#2A2A2E]">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-big-shoulders)] text-lg font-bold uppercase tracking-[0.06em] text-[#E9E4D8]"
          >
            <VaultMark />
            Sonic Vault
          </Link>
          <div className="flex items-center gap-6 font-mono text-xs tracking-wider text-[#8A6A24] uppercase">
            <a
              href="https://github.com/Kenyan-turkey90/sonic-vault"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[#D9A441]"
            >
              GitHub
            </a>
            <Link href="/login" className="transition hover:text-[#D9A441]">
              Log in
            </Link>
            <Link href="/admin" className="transition hover:text-[#10B981]">
              Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* ── hero ────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-6 py-16 sm:py-20 md:flex-row md:items-center md:gap-0 md:py-24">
        {/* left column — engraved headline */}
        <div className="flex-1 space-y-6 md:pr-8">
          {/* eyebrow */}
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs tracking-[0.2em] text-[#8A6A24] uppercase animate-fade-in-up">
            <span className="inline-block size-1.5 rounded-full bg-[#D9A441]" />
            Sonic Vault
            <span className="text-[#2A2A2E]">&middot;</span>
            Release v14
          </div>

          {/* main headline */}
          <h1
            className="font-[family-name:var(--font-big-shoulders)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-[-0.01em] text-[#E9E4D8] engrave animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Your music.
            <br />
            Sealed in the{" "}
            <span className="text-[#D9A441]">vault</span>.
          </h1>

          {/* body copy */}
          <p
            className="max-w-md text-sm sm:text-base leading-relaxed text-[#B0A89C] animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            A free player built for people who own their library.
            Offline-first, zero telemetry, and everything stays on your device
            where it belongs.
          </p>

          {/* download CTA */}
          <div
            className="flex flex-wrap items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <DownloadButton />
          </div>
        </div>

        {/* right column — vault dial */}
        <div className="flex flex-1 items-center justify-center md:justify-end animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <VaultDial />
        </div>
      </section>

      {/* ── spec plaque ─────────────────────────────────────────────── */}
      <SpecPlaque />

      {/* ── deposit ledger ──────────────────────────────────────────── */}
      <section className="relative z-10 w-full py-16 sm:py-20">
        <DepositLedger />
      </section>

      {/* ── footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#2A2A2E]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-6 py-8 sm:flex-row sm:justify-between">
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8A6A24]/50">
              Sonic Vault &middot; Built for music lovers
            </span>
          <a
            href="https://github.com/Kenyan-turkey90/sonic-vault"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8A6A24]/50 transition hover:text-[#D9A441]"
          >
            github.com/kenyan-turkey90/sonic-vault
          </a>
        </div>
      </footer>
    </main>
  );
}

function VaultMark() {
  return (
    <span className="inline-flex size-7 items-center justify-center rounded bg-[#D9A441]/15 text-[#D9A441]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden="true"
      >
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}
