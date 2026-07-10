import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Splash — "Monolith" v5.
 * Direção: minimalismo institucional. Preto profundo, um único
 * monograma "P" construído em SVG, régua de progresso fina em ouro
 * e tipografia serifada discreta. Sem HUD, sem radar, sem excesso.
 * Duração ~1.9s. Respeita prefers-reduced-motion.
 */

let splashMountedThisRuntime = false;

export function SplashScreen() {
  const shouldRender = !splashMountedThisRuntime;
  const [visible, setVisible] = useState(shouldRender);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    pushDiagEvent("info", "splash_mount", { willRender: shouldRender });
    if (!shouldRender) return;
    splashMountedThisRuntime = true;
    const t1 = window.setTimeout(() => setFadeOut(true), 1900);
    const t2 = window.setTimeout(() => setVisible(false), 2500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [shouldRender]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Carregando Plantão Pro"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #0d0d10 0%, #060607 55%, #030304 100%)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Grão sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* Vinheta */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Linhas horizontais finas — régua institucional */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 -translate-y-[112px] bg-gradient-to-r from-transparent via-white/15 to-transparent"
        style={{ width: "min(360px, 72vw)", animation: "splashLine 900ms cubic-bezier(.22,1,.36,1) both" }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-px -translate-x-1/2 translate-y-[112px] bg-gradient-to-r from-transparent via-white/15 to-transparent"
        style={{ width: "min(360px, 72vw)", animation: "splashLine 900ms 120ms cubic-bezier(.22,1,.36,1) both" }}
      />

      {/* Conteúdo central */}
      <div className="relative flex flex-col items-center">
        {/* Monograma */}
        <div
          className="relative"
          style={{ animation: "splashMark 1100ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <svg
            width="112"
            height="112"
            viewBox="0 0 112 112"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id="splashGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f6d97a" />
                <stop offset="45%" stopColor="#c9a24a" />
                <stop offset="100%" stopColor="#8a6a24" />
              </linearGradient>
              <linearGradient id="splashSteel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8e8ea" />
                <stop offset="100%" stopColor="#8a8a90" />
              </linearGradient>
            </defs>

            {/* Anel externo hexagonal */}
            <polygon
              points="56,6 100,31 100,81 56,106 12,81 12,31"
              stroke="url(#splashSteel)"
              strokeWidth="1"
              fill="none"
              opacity="0.55"
              style={{
                strokeDasharray: 360,
                strokeDashoffset: 360,
                animation: "splashDraw 1200ms 100ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* Anel interno */}
            <polygon
              points="56,18 89,37 89,75 56,94 23,75 23,37"
              stroke="url(#splashGold)"
              strokeWidth="1.25"
              fill="none"
              opacity="0.9"
              style={{
                strokeDasharray: 280,
                strokeDashoffset: 280,
                animation: "splashDraw 1200ms 260ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* "P" institucional */}
            <path
              d="M44 34 L44 82 M44 34 L64 34 C74 34 80 40 80 50 C80 60 74 66 64 66 L44 66"
              stroke="url(#splashGold)"
              strokeWidth="4"
              strokeLinecap="square"
              strokeLinejoin="miter"
              fill="none"
              style={{
                strokeDasharray: 180,
                strokeDashoffset: 180,
                animation: "splashDraw 1000ms 520ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* Pontos cardeais */}
            {[
              { cx: 56, cy: 6 },
              { cx: 56, cy: 106 },
              { cx: 12, cy: 56 },
              { cx: 100, cy: 56 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="1.6"
                fill="url(#splashGold)"
                style={{
                  opacity: 0,
                  animation: `splashDot 400ms ${900 + i * 80}ms cubic-bezier(.22,1,.36,1) forwards`,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Wordmark */}
        <div
          className="mt-8 flex flex-col items-center"
          style={{ animation: "splashFade 700ms 900ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <div
            className="text-[22px] tracking-[0.38em] font-light"
            style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
              color: "#eae2cf",
            }}
          >
            PLANTÃO
            <span
              style={{
                background: "linear-gradient(180deg,#f6d97a,#c9a24a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginLeft: "0.35em",
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              Pro
            </span>
          </div>
          <div
            className="mt-2 text-[9px] uppercase tracking-[0.55em]"
            style={{ color: "rgba(234,226,207,0.45)" }}
          >
            Sistema de Gestão Operacional
          </div>
        </div>

        {/* Régua de progresso */}
        <div
          className="mt-10 h-[2px] w-[220px] overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #c9a24a 30%, #f6d97a 55%, #c9a24a 80%, transparent 100%)",
              transform: "translateX(-100%)",
              animation: "splashProgress 1600ms 400ms cubic-bezier(.65,.05,.36,1) forwards",
            }}
          />
        </div>

        {/* Assinatura inferior */}
        <div
          className="mt-6 text-[8px] uppercase tracking-[0.4em]"
          style={{
            color: "rgba(234,226,207,0.28)",
            animation: "splashFade 600ms 1300ms both",
          }}
        >
          ISE · Acre — Segurança Socioeducativa
        </div>
      </div>

      <style>{`
        @keyframes splashDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes splashDot {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splashMark {
          from { opacity: 0; transform: translateY(6px) scale(0.985); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes splashFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashLine {
          from { opacity: 0; transform: translateX(-50%) scaleX(0.2); }
          to   { opacity: 1; transform: translateX(-50%) scaleX(1); }
        }
        @keyframes splashProgress {
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
