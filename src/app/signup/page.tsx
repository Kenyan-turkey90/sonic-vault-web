"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Method = "email" | "phone" | "oauth";

export default function SignupPage() {
  const router = useRouter();

  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  async function handlePhoneSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await getSupabase().auth.signInWithOtp({ phone });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setOtpSent(true);
    setLoading(false);
  }

  async function handlePhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await getSupabase().auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  async function handleOAuth(provider: "google" | "github" | "apple") {
    setLoading(true);
    setError("");

    const { error } = await getSupabase().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0B0B0D] px-4 py-12">
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

        <div className="flex rounded-xl border border-[#2A2A2E] bg-[#17171A] p-1">
          {(["email", "phone", "oauth"] as Method[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setError(""); }}
              className={`flex-1 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                method === m
                  ? "bg-[#D9A441]/15 text-[#D9A441]"
                  : "text-[#8A6A24] hover:text-[#D9A441]"
              }`}
            >
              {m === "oauth" ? "Social" : m}
            </button>
          ))}
        </div>
        {method === "email" && (
          <div className="space-y-4">
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
        )}

        {method === "phone" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handlePhoneSend} className="space-y-3">
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] px-4 py-3 text-sm text-[#E9E4D8] placeholder:text-[#8A6A24] focus:border-[#D9A441]/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#D9A441] py-3 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#D9A441]/90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneVerify} className="space-y-3">
                <p className="text-center text-sm text-[#B0A89C]">
                  Code sent to <span className="text-[#E9E4D8]">{phone}</span>
                </p>
                <input
                  type="text"
                  placeholder="123456"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] px-4 py-3 text-center text-sm tracking-[0.3em] text-[#E9E4D8] placeholder:text-[#8A6A24] focus:border-[#D9A441]/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#D9A441] py-3 text-sm font-semibold text-[#0B0B0D] transition hover:bg-[#D9A441]/90 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & sign up"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="w-full text-xs text-[#8A6A24] hover:text-[#D9A441]"
                >
                  Use a different number
                </button>
              </form>
            )}

            <p className="text-center text-xs text-[#8A6A24]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#D9A441] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {method === "oauth" && (
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2A2E] bg-[#17171A] py-3 text-sm font-semibold text-[#E9E4D8] transition hover:border-[#D9A441]/30 hover:text-[#D9A441] disabled:opacity-50"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

            <button
              onClick={() => handleOAuth("github")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2A2E] bg-[#17171A] py-3 text-sm font-semibold text-[#E9E4D8] transition hover:border-[#D9A441]/30 hover:text-[#D9A441] disabled:opacity-50"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Sign up with GitHub
            </button>

            <button
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A2A2E] bg-[#17171A] py-3 text-sm font-semibold text-[#E9E4D8] transition hover:border-[#D9A441]/30 hover:text-[#D9A441] disabled:opacity-50"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Sign up with Apple
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-[#8A6A24]">
        <Link href="/admin" className="hover:text-[#D9A441]">
          Already signed in? Go to admin
        </Link>
        <span className="mx-2">·</span>
        <a href="/logout" className="hover:text-[#D9A441]">
          Log out
        </a>
      </div>
    </main>
  );
}
