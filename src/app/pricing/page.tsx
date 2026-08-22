"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type PlanId = "free" | "basic" | "pro" | "premium";

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceCents: number;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceCents: 0,
    features: [
      "Stream audio with ads",
      "Basic themes",
      "Offline queue",
      "Community support",
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: "$2",
    priceCents: 200,
    features: [
      "Ad-free audio",
      "Synced lyrics",
      "Equalizer",
      "Offline downloads",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5",
    priceCents: 500,
    highlighted: true,
    features: [
      "Everything in Basic",
      "Music video playback",
      "Cloud sync",
      "5GB cloud hosting",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$10",
    priceCents: 1000,
    features: [
      "Everything in Pro",
      "Unlimited cloud hosting",
      "Custom themes",
      "API access",
      "Early access features",
      "Priority support",
    ],
  },
];

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("sv_device_id");
  if (stored) return stored;
  const raw = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const id = `dev_${Math.abs(hash).toString(36)}`;
  localStorage.setItem("sv_device_id", id);
  return id;
}

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);

  useEffect(() => {
    let cancelled = false;
    const deviceId = getDeviceId();
    if (!deviceId) return;
    fetch(`/api/subscriptions?device_id=${encodeURIComponent(deviceId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCurrentPlan(data.plan_id || "free");
      })
      .catch(() => {
        if (!cancelled) setCurrentPlan("free");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const deviceId = getDeviceId();
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: deviceId, plan_id: planId }),
      });
      if (res.ok) setCurrentPlan(planId);
    } catch (err) {
      console.error("Upgrade failed:", err);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <main className="min-h-dvh bg-[#0B0B0D]">
      <header className="border-b border-[#2A2A2E]">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-big-shoulders)] text-lg font-bold uppercase tracking-[0.06em] text-[#E9E4D8]"
          >
            <span className="inline-flex size-7 items-center justify-center rounded bg-[#D9A441]/15 text-[#D9A441]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
              </svg>
            </span>
            Sonic Vault
          </Link>
          <div className="flex items-center gap-6 font-mono text-xs tracking-wider text-[#8A6A24] uppercase">
            <Link href="/" className="transition hover:text-[#D9A441]">Home</Link>
            <Link href="/admin" className="transition hover:text-[#10B981]">Admin</Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
        <div className="mb-4 font-mono text-[10px] tracking-[0.2em] text-[#8A6A24] uppercase">
          Open release pricing
        </div>
        <h1 className="font-[family-name:var(--font-big-shoulders)] text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-[0.95] tracking-[-0.01em] text-[#E9E4D8] engrave">
          Choose your <span className="text-[#D9A441]">vault</span> tier
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#B0A89C]">
          Start free. Upgrade when you want more. No contracts, cancel anytime.
          Your music stays yours.
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isWorking = upgrading === plan.id;
          const isRec = plan.highlighted;

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition ${
                isRec
                  ? "border-[#D9A441]/40 bg-[#17171A]"
                  : "border-[#2A2A2E] bg-[#0B0B0D]"
              } ${isCurrent ? "ring-2 ring-[#10B981]/40" : ""}`}
            >
              {isRec && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#D9A441]/30 bg-[#D9A441]/10 px-3 py-0.5 font-mono text-[10px] font-medium tracking-wider text-[#D9A441] uppercase">
                  Most popular
                </div>
              )}

              <h2 className="font-[family-name:var(--font-big-shoulders)] text-xl font-bold uppercase tracking-[0.04em] text-[#E9E4D8]">
                {plan.name}
              </h2>

              <div className="mt-4 mb-6 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-big-shoulders)] text-4xl font-black text-[#E9E4D8]">
                  {plan.price}
                </span>
                {plan.priceCents > 0 && (
                  <span className="font-mono text-xs text-[#8A6A24]">/month</span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#B0A89C]">
                    <svg className="mt-0.5 size-4 shrink-0 text-[#10B981]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || isWorking || loading}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition ${
                  isCurrent
                    ? "border border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981] cursor-default"
                    : isRec
                    ? "bg-[#D9A441] text-[#0B0B0D] hover:bg-[#D9A441]/90 shadow-lg shadow-[#D9A441]/20"
                    : "border border-[#2A2A2E] bg-[#17171A] text-[#E9E4D8] hover:border-[#D9A441]/30 hover:text-[#D9A441]"
                } disabled:opacity-50`}
              >
                {isCurrent
                  ? "Current plan"
                  : isWorking
                  ? "Activating..."
                  : plan.priceCents === 0
                  ? "Downgrade to Free"
                  : "Upgrade"}
              </button>
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[#D9A441]/30 to-transparent" />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="font-mono text-lg font-semibold text-[#D9A441]">Cancel anytime</div>
            <p className="mt-1 text-xs text-[#8A6A24]">No lock-in, no questions asked.</p>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg font-semibold text-[#D9A441]">Secure payments</div>
            <p className="mt-1 text-xs text-[#8A6A24]">Powered by Stripe. We never see your card.</p>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg font-semibold text-[#D9A441]">Open source</div>
            <p className="mt-1 text-xs text-[#8A6A24]">GPL-3.0. Audit the code yourself.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2A2A2E]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8A6A24]/50">
            Manufactured in the open &middot; GPL-3.0
          </span>
          <a href="https://github.com/Kenyan-turkey90/sonic-vault" target="_blank" rel="noreferrer" className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8A6A24]/50 transition hover:text-[#D9A441]">
            github.com/kenyan-turkey90/sonic-vault
          </a>
        </div>
      </footer>
    </main>
  );
}
