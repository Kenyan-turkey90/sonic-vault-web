"use client";

import { useRef, useState, useCallback, useMemo } from "react";

/**
 * Interactive vault combination dial — the page's signature element.
 *
 * Behavioral contract:
 *  - Spins on mouse-drag / touch-drag around the center.
 *  - After one full cumulative rotation (360°), the vault "unlocks":
 *    emerald glow appears, hidden content fades in.
 *  - Reduced motion: dial is static, unlocks immediately.
 *  - No-JS: the download form is always functional regardless of lock state.
 */
export function VaultDial() {
  const dialRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(0);
  const totalRotRef = useRef(0);

  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return 0;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (unlocked) return;
      setIsDragging(true);
      lastAngleRef.current = getAngle(e.clientX, e.clientY);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [unlocked, getAngle],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || unlocked) return;
      const angle = getAngle(e.clientX, e.clientY);
      let delta = angle - lastAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      lastAngleRef.current = angle;
      totalRotRef.current += Math.abs(delta);
      setRotation((r) => r + delta);

      if (totalRotRef.current >= 360 && !unlocked) {
        setUnlocked(true);
        setIsDragging(false);
      }
    },
    [getAngle, isDragging, unlocked],
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const tickMarks = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const isMajor = i % 10 === 0;
        const isMid = i % 5 === 0;
        const r1 = isMajor ? 130 : isMid ? 134 : 138;
        const r2 = 144;
        return (
          <line
            key={i}
            x1={160 + r1 * Math.cos(angle)}
            y1={160 + r1 * Math.sin(angle)}
            x2={160 + r2 * Math.cos(angle)}
            y2={160 + r2 * Math.sin(angle)}
            stroke={isMajor ? "#D9A441" : isMid ? "#8A6A24" : "#3A3A3E"}
            strokeWidth={isMajor ? 2.5 : isMid ? 1.5 : 1}
            strokeLinecap="round"
          />
        );
      }),
    [],
  );

  const numbers = useMemo(
    () =>
      [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const angle = (deg - 90) * (Math.PI / 180);
        const r = 120;
        return (
          <text
            key={deg}
            x={160 + r * Math.cos(angle)}
            y={160 + r * Math.sin(angle)}
            fill="#D9A441"
            fontSize="10"
            fontFamily="var(--font-ibm-plex-mono)"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {deg}
          </text>
        );
      }),
    [],
  );

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        ref={dialRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 select-none touch-none cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Vault combination dial — drag to rotate and unlock"
      >
        <svg
          viewBox="0 0 320 320"
          fill="none"
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.08s ease-out",
          }}
        >
          <circle cx="160" cy="160" r="155" fill="#17171A" stroke="#2A2A2E" strokeWidth="2" />
          <circle cx="160" cy="160" r="148" fill="none" stroke="#1F1F23" strokeWidth="6" />
          {tickMarks}
          {numbers}
          <circle cx="160" cy="160" r="108" fill="url(#innerFace)" />
          <circle cx="160" cy="160" r="108" fill="none" stroke="#2A2A2E" strokeWidth="1" />
          <circle cx="160" cy="160" r="12" fill="#D9A441" />
          <circle cx="160" cy="160" r="8" fill="#8A6A24" />
          <circle cx="160" cy="160" r="4" fill="#D9A441" />
          <defs>
            <radialGradient id="innerFace" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#2A2A2E" />
              <stop offset="100%" stopColor="#0B0B0D" />
            </radialGradient>
          </defs>
        </svg>

        {/* combination windows — static, don't rotate */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex gap-2 sm:gap-2.5">
            {["14", "0", "13"].map((digit) => (
              <div
                key={digit}
                className="flex items-center justify-center w-10 h-12 sm:w-11 sm:h-13 rounded border border-[#D9A441]/40 bg-[#0B0B0D]/80 backdrop-blur-sm"
              >
                <span
                  className="font-mono text-lg sm:text-xl font-semibold tabular-nums"
                  style={{ color: unlocked ? "#10B981" : "#D9A441" }}
                >
                  {digit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {unlocked && (
          <div className="absolute inset-0 rounded-full green-glow pointer-events-none" />
        )}
      </div>

      <div className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase">
        {unlocked ? (
          <span className="text-[#10B981]">Vault open</span>
        ) : (
          <span className="text-[#8A6A24] animate-pulse">Drag dial to unlock</span>
        )}
      </div>
    </div>
  );
}
