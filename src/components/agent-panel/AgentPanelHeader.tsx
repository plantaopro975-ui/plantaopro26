import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AgentRoleSelector } from '@/components/agent-panel/AgentRoleSelector';
import { NotificationsPanel } from '@/components/agent-panel/NotificationsPanel';
import { getRemainingTrialDays } from '@/components/WelcomeTrialDialog';
import { Droplet, LogOut, Gift, Building2, Bell, RefreshCw, Wifi, WifiOff, Shield, Sword, Target, Zap, Crown, Type } from 'lucide-react';
import { FontSizeControl } from '@/components/FontSizeControl';
import { cn } from '@/lib/utils';
import { Icon3D } from '@/components/ui/Icon3D';
import icon3dGift from '@/assets/icon-3d-gift.png';
import icon3dRefresh from '@/assets/icon-3d-refresh.png';
import icon3dLogout from '@/assets/icon-3d-logout.png';
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

// Team config with icons
const getTeamConfig = (team: string | null) => {
  switch (team?.toUpperCase()) {
    case 'ALFA': return { 
      color: 'bg-gradient-to-r from-red-500/25 to-rose-500/20 border-red-500/50 text-red-400',
      icon: Shield
    };
    case 'BRAVO': return { 
      color: 'bg-gradient-to-r from-blue-500/25 to-indigo-500/20 border-blue-500/50 text-blue-400',
      icon: Sword
    };
    case 'CHARLIE': return { 
      color: 'bg-gradient-to-r from-emerald-500/25 to-green-500/20 border-emerald-500/50 text-emerald-400',
      icon: Target
    };
    case 'DELTA': return { 
      color: 'bg-gradient-to-r from-amber-500/25 to-orange-500/20 border-amber-500/50 text-amber-400',
      icon: Zap
    };
    default: return { 
      color: 'bg-gradient-to-r from-slate-500/25 to-zinc-500/20 border-slate-500/50 text-slate-400',
      icon: Crown
    };
  }
};

// Team Badge with Icon
function TeamBadge({ team }: { team: string | null }) {
  if (!team) return null;
  
  const config = getTeamConfig(team);
  const IconComponent = config.icon;
  
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs uppercase tracking-wide",
      config.color
    )}>
      <IconComponent className="h-3.5 w-3.5" />
      <span>{team}</span>
    </div>
  );
}

// Online Status Badge - Professional Design
function OnlineStatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <div className={cn(
      "relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-lg transition-all",
      isOnline 
        ? "bg-gradient-to-r from-emerald-500/20 to-green-500/15 border-emerald-500/50 shadow-emerald-500/20" 
        : "bg-gradient-to-r from-amber-500/20 to-orange-500/15 border-amber-500/50 shadow-amber-500/20"
    )}>
      <div className="relative">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-emerald-400" : "bg-amber-400"
        )} />
        {isOnline && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
        )}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-wider",
        isOnline ? "text-emerald-400" : "text-amber-400"
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

// Unit Name Display - Compact Professional
function UnitBadge({ unitId }: { unitId: string }) {
  const [unitName, setUnitName] = useState<string>('');
  
  useEffect(() => {
    const fetchUnit = async () => {
      const { data } = await supabase
        .from('units')
        .select('name')
        .eq('id', unitId)
        .single();
      if (data?.name) {
        setUnitName(data.name);
      }
    };
    if (unitId) fetchUnit();
  }, [unitId]);
  
  if (!unitName) return null;
  
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/40 rounded-lg">
      <Building2 className="h-3.5 w-3.5 text-amber-400" />
      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide truncate max-w-[120px] md:max-w-[200px]">
        {unitName}
      </span>
    </div>
  );
}

