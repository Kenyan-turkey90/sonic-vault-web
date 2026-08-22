"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/admin/actions";

/**
 * Minimal password gate. Submits to the `login` server action; on success
 * the action sets an httpOnly cookie and redirects to /admin.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    { error: null },
  );

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Admin access</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter the admin password to view vault analytics.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="sr-only">
            Admin password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100
                       placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none
                       focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950
                     shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Unlocking…" : "Unlock dashboard"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-zinc-600">
        Password lives in the ADMIN_PASSWORD env var.
      </p>
    </div>
  );
}
