/**
 * Command-room backdrop — SVG-only, totalmente responsivo.
 *
 * Estratégia para NUNCA cortar elementos em nenhum viewport
 * (mobile / tablet / desktop / ultrawide):
 *   1. Grid: pattern com unidades fixas em <svg> full-bleed → escala igual em toda tela.
 *   2. Radar central: <svg> próprio com preserveAspectRatio="xMidYMid meet"
 *      e clamp() no tamanho para nunca extrapolar o menor lado.
 *   3. Brackets/labels de canto: 4 SVGs pequenos ancorados em cada canto via CSS,
 *      independentes do viewBox global. Assim os cantos sempre existem.
 *   4. Hairlines: divs 1px topo/base.
 */
export function CommandRoomBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Wash tonal navy → âmbar */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, hsl(222 65% 4% / 0.55) 0%, hsl(220 45% 10% / 0.25) 45%, hsl(42 60% 20% / 0.20) 100%)',
        }}
      />

      {/* Vignette radial para legibilidade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, hsl(222 65% 3% / 0.45) 60%, hsl(222 70% 2% / 0.85) 100%)',
        }}
      />

      {/* GRID full-bleed — patterns em unidades fixas escalam igual em qualquer viewport */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern id="cmdGridFine" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="hsl(220 60% 80% / 0.06)" strokeWidth="0.5" />
          </pattern>
          <pattern id="cmdGridCoarse" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M160 0H0V160" fill="none" stroke="hsl(42 70% 60% / 0.10)" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cmdGridFine)" />
        <rect width="100%" height="100%" fill="url(#cmdGridCoarse)" />
      </svg>

      {/* RADAR central — tamanho responsivo com clamp para nunca ultrapassar o menor lado */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'min(90vw, 90vh, 900px)',
          height: 'min(90vw, 90vh, 900px)',
        }}
      >
        <svg viewBox="-500 -500 1000 1000" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
          <defs>
            <radialGradient id="cmdRadarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(42 90% 60% / 0.10)" />
              <stop offset="70%" stopColor="hsl(42 90% 60% / 0.02)" />
              <stop offset="100%" stopColor="hsl(42 90% 60% / 0)" />
            </radialGradient>
            <radialGradient id="cmdRadarMask" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="70%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="cmdRadarFade">
              <rect x="-500" y="-500" width="1000" height="1000" fill="url(#cmdRadarMask)" />
            </mask>
          </defs>
          <g mask="url(#cmdRadarFade)">
            <circle r="90" fill="url(#cmdRadarGlow)" />
            <circle r="90" fill="none" stroke="hsl(42 80% 60% / 0.30)" strokeWidth="1" />
            <circle r="170" fill="none" stroke="hsl(42 80% 60% / 0.22)" strokeWidth="1" />
            <circle r="260" fill="none" stroke="hsl(42 80% 60% / 0.16)" strokeWidth="0.9" />
            <circle r="360" fill="none" stroke="hsl(42 80% 60% / 0.10)" strokeWidth="0.8" />
            <circle r="460" fill="none" stroke="hsl(42 80% 60% / 0.06)" strokeWidth="0.7" />
            {/* Cruz de mira */}
            <line x1="-500" y1="0" x2="500" y2="0" stroke="hsl(42 80% 60% / 0.14)" strokeWidth="0.6" strokeDasharray="6 8" />
            <line x1="0" y1="-500" x2="0" y2="500" stroke="hsl(42 80% 60% / 0.14)" strokeWidth="0.6" strokeDasharray="6 8" />
            {/* Marcas cardinais */}
            <g fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize="14" fill="hsl(42 60% 65% / 0.40)" letterSpacing="4">
              <text x="0" y="-275" textAnchor="middle">N</text>
              <text x="275" y="5" textAnchor="middle">E</text>
              <text x="0" y="283" textAnchor="middle">S</text>
              <text x="-275" y="5" textAnchor="middle">O</text>
            </g>
          </g>
        </svg>
      </div>

      {/* CORNER BRACKETS — 4 SVGs ancorados individualmente para nunca serem cortados */}
      <CornerMark position="tl" label="SEC · 01" />
      <CornerMark position="tr" label="CH · 04" />
      <CornerMark position="bl" label="M · 01" />
      <CornerMark position="br" label="AES · 256" />

      {/* Hairlines âmbar topo/base */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}

type CornerPosition = 'tl' | 'tr' | 'bl' | 'br';

function CornerMark({ position, label }: { position: CornerPosition; label: string }) {
  // Distância a partir do canto — reduz em telas pequenas para não competir com conteúdo
  const anchor: Record<CornerPosition, string> = {
    tl: 'top-2 left-2 sm:top-4 sm:left-4',
    tr: 'top-2 right-2 sm:top-4 sm:right-4',
    bl: 'bottom-2 left-2 sm:bottom-4 sm:left-4',
    br: 'bottom-2 right-2 sm:bottom-4 sm:right-4',
  };
  // Path do bracket muda para apontar para o canto correto
  const path: Record<CornerPosition, string> = {
    tl: 'M0 20 L0 0 L20 0',
    tr: 'M28 20 L28 0 L8 0',
    bl: 'M0 8 L0 28 L20 28',
    br: 'M28 8 L28 28 L8 28',
  };
  const textAnchor: Record<CornerPosition, 'start' | 'end'> = {
    tl: 'start', tr: 'end', bl: 'start', br: 'end',
  };
  const labelX: Record<CornerPosition, number> = { tl: 26, tr: 2, bl: 26, br: 2 };
  const labelY: Record<CornerPosition, number> = { tl: 12, tr: 12, bl: 22, br: 22 };

  return (
    <svg
      className={`absolute ${anchor[position]}`}
      width="72"
      height="28"
      viewBox="0 0 72 28"
      aria-hidden
    >
      <path d={path[position]} fill="none" stroke="hsl(42 80% 60% / 0.40)" strokeWidth="1.2" />
      <text
        x={position === 'tl' || position === 'bl' ? labelX[position] : 70}
        y={labelY[position]}
        textAnchor={textAnchor[position]}
        fontFamily="'IBM Plex Mono', ui-monospace, monospace"
        fontSize="9"
        letterSpacing="2"
        fill="hsl(42 60% 65% / 0.45)"
      >
        {label}
      </text>
    </svg>
  );
}
