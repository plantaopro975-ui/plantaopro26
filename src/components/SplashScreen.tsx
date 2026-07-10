import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Cinematic splash — Command Center v4 "Aurum Tactical".
 * Timeline (~2.6s):
 *  0.00s  Deep-space wash + hex mesh materializes
 *  0.10s  Top/bottom HUD bars slide in with coordinates
 *  0.20s  Radar rings & compass ticks draw (stroke-dasharray)
 *  0.35s  Constellation of 8 ISE units lights up + connecting triangulation lines
 *  0.55s  Tactical shield reveals with 3D lift + laurel arcs
 *  0.90s  Wordmark wipes in (gold gradient) with subtitle
 *  1.20s  Boot log ticker (4 lines)
 *  1.80s  Segmented telemetry meter fills
 *  2.20s  "ACESSO AUTORIZADO" stamp locks
 *  2.60s  Fade to app
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
    });
    if (!shouldRender) return;
    splashMountedThisRuntime = true;
    const t1 = window.setTimeout(() => setFadeOut(true), 2600);
    const t2 = window.setTimeout(() => setVisible(false), 3200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      pushDiagEvent("info", "splash_unmount", { count: splashMountCount });
    };
  }, [shouldRender]);

  if (!visible) return null;

  return (
    <div
      className={`splash-root fixed inset-0 z-[10050] overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fadeOut}
      role="dialog"
      aria-label="Inicializando PlantãoPro"
      style={{
        background:
          "radial-gradient(ellipse 90% 65% at 50% 45%, #0d1730 0%, #070b1a 55%, #02040a 100%)",
      }}
    >
      {/* Layered atmosphere */}
      <div className="splash-hex absolute inset-0" aria-hidden />
      <div className="splash-noise absolute inset-0 mix-blend-overlay opacity-[0.08]" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(240,196,84,0.20) 0%, transparent 65%)",
        }}
      />
      <div className="splash-scan absolute inset-0 pointer-events-none" aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.82) 100%)",
        }}
      />
      <div className="splash-meridian absolute inset-y-0 left-1/2 w-px" aria-hidden />

      {/* TOP HUD */}
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
          <span>-9.9754 · -67.8249</span>
          <span className="h-3 w-px bg-amber-500/30" />
          <span>NODE · ACRE-BR</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-amber-100/50">CIPHER · AES-256</span>
          <span className="text-amber-300">OP · 24/7</span>
        </div>
      </div>

      <CornerBracket className="top-14 left-4" />
      <CornerBracket className="top-14 right-4" rotate={90} />
      <CornerBracket className="bottom-14 left-4" rotate={270} />
      <CornerBracket className="bottom-14 right-4" rotate={180} />

      {/* CENTER STAGE */}
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-5 sm:gap-6 px-6 text-center">
        {/* EMBLEM — 320px SVG canvas */}
        <div className="relative h-[260px] w-[260px] sm:h-[300px] sm:w-[300px]">
          <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="v4Gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="45%" stopColor="#f0d78c" />
                <stop offset="70%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#6b4a0e" />
              </linearGradient>
              <linearGradient id="v4Sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(240,215,140,0)" />
                <stop offset="100%" stopColor="rgba(240,215,140,0.55)" />
              </linearGradient>
              <radialGradient id="v4Core" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(240,215,140,0.42)" />
                <stop offset="100%" stopColor="rgba(240,215,140,0)" />
              </radialGradient>
              <linearGradient id="v4Line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(240,215,140,0.9)" />
                <stop offset="100%" stopColor="rgba(240,215,140,0.15)" />
              </linearGradient>
              <filter id="v4Glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Core glow */}
            <circle cx="150" cy="150" r="140" fill="url(#v4Core)" className="v4-core" />

            {/* Concentric rings — drawn with stroke-dasharray reveal */}
            {[140, 118, 96, 74, 52, 30].map((r, i) => (
              <circle
                key={r}
                cx="150"
                cy="150"
                r={r}
                fill="none"
                stroke="rgba(212,175,55,0.28)"
                strokeWidth={i === 0 ? 1 : 0.55}
                strokeDasharray={i % 2 === 0 ? "3 4" : `${2 * Math.PI * r}`}
                strokeDashoffset={i % 2 === 0 ? 0 : 2 * Math.PI * r}
                className="v4-ring"
                style={{ animationDelay: `${200 + i * 60}ms`, ["--len" as any]: 2 * Math.PI * r }}
              />
            ))}

            {/* Cross axes */}
            <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(212,175,55,0.18)" strokeWidth="0.6" className="v4-axis" />
            <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(212,175,55,0.18)" strokeWidth="0.6" className="v4-axis" style={{ animationDelay: "80ms" }} />
            <line x1="55" y1="55" x2="245" y2="245" stroke="rgba(212,175,55,0.10)" strokeWidth="0.5" className="v4-axis" style={{ animationDelay: "160ms" }} />
            <line x1="245" y1="55" x2="55" y2="245" stroke="rgba(212,175,55,0.10)" strokeWidth="0.5" className="v4-axis" style={{ animationDelay: "220ms" }} />

            {/* Compass ticks */}
            {[
              { x: 150, y: 8, t: "N" },
              { x: 292, y: 152, t: "E" },
              { x: 150, y: 296, t: "S" },
              { x: 8, y: 152, t: "W" },
            ].map(({ x, y, t }) => (
              <text
                key={t}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="8"
                fill="rgba(240,215,140,0.65)"
                fontFamily="'IBM Plex Mono', monospace"
                letterSpacing="1"
                dy="2.5"
                className="v4-fade"
                style={{ animationDelay: "500ms" }}
              >
                {t}
              </text>
            ))}

            {/* Triangulation grid — 8 unit constellation with connecting lines */}
            <g className="v4-net">
              {[
                [80, 92], [220, 100], [232, 172], [200, 232],
                [150, 250], [90, 220], [58, 158], [150, 62],
              ].map(([x1, y1], i, arr) => {
                const [x2, y2] = arr[(i + 3) % arr.length];
                return (
                  <line
                    key={`ln-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#v4Line)"
                    strokeWidth="0.5"
                    strokeDasharray="240"
                    strokeDashoffset="240"
                    className="v4-triangulate"
                    style={{ animationDelay: `${420 + i * 55}ms` }}
                  />
                );
              })}
            </g>

            {/* Unit markers */}
            {[
              [80, 92], [220, 100], [232, 172], [200, 232],
              [150, 250], [90, 220], [58, 158], [150, 62],
            ].map(([cx, cy], i) => (
              <g key={`u-${i}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="2.4"
                  fill="#f0d78c"
                  filter="url(#v4Glow)"
                  className="v4-unit"
                  style={{ animationDelay: `${600 + i * 70}ms` }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="2.4"
                  fill="none"
                  stroke="#f0d78c"
                  strokeWidth="0.7"
                  className="v4-ping"
                  style={{ animationDelay: `${600 + i * 70}ms` }}
                />
              </g>
            ))}

            {/* Radar sweep */}
            <g className="v4-sweep" style={{ transformOrigin: "150px 150px", transformBox: "fill-box" as any }}>
              <path d="M150 150 L150 10 A140 140 0 0 1 285 130 Z" fill="url(#v4Sweep)" opacity="0.85" />
              <line x1="150" y1="150" x2="150" y2="10" stroke="rgba(240,215,140,0.7)" strokeWidth="0.8" />
            </g>

            {/* Laurel arcs */}
            <g className="v4-laurel">
              <path d="M56 210 Q22 150 56 90" fill="none" stroke="url(#v4Gold)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M244 210 Q278 150 244 90" fill="none" stroke="url(#v4Gold)" strokeWidth="1.6" strokeLinecap="round" />
              {[100, 125, 150, 175, 200].map((y, i) => (
                <g key={i}>
                  <ellipse cx={46} cy={y} rx="6" ry="2.2" fill="url(#v4Gold)" opacity="0.78" transform={`rotate(-25 46 ${y})`} />
                  <ellipse cx={254} cy={y} rx="6" ry="2.2" fill="url(#v4Gold)" opacity="0.78" transform={`rotate(25 254 ${y})`} />
                </g>
              ))}
            </g>
          </svg>

          {/* Central crest — drawn with stroke-dasharray */}
          <div className="v4-shield-wrap absolute inset-0 flex items-center justify-center">
            <svg width="140" height="164" viewBox="0 0 140 164" fill="none" className="drop-shadow-[0_0_28px_rgba(240,215,140,0.55)]">
              <defs>
                <linearGradient id="v4Crest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="45%" stopColor="#f0d78c" />
                  <stop offset="70%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#6b4a0e" />
                </linearGradient>
                <linearGradient id="v4CrestFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(15,22,42,0.96)" />
                  <stop offset="100%" stopColor="rgba(5,8,18,0.9)" />
                </linearGradient>
              </defs>

              {/* Outer plate */}
              <path
                d="M70 4 L130 26 V78 C130 112 104 142 70 156 C36 142 10 112 10 78 V26 Z"
                fill="url(#v4CrestFill)"
                stroke="url(#v4Crest)"
                strokeWidth="2.4"
                strokeDasharray="600"
                strokeDashoffset="600"
                className="v4-crest-draw"
              />
              {/* Inner bevel */}
              <path
                d="M70 14 L122 32 V76 C122 106 100 132 70 144 C40 132 18 106 18 76 V32 Z"
                fill="none"
                stroke="url(#v4Crest)"
                strokeWidth="0.7"
                opacity="0.6"
                strokeDasharray="500"
                strokeDashoffset="500"
                className="v4-crest-draw"
                style={{ animationDelay: "100ms" }}
              />
              {/* Star */}
              <path
                d="M70 38 L77 58 L98 58 L81 71 L88 91 L70 79 L52 91 L59 71 L42 58 L63 58 Z"
                fill="url(#v4Crest)"
                className="v4-crest-fill"
              />
              {/* Chevrons */}
              <path d="M34 104 L70 88 L106 104" stroke="url(#v4Crest)" strokeWidth="2.6" fill="none" strokeLinecap="round"
                strokeDasharray="200" strokeDashoffset="200" className="v4-crest-draw" style={{ animationDelay: "260ms" }} />
              <path d="M34 120 L70 104 L106 120" stroke="url(#v4Crest)" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.72"
                strokeDasharray="200" strokeDashoffset="200" className="v4-crest-draw" style={{ animationDelay: "340ms" }} />
              <path d="M34 136 L70 120 L106 136" stroke="url(#v4Crest)" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.45"
                strokeDasharray="200" strokeDashoffset="200" className="v4-crest-draw" style={{ animationDelay: "420ms" }} />
              {/* Rivets */}
              <circle cx="18" cy="32" r="1.6" fill="url(#v4Crest)" className="v4-crest-fill" />
              <circle cx="122" cy="32" r="1.6" fill="url(#v4Crest)" className="v4-crest-fill" />
              <circle cx="70" cy="10" r="1.6" fill="url(#v4Crest)" className="v4-crest-fill" />
            </svg>
          </div>

          {/* Rotating outer rings */}
          <div className="v4-ring-orbit absolute -inset-3 rounded-full border border-amber-400/25" aria-hidden />
          <div className="v4-ring-orbit-slow absolute -inset-7 rounded-full border border-dashed border-amber-400/15" aria-hidden />
        </div>

        {/* Wordmark */}
        <div className="space-y-2">
          <div className="v4-reveal overflow-hidden inline-block">
            <h1
              className="text-[28px] sm:text-[36px] md:text-[44px] font-bold tracking-[0.12em] leading-none whitespace-nowrap"
              style={{
                fontFamily: "'Libre Baskerville', 'Playfair Display', Georgia, serif",
                background: "linear-gradient(180deg, #fef3c7 0%, #f0d78c 55%, #a97b1c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 24px rgba(240,215,140,0.30)",
              }}
            >
              PLANTÃO<span className="italic font-normal ml-2 tracking-[0.02em]">Pro</span>
            </h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-amber-400/60" />
            <span
              className="text-[8.5px] sm:text-[10px] uppercase tracking-[0.5em] text-amber-200/80"
              style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
            >
              Comando · Socioeducativo · Acre
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Boot log */}
        <div
          className="v4-log w-full max-w-[340px] sm:max-w-[400px] space-y-1 text-left text-[9.5px] uppercase tracking-[0.22em] text-amber-100/60"
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
        >
          <LogLine delay={1200} label="AUTH · Insígnia" value="Validada" />
          <LogLine delay={1380} label="LINK · Malha 24/7" value="Estável" />
          <LogLine delay={1560} label="RADAR · Unidades ISE" value="9 / 9" />
          <LogLine delay={1740} label="HUD · Console" value="Pronto" />
        </div>

        {/* Segmented meter */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-between w-full text-[8.5px] tracking-[0.3em] uppercase text-amber-200/60"
            style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
            <span>Inicializando</span>
            <span className="text-amber-300/80">100%</span>
          </div>
          <div className="grid grid-cols-14 gap-[3px] w-full" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="v4-seg h-[6px] rounded-[1px]"
                style={{ animationDelay: `${1800 + i * 40}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Authorization stamp */}
        <div
          className="v4-stamp inline-flex items-center gap-2.5 px-3.5 py-1.5 border rounded-sm"
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

      {/* BOTTOM HUD */}
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
        @keyframes v4FadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes v4Reveal { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
        @keyframes v4Ring { to { transform: rotate(360deg); } }
        @keyframes v4Sweep { 0% { transform: rotate(-30deg); } 100% { transform: rotate(330deg); } }
        @keyframes v4Scan { 0% { background-position: 0 -100vh; } 100% { background-position: 0 100vh; } }
        @keyframes v4HexDraw { from { opacity: 0; transform: scale(1.06); } to { opacity: 0.32; transform: scale(1); } }
        @keyframes v4Meridian { 0% { opacity: 0; transform: scaleY(0); } 40% { opacity: 1; } 100% { opacity: 0.55; transform: scaleY(1); } }
        @keyframes v4Core { 0% { opacity: 0; transform: scale(0.6); } 60% { opacity: 1; transform: scale(1.08); } 100% { opacity: 0.7; transform: scale(1); } }
        @keyframes v4RingDraw {
          0% { stroke-dashoffset: var(--len); opacity: 0; }
          40% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes v4Axis { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes v4Fade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes v4Triangulate { 0% { stroke-dashoffset: 240; opacity: 0; } 40% { opacity: 0.8; } 100% { stroke-dashoffset: 0; opacity: 0.55; } }
        @keyframes v4Unit { 0% { opacity: 0; transform: scale(0); } 60% { opacity: 1; transform: scale(1.7); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes v4Ping { 0% { opacity: 0.9; transform: scale(0.5); } 100% { opacity: 0; transform: scale(4.5); } }
        @keyframes v4Laurel { 0% { opacity: 0; transform: scale(0.85); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes v4ShieldIn {
          0% { transform: scale(0.55) rotateX(-25deg); opacity: 0; filter: blur(12px); }
          55% { transform: scale(1.08) rotateX(0); opacity: 1; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes v4CrestDraw { to { stroke-dashoffset: 0; } }
        @keyframes v4CrestFillIn { 0% { opacity: 0; transform: scale(0.4); transform-origin: center; transform-box: fill-box; } 100% { opacity: 1; transform: scale(1); } }
        @keyframes v4Seg {
          0% { opacity: 0; transform: scaleX(0); background: rgba(240,215,140,0.15); }
          60% { opacity: 1; background: rgba(240,215,140,0.9); box-shadow: 0 0 8px rgba(240,215,140,0.6); }
          100% { opacity: 1; transform: scaleX(1); background: linear-gradient(90deg,#d4af37,#f0d78c,#d4af37); box-shadow: 0 0 6px rgba(240,215,140,0.45); }
        }
        @keyframes v4Stamp {
          0% { opacity: 0; transform: scale(1.3) rotate(-4deg); filter: blur(3px); }
          60% { opacity: 1; transform: scale(0.94) rotate(0); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }

        .splash-hex {
          background-image:
            radial-gradient(circle at 20px 20px, rgba(240,215,140,0.07) 1px, transparent 1.4px),
            linear-gradient(60deg, rgba(240,215,140,0.06) 1px, transparent 1px),
            linear-gradient(-60deg, rgba(240,215,140,0.06) 1px, transparent 1px);
          background-size: 40px 40px, 40px 70px, 40px 70px;
          animation: v4HexDraw 900ms ease-out both;
        }
        .splash-noise {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
        }
        .splash-meridian {
          background: linear-gradient(180deg, transparent 0%, rgba(240,215,140,0.28) 15%, transparent 42%, transparent 58%, rgba(240,215,140,0.28) 85%, transparent 100%);
          box-shadow: 0 0 12px rgba(240,215,140,0.18);
          animation: v4Meridian 1s cubic-bezier(.22,1,.36,1) both;
          transform-origin: center;
        }
        .splash-scan {
          background: repeating-linear-gradient(180deg, rgba(240,215,140,0.035) 0px, rgba(240,215,140,0.035) 1px, transparent 2px, transparent 4px);
          animation: v4Scan 5s linear infinite;
        }

        .v4-core { transform-origin: center; transform-box: fill-box; animation: v4Core 1200ms cubic-bezier(.22,1,.36,1) 200ms both; }
        .v4-ring { animation: v4RingDraw 900ms cubic-bezier(.22,1,.36,1) both; }
        .v4-axis { transform-origin: center; transform-box: fill-box; opacity: 0; animation: v4Axis 500ms cubic-bezier(.22,1,.36,1) 150ms both; }
        .v4-fade { opacity: 0; animation: v4Fade 500ms ease-out both; }
        .v4-triangulate { animation: v4Triangulate 900ms cubic-bezier(.22,1,.36,1) both; }
        .v4-unit { opacity: 0; transform-origin: center; transform-box: fill-box; animation: v4Unit 600ms cubic-bezier(.22,1,.36,1) both; }
        .v4-ping { opacity: 0; transform-origin: center; transform-box: fill-box; animation: v4Ping 1.6s ease-out infinite; }
        .v4-sweep { animation: v4Sweep 2.4s cubic-bezier(.4,0,.2,1) 500ms infinite; }
        .v4-laurel { opacity: 0; transform-origin: center; transform-box: fill-box; animation: v4Laurel 700ms cubic-bezier(.22,1,.36,1) 800ms forwards; }
        .v4-shield-wrap { animation: v4ShieldIn 1000ms cubic-bezier(.22,1,.36,1) 550ms both; transform-origin: center; perspective: 800px; }
        .v4-crest-draw { animation: v4CrestDraw 900ms cubic-bezier(.22,1,.36,1) 700ms forwards; }
        .v4-crest-fill { opacity: 0; animation: v4CrestFillIn 500ms cubic-bezier(.22,1,.36,1) 1200ms forwards; }
        .v4-ring-orbit { animation: v4Ring 9s linear infinite; }
        .v4-ring-orbit-slow { animation: v4Ring 20s linear infinite reverse; }
        .v4-reveal h1 { animation: v4Reveal 900ms cubic-bezier(.7,0,.3,1) 900ms both; }
        .v4-log { animation: v4FadeUp 500ms ease-out 1150ms both; }
        .v4-seg { opacity: 0; transform-origin: left center; animation: v4Seg 220ms cubic-bezier(.22,1,.36,1) both; background: rgba(240,215,140,0.12); }
        .v4-stamp { opacity: 0; animation: v4Stamp 550ms cubic-bezier(.22,1,.36,1) 2200ms forwards; box-shadow: 0 0 24px rgba(240,215,140,0.18), inset 0 0 12px rgba(240,215,140,0.08); }
        .splash-top { animation: v4FadeUp 500ms ease-out 100ms both; }
        .splash-bottom { animation: v4FadeUp 500ms ease-out 250ms both; }

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
      style={{ animation: `v4FadeUp 400ms ease-out ${delay}ms both` }}
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
