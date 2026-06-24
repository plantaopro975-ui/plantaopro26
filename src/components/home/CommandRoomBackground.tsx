/**
 * Sober command-room background. Pure CSS+SVG — no images, no rotating posters.
 * Deep navy gradient + faint topographic contours + hex grid + soft amber radial.
 */
export function CommandRoomBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Base navy gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, hsl(222 60% 12%) 0%, hsl(222 65% 6%) 45%, hsl(222 70% 3%) 100%)',
        }}
      />

      {/* Subtle amber glow zones */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 85% 15%, hsl(38 92% 50% / 0.10) 0%, transparent 35%), radial-gradient(circle at 10% 90%, hsl(38 92% 50% / 0.06) 0%, transparent 40%)',
        }}
      />

      {/* SVG: topographic + hex grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
      >
        <defs>
          <pattern id="bgHexGrid" x="0" y="0" width="44" height="50" patternUnits="userSpaceOnUse">
            <polygon
              points="22,1 42,12 42,38 22,49 2,38 2,12"
              fill="none"
              stroke="hsl(38 92% 50% / 0.07)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="bgFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(222 70% 3%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(222 70% 3%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(222 70% 3%)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* hex grid */}
        <rect width="1920" height="1080" fill="url(#bgHexGrid)" />

        {/* topographic contour lines */}
        <g fill="none" stroke="hsl(38 92% 50% / 0.10)" strokeWidth="0.8">
          <path d="M0,820 Q480,720 960,780 T1920,740" />
          <path d="M0,760 Q480,660 960,720 T1920,680" />
          <path d="M0,700 Q480,600 960,660 T1920,620" />
          <path d="M0,640 Q480,560 960,600 T1920,580" />
          <path d="M0,300 Q480,220 960,280 T1920,260" />
          <path d="M0,240 Q480,160 960,220 T1920,200" />
          <path d="M0,180 Q480,100 960,160 T1920,140" />
        </g>

        {/* Bottom fade for footer readability */}
        <rect width="1920" height="1080" fill="url(#bgFade)" />
      </svg>

      {/* Top + bottom amber accent lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
