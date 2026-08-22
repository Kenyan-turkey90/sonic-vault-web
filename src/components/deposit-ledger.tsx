/**
 * Deposit Ledger — features section styled as bank ledger paperwork.
 * Each feature is a ruled row with slip number, name, description,
 * and a stamped status chip. Subject-true: real vault deposits are
 * recorded in ruled ledgers with sequential slip numbers.
 */

const SLIPS = [
  {
    id: "001",
    feature: "OFFLINE LIBRARY",
    desc: "Your music lives on your device. No cloud lock-in, no streaming fees, no dead playlists when the signal dies.",
    chip: "OFFLINE",
    chipTone: "emerald",
  },
  {
    id: "002",
    feature: "VAULT-GRADE PRIVACY",
    desc: "Zero analytics inside the app. Nothing leaves your phone. This site collects a single anonymous visit counter — that's it.",
    chip: "NO ACCOUNT",
    chipTone: "brass",
  },
  {
    id: "003",
    feature: "OPEN RELEASE",
    desc: "Buildable by anyone. SHA-256 verified APKs, reproducible builds, full changelog with every release.",
    chip: "OPEN SOURCE",
    chipTone: "emerald",
  },
  {
    id: "004",
    feature: "ADAPTIVE AUDIO",
    desc: "Theming, synced lyrics, tag editing, and an equalizer that respects your ears. Built in the open, shaped by users.",
    chip: "THEMABLE",
    chipTone: "brass",
  },
];

const CHIP_STYLES: Record<string, string> = {
  emerald:
    "border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]",
  brass:
    "border-[#D9A441]/30 bg-[#D9A441]/10 text-[#D9A441]",
};

export function DepositLedger() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6">
      {/* section eyebrow */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D9A441]/30 to-transparent" />
        <h2
          className="font-[family-name:var(--font-big-shoulders)] text-2xl sm:text-3xl font-bold uppercase tracking-[0.08em] text-[#D9A441]"
        >
          Deposit Ledger
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D9A441]/30 to-transparent" />
      </div>

      {/* ledger header row */}
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[60px_1fr_120px] gap-x-4 border-b border-[#D9A441]/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#8A6A24]">
        <span className="hidden sm:block">SLIP</span>
        <span>FEATURE</span>
        <span>STATUS</span>
      </div>

      {/* ledger rows */}
      <div className="divide-y divide-[#2A2A2E]/60">
        {SLIPS.map((slip, i) => (
          <div
            key={slip.id}
            className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[60px_1fr_120px] gap-x-4 px-3 py-4 sm:py-5 transition-colors hover:bg-[#1F1F23]/40"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* slip number */}
            <span className="font-mono text-xs text-[#8A6A24]/60 tabular-nums pt-0.5">
              {slip.id}
            </span>

            {/* feature + desc */}
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-big-shoulders)] text-sm sm:text-base font-bold uppercase tracking-[0.06em] text-[#E9E4D8]">
                {slip.feature}
              </h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#B0A89C] line-clamp-2">
                {slip.desc}
              </p>
            </div>

            {/* stamp chip */}
            <div className="flex items-start justify-end">
              <span
                className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider whitespace-nowrap ${CHIP_STYLES[slip.chipTone]}`}
              >
                {slip.chip}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ledger footer rule */}
      <div className="h-px bg-[#D9A441]/20" />
    </section>
  );
}
