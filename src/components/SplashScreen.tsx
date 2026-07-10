import { useEffect, useState } from "react";
import { pushDiagEvent } from "@/lib/diagLog";
import splashAsset from "@/assets/brand/plantaopro-splash.jpg.asset.json";

/**
 * Splash — v10 "Institucional Cinematográfico".
 * Exibe a arte oficial PlantãoPro (agente + viatura + wordmark) em fullscreen
 * antes do login/PlantaoHome. Uma vez por runtime. Preload eager + fallback
 * gradiente garante que nunca há flash em branco em qualquer navegador.
 * Respeita prefers-reduced-motion.
 */

const SPLASH_URL = splashAsset.url;

// Cache global — não remonta ao navegar entre rotas
let splashMountedThisRuntime = false;

// Preload assíncrono no módulo load (roda antes do primeiro render)
if (typeof window !== "undefined") {
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = SPLASH_URL;
  } catch {
    /* noop */
  }
}

const HOLD_MS = 1600;
const FADE_MS = 550;

export function SplashScreen() {
  const [visible, setVisible] = useState(() => !splashMountedThisRuntime);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    pushDiagEvent("info", "splash_mount", { willRender: visible });
    if (!visible) return;
    splashMountedThisRuntime = true;

    // Trava scroll enquanto splash está visível
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t1 = window.setTimeout(() => setFadeOut(true), HOLD_MS);
    const t2 = window.setTimeout(
      () => setVisible(false),
      HOLD_MS + FADE_MS + 30,
    );

    // Safety net: força desmontar em 5s caso algo trave
    const safety = window.setTimeout(() => {
      setFadeOut(true);
      setVisible(false);
    }, 5000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(safety);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Carregando PlantãoPro"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        // Fallback gradiente idêntico à paleta da arte — se a imagem demorar,
        // o usuário já vê a tonalidade correta, sem flash branco.
        background:
          "radial-gradient(ellipse 90% 60% at 60% 45%, #1a1408 0%, #0a0c12 55%, #050505 100%)",
        opacity: fadeOut ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: "opacity",
      }}
    >
      {/* Imagem institucional — object-cover para preencher qualquer viewport
          sem barras. object-position centraliza o agente em telas estreitas. */}
      <img
        src={SPLASH_URL}
        alt="PlantãoPro — Controle de Plantão, Escala e Banco de Horas"
        draggable={false}
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attribute
        fetchpriority="high"
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
        style={{
          objectFit: "cover",
          objectPosition: "center center",
          animation: "spSplashIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      />

      {/* Vinheta sutil para dar profundidade e integrar bordas em telas ultra-wide */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Barra de progresso institucional na base */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[220px] h-[2px] overflow-hidden rounded-full"
        style={{
          background: "rgba(244, 201, 116, 0.15)",
          animation: "spSplashFade 400ms 200ms both",
        }}
      >
        <div
          className="h-full"
          style={{
            width: "0%",
            background:
              "linear-gradient(90deg, #c9922b 0%, #f4c974 55%, #f4c974 100%)",
            boxShadow: "0 0 10px rgba(244, 201, 116, 0.7)",
            animation: `spSplashFill ${HOLD_MS}ms cubic-bezier(0.65, 0.05, 0.36, 1) 100ms forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes spSplashIn {
          from { opacity: 0; transform: scale(1.04); filter: blur(4px); }
          to   { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes spSplashFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spSplashFill {
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
