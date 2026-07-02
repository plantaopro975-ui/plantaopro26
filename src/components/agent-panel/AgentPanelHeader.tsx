import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AgentRoleSelector } from '@/components/agent-panel/AgentRoleSelector';
import { NotificationsPanel } from '@/components/agent-panel/NotificationsPanel';
import { getRemainingTrialDays } from '@/components/WelcomeTrialDialog';
import { FontSizeControl } from '@/components/FontSizeControl';
import { cn } from '@/lib/utils';
import panelHeaderBg from '@/assets/panel-header-bg.jpg';

interface Agent {
  id: string;
  name: string;
  team: string | null;
  role?: string | null;
  blood_type?: string | null;
  avatar_url?: string | null;
  unit_id?: string | null;
}

interface AgentPanelHeaderProps {
  agent: Agent;
  isOnline: boolean;
  onShowWelcome: () => void;
  onReactivateShiftBanner?: () => void;
  isShiftBannerDismissed?: boolean;
}

/* ────────────────────────────────────────────────────────────────
   Inline tactical SVG icons — public-security aesthetic
   ──────────────────────────────────────────────────────────────── */

const IconShieldStar = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z" />
    <path d="m12 8 1.3 2.7 2.9.4-2.1 2 .5 2.9L12 14.6l-2.6 1.4.5-2.9-2.1-2 2.9-.4L12 8Z" fill="currentColor" fillOpacity=".25" />
  </svg>
);

const IconDroplet = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" fill="currentColor" fillOpacity=".2" />
  </svg>
);

const IconBuilding = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <path d="M4 21V7l8-4 8 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M9 10h.01M12 10h.01M15 10h.01M9 13h.01M15 13h.01" strokeLinecap="round" />
  </svg>
);

const IconGift = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v9h14v-9M12 8v13" />
    <path d="M12 8s-3-5-5.5-3-1 5 2.5 3M12 8s3-5 5.5-3 1 5-2.5 3" />
  </svg>
);

const IconRefresh = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

const IconPower = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v9" />
    <path d="M5.6 7.6a9 9 0 1 0 12.8 0" />
  </svg>
);

const IconBell = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7Z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
);

/* ────────────────────────────────────────────────────────────────
   Team config — tactical corps identity
   ──────────────────────────────────────────────────────────────── */

const TEAM_CONFIG: Record<string, { hex: string; accent: string; label: string }> = {
  ALFA:    { hex: '#ef4444', accent: 'rgba(239,68,68,.55)',  label: 'ALFA' },
  BRAVO:   { hex: '#3b82f6', accent: 'rgba(59,130,246,.55)', label: 'BRAVO' },
  CHARLIE: { hex: '#10b981', accent: 'rgba(16,185,129,.55)', label: 'CHARLIE' },
  DELTA:   { hex: '#f59e0b', accent: 'rgba(245,158,11,.55)', label: 'DELTA' },
};

