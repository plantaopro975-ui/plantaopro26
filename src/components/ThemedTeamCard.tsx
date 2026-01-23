import { useState, useRef, MouseEvent, useCallback } from 'react';
import { useTheme, themes } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';
import { Radio, Star, Hexagon, Triangle, Square, Circle, Crown, Network, Octagon } from 'lucide-react';
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

// Theme-specific card styles - NO MORE SQUARE/RECTANGULAR CARDS
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
        cardClipPath: 'polygon(0% 8%, 8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%)',
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
        cardClipPath: 'polygon(0% 5%, 5% 0%, 95% 0%, 100% 5%, 100% 100%, 0% 100%)',
      };
    case 'arctic':
      return {
        borderRadius: 'rounded-[2rem] sm:rounded-[2.5rem]', // Soft, icy organic edges
        borderStyle: 'border-2',
        overlayGradient: 'bg-gradient-to-b from-sky-900/60 via-slate-900/50 to-slate-950/95',
        glowEffect: 'shadow-[0_0_20px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_35px_rgba(56,189,248,0.4)]',
        scanlineStyle: 'opacity-10',
        buttonStyle: '',
        accentShape: Circle,
        topAccent: 'h-0.5 bg-gradient-to-r from-transparent via-sky-300 to-transparent blur-[1px]',
        bottomAccent: 'h-0.5 bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400',
        cardClipPath: '',
      };
    // NEW: Sovereign - Premium gold institutional with asymmetric curves
    case 'sovereign':
      return {
        borderRadius: 'rounded-tl-[3rem] rounded-tr-lg rounded-bl-lg rounded-br-[3rem]', // Asymmetric luxury
        borderStyle: 'border-2',
        overlayGradient: 'bg-gradient-to-br from-yellow-950/80 via-amber-900/60 to-stone-950/95',
        glowEffect: 'shadow-[0_0_30px_rgba(234,179,8,0.25)] group-hover:shadow-[0_0_50px_rgba(234,179,8,0.5)]',
        scanlineStyle: 'opacity-5',
        buttonStyle: '',
        accentShape: Crown,
        topAccent: 'h-1 bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600',
        bottomAccent: 'h-0.5 bg-gradient-to-r from-yellow-700 via-amber-500 to-yellow-700',
        cardClipPath: '',
      };
    // NEW: Nexus - Matrix green with layered depth effect
    case 'nexus':
      return {
        borderRadius: 'rounded-xl', 
        borderStyle: 'border-2',
        overlayGradient: 'bg-gradient-to-b from-emerald-950/70 via-green-900/60 to-slate-950/95',
        glowEffect: 'shadow-[0_0_25px_rgba(34,197,94,0.3)] group-hover:shadow-[0_0_45px_rgba(34,197,94,0.55)]',
        scanlineStyle: 'opacity-25',
        buttonStyle: '',
        accentShape: Network,
        topAccent: 'h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
        bottomAccent: 'h-1 bg-gradient-to-r from-emerald-600 via-green-400 to-emerald-600',
        cardClipPath: 'polygon(0% 3%, 3% 0%, 97% 0%, 100% 3%, 100% 97%, 97% 100%, 3% 100%, 0% 97%)',
      };
    // NEW: Ember - Inspired by PlantãoPro logo
    case 'ember':
      return {
        borderRadius: 'rounded-xl sm:rounded-2xl',
        borderStyle: 'border-3',
        overlayGradient: 'bg-gradient-to-t from-black/95 via-red-950/60 to-orange-900/30',
        glowEffect: 'shadow-[0_0_30px_rgba(234,88,12,0.35)] group-hover:shadow-[0_0_50px_rgba(234,88,12,0.6)]',
        scanlineStyle: 'opacity-15',
        buttonStyle: '',
        accentShape: Star,
        topAccent: 'h-1.5 bg-gradient-to-r from-orange-600 via-red-500 to-amber-500',
        bottomAccent: 'h-1 bg-gradient-to-r from-orange-700 via-red-600 to-orange-700',
        cardClipPath: '',
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
        cardClipPath: '',
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

  const textColor = 'text-white';
  const subTextColor = 'text-white/90';

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
        
        {/* Sovereign gold shimmer */}
        {resolvedTheme === 'sovereign' && (
          <div 
            className="absolute -inset-2 opacity-0 group-hover:opacity-70 transition-opacity duration-700 hidden sm:block"
            style={{ 
              background: `conic-gradient(from 0deg, rgba(234,179,8,0.5), rgba(180,130,20,0.3) 25%, transparent 50%, rgba(180,130,20,0.3) 75%, rgba(234,179,8,0.5))`,
              animation: 'spin 4s linear infinite',
              filter: 'blur(8px)',
              borderRadius: 'inherit',
            }}
          />
        )}
        
        {/* Nexus matrix circuit glow */}
        {resolvedTheme === 'nexus' && (
          <div 
            className="absolute -inset-1 opacity-0 group-hover:opacity-80 transition-opacity duration-500 hidden sm:block rounded-xl"
            style={{ 
              background: `linear-gradient(135deg, rgba(34,197,94,0.4) 0%, transparent 30%, transparent 70%, rgba(34,197,94,0.4) 100%)`,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}
        
        {resolvedTheme !== 'cyber' && resolvedTheme !== 'sovereign' && resolvedTheme !== 'nexus' && (
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
        
        {/* Nexus matrix rain effect */}
        {resolvedTheme === 'nexus' && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none hidden sm:block overflow-hidden rounded-xl">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(180deg, transparent 0%, rgba(34,197,94,0.1) 50%, transparent 100%)',
              animation: 'matrixRain 2s linear infinite',
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
            clipPath: themeStyle.cardClipPath || undefined,
          }}
        />
        
        {/* Main Card - Mobile Optimized & Professional */}
        <div 
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            themeStyle.borderRadius,
            themeStyle.borderStyle,
            themeStyle.glowEffect,
            // Full width cards
            "w-full",
            // Balanced aspect ratio for all screens
            "aspect-[3/4]",
            "sm:aspect-[3/4]",
            "md:aspect-[3/4]",
            // Increased height limits for better visibility - LARGER
            "min-h-[200px] max-h-[260px]",
            "sm:min-h-[240px] sm:max-h-[320px]",
            "md:min-h-[280px] md:max-h-[400px]",
            "lg:min-h-[320px] lg:max-h-[480px]"
          )}
          style={{ 
            borderColor: teamColors[team as keyof typeof teamColors]?.primary,
            clipPath: themeStyle.cardClipPath || undefined,
          }}
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
          
          {/* Theme-specific security scan effects - unique per theme */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {resolvedTheme === 'tactical' && (
              <>
                {/* Tactical: Radar sweep */}
                <div 
                  className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent"
                  style={{ animation: 'radarSweep 3s linear infinite', boxShadow: '0 0 20px 4px rgba(251,191,36,0.4)' }}
                />
                <div 
                  className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-500/80"
                  style={{ animation: 'tacticalPulse 1.5s ease-in-out infinite' }}
                />
                <div 
                  className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-amber-500/80"
                  style={{ animation: 'tacticalPulse 1.5s ease-in-out infinite', animationDelay: '0.75s' }}
                />
              </>
            )}
            
            {resolvedTheme === 'cyber' && (
              <>
                {/* Cyber: Matrix code rain effect */}
                <div 
                  className="absolute h-full w-[1px] bg-gradient-to-b from-cyan-400/80 via-cyan-500/40 to-transparent"
                  style={{ animation: 'matrixLine 2s linear infinite', left: '20%' }}
                />
                <div 
                  className="absolute h-full w-[1px] bg-gradient-to-b from-purple-400/80 via-purple-500/40 to-transparent"
                  style={{ animation: 'matrixLine 2.5s linear infinite', left: '60%', animationDelay: '0.5s' }}
                />
                <div 
                  className="absolute h-full w-[1px] bg-gradient-to-b from-cyan-400/60 via-cyan-500/30 to-transparent"
                  style={{ animation: 'matrixLine 1.8s linear infinite', left: '85%', animationDelay: '1s' }}
                />
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.1) 2px, rgba(6,182,212,0.1) 4px)' }}
                />
              </>
            )}
            
            {resolvedTheme === 'crimson' && (
              <>
                {/* Crimson: Emergency beacon pulse */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-red-600/30 via-transparent to-transparent"
                  style={{ animation: 'emergencyPulse 2s ease-in-out infinite' }}
                />
                <div 
                  className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500"
                  style={{ animation: 'alarmFlash 0.8s ease-in-out infinite' }}
                />
                <div 
                  className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent"
                  style={{ animation: 'alertScan 2.5s ease-in-out infinite' }}
                />
              </>
            )}
            
            {resolvedTheme === 'arctic' && (
              <>
                {/* Arctic: Frost crystallization effect */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-transparent to-cyan-400/10"
                  style={{ animation: 'frostShimmer 4s ease-in-out infinite' }}
                />
                <div 
                  className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent blur-[1px]"
                  style={{ animation: 'frostLine 5s linear infinite' }}
                />
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(56,189,248,0.3) 0%, transparent 20%), radial-gradient(circle at 70% 80%, rgba(34,211,238,0.3) 0%, transparent 20%)' }}
                />
              </>
            )}
            
            {resolvedTheme === 'sovereign' && (
              <>
                {/* Sovereign: Royal golden shimmer */}
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: 'linear-gradient(45deg, transparent 40%, rgba(234,179,8,0.15) 50%, transparent 60%)',
                    animation: 'royalShimmer 3s ease-in-out infinite'
                  }}
                />
                <div 
                  className="absolute top-2 left-2 w-1.5 h-1.5 bg-yellow-400/80 rounded-full"
                  style={{ animation: 'crownGlow 2s ease-in-out infinite' }}
                />
                <div 
                  className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-amber-400/80 rounded-full"
                  style={{ animation: 'crownGlow 2s ease-in-out infinite', animationDelay: '1s' }}
                />
              </>
            )}
            
            {resolvedTheme === 'nexus' && (
              <>
                {/* Nexus: Circuit pulse network */}
                <div 
                  className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent"
                  style={{ animation: 'circuitPulseH 2.5s linear infinite' }}
                />
                <div 
                  className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-green-400/60 to-transparent"
                  style={{ animation: 'circuitPulseV 3s linear infinite', animationDelay: '0.5s' }}
                />
                <div 
                  className="absolute inset-0 opacity-[0.05]"
                  style={{ backgroundImage: 'linear-gradient(0deg, transparent 49%, rgba(34,197,94,0.3) 50%, transparent 51%), linear-gradient(90deg, transparent 49%, rgba(34,197,94,0.3) 50%, transparent 51%)', backgroundSize: '20px 20px' }}
                />
              </>
            )}
            
            {resolvedTheme === 'ember' && (
              <>
                {/* Ember: Fire effect inspired by logo */}
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-red-600/20 to-transparent"
                  style={{ animation: 'emberGlow 2.5s ease-in-out infinite' }}
                />
                <div 
                  className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent"
                  style={{ animation: 'emberSweep 3s linear infinite', boxShadow: '0 0 25px 5px rgba(234,88,12,0.5)' }}
                />
                <div 
                  className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-orange-500"
                  style={{ animation: 'emberFlare 1s ease-in-out infinite' }}
                />
                <div 
                  className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-amber-500"
                  style={{ animation: 'emberFlare 1s ease-in-out infinite', animationDelay: '0.5s' }}
                />
              </>
            )}
            
            {/* Diagonal security grid - all themes */}
            <div 
              className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity duration-500"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, currentColor 12px, currentColor 13px)' }}
            />
          </div>
          
          {/* Original hover scan line effect */}
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
                resolvedTheme === 'arctic' && "bg-sky-500/20 text-sky-300 border border-sky-400/40",
                resolvedTheme === 'sovereign' && "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40",
                resolvedTheme === 'nexus' && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
              )}>
                {themeConfig.emoji}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5 lg:p-6 z-10">
            <div className="flex flex-col items-center">
              {/* Team name with theme-specific icon - PROPORCIONAL AO CARD */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <TeamIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 shrink-0 text-white/80" />
                <h3 
                  className={cn(
                    "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-[0.05em] sm:tracking-[0.1em] drop-shadow-lg",
                    textColor
                  )}
                  style={{ textShadow: `0 2px 10px ${teamColors[team as keyof typeof teamColors]?.glow}` }}
                >
                  {team}
                </h3>
                <TeamIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 shrink-0 text-white/80" />
              </div>
              
              {/* War Name / Codename - PROPORCIONAL */}
              <p className={cn(
                "text-[10px] sm:text-xs md:text-sm text-center font-bold uppercase tracking-wider mb-2 md:mb-3 max-w-full transition-colors duration-300",
                subTextColor,
                "opacity-90"
              )}>
                {team === 'ALFA' && 'GUARDIÃO SUPREMO'}
                {team === 'BRAVO' && 'FORÇA TÁTICA'}
                {team === 'CHARLIE' && 'SENTINELA'}
                {team === 'DELTA' && 'OPERAÇÃO SIGMA'}
              </p>
              
              {/* Access button - PROPORCIONAL */}
              <div 
                className={cn(
                  "tactical-btn flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 backdrop-blur-sm border-2 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg",
                  'bg-black/80',
                  resolvedTheme === 'cyber' ? 'rounded-none' : 
                  resolvedTheme === 'arctic' ? 'rounded-full' : 
                  resolvedTheme === 'sovereign' ? 'rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm' :
                  resolvedTheme === 'nexus' ? 'rounded-lg' :
                  'rounded-md sm:rounded-lg md:rounded-xl'
                )}
                style={{ 
                  borderColor: teamColors[team as keyof typeof teamColors]?.primary,
                  boxShadow: `0 0 12px ${teamColors[team as keyof typeof teamColors]?.glow}40`,
                  clipPath: resolvedTheme === 'cyber' ? 'polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)' : undefined
                }}
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0 animate-pulse text-green-400" />
                <span className="text-sm sm:text-base md:text-lg font-bold tracking-wider uppercase text-white">
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