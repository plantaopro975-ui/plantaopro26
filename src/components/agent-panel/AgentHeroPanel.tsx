import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays, differenceInHours, isToday, isTomorrow, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Shield, Zap, Clock, Calendar, TrendingUp, Activity, 
  ChevronRight, Star, Sun, Moon, Target, Flame, Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentHeroPanelProps {
  agentId: string;
  agentName: string;
  agentTeam?: string | null;
}

interface NextShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

interface QuickStats {
  totalShifts: number;
  completedShifts: number;
  bhBalance: number;
  pendingLeaves: number;
}

export function AgentHeroPanel({ agentId, agentName, agentTeam }: AgentHeroPanelProps) {
  const [nextShift, setNextShift] = useState<NextShift | null>(null);
  const [stats, setStats] = useState<QuickStats>({ totalShifts: 0, completedShifts: 0, bhBalance: 0, pendingLeaves: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch next shift
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: shiftData } = await supabase
          .from('agent_shifts')
          .select('id, shift_date, start_time, end_time')
          .eq('agent_id', agentId)
          .gte('shift_date', today)
          .eq('status', 'scheduled')
          .order('shift_date', { ascending: true })
          .limit(1);

        if (shiftData && shiftData.length > 0) {
          setNextShift(shiftData[0]);
        }

        // Fetch quick stats
        const [shiftsRes, bhRes, leavesRes] = await Promise.all([
          supabase
            .from('agent_shifts')
            .select('id, status')
            .eq('agent_id', agentId),
          supabase.rpc('calculate_bh_balance', { p_agent_id: agentId }),
          supabase
            .from('agent_leaves')
            .select('id')
            .eq('agent_id', agentId)
            .eq('status', 'pending')
        ]);

        const totalShifts = shiftsRes.data?.length || 0;
        const completedShifts = shiftsRes.data?.filter(s => s.status === 'completed').length || 0;

        setStats({
          totalShifts,
          completedShifts,
          bhBalance: bhRes.data || 0,
          pendingLeaves: leavesRes.data?.length || 0
        });
      } catch (error) {
        console.error('Error fetching hero data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [agentId]);

  const getTimeUntilShift = () => {
    if (!nextShift) return null;
    
    const shiftDate = parseISO(nextShift.shift_date);
    const [hours, minutes] = (nextShift.start_time || '07:00').split(':').map(Number);
    shiftDate.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const diffMs = shiftDate.getTime() - now.getTime();
    
    if (diffMs < 0) return null;
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
    return `${diffMins}m`;
  };

  const getShiftContext = () => {
    if (!nextShift) return { label: 'Sem plantões', color: 'text-slate-400', urgent: false };
    
    const shiftDate = parseISO(nextShift.shift_date);
    
    if (isToday(shiftDate)) {
      return { label: 'HOJE', color: 'text-emerald-400', urgent: true };
    }
    if (isTomorrow(shiftDate)) {
      return { label: 'AMANHÃ', color: 'text-amber-400', urgent: true };
    }
    
    const days = differenceInDays(shiftDate, startOfDay(new Date()));
    return { label: `Em ${days} dias`, color: 'text-cyan-400', urgent: false };
  };

  const firstName = agentName.split(' ')[0];
  const shiftContext = getShiftContext();
  const timeUntil = getTimeUntilShift();
  const completionRate = stats.totalShifts > 0 
    ? Math.round((stats.completedShifts / stats.totalShifts) * 100) 
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800/95 to-zinc-900 border border-zinc-700/60 shadow-2xl">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Scan Line Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-full animate-scan" 
          style={{ animation: 'scan 4s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 p-4 md:p-6">
        {/* Top Bar - Status & Time */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Agente</p>
              <h2 className="text-lg md:text-xl font-bold text-white">{firstName}</h2>
            </div>
          </div>
          
          {/* Live Clock */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">{format(currentTime, "EEEE", { locale: ptBR })}</span>
            </div>
            <p className="text-xl md:text-2xl font-mono font-bold text-white tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </p>
          </div>
        </div>

        {/* Main Hero Content - Next Shift Countdown */}
        <div className="bg-zinc-800/60 backdrop-blur-sm rounded-xl border border-zinc-700/50 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Timer className={cn("h-4 w-4", shiftContext.urgent ? "animate-pulse" : "", shiftContext.color)} />
                <span className={cn("text-sm font-bold uppercase tracking-wider", shiftContext.color)}>
                  {shiftContext.label}
                </span>
              </div>
              
              {nextShift ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-black text-white tabular-nums">
                      {timeUntil || '--:--'}
                    </span>
                    <span className="text-xs text-zinc-500 uppercase">até o plantão</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(parseISO(nextShift.shift_date), "dd 'de' MMMM", { locale: ptBR })}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="font-mono">{nextShift.start_time?.slice(0, 5) || '07:00'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-zinc-500">Nenhum plantão agendado</p>
              )}
            </div>
            
            {/* Visual Indicator */}
            <div className="hidden sm:flex relative">
              <div className={cn(
                "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center",
                shiftContext.urgent 
                  ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50"
                  : "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30"
              )}>
                {shiftContext.urgent ? (
                  <Flame className="h-10 w-10 text-amber-400 animate-pulse" />
                ) : (
                  <Target className="h-10 w-10 text-cyan-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {[
            { 
              label: 'Plantões', 
              value: stats.totalShifts.toString(), 
              icon: Calendar, 
              color: 'from-cyan-500/20 to-cyan-600/10',
              iconColor: 'text-cyan-400',
              borderColor: 'border-cyan-500/30'
            },
            { 
              label: 'Cumpridos', 
              value: `${completionRate}%`, 
              icon: TrendingUp, 
              color: 'from-emerald-500/20 to-emerald-600/10',
              iconColor: 'text-emerald-400',
              borderColor: 'border-emerald-500/30'
            },
            { 
              label: 'B.Horas', 
              value: `${stats.bhBalance >= 0 ? '+' : ''}${stats.bhBalance}h`, 
              icon: Activity, 
              color: stats.bhBalance >= 0 ? 'from-blue-500/20 to-blue-600/10' : 'from-rose-500/20 to-rose-600/10',
              iconColor: stats.bhBalance >= 0 ? 'text-blue-400' : 'text-rose-400',
              borderColor: stats.bhBalance >= 0 ? 'border-blue-500/30' : 'border-rose-500/30'
            },
            { 
              label: 'Folgas', 
              value: stats.pendingLeaves.toString(), 
              icon: Star, 
              color: 'from-purple-500/20 to-purple-600/10',
              iconColor: 'text-purple-400',
              borderColor: 'border-purple-500/30'
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative p-2.5 md:p-3 rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02]",
                `bg-gradient-to-br ${stat.color}`,
                stat.borderColor
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5 mb-1.5", stat.iconColor)} />
              <p className="text-lg md:text-xl font-bold text-white tabular-nums leading-none">
                {stat.value}
              </p>
              <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wide mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
