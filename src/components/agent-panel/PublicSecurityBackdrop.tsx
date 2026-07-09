/**
 * Decorative SVG backdrop for the Agent Panel.
 * Public-security / tactical theme. Sits ABOVE ThemedPanelBackground's dark
 * gradients but BELOW panel cards — pointer-events disabled so it never
 * intercepts clicks. Opacities are tuned to remain visible over the theme's
 * dark overlays without competing with foreground content.
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
        // Sits above ThemedPanelBackground base (z-0 outside stacking context)
        // and stays below the content wrapper (z-10) that hosts the panel.
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="psbCenter" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="hsl(45 90% 55% / 0.06)" />
            <stop offset="70%" stopColor="hsl(220 60% 10% / 0)" />
            <stop offset="100%" stopColor="hsl(220 70% 3% / 0.35)" />
          </radialGradient>
          <linearGradient id="psbAccent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(45 90% 55% / 0)" />
            <stop offset="50%" stopColor="hsl(45 90% 60% / 0.9)" />
            <stop offset="100%" stopColor="hsl(45 90% 55% / 0)" />
          </linearGradient>
          <pattern id="psbGridFine" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="hsl(220 60% 75% / 0.18)" strokeWidth="0.6" />
          </pattern>
          <pattern id="psbGridCoarse" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M200 0H0V200" fill="none" stroke="hsl(220 60% 80% / 0.24)" strokeWidth="1" />
          </pattern>
          <filter id="psbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* soft center wash */}
        <rect width="1920" height="1080" fill="url(#psbCenter)" />

        {/* blueprint grids — visible but not distracting */}
        <rect width="1920" height="1080" fill="url(#psbGridFine)" />
        <rect width="1920" height="1080" fill="url(#psbGridCoarse)" />

        {/* left shield emblem */}
        <g transform="translate(240 560)" opacity="0.32">
          <path
            d="M0 -240 L200 -155 L200 65 C200 185 110 260 0 305 C-110 260 -200 185 -200 65 L-200 -155 Z"
            fill="hsl(220 60% 8% / 0.25)"
            stroke="hsl(45 90% 60%)"
            strokeWidth="2.5"
          />
          <path
            d="M0 -200 L155 -122 L155 55 C155 155 88 218 0 253 C-88 218 -155 155 -155 55 L-155 -122 Z"
            fill="none"
            stroke="hsl(220 80% 78%)"
            strokeWidth="1.5"
          />
          {/* star */}
          <path
            d="M0 -80 L21 -25 L78 -25 L32 10 L48 65 L0 30 L-48 65 L-32 10 L-78 -25 L-21 -25 Z"
            fill="hsl(45 90% 60%)"
            opacity="0.85"
          />
          <text x="0" y="150" textAnchor="middle" fontFamily="monospace" fontSize="14" fill="hsl(45 90% 65%)" letterSpacing="4">
            SEGURANÇA PÚBLICA
          </text>
        </g>

        {/* right radar */}
        <g transform="translate(1640 540)" opacity="0.35">
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
          <path
            d="M0 0 L440 0 A440 440 0 0 0 311 -311 Z"
            fill="hsl(45 90% 55% / 0.22)"
            filter="url(#psbGlow)"
          />
          <circle cx="0" cy="0" r="6" fill="hsl(45 90% 65%)" />
        </g>

        {/* corner tactical brackets */}
        {[
          { x: 40, y: 40, r: 0 },
          { x: 1880, y: 40, r: 90 },
          { x: 1880, y: 1040, r: 180 },
          { x: 40, y: 1040, r: 270 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`} opacity="0.7">
            <path
              d="M0 0 L72 0 M0 0 L0 72"
              stroke="hsl(45 90% 62%)"
              strokeWidth="2"
              fill="none"
            />
          </g>
        ))}

        {/* horizontal accent hairlines */}
        <rect x="0" y="140" width="1920" height="1.5" fill="url(#psbAccent)" opacity="0.9" />
        <rect x="0" y="960" width="1920" height="1.5" fill="url(#psbAccent)" opacity="0.9" />

        {/* coordinate ticks */}
        <g opacity="0.4" fill="hsl(220 40% 82%)" fontFamily="monospace" fontSize="10" letterSpacing="1">
          {Array.from({ length: 12 }).map((_, i) => (
            <text key={i} x={80 + i * 160} y="30" textAnchor="middle">
              {`0${i + 1}`.slice(-2)}°
            </text>
          ))}
        </g>

        {/* subtle central diamond mark */}
        <g transform="translate(960 540)" opacity="0.18">
          <path d="M0 -320 L320 0 L0 320 L-320 0 Z" fill="none" stroke="hsl(220 60% 75%)" strokeWidth="0.8" strokeDasharray="6 8" />
          <path d="M0 -200 L200 0 L0 200 L-200 0 Z" fill="none" stroke="hsl(45 80% 60%)" strokeWidth="0.8" strokeDasharray="3 6" />
        </g>
      </svg>
    </div>
  );
}
