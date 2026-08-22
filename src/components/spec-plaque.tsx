/**
 * Spec Plaque — a riveted data plate like those found on real bank vaults.
 * Reads: "DOOR CLASS M-120 · LOCAL FILES ONLY · ZERO TELEMETRY · OFFLINE PLAYBACK"
 * with version and architecture info below.
 */
export function SpecPlaque() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
      <div className="relative rounded border border-[#2A2A2E] bg-[#17171A] px-5 py-3 sm:px-8 sm:py-4">
        {/* corner rivets */}
        <Rivet className="absolute top-2 left-2" />
        <Rivet className="absolute top-2 right-2" />
        <Rivet className="absolute bottom-2 left-2" />
        <Rivet className="absolute bottom-2 right-2" />

        {/* main plate text */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] sm:text-xs tracking-[0.12em] text-[#B0A89C] uppercase">
          <span className="text-[#D9A441] font-semibold">Door Class M-120</span>
          <span className="text-[#2A2A2E]">|</span>
          <span>Local files only</span>
          <span className="text-[#2A2A2E]">|</span>
          <span>Zero telemetry</span>
          <span className="text-[#2A2A2E]">|</span>
          <span>Offline playback</span>
        </div>

        {/* secondary line: version + arch */}
        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 font-mono text-[9px] sm:text-[10px] tracking-wider text-[#8A6A24]/60">
          <span>v14.0.13</span>
          <span className="text-[#2A2A2E]">·</span>
          <span>arm64-v8a</span>
          <span className="text-[#2A2A2E]">/</span>
          <span>armeabi-v7a</span>
          <span className="text-[#2A2A2E]">·</span>
          <span>SHA-256 verified</span>
        </div>
      </div>
    </div>
  );
}

function Rivet({ className }: { className?: string }) {
  return (
    <span className={`block size-2 rounded-full bg-[#2A2A2E] ring-1 ring-[#17171A] ${className}`} />
  );
}
