import { useState, useEffect } from 'react';
import { useTheme, themes } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';
import { 
  Shield, Cpu, Sun, Snowflake, Flame, Monitor, Volume2, VolumeX,
  Radio, Wifi, Activity, Zap, Target, Crosshair, Clock, Calendar,
  Users, Check, ChevronDown, Palette, Lock, Signal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemedHeaderProps {
  selectedTeam?: string | null;
  onThemeOpen?: () => void;
}

// Theme-specific header configurations
const headerStyles = {
  tactical: {
    bg: 'from-amber-950/95 via-slate-900/98 to-amber-950/95',
    border: 'border-amber-500/40',
    accent: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    statusBg: 'bg-amber-500/10 border-amber-500/40',
    statusText: 'text-amber-400',
    centerWidget: 'tactical-radar',
    operationalText: 'MODO TÁTICO',
  },
  cyber: {
    bg: 'from-cyan-950/95 via-slate-900/98 to-fuchsia-950/95',
    border: 'border-cyan-500/40',
    accent: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    statusBg: 'bg-cyan-500/10 border-cyan-500/40',
    statusText: 'text-cyan-400',
    centerWidget: 'cyber-pulse',
    operationalText: 'NEURAL LINK',
  },
  crimson: {
    bg: 'from-red-950/95 via-slate-900/98 to-red-950/95',
    border: 'border-red-500/40',
    accent: 'text-red-400',
    glow: 'shadow-red-500/20',
    statusBg: 'bg-red-500/10 border-red-500/40',
    statusText: 'text-red-400',
    centerWidget: 'fire-pulse',
    operationalText: 'ALERTA MÁXIMO',
  },
  arctic: {
    bg: 'from-sky-950/95 via-slate-900/98 to-sky-950/95',
    border: 'border-sky-400/40',
    accent: 'text-sky-300',
    glow: 'shadow-sky-400/20',
    statusBg: 'bg-sky-500/10 border-sky-400/40',
    statusText: 'text-sky-300',
    centerWidget: 'ice-crystal',
    operationalText: 'MODO ÁRTICO',
  },
  light: {
    bg: 'from-slate-100/98 via-white/98 to-slate-100/98',
    border: 'border-slate-300',
    accent: 'text-slate-700',
    glow: 'shadow-slate-400/20',
    statusBg: 'bg-emerald-500/10 border-emerald-500/40',
    statusText: 'text-emerald-600',
    centerWidget: 'clean-status',
    operationalText: 'SISTEMA ATIVO',
  },
  system: {
    bg: 'from-slate-900/95 via-slate-800/98 to-slate-900/95',
    border: 'border-primary/40',
    accent: 'text-primary',
    glow: 'shadow-primary/20',
    statusBg: 'bg-primary/10 border-primary/40',
    statusText: 'text-primary',
    centerWidget: 'auto-detect',
    operationalText: 'AUTO SISTEMA',
  },
};

// Team-specific messages
const teamMessages = {
  ALFA: { text: 'FORÇA ALFA', icon: Shield, color: 'text-red-400' },
  BRAVO: { text: 'BRAVO TEAM', icon: Target, color: 'text-blue-400' },
  CHARLIE: { text: 'CHARLIE OPS', icon: Crosshair, color: 'text-green-400' },
  DELTA: { text: 'DELTA FORCE', icon: Radio, color: 'text-amber-400' },
};

export function ThemedHeader({ selectedTeam, onThemeOpen }: ThemedHeaderProps) {
  const { theme, setTheme, themeConfig, resolvedTheme } = useTheme();
  const { playSound, isSoundEnabled, toggleSound } = useSoundEffects();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  
  const effectiveTheme = theme === 'system' ? (resolvedTheme as keyof typeof headerStyles) : theme;
  const style = headerStyles[effectiveTheme] || headerStyles.tactical;
  const teamConfig = selectedTeam ? teamMessages[selectedTeam as keyof typeof teamMessages] : null;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const availableThemes = Object.values(themes).filter(t => 
    ['tactical', 'cyber', 'crimson', 'arctic', 'light', 'system'].includes(t.id)
  );

  const handleThemeChange = (themeId: string) => {
    playSound('theme-change');
    setTheme(themeId as any);
    setIsThemeDropdownOpen(false);
  };

  // Render center widget based on theme
  const renderCenterWidget = () => {
    switch (style.centerWidget) {
      case 'tactical-radar':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/30">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/40" />
              <div className="absolute inset-1 rounded-full border border-amber-500/20" />
              <div 
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: 'conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.5) 30deg, transparent 60deg)',
                  animation: 'spin 2s linear infinite'
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-amber-400/60 uppercase tracking-wider">Status</span>
              <span className="text-xs font-bold text-amber-400">OPERACIONAL</span>
            </div>
          </div>
        );
      
      case 'cyber-pulse':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/5 border border-cyan-500/30">
            <div className="relative flex items-center gap-0.5">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full"
                  style={{ 
                    height: `${Math.random() * 12 + 8}px`,
                    animation: `pulse 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                    opacity: 0.6 + (i * 0.05)
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-cyan-400/60 uppercase tracking-wider font-mono">Network</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">ONLINE</span>
            </div>
          </div>
        );
      
      case 'fire-pulse':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/5 border border-red-500/30">
            <Flame className="h-6 w-6 text-red-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] text-red-400/60 uppercase tracking-wider">Modo</span>
              <span className="text-xs font-bold text-red-400">COMBATE</span>
            </div>
          </div>
        );
      
      case 'ice-crystal':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/5 border border-sky-400/30">
            <Snowflake className="h-6 w-6 text-sky-300 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="flex flex-col">
              <span className="text-[9px] text-sky-300/60 uppercase tracking-wider">Temp</span>
              <span className="text-xs font-bold text-sky-300">ESTÁVEL</span>
            </div>
          </div>
        );
      
      case 'clean-status':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/80 border border-slate-300">
            <Activity className="h-5 w-5 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Sistema</span>
              <span className="text-xs font-bold text-slate-700">ATIVO</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/30">
            <Signal className="h-5 w-5 text-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] text-primary/60 uppercase tracking-wider">Auto</span>
              <span className="text-xs font-bold text-primary">DETECTADO</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "header-bar bg-gradient-to-r backdrop-blur-md border-b py-2 px-3 sm:px-4 relative z-20 shrink-0 transition-all duration-500",
      style.bg, style.border, style.glow
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Status & Team Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Status Indicator */}
            <div className={cn(
              "flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border shadow-lg",
              style.statusBg, style.glow
            )}>
              <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                <div className={cn("absolute inset-0 rounded-full border", style.border.replace('border-', 'border-'))} style={{ borderColor: 'currentColor', opacity: 0.3 }} />
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: `conic-gradient(from 0deg, transparent, currentColor 30deg, transparent 60deg)`,
                    animation: 'spin 2s linear infinite',
                    opacity: 0.5
                  }} 
                />
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-[0_0_8px_currentColor]", style.statusText.replace('text-', 'bg-'))} />
              </div>
              <span className={cn("text-[9px] sm:text-[11px] font-bold uppercase tracking-wider", style.statusText)}>
                {style.operationalText}
              </span>
            </div>
            
            {/* Team Badge (if selected) */}
            {teamConfig && (
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-600/40",
                teamConfig.color
              )}>
                <teamConfig.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{teamConfig.text}</span>
              </div>
            )}
          </div>
          
          {/* Center: Theme-specific Widget */}
          <div className="hidden sm:flex">
            {renderCenterWidget()}
          </div>
          
          {/* Right: Theme Selector & Clock */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Dropdown */}
            <DropdownMenu open={isThemeDropdownOpen} onOpenChange={setIsThemeDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={() => playSound('click')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105",
                    "bg-primary/10 border-primary/40 hover:bg-primary/20"
                  )}
                >
                  <themeConfig.icon className="h-4 w-4 text-primary" />
                  <ChevronDown className="h-3 w-3 text-primary/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/98 backdrop-blur-xl border-primary/30">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Selecionar Tema</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableThemes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <DropdownMenuItem
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: `hsl(${t.colors.primary})` }} />
                        <span className="text-sm">{t.name}</span>
                      </div>
                      {theme === t.id && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toggleSound();
                    playSound('click');
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="text-sm">Sons Táticos</span>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-colors",
                    isSoundEnabled ? "bg-primary" : "bg-muted"
                  )}>
                    <div className={cn(
                      "w-3 h-3 rounded-full bg-white transition-transform mt-0.5",
                      isSoundEnabled ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                    )} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Themed Clock */}
            <div className={cn(
              "flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border-2 shadow-lg backdrop-blur-sm",
              "bg-card/80",
              style.border, style.glow
            )}>
              <div className="relative flex items-center justify-center w-5 h-5">
                <div className={cn("absolute inset-0 rounded-full border", style.border)} />
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    background: `conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.4) 30deg, transparent 60deg)`,
                    animation: 'spin 2s linear infinite'
                  }}
                />
                <Clock className="h-3 w-3 text-primary" />
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className={cn("text-sm sm:text-base font-mono font-black tracking-wider tabular-nums", style.accent)}>
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className={cn("text-[8px] sm:text-[10px] font-mono opacity-60", style.accent)}>
                  :{String(currentTime.getSeconds()).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
