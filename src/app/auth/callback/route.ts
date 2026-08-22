import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * GET /auth/callback?code=xxx
 * Handles OAuth and email magic link callbacks.
 * Exchanges the auth code for a session and redirects to /admin.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with details
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
