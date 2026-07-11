/**
 * MadeInFeijoBadge — Selo discreto de origem
 *
 * SVG inline, tipografia mono, ancorado em `position: fixed` no canto
 * inferior-esquerdo. Não redimensiona layout nem interfere em cliques
 * (pointer-events-none). Aparece apenas em telas ≥ sm para não competir
 * com toolbars/mobile nav.
 */
export function MadeInFeijoBadge() {
  return (
    <div
      aria-hidden={false}
      role="note"
      title="Desenvolvido em Feijó, Acre — Brasil"
      className="pointer-events-none fixed bottom-1 left-1 z-[55] hidden sm:block select-none opacity-60 hover:opacity-100 transition-opacity"
      style={{ mixBlendMode: 'normal' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 168 22"
        width="126"
        height="16.5"
        role="img"
        aria-label="Feito em Feijó, Acre, Brasil"
      >
        <defs>
          <linearGradient id="mif-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1220" stopOpacity="0.92" />
            <stop offset="1" stopColor="#050912" stopOpacity="0.94" />
          </linearGradient>
          <linearGradient id="mif-accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Cápsula */}
        <rect
          x="0.5"
          y="0.5"
          width="167"
          height="21"
          rx="4"
          fill="url(#mif-bg)"
          stroke="#1e293b"
          strokeWidth="1"
        />

        {/* Faixa amarela — barra de acento à esquerda */}
        <rect x="1" y="1" width="3.2" height="20" rx="1" fill="url(#mif-accent)" />

        {/* Pin de localização */}
        <g transform="translate(10 4.5)" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 0.6 C3.2 0.6 1 2.7 1 5.4 C1 8.6 6 13 6 13 C6 13 11 8.6 11 5.4 C11 2.7 8.8 0.6 6 0.6 Z" />
          <circle cx="6" cy="5.3" r="1.7" fill="#0b1220" />
        </g>

        {/* Texto — Made in */}
        <text
          x="26"
          y="9.6"
          fill="#94a3b8"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
          fontSize="5.6"
          fontWeight="600"
          letterSpacing="1.6"
        >
          MADE IN
        </text>

        {/* Texto — FEIJÓ · ACRE */}
        <text
          x="26"
          y="17.4"
          fill="#f1f5f9"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
          fontSize="7.2"
          fontWeight="800"
          letterSpacing="1.4"
        >
          FEIJÓ · ACRE
        </text>

        {/* Selo circular BR à direita */}
        <g transform="translate(146 3)">
          <circle cx="8" cy="8" r="7.4" fill="#0f172a" stroke="#fbbf24" strokeWidth="0.9" />
          <text
            x="8"
            y="10.4"
            textAnchor="middle"
            fill="#fbbf24"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontSize="6.4"
            fontWeight="800"
            letterSpacing="0.4"
          >
            BR
          </text>
        </g>
      </svg>
    </div>
  );
}

export default MadeInFeijoBadge;
