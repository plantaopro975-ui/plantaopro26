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

        {/* HERO — team-branded when team is provided */}
        {teamBranded && teamPoster ? (
          <div className="relative h-52 sm:h-56 w-full overflow-hidden">
            {/* Poster background */}
            <img
              src={teamPoster}
              alt={`Equipe ${teamKey}`}
              className="absolute inset-0 h-full w-full object-cover scale-105"
              style={{ filter: 'contrast(1.05) saturate(1.1)' }}
            />
            {/* Tactical pattern overlay */}
            {teamPattern && (
              <div className="absolute inset-0 opacity-70 mix-blend-overlay"
                   style={{ backgroundImage: teamPattern }} />
            )}
            {/* Color wash */}
            <div className="absolute inset-0"
                 style={{
                   background: `linear-gradient(180deg, ${teamColor!.secondary}30 0%, transparent 40%, rgba(2,6,23,0.55) 75%, rgba(2,6,23,0.95) 100%)`,
                 }} />
            {/* Radial vignette pulse (team accent) */}
            <div className="absolute inset-0"
                 style={{
                   background: `radial-gradient(ellipse at 50% 30%, ${teamColor!.primary}25 0%, transparent 60%)`,
                 }} />

            {/* Corner decorations */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full animate-pulse"
                   style={{ background: teamColor!.primary, boxShadow: `0 0 12px ${teamColor!.primary}` }} />
              <span className="text-[10px] tracking-[0.3em] font-mono font-bold text-white/90 uppercase">
                Ch·{teamKey} · SEC
              </span>
            </div>
            <div className="absolute top-3 right-3 text-[10px] tracking-[0.25em] font-mono text-white/70">
              OP · CLASSIFIED
            </div>

            {/* Emblem + title stack */}
            <div className="absolute bottom-0 inset-x-0 px-6 pb-4 flex items-end gap-4">
              {teamEmblem && (
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 rounded-full blur-md opacity-70"
                       style={{ background: teamColor!.primary }} />
                  <img
                    src={teamEmblem}
                    alt=""
                    className="relative h-16 w-16 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] tracking-[0.35em] font-mono font-bold uppercase"
                     style={{ color: teamColor!.primary }}>
                  Equipe Operacional
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white leading-none mt-1 font-stencil">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-white/80 mt-1.5 leading-tight">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Bottom edge divider glow */}
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
