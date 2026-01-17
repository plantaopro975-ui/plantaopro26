import { useState, useRef, MouseEvent, useCallback } from 'react';
import { useTheme, themes } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';
import { Radio, Star, Hexagon, Triangle, Square, Circle } from 'lucide-react';
import { teamPosters, teamColors } from '@/lib/teamAssets';

interface ThemedTeamCardProps {
  team: string;
  selected?: boolean;
  onClick: () => void;
}

// 3D Tilt Hook
function use3DTilt() {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 12;
    const rotateY = (centerX - x) / 12;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
    setGlare({ 
      x: (x / rect.width) * 100, 
      y: (y / rect.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return { ref, transform, glare, handleMouseMove, handleMouseLeave };
}

// Theme-specific card styles
const getThemeCardStyle = (resolvedTheme: string) => {
  switch (resolvedTheme) {
    case 'cyber':
      return {
        borderRadius: 'rounded-none sm:rounded-sm', // Sharp edges for cyber
        borderStyle: 'border-2 border-dashed',
        overlayGradient: 'bg-gradient-to-br from-cyan-900/80 via-purple-900/60 to-black/90',
        glowEffect: 'shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]',
        scanlineStyle: 'opacity-30',
        buttonStyle: 'clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
        accentShape: Hexagon,
        topAccent: 'h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent',
        bottomAccent: 'h-px bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500',
      };
    case 'crimson':
      return {
        borderRadius: 'rounded-lg sm:rounded-xl',
        borderStyle: 'border-3',
        overlayGradient: 'bg-gradient-to-t from-red-950/95 via-black/70 to-red-900/40',
        glowEffect: 'shadow-[0_0_25px_rgba(239,68,68,0.25)] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.5)]',
        scanlineStyle: 'opacity-20',
        buttonStyle: '',
        accentShape: Triangle,
        topAccent: 'h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600',
        bottomAccent: 'h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700',
      };
    case 'arctic':
      return {
        borderRadius: 'rounded-2xl sm:rounded-3xl', // Soft, icy edges
        borderStyle: 'border-2',
        overlayGradient: 'bg-gradient-to-b from-sky-900/60 via-slate-900/50 to-slate-950/95',
        glowEffect: 'shadow-[0_0_20px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_35px_rgba(56,189,248,0.4)]',
        scanlineStyle: 'opacity-10',
        buttonStyle: '',
        accentShape: Circle,
        topAccent: 'h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent blur-[1px]',
        bottomAccent: 'h-0.5 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400',
      };
    case 'light':
      return {
        borderRadius: 'rounded-xl sm:rounded-2xl',
        borderStyle: 'border-2',
        overlayGradient: 'bg-gradient-to-t from-slate-100/95 via-white/60 to-transparent',
        glowEffect: 'shadow-lg group-hover:shadow-xl',
        scanlineStyle: 'opacity-5',
        buttonStyle: '',
        accentShape: Square,
        topAccent: 'h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400',
        bottomAccent: 'h-0.5 bg-blue-300',
      };
    case 'tactical':
    default:
      return {
        borderRadius: 'rounded-lg sm:rounded-xl md:rounded-2xl',
        borderStyle: 'border-2 md:border-3',
        overlayGradient: 'bg-gradient-to-t from-black/95 via-black/60 to-amber-900/20',
        glowEffect: 'shadow-[0_0_20px_rgba(251,191,36,0.15)] group-hover:shadow-[0_0_35px_rgba(251,191,36,0.4)]',
        scanlineStyle: 'opacity-15',
        buttonStyle: '',
        accentShape: Star,
        topAccent: 'h-1 md:h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500',
        bottomAccent: 'h-0.5 md:h-1 bg-amber-600/80',
      };
  }
};

export function ThemedTeamCard({ team, onClick }: ThemedTeamCardProps) {
  const { playSound } = useSoundEffects();
  const { theme, resolvedTheme, themeConfig } = useTheme();
  const { ref, transform, glare, handleMouseMove, handleMouseLeave } = use3DTilt();
  const hasPlayedHover = useRef(false);
  
  // Get theme-specific styles
  const themeStyle = getThemeCardStyle(resolvedTheme);
  const AccentIcon = themeStyle.accentShape;
  
  // Get team-specific icon from theme
  const activeTheme = themes[resolvedTheme];
  const teamKey = team as 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';
  const TeamIcon = activeTheme.teamIcons[teamKey];

  const handleClick = () => {
    playSound('card-select');
    onClick();
  };

  const handleMouseEnterCard = useCallback(() => {
    if (!hasPlayedHover.current) {
      playSound('hover');
      hasPlayedHover.current = true;
    }
  }, [playSound]);

  const handleMouseLeaveCard = useCallback(() => {
    hasPlayedHover.current = false;
    handleMouseLeave();
  }, [handleMouseLeave]);

  // Light theme text colors
  const isLight = resolvedTheme === 'light';
  const textColor = isLight ? 'text-slate-900' : 'text-white';
  const subTextColor = isLight ? 'text-slate-700' : 'text-white/90';

  return (
    <div 
      ref={ref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnterCard}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeaveCard}
      className="w-full cursor-pointer transition-all duration-300 ease-out group"
      style={{ transform, transformStyle: 'preserve-3d' }}
    >
      <div className="relative">
        {/* Theme-specific outer glow */}
        {resolvedTheme === 'cyber' && (
          <div 
            className="absolute -inset-1 opacity-0 group-hover:opacity-60 transition-opacity duration-500 hidden sm:block"
            style={{ 
              background: `linear-gradient(45deg, ${teamColors[team as keyof typeof teamColors]?.primary}, transparent 40%, ${teamColors[team as keyof typeof teamColors]?.primary})`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}
        
        {resolvedTheme !== 'cyber' && (
          <div 
            className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 hidden sm:block"
            style={{ 
              background: `conic-gradient(from 0deg, ${teamColors[team as keyof typeof teamColors]?.primary || '#fff'}, transparent 30%, ${teamColors[team as keyof typeof teamColors]?.primary || '#fff'} 60%, transparent 90%, ${teamColors[team as keyof typeof teamColors]?.primary || '#fff'})`,
              animation: 'spin 3s linear infinite',
              filter: 'blur(6px)',
            }}
          />
        )}
        
        {/* Glow background */}
        <div 
          className={cn(
            "absolute -inset-2 opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-xl sm:blur-2xl",
            themeStyle.borderRadius
          )}
          style={{ backgroundColor: teamColors[team as keyof typeof teamColors]?.primary }}
        />
        
        {/* Corner accents - Theme specific */}
        {resolvedTheme === 'tactical' && (
          <div className="absolute -inset-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
            {['top-0 left-0 border-l-2 border-t-2 rounded-tl-lg', 
              'top-0 right-0 border-r-2 border-t-2 rounded-tr-lg',
              'bottom-0 left-0 border-l-2 border-b-2 rounded-bl-lg',
              'bottom-0 right-0 border-r-2 border-b-2 rounded-br-lg'
            ].map((position, i) => (
              <div 
                key={i}
                className={cn("absolute w-6 h-6", position)}
                style={{ borderColor: teamColors[team as keyof typeof teamColors]?.primary }}
              />
            ))}
          </div>
        )}
        
        {/* Cyber grid lines */}
        {resolvedTheme === 'cyber' && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none hidden sm:block overflow-hidden rounded-sm">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(6,182,212,0.15) 25%, rgba(6,182,212,0.15) 26%, transparent 27%, transparent 74%, rgba(6,182,212,0.15) 75%, rgba(6,182,212,0.15) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(6,182,212,0.15) 25%, rgba(6,182,212,0.15) 26%, transparent 27%, transparent 74%, rgba(6,182,212,0.15) 75%, rgba(6,182,212,0.15) 76%, transparent 77%)',
              backgroundSize: '30px 30px'
            }} />
          </div>
        )}
        
        {/* Glare effect */}
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none z-10 overflow-hidden hidden sm:block",
            themeStyle.borderRadius
          )}
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity * 1.5}) 0%, transparent 50%)`,
          }}
        />
        
        {/* Main Card */}
        <div 
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            themeStyle.borderRadius,
            themeStyle.borderStyle,
            themeStyle.glowEffect,
            "w-full min-h-[120px] h-[calc(32vh-2rem)] landscape:min-h-[80px] landscape:h-[calc(70vh-4rem)] sm:min-h-[180px] sm:h-auto md:min-h-[260px] lg:min-h-[320px] xl:min-h-[380px] 2xl:min-h-[450px]"
          )}
          style={{ borderColor: teamColors[team as keyof typeof teamColors]?.primary }}
        >
          {/* Team Poster Background */}
          <div 
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{ 
              backgroundImage: `url(${teamPosters[team as keyof typeof teamPosters]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />
          
          {/* Theme-specific overlay */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300",
            themeStyle.overlayGradient,
            "group-hover:opacity-80"
          )} />
          
          {/* Top accent stripe */}
          <div className={cn("absolute top-0 left-0 right-0 transition-all duration-300", themeStyle.topAccent)} />
          
          {/* Scan line effect */}
          <div className={cn(
            "absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-300 hidden sm:block",
            themeStyle.scanlineStyle,
            "opacity-0 group-hover:opacity-100"
          )}>
            <div 
              className="absolute w-full h-20 -translate-y-full bg-gradient-to-b from-transparent via-white/20 to-transparent"
              style={{ animation: 'scan 2s ease-in-out infinite' }}
            />
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <AccentIcon className="w-3 h-3 text-primary opacity-60 hidden sm:block" />
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
          
          {/* Theme badge - top left */}
          {resolvedTheme !== 'tactical' && (
            <div className="absolute top-2 left-2 z-10 hidden sm:block">
              <div className={cn(
                "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                resolvedTheme === 'cyber' && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40",
                resolvedTheme === 'crimson' && "bg-red-500/20 text-red-300 border border-red-500/40",
                resolvedTheme === 'arctic' && "bg-sky-500/20 text-sky-300 border border-sky-500/40",
                resolvedTheme === 'light' && "bg-blue-100 text-blue-700 border border-blue-200",
              )}>
                {themeConfig.emoji}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-2 sm:p-4 md:p-5 lg:p-6 z-10">
            <div className="flex flex-col items-center">
              {/* Team name with theme-specific icon */}
              <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                <TeamIcon className={cn(
                  "h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 shrink-0",
                  isLight ? "text-slate-600" : "text-white/80"
                )} />
                <h3 
                  className={cn(
                    "text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-[0.08em] sm:tracking-[0.15em] drop-shadow-lg",
                    textColor
                  )}
                  style={{ textShadow: isLight ? 'none' : `0 2px 12px ${teamColors[team as keyof typeof teamColors]?.glow}` }}
                >
                  {team}
                </h3>
                <TeamIcon className={cn(
                  "h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 shrink-0",
                  isLight ? "text-slate-600" : "text-white/80"
                )} />
              </div>
              
              {/* War Name / Codename */}
              <p className={cn(
                "hidden md:block text-[10px] lg:text-xs text-center font-bold uppercase tracking-widest mb-2 md:mb-3 max-w-full transition-colors duration-300",
                subTextColor,
                "opacity-80"
              )}>
                {team === 'ALFA' && 'GUARDIÃO SUPREMO'}
                {team === 'BRAVO' && 'FORÇA TÁTICA'}
                {team === 'CHARLIE' && 'SENTINELA'}
                {team === 'DELTA' && 'OPERAÇÃO SIGMA'}
              </p>
              
              {/* Access button - Theme styled */}
              <div 
                className={cn(
                  "tactical-btn flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 md:px-6 md:py-3 backdrop-blur-sm border-2 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg",
                  resolvedTheme === 'cyber' ? 'bg-black/90' : 
                  resolvedTheme === 'light' ? 'bg-white/90' : 'bg-black/80',
                  resolvedTheme === 'cyber' ? 'rounded-none' : 
                  resolvedTheme === 'arctic' ? 'rounded-full' : 'rounded-md sm:rounded-lg md:rounded-xl'
                )}
                style={{ 
                  borderColor: teamColors[team as keyof typeof teamColors]?.primary,
                  boxShadow: `0 0 15px ${teamColors[team as keyof typeof teamColors]?.glow}40`,
                  clipPath: resolvedTheme === 'cyber' ? 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' : undefined
                }}
              >
                <Radio className={cn(
                  "w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 shrink-0 animate-pulse",
                  isLight ? "text-green-600" : "text-green-400"
                )} />
                <span className={cn(
                  "text-[10px] sm:text-sm md:text-base font-bold tracking-wider uppercase",
                  isLight ? "text-slate-900" : "text-white"
                )}>
                  ACESSAR
                </span>
              </div>
            </div>
          </div>
          
          {/* Bottom accent */}
          <div className={cn("absolute bottom-0 left-0 right-0", themeStyle.bottomAccent)} />
        </div>
      </div>
    </div>
  );
}
