import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Splash — "Sentinel Emblem" v8.
 * Direção editorial: composição minimalista, negativo generoso, um único
 * emblema institucional dominante (hexágono duplo + monograma "P" em ouro)
 * sobre carvão profundo com aurora sutil. Tipografia clássica com serifa
 * de exibição no wordmark. Duração ~2.4s. Respeita prefers-reduced-motion.
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

  const GOLD_HI = "#f4c974";
  const GOLD    = "#c9922b";
  const GOLD_LO = "#7a5312";
  const IVORY   = "#ece4d3";
  const INK     = "#e9edf3";

  return (
    <div
      role="status"
      aria-label="Carregando Plantão Pro"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 90% 60% at 50% 45%, #16202c 0%, #0b1218 55%, #05080c 100%)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Aurora sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 30% at 50% 30%, rgba(201,146,43,0.10), transparent 70%)",
        }}
      />

      {/* Grão / textura muito leve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Filete superior e inferior — moldura editorial */}
      <div
        aria-hidden
        className="absolute inset-x-10 top-8 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)`,
          animation: "emblFade 700ms 200ms both",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-10 bottom-8 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)`,
          animation: "emblFade 700ms 260ms both",
        }}
      />

      {/* Micro-legenda topo */}
      <div
        aria-hidden
        className="absolute top-12 left-1/2 -translate-x-1/2 text-[9px] uppercase"
        style={{
          color: `${IVORY}88`,
          letterSpacing: "0.65em",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          animation: "emblFade 700ms 340ms both",
        }}
      >
        Est. 2024 · Acre · Brasil
      </div>

      {/* Composição central */}
      <div className="relative flex flex-col items-center px-8">
        {/* Emblema — hexágono duplo com monograma "P" */}
        <div
          className="relative"
          style={{ animation: "emblRise 1000ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <svg
            width="180"
            height="200"
            viewBox="0 0 180 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id="emblGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={GOLD_HI} />
                <stop offset="55%"  stopColor={GOLD} />
                <stop offset="100%" stopColor={GOLD_LO} />
              </linearGradient>
              <linearGradient id="emblGoldSoft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={GOLD_HI} stopOpacity="0.9" />
                <stop offset="100%" stopColor={GOLD_LO} stopOpacity="0.55" />
              </linearGradient>
              <radialGradient id="emblCore" cx="0.5" cy="0.45" r="0.65">
                <stop offset="0%"  stopColor="#1a2735" />
                <stop offset="100%" stopColor="#070c12" />
              </radialGradient>
              <filter id="emblGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Halo dourado atrás */}
            <ellipse
              cx="90"
              cy="100"
              rx="86"
              ry="86"
              fill="url(#emblCore)"
              opacity="0.0"
            />
            <ellipse
              cx="90"
              cy="100"
              rx="78"
              ry="78"
              fill="none"
              stroke={`${GOLD}22`}
              strokeWidth="0.6"
              style={{ animation: "emblRing 3200ms ease-out infinite" }}
            />

            {/* Hexágono externo */}
            <polygon
              points="90,18 156,55 156,145 90,182 24,145 24,55"
              fill="url(#emblCore)"
              stroke="url(#emblGold)"
              strokeWidth="1.8"
              strokeLinejoin="miter"
            />

            {/* Hexágono interno (linha fina) */}
            <polygon
              points="90,30 145,62 145,138 90,170 35,138 35,62"
              fill="none"
              stroke="url(#emblGoldSoft)"
              strokeWidth="0.7"
              opacity="0.7"
            />

            {/* Pequenos pinos nos vértices */}
            {[
              [90, 18], [156, 55], [156, 145],
              [90, 182], [24, 145], [24, 55],
            ].map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="1.6"
                fill={GOLD_HI}
                opacity="0.85"
              />
            ))}

            {/* Monograma "P" institucional em ouro — centralizado no hexágono (90,100) */}
            <g
              transform="translate(50,55) scale(0.82)"
              filter="url(#emblGlow)"
              style={{
                animation: "emblMono 900ms 350ms cubic-bezier(.22,1,.36,1) both",
                transformOrigin: "90px 100px",
              }}
            >
              {/* Haste + arco + serifas */}
              <path
                d="M14 6 L14 92
                   M14 6 L46 6 C64 6 74 18 74 32 C74 46 64 58 46 58 L14 58
                   M6 92 L30 92
                   M6 6 L30 6"
                stroke="url(#emblGold)"
                strokeWidth="4.6"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
              />
              {/* Preenchimento sutil do bojo */}
              <path
                d="M22 16 L46 16 C58 16 64 24 64 32 C64 40 58 48 46 48 L22 48 Z"
                fill="url(#emblGold)"
                opacity="0.14"
              />
            </g>

            {/* Estrelas nos cantos superiores (referência institucional) */}
            <g fill={GOLD_HI} opacity="0.85">
              <polygon points="42,44 44,49 49,49 45,52 47,57 42,54 37,57 39,52 35,49 40,49" transform="scale(0.55) translate(28,10)" />
              <polygon points="42,44 44,49 49,49 45,52 47,57 42,54 37,57 39,52 35,49 40,49" transform="scale(0.55) translate(240,10)" />
            </g>
          </svg>
        </div>

        {/* Wordmark */}
        <div
          className="mt-9 flex flex-col items-center"
          style={{ animation: "emblFade 800ms 700ms both" }}
        >
          <div
            className="flex items-baseline gap-[0.24em]"
            style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
              color: INK,
            }}
          >
            <span
              className="text-[38px] leading-none"
              style={{ fontWeight: 400, letterSpacing: "0.02em" }}
            >
              Plant<span style={{ fontStyle: "italic" }}>ã</span>o
            </span>
            <span
              className="text-[38px] leading-none"
              style={{
                background: `linear-gradient(180deg, ${GOLD_HI}, ${GOLD_LO})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 600,
                fontStyle: "italic",
              }}
            >
              Pro
            </span>
          </div>

          {/* Divisor com losango */}
          <div className="mt-4 flex items-center gap-3">
            <span
              className="h-px w-14"
              style={{ background: `linear-gradient(90deg, transparent, ${GOLD}bb)` }}
            />
            <span
              aria-hidden
              className="inline-block"
              style={{
                width: 6,
                height: 6,
                background: `linear-gradient(135deg, ${GOLD_HI}, ${GOLD_LO})`,
                transform: "rotate(45deg)",
              }}
            />
            <span
              className="h-px w-14"
              style={{ background: `linear-gradient(270deg, transparent, ${GOLD}bb)` }}
            />
          </div>

          <div
            className="mt-3 text-[10px] uppercase"
            style={{
              color: `${IVORY}9a`,
              letterSpacing: "0.62em",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            Comando Socioeducativo
          </div>
        </div>

        {/* Régua de progresso minimalista */}
        <div
          className="mt-10 flex items-center gap-3"
          style={{ animation: "emblFade 500ms 1100ms both" }}
        >
          <span
            className="text-[8px] uppercase"
            style={{
              color: `${IVORY}55`,
              letterSpacing: "0.42em",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            Iniciando
          </span>
          <div
            className="h-[1px] w-[200px] overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${GOLD_HI}, ${GOLD}, transparent)`,
                transform: "translateX(-100%)",
                animation: "emblProgress 1700ms 350ms cubic-bezier(.65,.05,.36,1) forwards",
              }}
            />
          </div>
          <span
            className="text-[8px] uppercase"
            style={{
              color: `${GOLD}bb`,
              letterSpacing: "0.42em",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            Pronto
          </span>
        </div>
      </div>

      {/* Rodapé — assinatura */}
      <div
        aria-hidden
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[8px] uppercase"
        style={{
          color: `${IVORY}55`,
          letterSpacing: "0.55em",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          animation: "emblFade 700ms 1250ms both",
        }}
      >
        ISE · Sentinela Digital
      </div>

      <style>{`
        @keyframes emblFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes emblRise {
          from { opacity: 0; transform: translateY(18px) scale(0.94); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes emblMono {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes emblRing {
          0%   { transform: scale(0.94); opacity: 0.0; transform-origin: 90px 100px; }
          40%  { opacity: 0.55; }
          100% { transform: scale(1.10); opacity: 0; transform-origin: 90px 100px; }
        }
        @keyframes emblProgress {
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
