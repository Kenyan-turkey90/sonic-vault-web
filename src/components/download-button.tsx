/**
 * Download CTA — direct APK download from GitHub releases.
 */
export function DownloadButton() {
  return (
    <form action="/api/download" method="POST">
      <input type="hidden" name="platform" value="android" />
      <button
        type="submit"
        className="group relative inline-flex flex-col items-center gap-1 rounded border border-[#10B981]/30 bg-[#10B981]/10 px-7 py-3.5
                   font-semibold text-[#10B981] transition
                   hover:border-[#10B981]/50 hover:bg-[#10B981]/20 hover:shadow-[0_0_24px_rgba(16,185,129,0.15)]
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10B981]
                   active:scale-[0.98]"
      >
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 transition-transform group-hover:translate-y-0.5"
            aria-hidden="true"
          >
            <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          Download Free
        </span>
        <span className="font-mono text-[10px] font-normal tracking-wider text-[#10B981]/60">
          Android APK — no account needed
        </span>
      </button>
    </form>
  );
}
