import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AgentRoleSelector } from '@/components/agent-panel/AgentRoleSelector';
import { NotificationsPanel } from '@/components/agent-panel/NotificationsPanel';
import { getRemainingTrialDays } from '@/components/WelcomeTrialDialog';
import { Clock, Droplet, LogOut, Home, Gift, Shield, Building2, Bell } from 'lucide-react';

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

// Real-Time Clock Component - Compact
function CompactClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/60 rounded-lg border border-slate-600/40">
      <Clock className="h-3.5 w-3.5 text-emerald-400" />
      <span className="text-xs font-mono font-bold text-slate-200 tracking-wider tabular-nums">
        {formatTime(time)}
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

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'team_leader':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] px-1.5 py-0">Chefe</Badge>;
      case 'support':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] px-1.5 py-0">Apoio</Badge>;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-600/50 shadow-xl overflow-hidden">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
      
      <div className="p-2.5 md:p-3">
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
              <div className="flex items-center gap-1.5 mt-0.5">
                {agent.team && (
                  <Badge className="text-[9px] bg-slate-700/60 text-amber-300 border-amber-500/30 px-1.5 py-0">
                    {agent.team}
                  </Badge>
                )}
                {getRoleBadge(agent.role || null)}
              </div>
            </div>
          </div>

          {/* Center Section: Unit + Blood Type + Status */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {agent.unit_id && <UnitBadge unitId={agent.unit_id} />}
            
            {agent.blood_type && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded-lg">
                <Droplet className="h-3.5 w-3.5 text-red-400 fill-red-400/30" />
                <span className="text-xs font-black text-red-300">{agent.blood_type}</span>
              </div>
            )}
            
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              isOnline 
                ? 'bg-emerald-500/20 border border-emerald-500/40' 
                : 'bg-amber-500/20 border border-amber-500/40'
            }`}>
              <div className="relative">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {isOnline && <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />}
              </div>
              <span className={`text-[10px] font-semibold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isOnline ? 'ON' : 'OFF'}
              </span>
            </div>
            
            <CompactClock />
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Mobile: Blood type badge */}
            {agent.blood_type && (
              <div className="md:hidden flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded-md">
                <Droplet className="h-3 w-3 text-red-400 fill-red-400/30" />
                <span className="text-[10px] font-black text-red-300">{agent.blood_type}</span>
              </div>
            )}
            
            <AgentRoleSelector agentId={agent.id} currentRole={agent.role || 'agent'} />
            <NotificationsPanel agentId={agent.id} />
            
            {/* Trial Badge */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onShowWelcome}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                  >
                    <Gift className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 hidden sm:inline">{getRemainingTrialDays()}d</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 text-amber-300 border-amber-500/50 text-xs">
                  Trial: {getRemainingTrialDays()} dias restantes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Reactivate Shift Banner Button - Only shown when dismissed */}
            {isShiftBannerDismissed && onReactivateShiftBanner && (
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onReactivateShiftBanner}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 hover:bg-orange-500/30 transition-colors animate-pulse"
                    >
                      <Bell className="h-3.5 w-3.5 text-orange-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800 text-orange-300 border-orange-500/50 text-xs">
                    Reativar lembrete de plantão
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Home Button */}
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 border-slate-600 text-xs">
                  Tela Inicial
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Logout Button - Compact */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        
        {/* Mobile: Unit + Clock Row */}
        <div className="md:hidden flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
          {agent.unit_id && <UnitBadge unitId={agent.unit_id} />}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
              isOnline ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`text-[9px] font-semibold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <CompactClock />
          </div>
        </div>
      </div>
    </div>
  );
}
