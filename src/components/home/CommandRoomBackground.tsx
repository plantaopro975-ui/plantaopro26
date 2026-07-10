/**
 * Command-room backdrop — SVG-only.
 * Substitui a webp de mapas por composição vetorial profissional:
 *  · Blueprint grid duplo (fino + grosso)
 *  · Radar concêntrico central + cruz de mira sutil
 *  · Rosa dos ventos discreta
 *  · Ganchos de canto e hairlines âmbar
 * Combina com o fundo global do splash (radial navy → preto).
 */
export function CommandRoomBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Wash tonal navy → âmbar para dar profundidade sobre o body */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, hsl(222 65% 4% / 0.55) 0%, hsl(220 45% 10% / 0.25) 45%, hsl(42 60% 20% / 0.20) 100%)',
        }}
      />

      {/* Vignette radial para legibilidade do conteúdo central */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, hsl(222 65% 3% / 0.45) 60%, hsl(222 70% 2% / 0.85) 100%)',
        }}
      />

      {/* Camada SVG principal */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
      >
        <defs>
          {/* Grid fino */}
          <pattern id="bpFine" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="hsl(220 60% 80% / 0.06)" strokeWidth="0.5" />
          </pattern>
          {/* Grid grosso */}
          <pattern id="bpCoarse" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M160 0H0V160" fill="none" stroke="hsl(42 70% 60% / 0.10)" strokeWidth="0.9" />
          </pattern>
          {/* Gradiente radial para o radar */}
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(42 90% 60% / 0.10)" />
            <stop offset="70%" stopColor="hsl(42 90% 60% / 0.02)" />
            <stop offset="100%" stopColor="hsl(42 90% 60% / 0)" />
          </radialGradient>
          {/* Fade para máscara das linhas do radar */}
          <radialGradient id="radarMask" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="radarFade">
            <rect width="1920" height="1080" fill="url(#radarMask)" />
          </mask>
        </defs>

        {/* Grids */}
        <rect width="1920" height="1080" fill="url(#bpFine)" />
        <rect width="1920" height="1080" fill="url(#bpCoarse)" />

        {/* Radar concêntrico central (mascarado com fade radial) */}
        <g mask="url(#radarFade)" transform="translate(960 540)">
          <circle r="140" fill="none" stroke="hsl(42 80% 60% / 0.28)" strokeWidth="1" />
          <circle r="240" fill="none" stroke="hsl(42 80% 60% / 0.22)" strokeWidth="1" />
          <circle r="360" fill="none" stroke="hsl(42 80% 60% / 0.16)" strokeWidth="0.9" />
          <circle r="500" fill="none" stroke="hsl(42 80% 60% / 0.10)" strokeWidth="0.8" />
          <circle r="660" fill="none" stroke="hsl(42 80% 60% / 0.06)" strokeWidth="0.7" />
          <circle r="140" fill="url(#radarGlow)" />
          {/* Cruz de mira */}
          <line x1="-720" y1="0" x2="720" y2="0" stroke="hsl(42 80% 60% / 0.14)" strokeWidth="0.6" strokeDasharray="6 8" />
          <line x1="0" y1="-560" x2="0" y2="560" stroke="hsl(42 80% 60% / 0.14)" strokeWidth="0.6" strokeDasharray="6 8" />
          {/* Marcas cardinais */}
          <g fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="11" fill="hsl(42 60% 65% / 0.35)" letterSpacing="4">
            <text x="0" y="-370" textAnchor="middle">N</text>
            <text x="370" y="4" textAnchor="middle">E</text>
            <text x="0" y="378" textAnchor="middle">S</text>
            <text x="-370" y="4" textAnchor="middle">O</text>
          </g>
        </g>

        {/* Ganchos de canto (brackets) — 4 cantos */}
        <g stroke="hsl(42 80% 60% / 0.35)" strokeWidth="1.2" fill="none">
          <path d="M48 96 L48 48 L96 48" />
          <path d="M1872 96 L1872 48 L1824 48" />
          <path d="M48 984 L48 1032 L96 1032" />
          <path d="M1872 984 L1872 1032 L1824 1032" />
        </g>

        {/* Etiquetas monospace nos cantos */}
        <g fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="12" fill="hsl(42 60% 65% / 0.30)" letterSpacing="3">
          <text x="72" y="42">SEC · 01</text>
          <text x="1848" y="42" textAnchor="end">CH · 04</text>
          <text x="72" y="1050">M · 01</text>
          <text x="1848" y="1050" textAnchor="end">AES · 256</text>
        </g>
      </svg>

      {/* Hairlines âmbar topo e base */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
