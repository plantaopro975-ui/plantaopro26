import { useTheme, themes, ThemeType } from '@/contexts/ThemeContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Check, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ThemeSelectorProps {
  onSelect?: () => void;
  compact?: boolean;
}

export function ThemeSelector({ onSelect, compact = false }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const { playSound, isSoundEnabled, toggleSound } = useSoundEffects();

  // Only show the 4 main themes + system + light
  const availableThemes = Object.values(themes).filter(t => 
    ['tactical', 'cyber', 'crimson', 'arctic', 'light', 'system'].includes(t.id)
  );

  const handleSelect = (themeId: ThemeType) => {
    playSound('theme-change');
    setTheme(themeId);
    setTimeout(() => {
      onSelect?.();
    }, 150);
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!isSoundEnabled) {
      setTimeout(() => {
        const audio = new AudioContext();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.frequency.value = 500;
        gain.gain.value = 0.1;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.1);
        osc.stop(audio.currentTime + 0.1);
      }, 50);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {availableThemes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                "border-2",
                theme === t.id
                  ? "border-primary bg-primary/20 scale-105"
                  : "border-slate-600/50 bg-slate-800/40 hover:border-primary/40 hover:scale-105"
              )}
              title={t.name}
            >
              <Icon className="h-4 w-4" style={{ color: theme === t.id ? `hsl(${t.colors.primary})` : undefined }} />
            </button>
          );
        })}
        <button
          onClick={handleToggleSound}
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
            "border-2 border-slate-600/50 bg-slate-800/40 hover:border-amber-500/40",
            isSoundEnabled && "text-amber-400 border-amber-500/40 bg-amber-500/10"
          )}
          title={isSoundEnabled ? 'Desativar sons' : 'Ativar sons'}
        >
          {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-slate-900/95 rounded-xl border border-primary/30">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Tema</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 border",
              isSoundEnabled 
                ? "bg-amber-500/15 border-amber-500/40 text-amber-400" 
                : "bg-slate-800/60 border-slate-600/50 text-slate-500"
            )}
            title={isSoundEnabled ? 'Som Ativo' : 'Som Mudo'}
          >
            {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={onSelect}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Compact Theme Grid - 3 columns */}
      <div className="grid grid-cols-3 gap-2">
        {availableThemes.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.id;
          
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={cn(
                "relative p-2 rounded-xl border-2 transition-all duration-200 text-center group",
                "bg-slate-800/60",
                isSelected
                  ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                  : "border-slate-700/50 hover:border-slate-600 hover:scale-[1.01]"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
              
              {/* Icon */}
              <div 
                className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1"
                style={{ background: `linear-gradient(135deg, hsl(${t.colors.gradientFrom}) 0%, hsl(${t.colors.gradientTo}) 100%)` }}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              
              {/* Name */}
              <span className={cn(
                "text-[10px] font-semibold block truncate",
                isSelected ? "text-primary" : "text-slate-400"
              )}>
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
