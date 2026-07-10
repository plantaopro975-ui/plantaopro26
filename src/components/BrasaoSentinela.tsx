import { CSSProperties } from "react";
import brasaoSvg from "@/assets/brand/brasao-sentinela.svg?url";
import brasaoAsset from "@/assets/brand/brasao-sentinela-hd.png.asset.json";

interface BrasaoSentinelaProps {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  animated?: boolean;
  title?: string;
  /**
   * Força o uso da versão raster (PNG HD) em vez do SVG vetorial.
   * Útil para exportações, OG images e casos onde queremos o render fotorrealista.
   */
  raster?: boolean;
}

/**
 * Brasão Sentinela — logomarca oficial do PlantãoPro.
 *
 * Por padrão renderiza a versão SVG vetorial (nitidez em qualquer tamanho,
 * ideal para UI, favicons e Retina). Passe `raster` para usar o PNG HD 3D.
 * Fonte única de verdade da marca em todo o app.
 */
export function BrasaoSentinela({
  size = 96,
  className,
  style,
  animated = false,
  title = "PlantãoPro — Brasão oficial",
  raster = false,
}: BrasaoSentinelaProps) {
  const dim = typeof size === "number" ? `${size}px` : size;

  const composedStyle: CSSProperties = {
    width: dim,
    height: dim,
    filter:
      "drop-shadow(0 6px 18px rgba(201,168,76,0.28)) drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
    ...(animated
      ? {
          animation:
            "brasaoIn 900ms cubic-bezier(.22,1,.36,1) both, brasaoFloat 6s ease-in-out 900ms infinite",
        }
      : {}),
    ...style,
  };

  const src = raster ? brasaoAsset.url : brasaoSvg;

  return (
    <>
      <img
        src={src}
        alt={title}
        title={title}
        role="img"
        width={raster ? 1536 : 512}
        height={raster ? 1536 : 512}
        draggable={false}
        loading="eager"
        decoding="async"
        className={className}
        style={composedStyle}
      />
      {animated && (
        <style>{`
          @keyframes brasaoIn {
            0%   { opacity: 0; transform: scale(0.82) translateY(6px); }
            60%  { opacity: 1; transform: scale(1.03) translateY(-1px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes brasaoFloat {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-3px); }
          }
        `}</style>
      )}
    </>
  );
}

export default BrasaoSentinela;

