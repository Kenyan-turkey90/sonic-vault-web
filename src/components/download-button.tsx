/**
 * Download CTA — a native HTML form POSTing to /api/download.
 *
 * Using a real <form> (instead of fetch) means the browser follows the
 * route's 302 redirect straight to the APK / store link, and the whole
 * flow works even with JavaScript disabled. Zero client JS required.
 */
export function DownloadButton({ platform = "android" }: { platform?: "android" | "ios" }) {
  return (
    <form action="/api/download" method="POST">
      <input type="hidden" name="platform" value={platform} />
      <button
        type="submit"
        className="group inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3.5
                   text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20
                   transition hover:bg-emerald-400 hover:shadow-emerald-400/30
                   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500
                   active:scale-[0.98]"
      >
        {/* download arrow icon */}
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
        Download for {platform === "ios" ? "iOS" : "Android"}
        <span className="text-xs font-medium text-emerald-950/70">APK · free</span>
      </button>
    </form>
  );
}