function TeamInsignia({ team }: { team: string | null }) {
  if (!team) return null;
  const cfg = TEAM_CONFIG[team.toUpperCase()] ?? { hex: '#c9a84c', accent: 'rgba(201,168,76,.55)', label: team };
  return (
    <div
      className="relative flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-md bg-slate-950/70 border font-['IBM_Plex_Mono',_monospace]"
      style={{ borderColor: cfg.accent }}
    >
      {/* corps shield */}
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none">
        <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z" fill={cfg.hex} fillOpacity=".18" stroke={cfg.hex} strokeWidth="1.4" />
        <path d="M8 11h8M8 14h8M10 8h4" stroke={cfg.hex} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase" style={{ color: cfg.hex }}>
        {cfg.label}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Online status — radar pulse
   ──────────────────────────────────────────────────────────────── */

function OnlinePulse({ isOnline }: { isOnline: boolean }) {
  const color = isOnline ? '#10b981' : '#f59e0b';
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 border font-['IBM_Plex_Mono',_monospace]"
      style={{ borderColor: `${color}66` }}
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3">
        <circle cx="6" cy="6" r="5" fill="none" stroke={color} strokeOpacity=".35" strokeWidth="1" />
        {isOnline && <circle cx="6" cy="6" r="5" fill="none" stroke={color} strokeWidth="1" opacity=".8">
          <animate attributeName="r" from="2" to="5.5" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" from=".8" to="0" dur="1.6s" repeatCount="indefinite" />
        </circle>}
        <circle cx="6" cy="6" r="2.2" fill={color} />
      </svg>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color }}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Unit badge
   ──────────────────────────────────────────────────────────────── */

function UnitBadge({ unitId }: { unitId: string }) {
  const [unitName, setUnitName] = useState('');
  useEffect(() => {
    if (!unitId) return;
    supabase.from('units').select('name').eq('id', unitId).single().then(({ data }) => {
      if (data?.name) setUnitName(data.name);
    });
  }, [unitId]);
  if (!unitName) return null;
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 border border-amber-500/40 font-['IBM_Plex_Mono',_monospace]">
      <IconBuilding className="h-3.5 w-3.5 text-amber-400" />
      <span className="text-[10.5px] font-bold text-amber-300 tracking-[0.15em] uppercase truncate max-w-[140px] md:max-w-[220px]">
        {unitName}
      </span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Icon action button — unified premium tactile
   ──────────────────────────────────────────────────────────────── */

function ActionButton({
  onClick, tooltip, tone = 'neutral', children,
}: {
  onClick: () => void;
  tooltip: string;
  tone?: 'neutral' | 'amber' | 'orange' | 'emerald';
  children: React.ReactNode;
}) {
  const tones = {
    neutral: 'border-slate-700/70 text-slate-300 hover:text-amber-300 hover:border-amber-500/50',
    amber:   'border-amber-500/40 text-amber-300 hover:border-amber-400/70',
    orange:  'border-orange-500/50 text-orange-300 hover:border-orange-400/70 animate-pulse',
    emerald: 'border-emerald-500/40 text-emerald-300 hover:border-emerald-400/70',
  }[tone];
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'relative flex items-center justify-center h-9 min-w-9 px-2 rounded-md',
              'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border',
              'shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-all duration-200',
              'hover:-translate-y-[1px] active:translate-y-0',
              tones,
            )}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-slate-950 border-slate-700 text-slate-200 text-[11px]">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main header
   ──────────────────────────────────────────────────────────────── */

export function AgentPanelHeader({ agent, isOnline, onShowWelcome, onReactivateShiftBanner, isShiftBannerDismissed }: AgentPanelHeaderProps) {
  const navigate = useNavigate();
  const trial = getRemainingTrialDays();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/70 shadow-[0_10px_40px_-15px_rgba(0,0,0,.8)]">
      {/* background layers */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${panelHeaderBg})` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-slate-950" />

      {/* diagonal SVG stripes — subtle tactical texture */}
      <svg aria-hidden className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tacstripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#c9a84c" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tacstripes)" />
      </svg>

      {/* gold top accent + chevron ribbon */}
      <div className="relative h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
      <svg aria-hidden viewBox="0 0 1200 8" preserveAspectRatio="none" className="relative w-full h-2 text-amber-500/70">
        <path d="M0 0 L20 8 L40 0 L60 8 L80 0 L100 8 L120 0" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".4" />
      </svg>

      <div className="relative p-2.5 md:p-3">
        <div className="flex items-center justify-between gap-2">
          {/* ── Identity block ── */}
          <button
            type="button"
            onClick={() => navigate('/agent-profile')}
            className="group flex items-center gap-2.5 min-w-0 flex-shrink text-left"
          >
            {/* Avatar with SVG rank ring */}
            <div className="relative shrink-0">
              <svg viewBox="0 0 48 48" className="absolute -inset-1 h-[52px] w-[52px] md:h-[56px] md:w-[56px] pointer-events-none">
                <defs>
                  <linearGradient id="ringGold" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#f0d78c" />
                    <stop offset="100%" stopColor="#8a6a1e" />
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="22" fill="none" stroke="url(#ringGold)" strokeWidth="1.5" strokeDasharray="3 3" opacity=".7" />
              </svg>
              <Avatar className="w-10 h-10 md:w-11 md:h-11 border-2 border-amber-500/70">
                {agent.avatar_url && <AvatarImage src={agent.avatar_url} alt={agent.name} className="object-cover" />}
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-700 text-sm font-black text-slate-950">
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* rank chevrons */}
              <svg viewBox="0 0 24 12" className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2.5 w-6 text-amber-400 drop-shadow">
                <path d="M2 8 L12 2 L22 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 10 L12 5 L20 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
              </svg>
            </div>

            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1.5">
                <IconShieldStar className="h-3 w-3 text-amber-400/80" />
                <span className="text-[9px] tracking-[0.25em] uppercase text-amber-400/80 font-['IBM_Plex_Mono',_monospace]">
                  Agente
                </span>
              </div>
              <h1 className="text-sm md:text-[15px] font-bold text-slate-50 truncate tracking-wide font-['Libre_Baskerville',_serif] group-hover:text-amber-200 transition-colors">
                {agent.name}
              </h1>
            </div>
          </button>

          {/* ── Center insignia row (desktop) ── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {agent.team && <TeamInsignia team={agent.team} />}
            {agent.unit_id && <UnitBadge unitId={agent.unit_id} />}
            {agent.blood_type && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-950/70 border border-red-500/50 font-['IBM_Plex_Mono',_monospace]">
                <IconDroplet className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[10.5px] font-black text-red-300 tracking-wider">{agent.blood_type}</span>
              </div>
            )}
            <OnlinePulse isOnline={isOnline} />
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1.5">
            {agent.blood_type && (
              <div className="md:hidden flex items-center gap-1 px-1.5 h-9 rounded-md bg-slate-950/70 border border-red-500/50">
                <IconDroplet className="h-3 w-3 text-red-400" />
                <span className="text-[10px] font-black text-red-300">{agent.blood_type}</span>
              </div>
            )}

            <AgentRoleSelector agentId={agent.id} currentRole={agent.role || 'agent'} />
            <NotificationsPanel agentId={agent.id} />
            <FontSizeControl />

            <ActionButton onClick={onShowWelcome} tooltip={`Trial: ${trial} dias restantes`} tone="amber">
              <IconGift className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5 text-[10.5px] font-bold tracking-wider font-['IBM_Plex_Mono',_monospace]">
                {trial}D
              </span>
            </ActionButton>

            {isShiftBannerDismissed && onReactivateShiftBanner && (
              <ActionButton onClick={onReactivateShiftBanner} tooltip="Reativar lembrete de plantão" tone="orange">
                <IconBell className="h-4 w-4" />
              </ActionButton>
            )}

            <ActionButton onClick={() => window.location.reload()} tooltip="Atualizar dados" tone="emerald">
              <IconRefresh className="h-4 w-4" />
            </ActionButton>

            {/* Logout — premium tactile */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                      'group relative flex items-center gap-1.5 h-9 px-3 rounded-md overflow-hidden',
                      'bg-gradient-to-b from-red-600 to-red-800 border border-red-400/40',
                      'text-white font-bold text-[11px] tracking-[0.15em] uppercase font-[\'IBM_Plex_Mono\',_monospace]',
                      'shadow-[0_4px_14px_-4px_rgba(220,38,38,.6),inset_0_1px_0_rgba(255,255,255,.15)]',
                      'hover:from-red-500 hover:to-red-700 hover:-translate-y-[1px]',
                      'active:translate-y-0 transition-all duration-200'
                    )}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <IconPower className="h-4 w-4 relative" />
                    <span className="hidden sm:inline relative">Sair</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-950 border-slate-700 text-slate-200 text-[11px]">
                  Encerrar sessão
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Mobile insignia row */}
        <div className="md:hidden flex items-center justify-between mt-2 pt-2 border-t border-amber-500/15">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {agent.team && <TeamInsignia team={agent.team} />}
            {agent.unit_id && <UnitBadge unitId={agent.unit_id} />}
          </div>
          <OnlinePulse isOnline={isOnline} />
        </div>
      </div>

      {/* bottom gold accent */}
      <div className="relative h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
    </div>
  );
}
