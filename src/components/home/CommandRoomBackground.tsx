/**
 * Refined operations background — graphite slate, blueprint micro-grid,
 * soft diagonal light beam. No hex, no topographic clutter, no images.
 */
export function CommandRoomBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Base graphite gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, hsl(220 20% 10%) 0%, hsl(222 22% 7%) 45%, hsl(224 24% 5%) 100%)',
        }}
      />

      {/* Soft diagonal light beam */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, transparent 0%, transparent 40%, hsl(38 92% 55% / 0.05) 55%, transparent 70%)',
        }}
      />

      {/* Ambient amber wash (top-right) + cool wash (bottom-left) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 90% 0%, hsl(38 92% 55% / 0.08) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 0% 100%, hsl(210 80% 40% / 0.06) 0%, transparent 65%)',
        }}
      />

      {/* Blueprint micro-grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.35]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
      >
        <defs>
          <pattern id="bpFine" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="hsl(210 30% 60% / 0.05)" strokeWidth="0.5" />
          </pattern>
          <pattern id="bpCoarse" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M160 0H0V160" fill="none" stroke="hsl(210 30% 70% / 0.08)" strokeWidth="0.8" />
          </pattern>
          <radialGradient id="bpVignette" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="hsl(220 24% 5%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(220 24% 4%)" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bpFine)" />
        <rect width="1920" height="1080" fill="url(#bpCoarse)" />
        <rect width="1920" height="1080" fill="url(#bpVignette)" />
      </svg>

      {/* Top + bottom hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
    </div>
  );
}
