"use client";

import { useEffect, useRef } from "react";

/**
 * Fires GET /api/track-visit exactly once per mount of the landing page.
 * Renders nothing; failures are silently ignored (analytics is best-effort).
 * The ref guard also protects against React StrictMode's double effect run.
 */
export function VisitTracker() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/track-visit", { cache: "no-store" }).catch(() => {
      /* analytics must never break the page */
    });
  }, []);

  return null;
}
