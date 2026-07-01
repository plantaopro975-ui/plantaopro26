import heroCommand from '@/assets/hero-command.jpg';

/**
 * Professional public-security command room backdrop.
 * Khaki + royal blue palette matching the tactical agent uniform.
 */
export function CommandRoomBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Base khaki fallback */}
      <div className="absolute inset-0 bg-background" />

      {/* Hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroCommand})` }}
      />

      {/* Navy + Gold tonal wash — Obsidian Command */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, hsl(222 65% 4% / 0.85) 0%, hsl(220 45% 10% / 0.55) 45%, hsl(42 60% 22% / 0.45) 100%)',
        }}
      />

      {/* Radial vignette for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, hsl(222 65% 3% / 0.55) 65%, hsl(222 70% 2% / 0.88) 100%)',
        }}
      />

      {/* Blueprint micro-grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.25]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1920 1080"
      >
        <defs>
          <pattern id="bpFine" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="hsl(220 60% 80% / 0.08)" strokeWidth="0.5" />
          </pattern>
          <pattern id="bpCoarse" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M160 0H0V160" fill="none" stroke="hsl(220 60% 85% / 0.12)" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#bpFine)" />
        <rect width="1920" height="1080" fill="url(#bpCoarse)" />
      </svg>

      {/* Top + bottom hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
