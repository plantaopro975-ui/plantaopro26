import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// Theme-specific visual effects and styling
const themeConfigs: Record<string, {
  gradient: string;
  glowColor: string;
  accentColor: string;
  borderColor: string;
  pattern: 'hexagon' | 'circuit' | 'military' | 'frost' | 'fire' | 'waves' | 'classic';
  animation: string;
}> = {
  tactical: {
    gradient: 'from-emerald-500 via-green-400 to-emerald-600',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50',
    pattern: 'military',
    animation: 'animate-pulse',
  },
  cyber: {
    gradient: 'from-cyan-400 via-blue-500 to-purple-500',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/50',
    pattern: 'circuit',
    animation: 'animate-gradient-x',
  },
  crimson: {
    gradient: 'from-red-500 via-rose-500 to-orange-500',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    accentColor: 'text-red-400',
    borderColor: 'border-red-500/50',
    pattern: 'fire',
    animation: 'animate-pulse',
  },
  arctic: {
    gradient: 'from-blue-300 via-cyan-200 to-white',
    glowColor: 'rgba(147, 197, 253, 0.5)',
    accentColor: 'text-blue-300',
    borderColor: 'border-blue-300/50',
    pattern: 'frost',
    animation: 'animate-gradient-x',
  },
  military: {
    gradient: 'from-amber-500 via-yellow-500 to-amber-600',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    pattern: 'military',
    animation: 'animate-pulse',
  },
  sentinel: {
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    pattern: 'military',
    animation: 'animate-pulse',
  },
  stealth: {
    gradient: 'from-slate-400 via-zinc-400 to-slate-500',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    accentColor: 'text-slate-300',
    borderColor: 'border-slate-500/50',
    pattern: 'hexagon',
    animation: 'animate-gradient-x',
  },
  nightops: {
    gradient: 'from-indigo-500 via-purple-500 to-violet-500',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    accentColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/50',
    pattern: 'hexagon',
    animation: 'animate-pulse',
  },
  ember: {
    gradient: 'from-orange-400 via-red-500 to-amber-500',
    glowColor: 'rgba(251, 146, 60, 0.5)',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/50',
    pattern: 'fire',
    animation: 'animate-gradient-x',
  },
  sovereign: {
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
    pattern: 'classic',
    animation: 'animate-pulse',
  },
  nexus: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/50',
    pattern: 'circuit',
    animation: 'animate-gradient-x',
  },
};

// Pattern SVG backgrounds
const patterns: Record<string, string> = {
  hexagon: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  circuit: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.03'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm63 31a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM34 90a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm56-76a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 86a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm28-65a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm23-11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  military: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  frost: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0'/%3E%3C/g%3E%3C/svg%3E")`,
  fire: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='26' viewBox='0 0 52 26'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ff6600' fill-opacity='0.04'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath fill='%23ffffff' fill-opacity='0.04' d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z'/%3E%3C/svg%3E")`,
  classic: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d4af37' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
};

export function InstitutionalBanner() {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || theme;
  const config = themeConfigs[currentTheme] || themeConfigs.tactical;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background with pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{ backgroundImage: patterns[config.pattern] }}
      />
      
      {/* Animated glow effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
        }}
      />
      
      {/* Main content */}
      <div className={cn(
        "relative z-10 py-3 sm:py-4 px-4 sm:px-6",
        "border-y-2",
        config.borderColor,
        "bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-900/90"
      )}>
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 rounded-tl-lg" style={{ borderColor: `hsl(var(--primary))` }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 rounded-tr-lg" style={{ borderColor: `hsl(var(--primary))` }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 rounded-bl-lg" style={{ borderColor: `hsl(var(--primary))` }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 rounded-br-lg" style={{ borderColor: `hsl(var(--primary))` }} />

        <div className="text-center space-y-1">
          {/* Main Title with effects */}
          <div className="relative inline-block">
            {/* Glow behind text */}
            <div 
              className="absolute inset-0 blur-2xl opacity-60"
              style={{ background: `linear-gradient(90deg, transparent, ${config.glowColor}, transparent)` }}
            />
            
            <h1 className={cn(
              "relative text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-wide",
              "bg-gradient-to-r bg-clip-text text-transparent",
              config.gradient,
              config.animation
            )}
            style={{
              textShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
              WebkitBackgroundClip: 'text',
            }}>
              ISE / ACRE
            </h1>
          </div>
          
          {/* Subtitle with shimmer */}
          <div className="relative">
            <p className={cn(
              "text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase",
              config.accentColor,
              "drop-shadow-[0_0_8px_currentColor]"
            )}>
              Sistema Socioeducativo do Acre
            </p>
            
            {/* Animated underline */}
            <div className="mt-1 mx-auto w-32 sm:w-48 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
          </div>
          
          {/* Decorative elements */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span className="text-[8px] sm:text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
              Estado do Acre
            </span>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}