export function AgentPanelHeader({ agent, isOnline, onShowWelcome, onReactivateShiftBanner, isShiftBannerDismissed }: AgentPanelHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-600/50 shadow-xl overflow-hidden">
      {/* Realistic tactical operations background */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${panelHeaderBg})` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-950/85 pointer-events-none" />

      {/* Top accent line */}
      <div className="relative h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      <div className="relative p-2.5 md:p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left Section: Avatar + Name */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity min-w-0 flex-shrink"
            onClick={() => navigate('/agent-profile')}
          >
            <Avatar className="w-10 h-10 md:w-11 md:h-11 border-2 border-amber-500/50 shadow-lg flex-shrink-0">
              {agent.avatar_url && <AvatarImage src={agent.avatar_url} alt={agent.name} className="object-cover" />}
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-600 text-base font-black text-black">
                {agent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-slate-100 truncate leading-tight">
                {agent.name}
              </h1>
            </div>
          </div>

          {/* Center Section: Team Badge + Unit + Blood Type */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {agent.team && <TeamBadge team={agent.team} />}
            {agent.unit_id && <UnitBadge unitId={agent.unit_id} />}
            
            {agent.blood_type && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-lg">
                <Droplet className="h-3.5 w-3.5 text-red-400 fill-red-400/30" />
                <span className="text-xs font-black text-red-300">{agent.blood_type}</span>
              </div>
            )}
            
            <OnlineStatusBadge isOnline={isOnline} />
          </div>

          {/* Right Section: Actions - Spectacular Professional Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Mobile: Blood type badge */}
            {agent.blood_type && (
              <div className="md:hidden flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-br from-red-500/30 to-rose-600/20 border border-red-500/50 rounded-lg shadow-lg shadow-red-500/10">
                <Droplet className="h-3 w-3 text-red-400 fill-red-400/30" />
                <span className="text-[10px] font-black text-red-300">{agent.blood_type}</span>
              </div>
            )}
            
            <AgentRoleSelector agentId={agent.id} currentRole={agent.role || 'agent'} />
            <NotificationsPanel agentId={agent.id} />
            
            {/* Font Size Control - Accessibility */}
            <FontSizeControl />
            
            {/* Trial Badge - Spectacular */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onShowWelcome}
                    className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/15 to-orange-500/20 border-2 border-amber-500/40 hover:border-amber-400/60 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 group-hover:translate-x-full transition-transform duration-700" />
                    <img src={icon3dGift} alt="" width={24} height={24} loading="lazy" className={icon3dCls} />
                    <span className="text-xs font-bold text-amber-300 hidden sm:inline">{getRemainingTrialDays()}d</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 text-amber-300 border-amber-500/50 text-xs font-medium">
                  ✨ Trial: {getRemainingTrialDays()} dias restantes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Reactivate Shift Banner Button - Spectacular */}
            {isShiftBannerDismissed && onReactivateShiftBanner && (
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onReactivateShiftBanner}
                      className="relative flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-br from-orange-500/25 via-orange-600/20 to-red-500/20 border-2 border-orange-500/50 hover:border-orange-400/70 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/15 to-orange-400/0 animate-pulse" />
                      <Bell className="h-4 w-4 text-orange-400 group-hover:animate-bounce" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800 text-orange-300 border-orange-500/50 text-xs font-medium">
                    🔔 Reativar lembrete de plantão
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Refresh Button - Useful action */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 border-2 border-slate-600/50 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95 group"
                  >
                    <img src={icon3dRefresh} alt="" width={24} height={24} loading="lazy" className={cn(icon3dCls, 'group-hover:rotate-180 transition-transform duration-500')} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-xs font-medium">
                  🔄 Atualizar Dados
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Logout Button - Spectacular */}
            <button
              type="button"
              onClick={handleLogout}
              className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:via-red-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 border border-red-400/30 group overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <img src={icon3dLogout} alt="" width={20} height={20} loading="lazy" className="h-5 w-5 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] group-hover:translate-x-0.5 transition-transform duration-300" />
              <span className="hidden sm:inline tracking-wide">Sair</span>
            </button>
          </div>
        </div>
        
        {/* Mobile: Team + Unit Row */}
        <div className="md:hidden flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            {agent.team && <TeamBadge team={agent.team} />}
            {agent.unit_id && <UnitBadge unitId={agent.unit_id} />}
          </div>
          <OnlineStatusBadge isOnline={isOnline} />
        </div>
      </div>
    </div>
  );
}
