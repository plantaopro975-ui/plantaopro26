import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";

/**
 * Splash — "Boot Tático" v9.
 * Direção institucional cotando o HUD do site (amber-on-navy, grid, brackets,
 * telemetria monospace, wordmark serifa + estêncil ISE). Duração ~2.6s.
 * Respeita prefers-reduced-motion.
 */

let splashMountedThisRuntime = false;

const GOLD = "#f4c974";
const GOLD_DEEP = "#c9922b";
const INK = "#e9edf3";
const NAVY_0 = "#050505";

const BOOT_LINES: { t: string; msg: string; hot?: boolean }[] = [
  { t: "0.12", msg: "Iniciando módulos ISE..." },
  { t: "0.45", msg: "Verificando credenciais..." },
  { t: "1.12", msg: "Sincronizando escalas..." },
  { t: "2.04", msg: "Sistema pronto. Acessando...", hot: true },
];

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !splashMountedThisRuntime);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    pushDiagEvent("info", "splash_mount", { willRender: visible });
    if (!visible) return;
    splashMountedThisRuntime = true;
    const t1 = window.setTimeout(() => setFadeOut(true), 2600);
    const t2 = window.setTimeout(() => setVisible(false), 3250);
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
          "radial-gradient(ellipse 90% 60% at 50% 45%, #0A1128 0%, #060912 60%, #050505 100%)",
        color: GOLD,
        fontFamily: "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 650ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* HUD grid layer */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(244,201,116,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(244,201,116,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />

      {/* Scanline */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px]"
          style={{
            top: 0,
            background: `linear-gradient(90deg, transparent, ${GOLD}22, transparent)`,
            animation: "spScan 3.6s linear infinite",
          }}
        />
      </div>

      {/* Frame brackets */}
      {[
        "top-6 left-6 border-t-2 border-l-2",
        "top-6 right-6 border-t-2 border-r-2",
        "bottom-6 left-6 border-b-2 border-l-2",
        "bottom-6 right-6 border-b-2 border-r-2",
      ].map((cls, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute w-9 h-9 ${cls}`}
          style={{
            borderColor: `${GOLD}66`,
            animation: `spFade 500ms ${120 + i * 80}ms both`,
          }}
        />
      ))}

      {/* Top telemetry */}
      <div
        className="absolute top-8 left-8 right-8 flex items-start justify-between text-[10px] uppercase tracking-[0.22em]"
        style={{ color: `${INK}99`, animation: "spFade 600ms 200ms both" }}
      >
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: GOLD,
                boxShadow: `0 0 6px ${GOLD}`,
                animation: "spPulse 1.4s ease-in-out infinite",
              }}
            />
            <span style={{ color: GOLD }}>Secure link established</span>
          </span>
          <span>ID: ISE-ACRE // OPS-ALPHA</span>
        </div>
        <div className="text-right leading-relaxed">
          <div>LAT: 9.9748° S</div>
          <div>LON: 67.8111° W</div>
        </div>
      </div>

      {/* Central composition */}
      <div className="relative z-10 flex flex-col items-center px-8">
        {/* Emblema — hexágono ISE em ouro */}
        <div
          className="relative mb-8"
          style={{ animation: "spRise 900ms cubic-bezier(.22,1,.36,1) both" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${GOLD}33`,
              animation: "spSpin 14s linear infinite",
              inset: "-14px",
            }}
          />
          <svg width="86" height="86" viewBox="0 0 100 100" aria-hidden>
            <defs>
              <linearGradient id="spGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f4c974" />
                <stop offset="55%" stopColor="#c9922b" />
                <stop offset="100%" stopColor="#7a5312" />
              </linearGradient>
            </defs>
            <polygon
              points="50,6 88,28 88,72 50,94 12,72 12,28"
              fill="none"
              stroke="url(#spGold)"
              strokeWidth="2.2"
              strokeLinejoin="miter"
            />
            <polygon
              points="50,18 78,34 78,66 50,82 22,66 22,34"
              fill="none"
              stroke={`${GOLD}66`}
              strokeWidth="0.8"
            />
            {/* Monograma P */}
            <g stroke="url(#spGold)" strokeWidth="3.2" strokeLinecap="square" fill="none">
              <path d="M40 30 L40 70" />
              <path d="M40 30 L56 30 C64 30 68 36 68 42 C68 48 64 54 56 54 L40 54" />
            </g>
            <path
              d="M44 34 L56 34 C60 34 62 38 62 42 C62 46 60 50 56 50 L44 50 Z"
              fill="url(#spGold)"
              opacity="0.18"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div
          className="flex flex-col items-center"
          style={{ animation: "spFade 700ms 500ms both" }}
        >
          <h1
            className="text-[44px] md:text-[54px] leading-none tracking-tight relative"
            style={{
              fontFamily:
                "'Libre Baskerville', 'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: INK,
            }}
          >
            PLANTÃO{" "}
            <span
              style={{
                background: `linear-gradient(180deg, ${GOLD}, ${GOLD_DEEP})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PRO
            </span>
            <span
              aria-hidden
              className="absolute -bottom-2 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, ${GOLD}88, transparent)`,
              }}
            />
          </h1>

          <p
            className="mt-5 text-[11px] uppercase"
            style={{
              color: `${GOLD}cc`,
              letterSpacing: "0.4em",
              animation: "spFade 700ms 750ms both",
            }}
          >
            Sistema Profissional · Escala · Banco de Horas
          </p>
        </div>

        {/* Console boot log */}
        <div
          className="mt-10 w-[280px] text-[9px] uppercase tracking-[0.18em] flex flex-col gap-1.5"
          style={{ color: `${GOLD}99` }}
        >
          {BOOT_LINES.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span style={{ opacity: 0.45 }}>[{line.t}]</span>
              <span
                className="sp-boot-line overflow-hidden whitespace-nowrap"
                style={{
                  animation: `spType 380ms steps(22) ${400 * (i + 1)}ms forwards`,
                  color: line.hot ? GOLD : undefined,
                  fontWeight: line.hot ? 600 : 400,
                  borderRight:
                    i === BOOT_LINES.length - 1 ? "none" : `2px solid ${GOLD}`,
                  width: 0,
                }}
              >
                {line.msg}
              </span>
            </div>
          ))}
        </div>

        {/* Progress rail */}
        <div
          className="mt-10 w-[280px] h-[3px] relative overflow-hidden"
          style={{
            background: `${GOLD}18`,
            animation: "spFade 500ms 900ms both",
          }}
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: "0%",
              background: `linear-gradient(90deg, ${GOLD_DEEP}, ${GOLD})`,
              boxShadow: `0 0 10px ${GOLD}`,
              animation: "spFill 2.2s cubic-bezier(.65,.05,.36,1) 300ms forwards",
            }}
          />
        </div>
      </div>

      {/* Bottom telemetry */}
      <div
        className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-[9px] uppercase tracking-[0.28em]"
        style={{ color: `${INK}66`, animation: "spFade 700ms 1000ms both" }}
      >
        <span>M-01 · SIGILO · AES-256</span>
        <span>ISE / ACRE · v2.7</span>
      </div>

      <style>{`
        @keyframes spFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spRise {
          from { opacity: 0; transform: translateY(14px) scale(0.94); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes spScan {
          0%   { top: -2%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 102%; opacity: 0; }
        }
        @keyframes spPulse {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.4; }
        }
        @keyframes spSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spType {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes spFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] * {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
}
