import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Cinematic splash — Command Center v3.
 * Sequence (~3s):
 *  0.0s  HUD hexagon field draws in, top/bottom bars slide
 *  0.2s  Crest core materializes with radial burst
 *  0.5s  Radar sweep locks + 3 ping bursts across unit markers
 *  0.9s  Wordmark reveal (clip-path wipe) + laurel arcs
 *  1.1s  Boot log ticker (4 lines, staggered)
 *  1.8s  12-segment progress meter fills
 *  2.4s  "AUTORIZADO" stamp locks in
 *  2.6s  Fade to app
 */

let splashMountedThisRuntime = false;
let splashMountCount = 0;

export function SplashScreen() {
  const shouldRender = !splashMountedThisRuntime;

  const [visible, setVisible] = useState(shouldRender);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    splashMountCount += 1;
    pushDiagEvent("info", "splash_mount", {
      count: splashMountCount,
      moduleGuard: splashMountedThisRuntime,
      willRender: shouldRender,
      referrer: typeof document !== "undefined" ? document.referrer : "",
      visibility: typeof document !== "undefined" ? document.visibilityState : "",
    });

    if (!shouldRender) return;
    splashMountedThisRuntime = true;
    const t1 = window.setTimeout(() => setFadeOut(true), 2700);
    const t2 = window.setTimeout(() => setVisible(false), 3300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      pushDiagEvent("info", "splash_unmount", { count: splashMountCount });
    };
  }, [shouldRender]);

  if (!visible) return null;

  return (
    <div
      className={`splash-root fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fadeOut}
      role="dialog"
      aria-label="Inicializando Plantão Pro"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 42%, #0b1226 0%, #060912 55%, #030509 100%)",
      }}
    >
      {/* ============ LAYER 1: hex HUD + noise ============ */}
      <div className="splash-hex absolute inset-0" />
      <div className="splash-noise absolute inset-0 mix-blend-overlay opacity-[0.10]" />

      {/* Golden atmospheric wash */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 50% 50%, rgba(212,175,55,0.22) 0%, transparent 62%)",
        }}
      />

      {/* Vertical meridian sweep */}
      <div className="splash-meridian absolute inset-y-0 left-1/2 w-px" aria-hidden />

      {/* Scanlines + vignette */}
      <div className="splash-scan absolute inset-0 pointer-events-none" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.78) 100%)",
        }}
      />

      {/* ============ TOP HUD ============ */}
      <div
        className="splash-top absolute top-0 inset-x-0 flex items-center justify-between px-5 sm:px-8 py-4 text-[9.5px] uppercase tracking-[0.4em] text-amber-200/75"
        style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-amber-400 opacity-70 animate-ping" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-amber-400" />
          </span>
          <span>SYS · BOOT</span>
          <span className="text-amber-500/50">|</span>
          <span className="hidden sm:inline text-amber-100/60">SEQ · 0x24F</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-amber-100/50">
          <span>NODE · ACRE-BR</span>
          <span className="h-3 w-px bg-amber-500/30" />
          <span>ISE · SEJUSP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-amber-100/50">CIPHER · AES-256</span>
          <span className="text-amber-300">OP · 24/7</span>
        </div>
      </div>

      {/* Corner brackets */}
      <CornerBracket className="top-14 left-4" />
      <CornerBracket className="top-14 right-4" rotate={90} />
      <CornerBracket className="bottom-14 left-4" rotate={270} />
      <CornerBracket className="bottom-14 right-4" rotate={180} />

      {/* ============ CENTER STAGE ============ */}
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-6 sm:gap-7 px-6 text-center">
        {/* Emblem stage */}
        <div className="relative h-[240px] w-[240px] md:h-[280px] md:w-[280px]">
          {/* Radar SVG */}
          <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(212,175,55,0)" />
                <stop offset="100%" stopColor="rgba(240,215,140,0.55)" />
              </linearGradient>
              <radialGradient id="coreGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(240,215,140,0.35)" />
                <stop offset="100%" stopColor="rgba(240,215,140,0)" />
              </radialGradient>
              <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0d78c" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#8a6a1c" />
              </linearGradient>
            </defs>

            {/* Core glow */}
            <circle cx="120" cy="120" r="110" fill="url(#coreGlow)" className="splash-core" />

            {/* Concentric rings */}
            {[110, 90, 70, 50, 30].map((r, i) => (
              <circle
                key={r}
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke="rgba(212,175,55,0.22)"
                strokeWidth={i === 0 ? 1 : 0.6}
                strokeDasharray={i % 2 === 0 ? "2 3" : undefined}
              />
            ))}
            {/* Cross axes */}
            <line x1="120" y1="10" x2="120" y2="230" stroke="rgba(212,175,55,0.15)" strokeWidth="0.6" />
            <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(212,175,55,0.15)" strokeWidth="0.6" />
            {/* Diagonal axes */}
            <line x1="42" y1="42" x2="198" y2="198" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" />
            <line x1="198" y1="42" x2="42" y2="198" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" />

            {/* Compass ticks (N/E/S/W) */}
            {[
              { x: 120, y: 6, t: "N" },
              { x: 232, y: 122, t: "E" },
              { x: 120, y: 236, t: "S" },
              { x: 6, y: 122, t: "W" },
            ].map(({ x, y, t }) => (
              <text
                key={t}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="7"
                fill="rgba(240,215,140,0.55)"
                fontFamily="'IBM Plex Mono', monospace"
                letterSpacing="1"
                dy="2.5"
              >
                {t}
              </text>
            ))}

            {/* Unit markers (constellation of ISE units) */}
            {[
              { cx: 68, cy: 78, d: 800 },
              { cx: 178, cy: 92, d: 1100 },
              { cx: 190, cy: 168, d: 1400 },
              { cx: 82, cy: 176, d: 1700 },
              { cx: 152, cy: 62, d: 2000 },
            ].map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r="2"
                  fill="#f0d78c"
                  className="splash-unit"
                  style={{ animationDelay: `${p.d}ms` }}
                />
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r="2"
                  fill="none"
                  stroke="#f0d78c"
                  strokeWidth="0.8"
                  className="splash-ping"
                  style={{ animationDelay: `${p.d}ms` }}
                />
              </g>
            ))}

            {/* Sweep wedge */}
            <g
              className="splash-sweep-g"
              style={{ transformOrigin: "120px 120px", transformBox: "fill-box" as any }}
            >
              <path
                d="M120 120 L120 10 A110 110 0 0 1 226 106 Z"
                fill="url(#sweepGrad)"
                opacity="0.85"
              />
              <line x1="120" y1="120" x2="120" y2="10" stroke="rgba(240,215,140,0.7)" strokeWidth="0.8" />
            </g>

            {/* Laurel arcs */}
            <g className="splash-laurel">
              <path
                d="M46 168 Q22 120 46 72"
                fill="none"
                stroke="url(#goldStroke)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <path
                d="M194 168 Q218 120 194 72"
                fill="none"
                stroke="url(#goldStroke)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {/* laurel leaves */}
              {[80, 100, 120, 140, 160].map((y, i) => (
                <g key={i}>
                  <ellipse cx={38} cy={y} rx="5" ry="2" fill="url(#goldStroke)" opacity="0.75" transform={`rotate(-25 38 ${y})`} />
                  <ellipse cx={202} cy={y} rx="5" ry="2" fill="url(#goldStroke)" opacity="0.75" transform={`rotate(25 202 ${y})`} />
                </g>
              ))}
            </g>
          </svg>

          {/* Crest (layered SVG) */}
          <div className="splash-shield absolute inset-0 flex items-center justify-center">
            <svg width="128" height="150" viewBox="0 0 128 150" fill="none" className="drop-shadow-[0_0_28px_rgba(240,215,140,0.55)]">
              <defs>
                <linearGradient id="crestGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="45%" stopColor="#f0d78c" />
                  <stop offset="70%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#6b4a0e" />
                </linearGradient>
                <linearGradient id="crestFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(15,20,38,0.95)" />
                  <stop offset="100%" stopColor="rgba(5,8,16,0.85)" />
                </linearGradient>
              </defs>
              {/* Outer plate */}
              <path
                d="M64 3 L120 24 V72 C120 104 96 132 64 145 C32 132 8 104 8 72 V24 Z"
                fill="url(#crestFill)"
                stroke="url(#crestGold)"
                strokeWidth="2.4"
              />
              {/* Inner bevel */}
              <path
                d="M64 12 L112 30 V70 C112 98 92 122 64 134 C36 122 16 98 16 70 V30 Z"
                fill="none"
                stroke="url(#crestGold)"
                strokeWidth="0.7"
                opacity="0.55"
              />
              {/* Star */}
              <path
                d="M64 34 L70 52 L89 52 L74 64 L80 82 L64 71 L48 82 L54 64 L39 52 L58 52 Z"
                fill="url(#crestGold)"
              />
              {/* Chevrons */}
              <path d="M32 96 L64 82 L96 96" stroke="url(#crestGold)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M32 110 L64 96 L96 110" stroke="url(#crestGold)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.72" />
              <path d="M32 124 L64 110 L96 124" stroke="url(#crestGold)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.45" />
              {/* Rivets */}
              <circle cx="18" cy="30" r="1.4" fill="url(#crestGold)" />
              <circle cx="110" cy="30" r="1.4" fill="url(#crestGold)" />
              <circle cx="64" cy="9" r="1.4" fill="url(#crestGold)" />
            </svg>
          </div>

          {/* Rotating ring accents */}
          <div className="splash-ring absolute -inset-2 rounded-full border border-amber-400/20" aria-hidden />
          <div className="splash-ring-slow absolute -inset-5 rounded-full border border-dashed border-amber-400/12" aria-hidden />
        </div>

        {/* Wordmark */}
        <div className="space-y-2.5">
          <div className="splash-reveal overflow-hidden inline-block">
            <h1
              className="text-[26px] sm:text-[34px] md:text-[44px] font-bold tracking-[0.24em] leading-none"
              style={{
                fontFamily: "'Libre Baskerville', 'Playfair Display', Georgia, serif",
                background: "linear-gradient(180deg, #fef3c7 0%, #f0d78c 55%, #a97b1c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 24px rgba(240,215,140,0.30)",
              }}
            >
              PLANTÃO<span className="italic font-normal">Pro</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-amber-400/60" />
            <span
              className="text-[8.5px] sm:text-[10px] uppercase tracking-[0.5em] text-amber-200/75"
              style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
            >
              Comando · Socioeducativo · Acre
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Boot log */}
        <div
          className="splash-log w-full max-w-[340px] sm:max-w-[400px] space-y-1 text-left text-[9.5px] uppercase tracking-[0.22em] text-amber-100/55"
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
        >
          <LogLine delay={1100} label="AUTH · Insígnia Master" value="Validada" />
          <LogLine delay={1350} label="LINK · Malha 24/7" value="Estável" />
          <LogLine delay={1600} label="RADAR · Unidades ISE" value="9 / 9" />
          <LogLine delay={1850} label="HUD · Console Comando" value="Pronto" />
        </div>

        {/* Segmented progress meter */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-between w-full text-[8.5px] tracking-[0.3em] uppercase text-amber-200/50"
            style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
            <span>Inicializando</span>
            <span className="text-amber-300/80">100%</span>
          </div>
          <div className="grid grid-cols-12 gap-[3px] w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="splash-seg h-[6px] rounded-[1px]"
                style={{ animationDelay: `${1900 + i * 55}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Authorization stamp */}
        <div
          className="splash-stamp inline-flex items-center gap-2.5 px-3.5 py-1.5 border rounded-sm"
          style={{
            borderColor: "rgba(240,215,140,0.55)",
            background: "rgba(240,215,140,0.08)",
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
            <path d="M2 6 L5 9 L10 3" fill="none" stroke="#f0d78c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] tracking-[0.42em] uppercase text-amber-100">
            Acesso Autorizado
          </span>
          <span className="h-3 w-px bg-amber-300/40" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-amber-300/70">Nível 10</span>
        </div>
      </div>

      {/* ============ BOTTOM HUD ============ */}
      <div
        className="splash-bottom absolute bottom-0 inset-x-0 flex items-center justify-between px-5 sm:px-8 py-4 text-[9.5px] uppercase tracking-[0.4em] text-amber-200/65"
        style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
      >
        <span className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          <span>v · CMD.24</span>
        </span>
        <span className="hidden md:inline italic text-amber-100/50" style={{ fontFamily: "'Libre Baskerville', serif", letterSpacing: "0.1em" }}>
          Feito por Agente · Para o Agente
        </span>
        <span>QSL · Feijó</span>
      </div>

      <style>{`
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashShieldIn {
          0% { transform: scale(0.55) rotateX(-25deg); opacity: 0; filter: blur(12px); }
          55% { transform: scale(1.08) rotateX(0); opacity: 1; filter: blur(0); }
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
        @keyframes hexDraw {
          from { opacity: 0; transform: scale(1.06); }
          to { opacity: 0.35; transform: scale(1); }
        }
        @keyframes meridian {
          0% { opacity: 0; transform: scaleY(0); }
          40% { opacity: 1; }
          100% { opacity: 0.55; transform: scaleY(1); }
        }
        @keyframes coreGlow {
          0% { opacity: 0; transform: scale(0.6); transform-origin: center; }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 0.75; transform: scale(1); }
        }
        @keyframes laurelIn {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes unitBlink {
          0%   { opacity: 0; transform: scale(0); }
          60%  { opacity: 1; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes unitPing {
          0%   { opacity: 0.9; transform: scale(0.5); }
          100% { opacity: 0; transform: scale(4); }
        }
        @keyframes segIn {
          0% { opacity: 0; transform: scaleX(0); background: rgba(240,215,140,0.15); }
          60% { opacity: 1; background: rgba(240,215,140,0.9); box-shadow: 0 0 8px rgba(240,215,140,0.6); }
          100% { opacity: 1; transform: scaleX(1); background: linear-gradient(90deg,#d4af37,#f0d78c,#d4af37); box-shadow: 0 0 6px rgba(240,215,140,0.45); }
        }
        @keyframes stampIn {
          0% { opacity: 0; transform: scale(1.3) rotate(-4deg); filter: blur(3px); }
          60% { opacity: 1; transform: scale(0.94) rotate(0); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }

        .splash-hex {
          background-color: transparent;
          background-image:
            radial-gradient(circle at 20px 20px, rgba(240,215,140,0.06) 1px, transparent 1.4px),
            linear-gradient(60deg, rgba(240,215,140,0.06) 1px, transparent 1px),
            linear-gradient(-60deg, rgba(240,215,140,0.06) 1px, transparent 1px);
          background-size: 40px 40px, 40px 70px, 40px 70px;
          animation: hexDraw 900ms ease-out both;
        }
        .splash-noise {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
        }
        .splash-meridian {
          background: linear-gradient(180deg, transparent 0%, rgba(240,215,140,0.55) 25%, rgba(240,215,140,0.9) 50%, rgba(240,215,140,0.55) 75%, transparent 100%);
          box-shadow: 0 0 18px rgba(240,215,140,0.35);
          animation: meridian 1.1s cubic-bezier(.22,1,.36,1) both;
          transform-origin: center;
        }
        .splash-scan {
          background: repeating-linear-gradient(
            180deg,
            rgba(240,215,140,0.035) 0px,
            rgba(240,215,140,0.035) 1px,
            transparent 2px,
            transparent 4px
          );
          animation: splashScan 5s linear infinite;
        }

        .splash-core { animation: coreGlow 1200ms cubic-bezier(.22,1,.36,1) 300ms both; transform-origin: center; transform-box: fill-box; }
        .splash-shield { animation: splashShieldIn 1000ms cubic-bezier(.22,1,.36,1) 250ms both; transform-origin: center; perspective: 800px; }
        .splash-ring { animation: splashRing 9s linear infinite; }
        .splash-ring-slow { animation: splashRing 18s linear infinite reverse; }
        .splash-sweep-g { animation: splashSweep 2.2s cubic-bezier(.4,0,.2,1) infinite; }
        .splash-laurel { opacity: 0; animation: laurelIn 700ms cubic-bezier(.22,1,.36,1) 700ms forwards; transform-origin: center; transform-box: fill-box; }
        .splash-unit { opacity: 0; transform-origin: center; transform-box: fill-box; animation: unitBlink 600ms cubic-bezier(.22,1,.36,1) both; }
        .splash-ping { opacity: 0; transform-origin: center; transform-box: fill-box; animation: unitPing 1.4s ease-out infinite; }
        .splash-reveal h1 { animation: splashReveal 900ms cubic-bezier(.7,0,.3,1) 900ms both; }
        .splash-log { animation: splashFadeUp 500ms ease-out 1050ms both; }
        .splash-top { animation: splashFadeUp 500ms ease-out 100ms both; }
        .splash-bottom { animation: splashFadeUp 500ms ease-out 250ms both; }
        .splash-seg { opacity: 0; transform-origin: left center; animation: segIn 240ms cubic-bezier(.22,1,.36,1) both; background: rgba(240,215,140,0.12); }
        .splash-stamp { opacity: 0; animation: stampIn 550ms cubic-bezier(.22,1,.36,1) 2400ms forwards; box-shadow: 0 0 24px rgba(240,215,140,0.18), inset 0 0 12px rgba(240,215,140,0.08); }

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
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      className={`splash-bracket absolute text-amber-300/75 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path d="M2 12 V2 H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 2 H2 V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function LogLine({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div
      className="flex justify-between items-center border-b border-amber-500/12 pb-0.5"
      style={{ animation: `splashFadeUp 400ms ease-out ${delay}ms both` }}
    >
      <span className="flex items-center gap-1.5">
        <span className="text-amber-400/80">›</span>
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-amber-200">
        {value}
        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
      </span>
    </div>
  );
}
