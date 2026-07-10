import { CSSProperties } from "react";

interface BrasaoSentinelaProps {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  animated?: boolean;
  title?: string;
}

/**
 * Brasão Sentinela — mark oficial e único do sistema PlantãoPro.
 * Mesma marca usada na splash screen, no favicon e em toda a UI.
 * Escudo duplo em aço/ouro, estrela de 5 pontas, 3 galões, "P"
 * institucional, arcos de louro e rebites cardeais.
 */
export function BrasaoSentinela({
  size = 96,
  className,
  style,
  animated = false,
  title = "PlantãoPro",
}: BrasaoSentinelaProps) {
  const draw = animated
    ? { strokeDasharray: 520, strokeDashoffset: 520, animation: "brasaoDraw 1200ms cubic-bezier(.22,1,.36,1) forwards" }
    : undefined;
  const draw2 = animated
    ? { strokeDasharray: 440, strokeDashoffset: 440, animation: "brasaoDraw 1200ms 180ms cubic-bezier(.22,1,.36,1) forwards" }
    : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 200"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
      style={style}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="brasaoGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6d97a" />
          <stop offset="50%" stopColor="#c9a24a" />
          <stop offset="100%" stopColor="#7a5a1c" />
        </linearGradient>
        <linearGradient id="brasaoSteel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcdce0" />
          <stop offset="100%" stopColor="#6a6a70" />
        </linearGradient>
        <radialGradient id="brasaoCore" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="rgba(246,217,122,0.28)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Halo */}
      <circle cx="90" cy="100" r="82" fill="url(#brasaoCore)" />

      {/* Escudo externo */}
      <path
        d="M90 8 L160 32 L160 108 C160 148 128 178 90 192 C52 178 20 148 20 108 L20 32 Z"
        stroke="url(#brasaoSteel)"
        strokeWidth="1.4"
        fill="rgba(20,20,15,0.55)"
        style={draw}
      />

      {/* Escudo interno ouro */}
      <path
        d="M90 20 L148 40 L148 106 C148 140 122 166 90 178 C58 166 32 140 32 106 L32 40 Z"
        stroke="url(#brasaoGold)"
        strokeWidth="1.6"
        fill="none"
        style={draw2}
      />

      {/* Estrela superior */}
      <path
        d="M90 40 L94 52 L107 52 L96 60 L100 72 L90 64 L80 72 L84 60 L73 52 L86 52 Z"
        fill="url(#brasaoGold)"
      />

      {/* 3 galões */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M60 ${100 + i * 12} L90 ${92 + i * 12} L120 ${100 + i * 12}`}
          stroke="url(#brasaoGold)"
          strokeWidth="2.6"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
      ))}

      {/* "P" institucional */}
      <path
        d="M78 148 L78 172 M78 148 L94 148 C102 148 106 152 106 158 C106 164 102 168 94 168 L78 168"
        stroke="url(#brasaoGold)"
        strokeWidth="2.8"
        strokeLinecap="square"
        fill="none"
      />

      {/* Louros laterais */}
      <path d="M28 110 Q10 130 32 168" stroke="url(#brasaoGold)" strokeWidth="1" fill="none" opacity="0.75" />
      <path d="M152 110 Q170 130 148 168" stroke="url(#brasaoGold)" strokeWidth="1" fill="none" opacity="0.75" />

      {/* Rebites cardeais */}
      <circle cx="90" cy="8" r="2" fill="url(#brasaoGold)" />
      <circle cx="90" cy="192" r="2" fill="url(#brasaoGold)" />
      <circle cx="20" cy="70" r="2" fill="url(#brasaoGold)" />
      <circle cx="160" cy="70" r="2" fill="url(#brasaoGold)" />

      {animated && (
        <style>{`@keyframes brasaoDraw { to { stroke-dashoffset: 0; } }`}</style>
      )}
    </svg>
  );
}

export default BrasaoSentinela;
