import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays, differenceInHours, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Zap, AlertTriangle, Palmtree, Wallet, TrendingUp, ChevronLeft, ChevronRight, Megaphone, Bell, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextShiftCountdownProps {
  agentId: string;
  agentName?: string;
  agentUnitId?: string | null;
  agentTeam?: string | null;
  className?: string;
}

interface NextShift {
  id: string;
  shift_date: string;
  start_time: string;
}

interface AgentLeave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
}

interface AdminAnnouncement {
  id: string;
  title: string;
  content: string | null;
  priority: string;
}

interface InfoCard {
  id: string;
  type: 'shift' | 'leave' | 'bh' | 'bh_value' | 'announcement';
  priority: number;
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  animate?: boolean;
}

export function NextShiftCountdown({ agentId, agentName, agentUnitId, agentTeam, className }: NextShiftCountdownProps) {
  const [nextShift, setNextShift] = useState<NextShift | null>(null);
  const [todayLeave, setTodayLeave] = useState<AgentLeave | null>(null);
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [bhBalance, setBhBalance] = useState<number>(0);
  const [bhValue, setBhValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Get first name for display
  const firstName = agentName?.split(' ')[0] || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!agentId) return;
      
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Fetch next shift, leaves, BH, and announcements in parallel
        const [shiftResult, leaveResult, bhResult, agentResult, announcementsResult] = await Promise.all([
          supabase
            .from('agent_shifts')
            .select('id, shift_date, start_time')
            .eq('agent_id', agentId)
            .gte('shift_date', today)
            .eq('status', 'scheduled')
            .eq('is_vacation', false)
            .order('shift_date', { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('agent_leaves')
            .select('id, leave_type, start_date, end_date')
            .eq('agent_id', agentId)
            .eq('status', 'approved')
            .lte('start_date', today)
            .gte('end_date', today)
            .limit(1)
            .maybeSingle(),
          supabase.rpc('calculate_bh_balance', { p_agent_id: agentId }),
          supabase
            .from('agents')
            .select('bh_hourly_rate')
            .eq('id', agentId)
            .single(),
          supabase
            .from('admin_announcements')
            .select('id, title, content, priority')
            .eq('is_active', true)
            .lte('starts_at', new Date().toISOString())
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        if (shiftResult.data) {
          setNextShift(shiftResult.data as NextShift);
        }

        if (leaveResult.data) {
          setTodayLeave(leaveResult.data as AgentLeave);
        }

        // Filter announcements by target
        if (announcementsResult.data) {
          setAnnouncements(announcementsResult.data as AdminAnnouncement[]);
        }

        const balance = bhResult.data || 0;
        setBhBalance(balance);

        const hourlyRate = agentResult.data?.bh_hourly_rate || 15.75;
        setBhValue(balance * hourlyRate);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [agentId, agentUnitId, agentTeam]);

  const infoCards = useMemo(() => {
    const cards: InfoCard[] = [];

    // Leave card (highest priority if on leave today)
    if (todayLeave) {
      const leaveLabels: Record<string, string> = {
        vacation: 'Férias',
        medical: 'Licença Médica',
        special: 'Folga Especial',
        training: 'Treinamento',
      };
      cards.push({
        id: 'leave',
        type: 'leave',
        priority: 1,
        icon: <Palmtree className="h-5 w-5 text-white" />,
        title: 'VOCÊ ESTÁ DE FOLGA',
        value: leaveLabels[todayLeave.leave_type] || todayLeave.leave_type,
        subtitle: `até ${format(parseISO(todayLeave.end_date), 'dd/MM', { locale: ptBR })}`,
        colorClass: 'text-green-400',
        bgClass: 'bg-gradient-to-br from-green-500 to-emerald-600',
        borderClass: 'border-green-500/60 bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-green-500/20 shadow-lg shadow-green-500/20',
        animate: true,
      });
    }

    // Shift card
    if (nextShift) {
      const shiftDate = parseISO(nextShift.shift_date);
      const now = new Date();
      const daysUntil = differenceInDays(shiftDate, now);
      const hoursUntil = differenceInHours(shiftDate, now);
      const isTodayShift = isToday(shiftDate);
      const isUrgent = isTodayShift || hoursUntil <= 12;
      const isSoon = daysUntil <= 1;

      cards.push({
        id: 'shift',
        type: 'shift',
        priority: isTodayShift ? 2 : 10,
        icon: isUrgent ? <Zap className="h-5 w-5 text-white" /> : isSoon ? <AlertTriangle className="h-5 w-5 text-white" /> : <Calendar className="h-5 w-5 text-white" />,
        title: isTodayShift ? 'PLANTÃO HOJE' : 'Próximo Plantão',
        value: isTodayShift ? `às ${nextShift.start_time?.slice(0, 5) || '07:00'}` : `${daysUntil} dia${daysUntil !== 1 ? 's' : ''}`,
        subtitle: format(shiftDate, "EEEE, dd/MM", { locale: ptBR }),
        colorClass: isUrgent ? 'text-emerald-400' : isSoon ? 'text-amber-400' : 'text-slate-400',
        bgClass: isUrgent ? 'bg-gradient-to-br from-emerald-500 to-green-600' : isSoon ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-slate-600 to-slate-700',
        borderClass: isUrgent 
          ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-emerald-500/20 shadow-lg shadow-emerald-500/20'
          : isSoon 
            ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 shadow-lg shadow-amber-500/15'
            : 'border-slate-700/60 bg-gradient-to-r from-slate-800/80 to-slate-900/80',
        animate: isUrgent,
      });
    }

    // BH Balance card (if has hours)
    if (bhBalance !== 0) {
      const isPositive = bhBalance > 0;
      cards.push({
        id: 'bh',
        type: 'bh',
        priority: 20,
        icon: <TrendingUp className="h-5 w-5 text-white" />,
        title: 'BANCO DE HORAS',
        value: `${isPositive ? '+' : ''}${bhBalance.toFixed(1)}h`,
        subtitle: isPositive ? 'horas acumuladas' : 'horas devidas',
        colorClass: isPositive ? 'text-blue-400' : 'text-red-400',
        bgClass: isPositive ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-red-500 to-rose-600',
        borderClass: isPositive 
          ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15'
          : 'border-red-500/50 bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/15',
      });
    }

    // BH Value card (if has value)
    if (bhValue !== 0 && bhBalance !== 0) {
      const isPositive = bhValue > 0;
      cards.push({
        id: 'bh_value',
        type: 'bh_value',
        priority: 21,
        icon: <Wallet className="h-5 w-5 text-white" />,
        title: 'VALOR BH',
        value: `R$ ${Math.abs(bhValue).toFixed(2)}`,
        subtitle: isPositive ? 'a receber' : 'a compensar',
        colorClass: isPositive ? 'text-emerald-400' : 'text-orange-400',
        bgClass: isPositive ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-orange-500 to-amber-600',
        borderClass: isPositive 
          ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15'
          : 'border-orange-500/50 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15',
      });
    }

    // Admin Announcements
    announcements.forEach((announcement, index) => {
      const priorityConfig: Record<string, { priority: number; icon: React.ReactNode; colorClass: string; bgClass: string; borderClass: string; animate: boolean }> = {
        urgent: {
          priority: 0, // Highest priority
          icon: <AlertCircle className="h-5 w-5 text-white" />,
          colorClass: 'text-red-400',
          bgClass: 'bg-gradient-to-br from-red-500 to-rose-600',
          borderClass: 'border-red-500/60 bg-gradient-to-r from-red-500/20 via-rose-500/15 to-red-500/20 shadow-lg shadow-red-500/20',
          animate: true,
        },
        high: {
          priority: 3,
          icon: <Bell className="h-5 w-5 text-white" />,
          colorClass: 'text-amber-400',
          bgClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
          borderClass: 'border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 shadow-lg shadow-amber-500/15',
          animate: true,
        },
        normal: {
          priority: 15,
          icon: <Megaphone className="h-5 w-5 text-white" />,
          colorClass: 'text-blue-400',
          bgClass: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          borderClass: 'border-blue-500/50 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-blue-500/15',
          animate: false,
        },
        low: {
          priority: 25,
          icon: <Megaphone className="h-5 w-5 text-white" />,
          colorClass: 'text-slate-400',
          bgClass: 'bg-gradient-to-br from-slate-500 to-slate-600',
          borderClass: 'border-slate-500/50 bg-gradient-to-r from-slate-500/15 via-slate-600/10 to-slate-500/15',
          animate: false,
        },
      };

      const config = priorityConfig[announcement.priority] || priorityConfig.normal;

      cards.push({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        priority: config.priority + (index * 0.1), // Slight offset for multiple announcements
        icon: config.icon,
        title: announcement.priority === 'urgent' ? '🚨 AVISO URGENTE' : announcement.priority === 'high' ? '⚠️ AVISO IMPORTANTE' : 'AVISO',
        value: announcement.title,
        subtitle: announcement.content || '',
        colorClass: config.colorClass,
        bgClass: config.bgClass,
        borderClass: config.borderClass,
        animate: config.animate,
      });
    });

    // Sort by priority
    return cards.sort((a, b) => a.priority - b.priority);
  }, [nextShift, todayLeave, bhBalance, bhValue, announcements]);

  // Auto-rotate cards
  useEffect(() => {
    if (infoCards.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % infoCards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [infoCards.length]);

  if (isLoading || infoCards.length === 0) {
    return null;
  }

  const activeCard = infoCards[activeIndex];
  const showNavigation = infoCards.length > 1;

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + infoCards.length) % infoCards.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % infoCards.length);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 p-3 transition-all duration-500",
        activeCard.borderClass,
        className
      )}
    >
      {/* Animated background */}
      {activeCard.animate && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse" />
      )}
      
      {/* Floating name badge - Professional style */}
      {firstName && (
        <div className="absolute top-1 right-2 z-10">
          <span className="text-[9px] font-bold tracking-widest text-amber-400/80 uppercase bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent px-2 py-0.5 rounded-full border border-amber-500/20">
            {firstName}
          </span>
        </div>
      )}

      <div className="relative flex items-center gap-3">
        {/* Navigation Left */}
        {showNavigation && (
          <button
            onClick={goToPrev}
            className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 border border-slate-600/50 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 text-amber-400" />
          </button>
        )}

        {/* Icon with animation */}
        <div
          className={cn(
            "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-xl transition-all duration-500 border border-white/20",
            activeCard.bgClass
          )}
        >
          {activeCard.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors duration-500",
                activeCard.colorClass
              )}
            >
              {activeCard.title}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={cn(
                "text-xl font-black tabular-nums transition-colors duration-500",
                activeCard.colorClass.replace('-400', '-300')
              )}
            >
              {activeCard.value}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 mt-0.5 truncate capitalize">
            {activeCard.subtitle}
          </p>
        </div>

        {/* Dots indicator - Professional style */}
        {showNavigation && (
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5 p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            {infoCards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                  idx === activeIndex 
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 scale-125 shadow-amber-500/50" 
                    : "bg-slate-600 hover:bg-slate-500"
                )}
              />
            ))}
          </div>
        )}

        {/* Navigation Right */}
        {showNavigation && (
          <button
            onClick={goToNext}
            className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-slate-700/80 to-slate-800/80 hover:from-slate-600/80 hover:to-slate-700/80 border border-slate-600/50 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-4 w-4 text-amber-400" />
          </button>
        )}
      </div>
    </div>
  );
}
