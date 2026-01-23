import { AlertTriangle, ShieldAlert, Lock, ShieldX, XCircle, KeyRound, Users, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useEffect, useCallback } from 'react';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'auth' | 'password' | 'team';
}

// Pleasant notification sound - soft chime
function playPleasantSound(type: 'warning' | 'error' | 'info') {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;

    if (type === 'warning' || type === 'error') {
      // Gentle two-note attention sound (not harsh)
      const notes = type === 'warning' ? [523, 440] : [440, 349]; // C5-A4 or A4-F4
      
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.15);
        
        // Soft attack, gentle release
        gain.gain.setValueAtTime(0, now + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.25);
        
        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.3);
      });
    } else {
      // Info: single soft tone
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659, now); // E5
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    // Ignore audio errors
  }
}

export function ErrorDialog({ open, onClose, title, message, type = 'error' }: ErrorDialogProps) {
  const config = {
    error: {
      icon: XCircle,
      iconBg: 'bg-gradient-to-br from-red-500/20 to-rose-600/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/50',
      btnBg: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500',
      headerBg: 'bg-gradient-to-r from-red-950/60 via-rose-950/40 to-transparent',
      headerBar: 'from-red-600 via-rose-600 to-red-600',
      headerText: 'Erro no Sistema',
      headerIcon: AlertTriangle,
      accentColor: 'red',
    },
    warning: {
      icon: ShieldX,
      iconBg: 'bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
      headerBg: 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-transparent',
      headerBar: 'from-amber-600 via-orange-500 to-amber-600',
      headerText: 'Protocolo de Segurança',
      headerIcon: ShieldAlert,
      accentColor: 'amber',
    },
    auth: {
      icon: Lock,
      iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-600/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      btnBg: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500',
      headerBg: 'bg-gradient-to-r from-rose-950/60 via-pink-950/40 to-transparent',
      headerBar: 'from-rose-600 via-pink-500 to-rose-600',
      headerText: 'Autenticação',
      headerIcon: Lock,
      accentColor: 'rose',
    },
    password: {
      icon: KeyRound,
      iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20',
      iconColor: 'text-violet-400',
      borderColor: 'border-violet-500/50',
      btnBg: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500',
      headerBg: 'bg-gradient-to-r from-violet-950/60 via-purple-950/40 to-transparent',
      headerBar: 'from-violet-600 via-purple-500 to-violet-600',
      headerText: 'Credencial Inválida',
      headerIcon: KeyRound,
      accentColor: 'violet',
    },
    team: {
      icon: Users,
      iconBg: 'bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
      headerBg: 'bg-gradient-to-r from-amber-950/60 via-orange-950/40 to-transparent',
      headerBar: 'from-amber-600 via-orange-500 to-amber-600',
      headerText: 'Equipe Incorreta',
      headerIcon: ShieldAlert,
      accentColor: 'amber',
    },
  };

  const { 
    icon: Icon, 
    iconBg, 
    iconColor, 
    borderColor, 
    btnBg, 
    headerBg,
    headerBar,
    headerText,
    headerIcon: HeaderIcon,
    accentColor 
  } = config[type];

  // Play sound when dialog opens
  useEffect(() => {
    if (open) {
      const soundType = type === 'warning' || type === 'team' ? 'warning' : type === 'error' || type === 'password' ? 'error' : 'info';
      playPleasantSound(soundType);
    }
  }, [open, type]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        className={cn(
          "sm:max-w-md p-0 gap-0 border-2 overflow-hidden",
          "bg-slate-900/98 backdrop-blur-xl",
          borderColor,
          `shadow-[0_0_40px_rgba(var(--${accentColor}-rgb,245,158,11),0.15)]`
        )}
      >
        {/* Stylish Header Bar */}
        <div className={cn(
          "px-4 py-2.5 flex items-center gap-3 border-b",
          `border-${accentColor}-500/30`,
          `bg-gradient-to-r ${headerBar}`
        )}>
          <div className="relative">
            <HeaderIcon className="w-5 h-5 text-white drop-shadow-lg" />
            <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-white/80 animate-pulse" />
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-widest drop-shadow-sm">
            {headerText}
          </span>
          <div className="flex-1" />
          <div className="flex gap-1.5">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", `bg-white/80`)} />
            <div className={cn("w-2 h-2 rounded-full animate-pulse delay-150", `bg-white/60`)} />
          </div>
        </div>
        
        {/* Content */}
        <div className={cn("p-5", headerBg)}>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {/* Icon with glow effect */}
              <div className={cn(
                "p-4 rounded-2xl shrink-0 border relative",
                iconBg,
                `border-${accentColor}-500/30`,
                `shadow-lg shadow-${accentColor}-500/20`
              )}>
                <Icon className={cn(
                  "w-8 h-8",
                  iconColor,
                  `drop-shadow-[0_0_10px_rgba(var(--${accentColor}-rgb,245,158,11),0.5)]`
                )} strokeWidth={2} />
                
                {/* Pulsing ring effect */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl border-2 animate-ping opacity-30",
                  `border-${accentColor}-400`
                )} style={{ animationDuration: '2s' }} />
              </div>
              
              <div className="flex-1 space-y-2 pt-1">
                <h2 className={cn(
                  "text-xl font-bold text-left tracking-wide",
                  iconColor
                )}>
                  {title}
                </h2>
                
                {/* Status indicator */}
                <div className={cn(
                  "inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full",
                  `bg-${accentColor}-500/10 border border-${accentColor}-500/30`
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", `bg-${accentColor}-400`)} />
                  <span className={cn("uppercase tracking-wider font-semibold", `text-${accentColor}-400/90`)}>
                    Ação Necessária
                  </span>
                </div>
              </div>
            </div>
            
            {/* Message box */}
            <p className={cn(
              "text-sm leading-relaxed whitespace-pre-line",
              "text-slate-200 bg-slate-800/60 p-4 rounded-xl",
              "border border-slate-700/50 backdrop-blur-sm"
            )}>
              {message}
            </p>
          </div>
          
          {/* Action button */}
          <div className="flex justify-end pt-5">
            <Button
              onClick={onClose}
              size="lg"
              className={cn(
                "text-white font-bold uppercase tracking-wider px-8",
                "shadow-lg transition-all duration-200",
                "hover:scale-105 hover:shadow-xl",
                btnBg
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Entendido
            </Button>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className={cn(
          "h-1 bg-gradient-to-r",
          headerBar
        )} />
      </DialogContent>
    </Dialog>
  );
}
