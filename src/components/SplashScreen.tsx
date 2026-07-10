import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Splash — "Radar de Comando" v7.
 * Direção nova: sala de comando institucional. Fundo azul-noite profundo,
 * anéis de radar pulsando, feixe rotativo em ciano, rosa dos ventos em
 * âmbar, hex grid sutil, monograma "P" institucional dentro de hexágono
 * técnico. Duração ~2.4s. Respeita prefers-reduced-motion.
 */

let splashMountedThisRuntime = false;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !splashMountedThisRuntime);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    pushDiagEvent("info", "splash_mount", { willRender: visible });
    if (!visible) return;
    splashMountedThisRuntime = true;
    const t1 = window.setTimeout(() => setFadeOut(true), 2400);
    const t2 = window.setTimeout(() => setVisible(false), 3050);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const CYAN = "#22d3ee";
  const AMBER = "#f5b842";
  const IVORY = "#e6edf3";

  return (
    <div
      role="status"
      aria-label="Carregando Plantão Pro"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #0d223d 0%, #06111f 55%, #020610 100%)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 650ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Hex grid de fundo */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.10]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="splashHex" width="56" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">
            <path
              d="M28 0 L56 16.16 L56 48.5 L28 64.66 L0 48.5 L0 16.16 Z"
              fill="none"
              stroke={CYAN}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#splashHex)" />
      </svg>

      {/* Scanlines suaves */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.35) 3px, rgba(255,255,255,0.35) 4px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Vinheta */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Labels de canto */}
      <div
        aria-hidden
        className="absolute left-6 top-6 flex flex-col gap-1 text-[9px] uppercase tracking-[0.42em]"
        style={{ color: `${IVORY}99`, fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "rdrFade 500ms 220ms both" }}
      >
        <span style={{ color: `${CYAN}cc` }}>◉ RADAR · ATIVO</span>
        <span>09°58′S · 67°48′W</span>
      </div>
      <div
        aria-hidden
        className="absolute right-6 top-6 flex flex-col items-end gap-1 text-[9px] uppercase tracking-[0.42em]"
        style={{ color: `${IVORY}99`, fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "rdrFade 500ms 280ms both" }}
      >
        <span style={{ color: `${AMBER}dd` }}>CH-01 · 2.4 GHz</span>
        <span>PING · 12 ms</span>
      </div>
      <div
        aria-hidden
        className="absolute bottom-6 left-6 text-[9px] uppercase tracking-[0.42em]"
        style={{ color: `${IVORY}80`, fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "rdrFade 500ms 340ms both" }}
      >
        NÓ · FEIJÓ / AC · 220v
      </div>
      <div
        aria-hidden
        className="absolute bottom-6 right-6 text-[9px] uppercase tracking-[0.42em]"
        style={{ color: `${IVORY}80`, fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "rdrFade 500ms 400ms both" }}
      >
        UPLINK · TLS-1.3
      </div>

      {/* Radar central + monograma */}
      <div className="relative flex flex-col items-center px-6">
        <div className="relative" style={{ animation: "rdrFadeUp 900ms cubic-bezier(.22,1,.36,1) both" }}>
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id="rdrCyan" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7ff2ff" />
                <stop offset="100%" stopColor="#0aa3c7" />
              </linearGradient>
              <linearGradient id="rdrAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd48a" />
                <stop offset="100%" stopColor="#c07f18" />
              </linearGradient>
              <radialGradient id="rdrGlow" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              {/* Sweep — cone que gira */}
              <linearGradient id="rdrSweep" x1="0.5" y1="0" x2="1" y2="0.5">
                <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </linearGradient>
              <clipPath id="rdrClip">
                <circle cx="120" cy="120" r="108" />
              </clipPath>
            </defs>

            {/* Glow central */}
            <circle cx="120" cy="120" r="112" fill="url(#rdrGlow)" />

            {/* Anéis radar */}
            {[108, 84, 60, 36].map((r, i) => (
              <circle
                key={r}
                cx="120"
                cy="120"
                r={r}
                fill="none"
                stroke={CYAN}
                strokeWidth={i === 0 ? 1.1 : 0.7}
                opacity={0.55 - i * 0.08}
                style={{ animation: `rdrPulse 2400ms ${i * 260}ms ease-out infinite` }}
              />
            ))}

            {/* Cruz cardinal */}
            <g stroke={CYAN} strokeWidth="0.6" opacity="0.55">
              <line x1="12" y1="120" x2="228" y2="120" />
              <line x1="120" y1="12" x2="120" y2="228" />
              <line x1="35" y1="35" x2="205" y2="205" opacity="0.35" />
              <line x1="205" y1="35" x2="35" y2="205" opacity="0.35" />
            </g>

            {/* Marcadores de bússola N E S W */}
            {[
              { x: 120, y: 8,  t: "N" },
              { x: 232, y: 124, t: "L" },
              { x: 120, y: 236, t: "S" },
              { x: 8,   y: 124, t: "O" },
            ].map((m) => (
              <text
                key={m.t}
                x={m.x}
                y={m.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'JetBrains Mono', ui-monospace, monospace"
                fontSize="9"
                fill={AMBER}
                opacity="0.9"
              >
                {m.t}
              </text>
            ))}

            {/* Sweep rotativo dentro do radar */}
            <g clipPath="url(#rdrClip)">
              <g style={{ transformOrigin: "120px 120px", animation: "rdrSweep 3.6s linear infinite" }}>
                <path d="M120 120 L120 12 A108 108 0 0 1 228 120 Z" fill="url(#rdrSweep)" />
              </g>
            </g>

            {/* Blips */}
            {[
              { x: 78,  y: 96,  d: 400 },
              { x: 168, y: 82,  d: 900 },
              { x: 156, y: 172, d: 1400 },
              { x: 84,  y: 158, d: 1900 },
            ].map((b) => (
              <circle
                key={`${b.x}-${b.y}`}
                cx={b.x}
                cy={b.y}
                r="2.6"
                fill={AMBER}
                style={{ opacity: 0, animation: `rdrBlip 1400ms ${b.d}ms ease-out infinite` }}
              />
            ))}

            {/* Hexágono central com monograma "P" */}
            <g style={{ animation: "rdrFadeUp 700ms 500ms cubic-bezier(.22,1,.36,1) both" }}>
              <polygon
                points="120,72 162,96 162,144 120,168 78,144 78,96"
                fill="rgba(6,17,31,0.85)"
                stroke="url(#rdrCyan)"
                strokeWidth="1.6"
              />
              <polygon
                points="120,80 154,100 154,140 120,160 86,140 86,100"
                fill="none"
                stroke="url(#rdrAmber)"
                strokeWidth="0.8"
                opacity="0.7"
              />
              {/* Monograma "P" institucional (mesmo do brasão) */}
              <g transform="translate(60,42) scale(1.05)">
                <path
                  d="M74 138 L74 178 M74 138 L98 138 C110 138 116 144 116 152 C116 160 110 166 98 166 L74 166 M68 178 L86 178 M68 138 L86 138"
                  stroke="url(#rdrAmber)"
                  strokeWidth="3.2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  fill="none"
                />
                <path
                  d="M82 146 L98 146 C104 146 107 149 107 152 C107 155 104 158 98 158 L82 158 Z"
                  fill="url(#rdrAmber)"
                  opacity="0.22"
                />
              </g>
            </g>

            {/* Ponto central + halo */}
            <circle cx="120" cy="120" r="3" fill={CYAN} />
            <circle cx="120" cy="120" r="7" fill="none" stroke={CYAN} strokeWidth="0.6" opacity="0.6" />
          </svg>
        </div>

        {/* Faixa institucional */}
        <div
          className="mt-5 flex items-center gap-3"
          style={{ animation: "rdrFade 700ms 900ms both" }}
        >
          <span className="h-px w-10" style={{ background: `linear-gradient(90deg, transparent, ${CYAN}cc)` }} />
          <span
            className="text-[9px] uppercase tracking-[0.55em]"
            style={{ color: `${CYAN}dd`, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            COMANDO · SOCIOEDUCATIVO
          </span>
          <span className="h-px w-10" style={{ background: `linear-gradient(270deg, transparent, ${CYAN}cc)` }} />
        </div>

        {/* Wordmark */}
        <div
          className="mt-5 flex flex-col items-center"
          style={{ animation: "rdrFade 700ms 1100ms both" }}
        >
          <div
            className="text-[30px] leading-none tracking-[0.28em]"
            style={{
              fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
              color: IVORY,
              fontWeight: 300,
            }}
          >
            PLANTÃO
            <span
              style={{
                background: `linear-gradient(180deg, ${AMBER}, #b57312)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginLeft: "0.32em",
                fontWeight: 600,
              }}
            >
              Pro
            </span>
          </div>
          <div
            className="mt-3 text-[10px] uppercase tracking-[0.5em]"
            style={{ color: `${IVORY}88` }}
          >
            Radar · Escala · Comando
          </div>
        </div>

        {/* Régua de progresso */}
        <div
          className="mt-9 flex items-center gap-3"
          style={{ animation: "rdrFade 500ms 1250ms both" }}
        >
          <span
            className="text-[8px] uppercase tracking-[0.4em]"
            style={{ color: `${IVORY}55`, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            SYNC
          </span>
          <div
            className="h-[2px] w-[240px] overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${CYAN} 30%, ${AMBER} 60%, ${CYAN} 85%, transparent 100%)`,
                transform: "translateX(-100%)",
                animation: "rdrProgress 1900ms 400ms cubic-bezier(.65,.05,.36,1) forwards",
              }}
            />
          </div>
          <span
            className="text-[8px] uppercase tracking-[0.4em]"
            style={{ color: `${AMBER}bb`, fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            LINK
          </span>
        </div>
      </div>

      <style>{`
        @keyframes rdrFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rdrFadeUp {
          from { opacity: 0; transform: translateY(14px) scale(0.96); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes rdrSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes rdrPulse {
          0%   { stroke-opacity: 0.05; transform: scale(0.85); transform-origin: 120px 120px; }
          40%  { stroke-opacity: 0.75; }
          100% { stroke-opacity: 0;    transform: scale(1.08); transform-origin: 120px 120px; }
        }
        @keyframes rdrBlip {
          0%   { opacity: 0; transform: scale(0.4); }
          20%  { opacity: 1; transform: scale(1); }
          60%  { opacity: 0.6; }
          100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes rdrProgress {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] * { animation-duration: 1ms !important; animation-delay: 0ms !important; }
        }
      `}</style>
    </div>
  );
}
