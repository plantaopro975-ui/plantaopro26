import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import logoShield from '@/assets/ise-acre-badge.png';
import { getTeamPoster, getTeamEmblem, getTeamColors } from '@/lib/teamAssets';

type AuthDialogVariant = 'agent' | 'master' | 'admin' | 'register' | 'check';
type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: AuthDialogVariant;
  title: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
  teamBadge?: ReactNode;
  /** When provided, renders the team-branded hero (poster + emblem + team colors). */
  team?: TeamName | string | null;
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

// Team-specific tactical patterns overlay (SVG data URI)
const teamPatterns: Record<string, string> = {
  ALFA: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 20L20 0L40 20L20 40Z' fill='none' stroke='rgba(34,197,94,0.15)' stroke-width='1'/></svg>\")",
  BRAVO: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='6' fill='none' stroke='rgba(249,115,22,0.18)' stroke-width='1'/></svg>\")",
  CHARLIE: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 0h40v40H0z' fill='none' stroke='rgba(59,130,246,0.12)' stroke-width='0.5'/><path d='M10 20h20M20 10v20' stroke='rgba(59,130,246,0.15)' stroke-width='0.5'/></svg>\")",
  DELTA: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M20 4L34 30H6z' fill='none' stroke='rgba(234,179,8,0.18)' stroke-width='1'/></svg>\")",
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
  team,
}: AuthDialogProps) {
  const styles = variantStyles[variant];
  const teamKey = team ? String(team).toUpperCase() : null;
  const teamPoster = teamKey ? getTeamPoster(teamKey) : null;
  const teamEmblem = teamKey ? getTeamEmblem(teamKey) : null;
  const teamColor = teamKey ? getTeamColors(teamKey) : null;
  const teamPattern = teamKey ? teamPatterns[teamKey] : null;
  const teamBranded = Boolean(teamPoster && teamColor);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[94vw] max-w-[440px] p-0 gap-0 overflow-hidden",
          "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
          "border-2",
          !teamBranded && styles.border,
          "shadow-2xl",
          !teamBranded && styles.glow,
          variant === 'register' && "max-h-[90vh] overflow-y-auto"
        )}
        style={teamBranded && teamColor ? {
          borderColor: `${teamColor.primary}80`,
          boxShadow: `0 25px 60px -12px ${teamColor.glow}, 0 0 0 1px ${teamColor.primary}30`,
        } : undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{subtitle || title}</DialogDescription>

        {/* Top accent bar */}
        <div
          className={cn("h-1.5 w-full relative overflow-hidden",
            !teamBranded && "bg-gradient-to-r", !teamBranded && styles.accent)}
          style={teamBranded && teamColor ? {
            background: `linear-gradient(90deg, ${teamColor.secondary}, ${teamColor.primary}, ${teamColor.secondary})`,
          } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
               style={{ animationDuration: '3s' }} />
        </div>

        {/* HERO — team-branded (compact professional) */}
        {teamBranded && teamPoster ? (
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={teamPoster}
              alt={`Equipe ${teamKey}`}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'contrast(1.1) saturate(0.7) brightness(0.5)' }}
            />
            {teamPattern && (
              <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                   style={{ backgroundImage: teamPattern }} />
            )}
            <div className="absolute inset-0"
                 style={{ background: `linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.7) 55%, rgba(2,6,23,0.98) 100%)` }} />
            <div className="absolute left-0 top-0 bottom-0 w-[3px]"
                 style={{ background: `linear-gradient(180deg, transparent, ${teamColor!.primary}, transparent)` }} />

            {/* Top status row */}
            <div className="absolute top-2.5 inset-x-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse"
                     style={{ background: teamColor!.primary, boxShadow: `0 0 8px ${teamColor!.primary}` }} />
                <span className="text-[9px] tracking-[0.28em] font-mono font-semibold text-white/75 uppercase">
                  Secure · {teamKey}
                </span>
              </div>
              <span className="text-[9px] tracking-[0.22em] font-mono text-white/45">CLASSIFIED</span>
            </div>

            {/* Emblem + title — horizontal compact */}
            <div className="absolute bottom-0 inset-x-0 px-4 pb-3 flex items-center gap-3">
              {teamEmblem && (
                <div className="relative shrink-0">
                  <div className="absolute -inset-0.5 rounded-full blur-sm opacity-60"
                       style={{ background: teamColor!.primary }} />
                  <img src={teamEmblem} alt=""
                    className="relative h-11 w-11 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[9px] tracking-[0.32em] font-mono font-bold uppercase leading-none"
                     style={{ color: teamColor!.primary }}>
                  Equipe {teamKey}
                </div>
                <h2 className="text-lg font-bold tracking-tight text-white leading-tight mt-1 font-stencil truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11px] text-white/65 leading-tight mt-0.5 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 h-px"
                 style={{ background: `linear-gradient(90deg, transparent, ${teamColor!.primary}, transparent)` }} />
          </div>
        ) : (
          <>
            {/* Legacy header (non-team dialogs) */}
            <div className={cn("relative px-6 pt-8 pb-6 bg-gradient-to-b", styles.headerBg)}>
              <div className="absolute top-4 right-4 flex gap-1.5">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", styles.decorColor)} />
                <div className={cn("w-2 h-2 rounded-full animate-pulse opacity-60", styles.decorColor)}
                     style={{ animationDelay: '0.3s' }} />
                <div className={cn("w-2 h-2 rounded-full animate-pulse opacity-30", styles.decorColor)}
                     style={{ animationDelay: '0.6s' }} />
              </div>
              <div className="flex justify-center mb-5">
                <div className={cn("p-4 rounded-2xl bg-gradient-to-br backdrop-blur-sm",
                  styles.logoBg, "border border-white/10 shadow-lg")}>
                  <img src={logoShield} alt="Plantão Pro" className="w-16 h-16 object-contain drop-shadow-lg" />
                </div>
              </div>
              {teamBadge && (
                <div className="flex justify-center mb-4">{teamBadge}</div>
              )}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  {icon && (
                    <div className={cn("p-2.5 rounded-xl bg-gradient-to-br", styles.logoBg, "border border-white/10")}>
                      {icon}
                    </div>
                  )}
                  <h2 className={cn("text-2xl font-bold tracking-tight", styles.titleColor)}>
                    {title}
                  </h2>
                </div>
                {subtitle && (
                  <p className={cn("text-base", styles.subtitleColor)}>{subtitle}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Separator */}
        <div className="relative h-px bg-slate-800">
          <div
            className="absolute inset-0 opacity-60"
            style={teamBranded && teamColor ? {
              background: `linear-gradient(90deg, transparent, ${teamColor.primary}, transparent)`,
            } : undefined}
          >
            {!teamBranded && (
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-50",
                variant === 'agent' && "text-blue-500",
                variant === 'master' && "text-amber-500",
                variant === 'admin' && "text-indigo-500",
                variant === 'register' && "text-cyan-500",
                variant === 'check' && "text-emerald-500"
              )} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>

        {/* Bottom accent */}
        <div
          className={cn("h-1 w-full opacity-70", !teamBranded && "bg-gradient-to-r", !teamBranded && styles.accent)}
          style={teamBranded && teamColor ? {
            background: `linear-gradient(90deg, ${teamColor.secondary}, ${teamColor.primary}, ${teamColor.secondary})`,
          } : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}

// shimmer keyframes injected once
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;

if (typeof document !== 'undefined') {
  if (!document.head.querySelector('[data-shimmer-animation]')) {
    const style = document.createElement('style');
    style.textContent = shimmerKeyframes;
    style.setAttribute('data-shimmer-animation', 'true');
    document.head.appendChild(style);
  }
}
