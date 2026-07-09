/**
 * Decorative SVG backdrop for the Agent Panel.
 * Public-security / tactical theme — shield, radar sweep, blueprint grid,
 * concentric rings and hairlines. Pointer-events disabled and fixed so it
 * never intercepts clicks or covers panels/icons — pure background art.
 */
export function PublicSecurityBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="psbVign" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="hsl(220 40% 8% / 0)" />
            <stop offset="70%" stopColor="hsl(220 50% 5% / 0.35)" />
            <stop offset="100%" stopColor="hsl(220 60% 3% / 0.75)" />
          </radialGradient>
          <linearGradient id="psbAccent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(45 90% 55% / 0)" />
            <stop offset="50%" stopColor="hsl(45 90% 55% / 0.5)" />
            <stop offset="100%" stopColor="hsl(45 90% 55% / 0)" />
          </linearGradient>
          <pattern id="psbGridFine" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="hsl(220 50% 70% / 0.05)" strokeWidth="0.5" />
          </pattern>
          <pattern id="psbGridCoarse" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M200 0H0V200" fill="none" stroke="hsl(220 50% 75% / 0.08)" strokeWidth="0.8" />
          </pattern>
          <filter id="psbGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* base vignette */}
        <rect width="1920" height="1080" fill="url(#psbVign)" />

        {/* blueprint grids */}
        <rect width="1920" height="1080" fill="url(#psbGridFine)" opacity="0.6" />
        <rect width="1920" height="1080" fill="url(#psbGridCoarse)" opacity="0.7" />

        {/* left shield emblem (large, subtle) */}
        <g transform="translate(220 540)" opacity="0.10">
          <path
            d="M0 -220 L180 -140 L180 60 C180 170 100 240 0 280 C-100 240 -180 170 -180 60 L-180 -140 Z"
            fill="none"
            stroke="hsl(45 85% 55%)"
            strokeWidth="2.5"
          />
          <path
            d="M0 -180 L140 -110 L140 50 C140 140 80 200 0 232 C-80 200 -140 140 -140 50 L-140 -110 Z"
            fill="none"
            stroke="hsl(220 70% 70%)"
            strokeWidth="1.5"
          />
          {/* star inside */}
          <path
            d="M0 -70 L18 -22 L68 -22 L28 8 L42 56 L0 26 L-42 56 L-28 8 L-68 -22 L-18 -22 Z"
            fill="hsl(45 85% 55% / 0.6)"
          />
        </g>

        {/* right radar sweep (concentric rings + cross-hairs) */}
        <g transform="translate(1620 540)" opacity="0.12">
          {[80, 160, 240, 320, 400].map((r) => (
            <circle
              key={r}
              cx="0"
              cy="0"
              r={r}
              fill="none"
              stroke="hsl(220 70% 75%)"
              strokeWidth={r === 400 ? 1.4 : 0.9}
              strokeDasharray={r === 240 ? '4 6' : undefined}
            />
          ))}
          <line x1="-420" y1="0" x2="420" y2="0" stroke="hsl(220 70% 75%)" strokeWidth="0.8" />
          <line x1="0" y1="-420" x2="0" y2="420" stroke="hsl(220 70% 75%)" strokeWidth="0.8" />
          {/* sweep wedge */}
          <path
            d="M0 0 L400 0 A400 400 0 0 0 283 -283 Z"
            fill="hsl(45 90% 55% / 0.10)"
            filter="url(#psbGlow)"
          />
        </g>

        {/* corner tactical brackets */}
        {[
          { x: 40, y: 40, r: 0 },
          { x: 1880, y: 40, r: 90 },
          { x: 1880, y: 1040, r: 180 },
          { x: 40, y: 1040, r: 270 },
        ].map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.r})`} opacity="0.35">
            <path d="M0 0 L60 0 M0 0 L0 60" stroke="hsl(45 90% 60%)" strokeWidth="1.5" fill="none" />
          </g>
        ))}

        {/* horizontal accent hairlines */}
        <rect x="0" y="120" width="1920" height="1" fill="url(#psbAccent)" />
        <rect x="0" y="960" width="1920" height="1" fill="url(#psbAccent)" />

        {/* faint coordinate ticks along top */}
        <g opacity="0.18" fill="hsl(220 40% 80%)" fontFamily="monospace" fontSize="10">
          {Array.from({ length: 12 }).map((_, i) => (
            <text key={i} x={80 + i * 160} y="30" textAnchor="middle">
              {`0${i + 1}`.slice(-2)}°
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
