import { useEffect, useState } from "react";

/**
 * Cinematic splash screen — shown once per browser session.
 * Noir & Gold tactical aesthetic, ~2.4s total.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem("splash_shown_v1") !== "1";
    } catch {
      return true;
    }
  });
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t1 = window.setTimeout(() => setFadeOut(true), 2000);
    const t2 = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("splash_shown_v1", "1");
      } catch {}
    }, 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#050810] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Abertura PlantãoPro"
    >
      {/* Radial gold glow */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.18) 0%, rgba(5,8,16,0) 55%)",
        }}
      />

      {/* Diagonal scanline sweep */}
      <div className="splash-sweep absolute inset-0 pointer-events-none" />

      {/* Center emblem + text */}
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <div className="splash-shield relative">
          <svg
            width="120"
            height="140"
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_30px_rgba(245,158,11,0.55)]"
          >
            <defs>
              <linearGradient id="splashGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            <path
              d="M60 4 L112 24 V70 C112 100 88 126 60 136 C32 126 8 100 8 70 V24 Z"
              stroke="url(#splashGold)"
              strokeWidth="3"
              fill="rgba(245,158,11,0.05)"
            />
            <path
              d="M60 40 L68 58 L88 60 L73 74 L78 94 L60 84 L42 94 L47 74 L32 60 L52 58 Z"
              fill="url(#splashGold)"
            />
          </svg>
          {/* Rotating ring */}
          <div className="splash-ring absolute inset-0 -m-6 rounded-full border border-amber-500/30" />
        </div>

        <div className="space-y-2">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-[0.25em] text-amber-400"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            PLANTÃO<span className="text-amber-200">PRO</span>
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-amber-500/50" />
            <span
              className="text-[0.65rem] md:text-xs uppercase tracking-[0.4em] text-amber-200/70"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Comando Operacional
            </span>
            <span className="h-px w-10 bg-amber-500/50" />
          </div>
        </div>

        {/* Loading bar */}
        <div className="mt-4 h-[3px] w-56 overflow-hidden rounded-full bg-amber-500/10">
          <div className="splash-bar h-full w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes splashShieldIn {
          0% { transform: scale(0.6) translateY(20px); opacity: 0; filter: blur(10px); }
          60% { transform: scale(1.05) translateY(-4px); opacity: 1; filter: blur(0); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes splashRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splashSweep {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        @keyframes splashBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .splash-shield { animation: splashShieldIn 900ms cubic-bezier(.22,1,.36,1) both; }
        .splash-ring { animation: splashRing 6s linear infinite; }
        .splash-sweep {
          background: linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.08) 50%, transparent 100%);
          animation: splashSweep 1.8s ease-out both;
        }
        .splash-bar { animation: splashBar 1.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .splash-shield, .splash-ring, .splash-sweep, .splash-bar { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
