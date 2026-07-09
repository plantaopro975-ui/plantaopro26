/**
 * Decorative SVG backdrop for the Agent Panel.
 * Rasterized once by the browser (fixed layer, no filters, no animations)
 * so it never repaints on scroll.
 */
export function PublicSecurityBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        transform: 'translateZ(0)',
        contain: 'strict',
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="psbCenter" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="hsl(45 90% 55% / 0.05)" />
            <stop offset="70%" stopColor="hsl(220 60% 10% / 0)" />
            <stop offset="100%" stopColor="hsl(220 70% 3% / 0.35)" />
          </radialGradient>
          <linearGradient id="psbAccent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(45 90% 55% / 0)" />
            <stop offset="50%" stopColor="hsl(45 90% 60% / 0.85)" />
            <stop offset="100%" stopColor="hsl(45 90% 55% / 0)" />
          </linearGradient>
          <pattern id="psbGridCoarse" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M200 0H0V200" fill="none" stroke="hsl(220 60% 80% / 0.20)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1920" height="1080" fill="url(#psbCenter)" />
        <rect width="1920" height="1080" fill="url(#psbGridCoarse)" />

        {/* left shield emblem */}
        <g transform="translate(240 560)" opacity="0.28">
          <path
            d="M0 -240 L200 -155 L200 65 C200 185 110 260 0 305 C-110 260 -200 185 -200 65 L-200 -155 Z"
            fill="hsl(220 60% 8% / 0.25)"
            stroke="hsl(45 90% 60%)"
            strokeWidth="2.5"
          />
          <path
            d="M0 -80 L21 -25 L78 -25 L32 10 L48 65 L0 30 L-48 65 L-32 10 L-78 -25 L-21 -25 Z"
            fill="hsl(45 90% 60%)"
            opacity="0.85"
          />
          <text x="0" y="150" textAnchor="middle" fontFamily="monospace" fontSize="14" fill="hsl(45 90% 65%)" letterSpacing="4">
            SEGURANÇA PÚBLICA
          </text>
        </g>

        {/* right radar (no blur filter — was a huge repaint cost) */}
        <g transform="translate(1640 540)" opacity="0.30">
          {[90, 180, 270, 360, 440].map((r, i) => (
            <circle
              key={r}
              cx="0"
              cy="0"
              r={r}
              fill="none"
              stroke="hsl(220 75% 78%)"
              strokeWidth={i === 4 ? 1.4 : 0.9}
              strokeDasharray={i === 2 ? '4 6' : undefined}
            />
          ))}
          <line x1="-460" y1="0" x2="460" y2="0" stroke="hsl(220 75% 78%)" strokeWidth="0.9" />
          <line x1="0" y1="-460" x2="0" y2="460" stroke="hsl(220 75% 78%)" strokeWidth="0.9" />
          <path d="M0 0 L440 0 A440 440 0 0 0 311 -311 Z" fill="hsl(45 90% 55% / 0.18)" />
          <circle cx="0" cy="0" r="6" fill="hsl(45 90% 65%)" />
        </g>

        {/* corner tactical brackets */}
        {[
          { x: 40, y: 40, r: 0 },
          { x: 1880, y: 40, r: 90 },
          { x: 1880, y: 1040, r: 180 },
          { x: 40, y: 1040, r: 270 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`} opacity="0.6">
            <path d="M0 0 L72 0 M0 0 L0 72" stroke="hsl(45 90% 62%)" strokeWidth="2" fill="none" />
          </g>
        ))}

        <rect x="0" y="140" width="1920" height="1.5" fill="url(#psbAccent)" />
        <rect x="0" y="960" width="1920" height="1.5" fill="url(#psbAccent)" />
      </svg>
    </div>
  );
}
