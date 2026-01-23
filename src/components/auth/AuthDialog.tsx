import { ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import logoShield from '@/assets/logo-shield.png';

type AuthDialogVariant = 'agent' | 'master' | 'admin' | 'register' | 'check';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: AuthDialogVariant;
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
  teamBadge?: ReactNode;
}

const variantStyles = {
  agent: {
    border: 'border-blue-500/50',
    glow: 'shadow-blue-500/20',
    accent: 'from-blue-600 via-blue-500 to-cyan-500',
    logoBg: 'from-blue-500/20 to-cyan-500/10',
    headerBg: 'from-blue-900/40 via-blue-800/20 to-transparent',
    titleColor: 'text-blue-100',
    subtitleColor: 'text-blue-300/80',
    decorColor: 'bg-blue-500',
  },
  master: {
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/25',
    accent: 'from-amber-500 via-orange-500 to-yellow-500',
    logoBg: 'from-amber-500/25 to-orange-500/15',
    headerBg: 'from-amber-900/40 via-orange-900/20 to-transparent',
    titleColor: 'text-amber-100',
    subtitleColor: 'text-amber-300/80',
    decorColor: 'bg-amber-500',
  },
  admin: {
    border: 'border-indigo-500/50',
    glow: 'shadow-indigo-500/20',
    accent: 'from-indigo-500 via-purple-500 to-violet-500',
    logoBg: 'from-indigo-500/20 to-purple-500/10',
    headerBg: 'from-indigo-900/40 via-purple-900/20 to-transparent',
    titleColor: 'text-indigo-100',
    subtitleColor: 'text-indigo-300/80',
    decorColor: 'bg-indigo-500',
  },
  register: {
    border: 'border-cyan-500/50',
    glow: 'shadow-cyan-500/20',
    accent: 'from-cyan-500 via-teal-500 to-emerald-500',
    logoBg: 'from-cyan-500/20 to-teal-500/10',
    headerBg: 'from-cyan-900/40 via-teal-900/20 to-transparent',
    titleColor: 'text-cyan-100',
    subtitleColor: 'text-cyan-300/80',
    decorColor: 'bg-cyan-500',
  },
  check: {
    border: 'border-emerald-500/50',
    glow: 'shadow-emerald-500/20',
    accent: 'from-emerald-500 via-green-500 to-teal-500',
    logoBg: 'from-emerald-500/20 to-green-500/10',
    headerBg: 'from-emerald-900/40 via-green-900/20 to-transparent',
    titleColor: 'text-emerald-100',
    subtitleColor: 'text-emerald-300/80',
    decorColor: 'bg-emerald-500',
  },
};

export function AuthDialog({
  open,
  onOpenChange,
  variant,
  title,
  subtitle,
  children,
  icon,
  teamBadge,
}: AuthDialogProps) {
  const styles = variantStyles[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Base structure
          "w-[94vw] max-w-[440px] p-0 gap-0 overflow-hidden",
          // Dark premium background
          "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
          // Border and glow
          "border-2",
          styles.border,
          "shadow-2xl",
          styles.glow,
          // Registration needs scrolling
          variant === 'register' && "max-h-[90vh] overflow-y-auto"
        )}
      >
        {/* Animated accent line at top */}
        <div className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          styles.accent,
          "relative overflow-hidden"
        )}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" 
               style={{ animationDuration: '3s' }} />
        </div>

        {/* Header section */}
        <div className={cn(
          "relative px-6 pt-8 pb-6",
          "bg-gradient-to-b",
          styles.headerBg
        )}>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 flex gap-1.5">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", styles.decorColor)} />
            <div className={cn("w-2 h-2 rounded-full animate-pulse opacity-60", styles.decorColor)} 
                 style={{ animationDelay: '0.3s' }} />
            <div className={cn("w-2 h-2 rounded-full animate-pulse opacity-30", styles.decorColor)}
                 style={{ animationDelay: '0.6s' }} />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className={cn(
              "p-4 rounded-2xl bg-gradient-to-br backdrop-blur-sm",
              styles.logoBg,
              "border border-white/10",
              "shadow-lg"
            )}>
              <img
                src={logoShield}
                alt="Plantão Pro"
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Team badge */}
          {teamBadge && (
            <div className="flex justify-center mb-4">
              {teamBadge}
            </div>
          )}

          {/* Title area */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              {icon && (
                <div className={cn(
                  "p-2.5 rounded-xl bg-gradient-to-br",
                  styles.logoBg,
                  "border border-white/10"
                )}>
                  {icon}
                </div>
              )}
              <h2 className={cn(
                "text-2xl font-bold tracking-tight",
                styles.titleColor
              )}>
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className={cn("text-base", styles.subtitleColor)}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Separator line */}
        <div className="relative h-px bg-slate-800">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-50",
            variant === 'agent' && "text-blue-500",
            variant === 'master' && "text-amber-500",
            variant === 'admin' && "text-indigo-500",
            variant === 'register' && "text-cyan-500",
            variant === 'check' && "text-emerald-500"
          )} />
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>

        {/* Bottom accent */}
        <div className={cn(
          "h-1 w-full bg-gradient-to-r opacity-60",
          styles.accent
        )} />
      </DialogContent>
    </Dialog>
  );
}

// Add shimmer animation to globals
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  if (!document.head.querySelector('[data-shimmer-animation]')) {
    style.setAttribute('data-shimmer-animation', 'true');
    document.head.appendChild(style);
  }
}
