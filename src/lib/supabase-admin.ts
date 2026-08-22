import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * This client bypasses Row Level Security. It must never be imported from a
 * Client Component ("use client") or referenced by NEXT_PUBLIC_ vars.
 *
 * Env vars (see .env.example):
 *   SUPABASE_URL              Project URL (local: http://127.0.0.1:54321)
 *   SUPABASE_SERVICE_ROLE_KEY Secret service-role key (Vercel: encrypted env var)
 */

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      // No session storage / token refresh on the server — we only use REST.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}
