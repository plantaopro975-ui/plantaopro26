import { useEffect, useState } from "react";

/**
 * Cinematic splash — Command Center boot sequence.
 * Sequence (~2.6s): HUD grid draws → radar sweep + emblem authenticate
 * → wordmark reveal → status ticker → progress bar → fade.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFadeOut(true), 2400);
    const t2 = window.setTimeout(() => setVisible(false), 3000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`splash-root fixed inset-0 z-[9999] overflow-hidden bg-[#050810] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Inicializando PlantãoPro"
    >
      {/* HUD grid */}
      <div className="splash-grid absolute inset-0 opacity-40" />

      {/* Radial gold glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,158,11,0.20) 0%, rgba(5,8,16,0) 60%)",
        }}
      />

      {/* Vignette + scanlines */}
      <div className="splash-scan absolute inset-0 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Top HUD bar */}
      <div className="splash-top absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 text-[10px] uppercase tracking-[0.35em] text-amber-300/70"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>SYS · BOOT</span>
        </div>
        <div className="hidden sm:block">CMD // ACRE · BR</div>
        <div>OP · 24/7</div>
      </div>

      {/* Corner brackets */}
      <CornerBracket className="top-14 left-4" />
      <CornerBracket className="top-14 right-4" rotate={90} />
      <CornerBracket className="bottom-14 left-4" rotate={270} />
      <CornerBracket className="bottom-14 right-4" rotate={180} />

      {/* Center stage */}
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-8 px-6 text-center">
        {/* Radar + Shield */}
        <div className="relative h-[220px] w-[220px] md:h-[260px] md:w-[260px]">
          {/* Radar rings */}
          <svg
            viewBox="0 0 200 200"
            className="splash-radar absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(245,158,11,0)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.55)" />
              </linearGradient>
            </defs>
            {[95, 75, 55, 35].map((r) => (
              <circle
                key={r}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="rgba(245,158,11,0.20)"
                strokeWidth="0.8"
              />
            ))}
            <line x1="100" y1="5" x2="100" y2="195" stroke="rgba(245,158,11,0.15)" strokeWidth="0.6" />
            <line x1="5" y1="100" x2="195" y2="100" stroke="rgba(245,158,11,0.15)" strokeWidth="0.6" />
            {/* Sweep */}
            <g className="splash-sweep-g" style={{ transformOrigin: "100px 100px" }}>
              <path d="M100 100 L100 5 A95 95 0 0 1 195 100 Z" fill="url(#sweepGrad)" />
            </g>
          </svg>

          {/* Shield */}
          <div className="splash-shield absolute inset-0 flex items-center justify-center">
            <svg
              width="110"
              height="128"
              viewBox="0 0 120 140"
              fill="none"
              className="drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]"
            >
              <defs>
                <linearGradient id="splashGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="55%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>
              <path
                d="M60 4 L112 24 V70 C112 100 88 126 60 136 C32 126 8 100 8 70 V24 Z"
                stroke="url(#splashGold)"
                strokeWidth="2.5"
                fill="rgba(245,158,11,0.06)"
              />
              {/* Chevrons */}
              <path d="M30 92 L60 78 L90 92" stroke="url(#splashGold)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M30 106 L60 92 L90 106" stroke="url(#splashGold)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
              {/* Star */}
              <path
                d="M60 30 L66 48 L85 48 L70 60 L76 78 L60 68 L44 78 L50 60 L35 48 L54 48 Z"
                fill="url(#splashGold)"
              />
            </svg>
          </div>

          {/* Rotating outer ring */}
          <div className="splash-ring absolute -inset-3 rounded-full border border-amber-500/25" />
          <div className="splash-ring-slow absolute -inset-6 rounded-full border border-dashed border-amber-500/15" />
        </div>

        {/* Wordmark */}
        <div className="space-y-3">
          <div className="splash-reveal overflow-hidden">
            <h1
              className="text-3xl md:text-5xl font-bold tracking-[0.28em] text-amber-300"
              style={{ fontFamily: "'Libre Baskerville', serif", textShadow: "0 0 20px rgba(245,158,11,0.35)" }}
            >
              PLANTÃO<span className="text-amber-100">PRO</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/60" />
            <span
              className="text-[0.6rem] md:text-[0.7rem] uppercase tracking-[0.5em] text-amber-200/70"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Comando Operacional · Socioeducativo
            </span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>
        </div>

        {/* Boot log ticker */}
        <div
          className="splash-log w-full max-w-sm space-y-1 text-left text-[10px] uppercase tracking-[0.2em] text-amber-200/50"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <LogLine delay={200} label="AUTH · Insígnia" value="OK" />
          <LogLine delay={500} label="LINK · Rede 24/7" value="Estabelecido" />
          <LogLine delay={900} label="RADAR · Unidades ISE" value="Online" />
          <LogLine delay={1300} label="HUD · Comando" value="Pronto" />
        </div>

        {/* Progress bar */}
        <div className="relative mt-1 h-[3px] w-64 max-w-full overflow-hidden rounded-full bg-amber-500/10">
          <div className="splash-progress absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-500" />
        </div>
      </div>

      {/* Bottom HUD bar */}
      <div className="splash-bottom absolute bottom-0 inset-x-0 flex items-center justify-between px-6 py-4 text-[10px] uppercase tracking-[0.35em] text-amber-300/60"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        <span>v · CMD.24</span>
        <span className="hidden sm:inline">Feito por Agente para Agente</span>
        <span>QSL · Feijó</span>
      </div>

      <style>{`
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashShieldIn {
          0% { transform: scale(0.4); opacity: 0; filter: blur(14px); }
          60% { transform: scale(1.08); opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashReveal {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes splashRing { to { transform: rotate(360deg); } }
        @keyframes splashSweep {
          0% { transform: rotate(-30deg); }
          100% { transform: rotate(330deg); }
        }
        @keyframes splashScan {
          0% { background-position: 0 -100vh; }
          100% { background-position: 0 100vh; }
        }
        @keyframes splashProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes gridDraw {
          from { opacity: 0; transform: scale(1.1); }
          to { opacity: 0.4; transform: scale(1); }
        }
        .splash-grid {
          background-image:
            linear-gradient(rgba(245,158,11,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.12) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridDraw 900ms ease-out both;
        }
        .splash-scan {
          background: repeating-linear-gradient(
            180deg,
            rgba(245,158,11,0.04) 0px,
            rgba(245,158,11,0.04) 1px,
            transparent 2px,
            transparent 4px
          );
          animation: splashScan 4s linear infinite;
        }
        .splash-shield { animation: splashShieldIn 900ms cubic-bezier(.22,1,.36,1) 200ms both; }
        .splash-ring { animation: splashRing 8s linear infinite; }
        .splash-ring-slow { animation: splashRing 16s linear infinite reverse; }
        .splash-sweep-g { animation: splashSweep 2.4s cubic-bezier(.4,0,.2,1) infinite; transform-box: fill-box; }
        .splash-reveal h1 { animation: splashReveal 800ms cubic-bezier(.7,0,.3,1) 900ms both; }
        .splash-log { animation: splashFadeUp 500ms ease-out 1000ms both; }
        .splash-top { animation: splashFadeUp 500ms ease-out 100ms both; }
        .splash-bottom { animation: splashFadeUp 500ms ease-out 300ms both; }
        .splash-progress { animation: splashProgress 2.3s cubic-bezier(.4,0,.2,1) 200ms both; }
        @media (prefers-reduced-motion: reduce) {
          .splash-root *, .splash-root { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function CornerBracket({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      className={`splash-bracket absolute text-amber-400/70 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M2 10 V2 H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LogLine({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div
      className="flex justify-between border-b border-amber-500/10 pb-0.5"
      style={{ animation: `splashFadeUp 400ms ease-out ${delay}ms both` }}
    >
      <span>› {label}</span>
      <span className="text-amber-300">{value}</span>
    </div>
  );
}
