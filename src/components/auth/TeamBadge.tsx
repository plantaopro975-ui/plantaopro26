import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Target, Radio, Zap } from 'lucide-react';

type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface TeamBadgeProps {
  team: TeamName;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const teamConfig: Record<TeamName, { 
  icon: typeof Shield;
  color: string;
  bg: string;
  border: string;
  glow: string;
}> = {
  ALFA: {
    icon: Shield,
    color: 'text-red-400',
    bg: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/40',
    glow: 'shadow-red-500/30',
  },
  BRAVO: {
    icon: Target,
    color: 'text-blue-400',
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-500/30',
  },
  CHARLIE: {
    icon: Radio,
    color: 'text-emerald-400',
    bg: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/40',
    glow: 'shadow-emerald-500/30',
  },
  DELTA: {
    icon: Zap,
    color: 'text-amber-400',
    bg: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/40',
    glow: 'shadow-amber-500/30',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-3 py-1.5 gap-2',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-2 gap-2.5',
    icon: 'w-5 h-5',
    text: 'text-base',
  },
  lg: {
    container: 'px-5 py-2.5 gap-3',
    icon: 'w-6 h-6',
    text: 'text-lg',
  },
};

export function TeamBadge({ team, size = 'md', showIcon = true, className }: TeamBadgeProps) {
  const config = teamConfig[team];
  const sizes = sizeStyles[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl",
        "bg-gradient-to-r backdrop-blur-sm",
        config.bg,
        "border",
        config.border,
        "shadow-lg",
        config.glow,
        sizes.container,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(sizes.icon, config.color)} />
      )}
      <span className={cn(
        "font-bold tracking-wider",
        config.color,
        sizes.text
      )}>
        EQUIPE {team}
      </span>
    </div>
  );
}

export function getTeamIcon(team: TeamName) {
  return teamConfig[team].icon;
}

export function getTeamColor(team: TeamName) {
  return teamConfig[team].color;
}
