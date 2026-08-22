"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const getSupabase = useCallback(() => getSupabaseBrowser(), []);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEmailConfirmed(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#0B0B0D] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-[family-name:var(--font-big-shoulders)] text-2xl font-bold uppercase tracking-[0.06em] text-[#E9E4D8]"
          >
            <span className="inline-flex size-8 items-center justify-center rounded bg-[#D9A441]/15 text-[#D9A441]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
              </svg>
            </span>
            Sonic Vault
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-big-shoulders)] text-3xl font-black uppercase tracking-[0.02em] text-[#E9E4D8]">
            Join the vault
          </h1>
          <p className="mt-2 text-sm text-[#B0A89C]">
            Create your account and start listening.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {emailConfirmed && (
          <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-3 text-center text-sm text-[#10B981]">
            Check your email to confirm your account.
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] px-4 py-3 text-sm text-[#E9E4D8] placeholder:text-[#8A6A24] focus:border-[#D9A441]/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] px-4 py-3 text-sm text-[#E9E4D8] placeholder:text-[#8A6A24] focus:border-[#D9A441]/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] px-4 py-3 text-sm text-[#E9E4D8] placeholder:text-[#8A6A24] focus:border-[#D9A441]/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#D9A441] py-3 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#D9A441]/90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-[#8A6A24]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D9A441] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 text-center text-xs text-[#8A6A24]">
        <a href="/logout" className="hover:text-[#D9A441]">Sign out</a>
      </div>
    </main>
  );
}
