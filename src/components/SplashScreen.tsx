import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Splash — "Sentinela" v6.
 * Direção: arte institucional de segurança pública. Tela cheia, preto
 * carvão, chevrons táticos, brasão sentinela em SVG, faixas de patente,
 * grid de coordenadas ISE/Acre e wordmark serifado em ouro escovado.
 * Duração ~2.2s. Respeita prefers-reduced-motion.
 */

let splashMountedThisRuntime = false;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !splashMountedThisRuntime);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    pushDiagEvent("info", "splash_mount", { willRender: visible });
    if (!visible) return;
    splashMountedThisRuntime = true;
    const t1 = window.setTimeout(() => setFadeOut(true), 2200);
    const t2 = window.setTimeout(() => setVisible(false), 2900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Carregando Plantão Pro"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 35%, #14140f 0%, #0a0a08 45%, #030302 100%)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Grid tático de coordenadas — tela inteira */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.09]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="splashGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#c9a24a" strokeWidth="0.5" />
          </pattern>
          <pattern id="splashGridMinor" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#c9a24a" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#splashGridMinor)" />
        <rect width="100%" height="100%" fill="url(#splashGrid)" />
      </svg>

      {/* Grão sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* Vinheta forte */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Cantos táticos — corner brackets */}
      {[
        { top: 24, left: 24, rot: 0 },
        { top: 24, right: 24, rot: 90 },
        { bottom: 24, right: 24, rot: 180 },
        { bottom: 24, left: 24, rot: 270 },
      ].map((c, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute"
          style={{
            top: c.top,
            bottom: c.bottom,
            left: c.left,
            right: c.right,
            width: 42,
            height: 42,
            borderTop: "1px solid rgba(201,162,74,0.7)",
            borderLeft: "1px solid rgba(201,162,74,0.7)",
            transform: `rotate(${c.rot}deg)`,
            animation: `splashFade 500ms ${100 + i * 60}ms cubic-bezier(.22,1,.36,1) both`,
          }}
        />
      ))}

      {/* Labels de canto — coordenadas ISE */}
      <div
        aria-hidden
        className="absolute left-6 top-6 flex flex-col gap-1 text-[9px] uppercase tracking-[0.35em]"
        style={{ color: "rgba(234,226,207,0.55)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "splashFade 500ms 200ms both" }}
      >
        <span>ISE · ACRE</span>
        <span style={{ color: "rgba(201,162,74,0.9)" }}>09°58′S 67°48′W</span>
      </div>
      <div
        aria-hidden
        className="absolute right-6 top-6 flex flex-col items-end gap-1 text-[9px] uppercase tracking-[0.35em]"
        style={{ color: "rgba(234,226,207,0.55)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "splashFade 500ms 260ms both" }}
      >
        <span>SEC · CLR-A</span>
        <span style={{ color: "rgba(201,162,74,0.9)" }}>NÍVEL OPERACIONAL</span>
      </div>
      <div
        aria-hidden
        className="absolute bottom-6 left-6 text-[9px] uppercase tracking-[0.35em]"
        style={{ color: "rgba(234,226,207,0.4)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "splashFade 500ms 320ms both" }}
      >
        UNIDADE · FEIJÓ / AC
      </div>
      <div
        aria-hidden
        className="absolute bottom-6 right-6 text-[9px] uppercase tracking-[0.35em]"
        style={{ color: "rgba(234,226,207,0.4)", fontFamily: "'JetBrains Mono', ui-monospace, monospace", animation: "splashFade 500ms 380ms both" }}
      >
        HANDSHAKE · AES-256
      </div>

      {/* Chevrons táticos — barras de patente laterais */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "min(720px, 92vw)", height: 4 }}
      >
        <div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2"
          style={{
            width: "calc(50% - 200px)",
            background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.55))",
            animation: "splashLineL 900ms 250ms cubic-bezier(.22,1,.36,1) both",
          }}
        />
        <div
          className="absolute right-0 top-1/2 h-px -translate-y-1/2"
          style={{
            width: "calc(50% - 200px)",
            background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.55))",
            animation: "splashLineR 900ms 250ms cubic-bezier(.22,1,.36,1) both",
          }}
        />
      </div>

      {/* Conteúdo central */}
      <div className="relative flex flex-col items-center px-6">
        {/* Brasão Sentinela */}
        <div
          className="relative"
          style={{ animation: "splashMark 1200ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <svg
            width="180"
            height="200"
            viewBox="0 0 180 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id="spGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6d97a" />
                <stop offset="50%" stopColor="#c9a24a" />
                <stop offset="100%" stopColor="#7a5a1c" />
              </linearGradient>
              <linearGradient id="spSteel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dcdce0" />
                <stop offset="100%" stopColor="#6a6a70" />
              </linearGradient>
              <radialGradient id="spCore" cx="0.5" cy="0.5" r="0.6">
                <stop offset="0%" stopColor="rgba(246,217,122,0.35)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Halo do brasão */}
            <circle cx="90" cy="100" r="80" fill="url(#spCore)" />

            {/* Escudo externo */}
            <path
              d="M90 8 L160 32 L160 108 C160 148 128 178 90 192 C52 178 20 148 20 108 L20 32 Z"
              stroke="url(#spSteel)"
              strokeWidth="1.2"
              fill="rgba(20,20,15,0.35)"
              style={{
                strokeDasharray: 520,
                strokeDashoffset: 520,
                animation: "splashDraw 1300ms 150ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* Escudo interno ouro */}
            <path
              d="M90 20 L148 40 L148 106 C148 140 122 166 90 178 C58 166 32 140 32 106 L32 40 Z"
              stroke="url(#spGold)"
              strokeWidth="1.5"
              fill="none"
              style={{
                strokeDasharray: 440,
                strokeDashoffset: 440,
                animation: "splashDraw 1300ms 320ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* Estrela superior — 5 pontas */}
            <path
              d="M90 40 L94 52 L107 52 L96 60 L100 72 L90 64 L80 72 L84 60 L73 52 L86 52 Z"
              fill="url(#spGold)"
              style={{
                opacity: 0,
                transformOrigin: "90px 56px",
                animation: "splashStar 600ms 900ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* Chevrons — 3 galões */}
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M60 ${100 + i * 12} L90 ${92 + i * 12} L120 ${100 + i * 12}`}
                stroke="url(#spGold)"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
                style={{
                  strokeDasharray: 90,
                  strokeDashoffset: 90,
                  animation: `splashDraw 500ms ${1050 + i * 120}ms cubic-bezier(.22,1,.36,1) forwards`,
                }}
              />
            ))}

            {/* Balança da Justiça — símbolo institucional socioeducativo */}
            <g
              style={{
                opacity: 0,
                transformOrigin: "90px 158px",
                animation: "splashStar 700ms 1250ms cubic-bezier(.22,1,.36,1) forwards",
              }}
              stroke="url(#spGold)"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              {/* Coluna vertical */}
              <line x1="90" y1="138" x2="90" y2="176" strokeWidth="2.2" />
              {/* Base */}
              <line x1="80" y1="178" x2="100" y2="178" strokeWidth="3" />
              <line x1="84" y1="176" x2="96" y2="176" strokeWidth="1.6" />
              {/* Travessão superior */}
              <line x1="66" y1="140" x2="114" y2="140" strokeWidth="2.2" />
              {/* Finial */}
              <circle cx="90" cy="136" r="2.4" fill="url(#spGold)" stroke="none" />
              {/* Correntes */}
              <line x1="68" y1="142" x2="68" y2="150" strokeWidth="1.2" opacity="0.85" />
              <line x1="112" y1="142" x2="112" y2="150" strokeWidth="1.2" opacity="0.85" />
              {/* Prato esquerdo */}
              <path d="M60 150 Q68 162 76 150" strokeWidth="2" />
              <line x1="60" y1="150" x2="76" y2="150" strokeWidth="1.3" opacity="0.8" />
              {/* Prato direito */}
              <path d="M104 150 Q112 162 120 150" strokeWidth="2" />
              <line x1="104" y1="150" x2="120" y2="150" strokeWidth="1.3" opacity="0.8" />
            </g>



            {/* Louros — arcos laterais */}
            <path
              d="M28 110 Q10 130 32 168"
              stroke="url(#spGold)"
              strokeWidth="1"
              fill="none"
              opacity="0.75"
              style={{
                strokeDasharray: 90,
                strokeDashoffset: 90,
                animation: "splashDraw 900ms 800ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />
            <path
              d="M152 110 Q170 130 148 168"
              stroke="url(#spGold)"
              strokeWidth="1"
              fill="none"
              opacity="0.75"
              style={{
                strokeDasharray: 90,
                strokeDashoffset: 90,
                animation: "splashDraw 900ms 800ms cubic-bezier(.22,1,.36,1) forwards",
              }}
            />

            {/* Rebites cardeais */}
            {[
              { cx: 90, cy: 8 },
              { cx: 90, cy: 192 },
              { cx: 20, cy: 70 },
              { cx: 160, cy: 70 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="2"
                fill="url(#spGold)"
                style={{
                  opacity: 0,
                  animation: `splashDot 400ms ${1500 + i * 80}ms cubic-bezier(.22,1,.36,1) forwards`,
                }}
              />
            ))}
          </svg>
        </div>

        {/* Faixa de patente sob o brasão */}
        <div
          className="mt-6 flex items-center gap-3"
          style={{ animation: "splashFade 700ms 1400ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <span
            className="h-px w-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,74,0.9))" }}
          />
          <span
            className="text-[9px] uppercase tracking-[0.55em]"
            style={{ color: "rgba(201,162,74,0.95)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            SEGURANÇA · SOCIOEDUCATIVA
          </span>
          <span
            className="h-px w-10"
            style={{ background: "linear-gradient(270deg, transparent, rgba(201,162,74,0.9))" }}
          />
        </div>

        {/* Wordmark */}
        <div
          className="mt-6 flex flex-col items-center"
          style={{ animation: "splashFade 700ms 1600ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <div
            className="text-[30px] leading-none tracking-[0.32em] font-light"
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
                marginLeft: "0.32em",
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              Pro
            </span>
          </div>
          <div
            className="mt-3 text-[10px] uppercase tracking-[0.5em]"
            style={{ color: "rgba(234,226,207,0.5)" }}
          >
            Comando · Escala · Vigilância
          </div>
        </div>

        {/* Régua de progresso */}
        <div
          className="mt-10 flex items-center gap-3"
          style={{ animation: "splashFade 500ms 1700ms both" }}
        >
          <span
            className="text-[8px] uppercase tracking-[0.4em]"
            style={{ color: "rgba(234,226,207,0.4)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            SYS
          </span>
          <div
            className="h-[2px] w-[240px] overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #c9a24a 30%, #f6d97a 55%, #c9a24a 80%, transparent 100%)",
                transform: "translateX(-100%)",
                animation: "splashProgress 1800ms 500ms cubic-bezier(.65,.05,.36,1) forwards",
              }}
            />
          </div>
          <span
            className="text-[8px] uppercase tracking-[0.4em]"
            style={{ color: "rgba(201,162,74,0.75)", fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            OK
          </span>
        </div>
      </div>

      <style>{`
        @keyframes splashDraw { to { stroke-dashoffset: 0; } }
        @keyframes splashDot {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splashStar {
          from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
          to   { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes splashMark {
          from { opacity: 0; transform: translateY(10px) scale(0.97); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes splashFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashLineL {
          from { opacity: 0; transform: translateX(-24px) translateY(-50%); }
          to   { opacity: 1; transform: translateX(0) translateY(-50%); }
        }
        @keyframes splashLineR {
          from { opacity: 0; transform: translateX(24px) translateY(-50%); }
          to   { opacity: 1; transform: translateX(0) translateY(-50%); }
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
