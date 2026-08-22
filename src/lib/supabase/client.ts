"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
}

/**
 * React hook version — safe for prerender / SSR.
 * Returns null during SSR, initializes on client.
 */
export function useSupabaseBrowser() {
  return useMemo(() => {
    if (typeof window === "undefined") return null;
    return getSupabaseBrowser();
  }, []);
}
