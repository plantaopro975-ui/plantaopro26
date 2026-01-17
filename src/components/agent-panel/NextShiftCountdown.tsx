import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays, differenceInHours, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextShiftCountdownProps {
  agentId: string;
  className?: string;
}

interface NextShift {
  id: string;
  shift_date: string;
  start_time: string;
}

export function NextShiftCountdown({ agentId, className }: NextShiftCountdownProps) {
  const [nextShift, setNextShift] = useState<NextShift | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNextShift = async () => {
      if (!agentId) return;
      
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('agent_shifts')
          .select('id, shift_date, start_time')
          .eq('agent_id', agentId)
          .gte('shift_date', today)
          .eq('status', 'scheduled')
          .eq('is_vacation', false)
          .order('shift_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setNextShift(data as NextShift);
        }
      } catch (error) {
        console.error('Error fetching next shift:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextShift();
  }, [agentId]);

  const countdownInfo = useMemo(() => {
    if (!nextShift) return null;

    const shiftDate = parseISO(nextShift.shift_date);
    const now = new Date();
    const daysUntil = differenceInDays(shiftDate, now);
    const hoursUntil = differenceInHours(shiftDate, now);
    const isTodayShift = isToday(shiftDate);

    return {
      days: daysUntil,
      hours: hoursUntil,
      isToday: isTodayShift,
      isSoon: daysUntil <= 1,
      dateFormatted: format(shiftDate, "EEEE, dd/MM", { locale: ptBR }),
      time: nextShift.start_time?.slice(0, 5) || '07:00',
    };
  }, [nextShift]);

  if (isLoading || !nextShift || !countdownInfo) {
    return null;
  }

  const isUrgent = countdownInfo.isToday || countdownInfo.hours <= 12;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 p-3 transition-all duration-300",
        isUrgent
          ? "bg-gradient-to-r from-emerald-500/20 via-green-500/15 to-emerald-500/20 border-emerald-500/60 shadow-lg shadow-emerald-500/20"
          : countdownInfo.isSoon
            ? "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/15"
            : "bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-700/60",
        className
      )}
    >
      {/* Animated background for today */}
      {isUrgent && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5 animate-pulse" />
      )}

      <div className="relative flex items-center gap-3">
        {/* Icon with animation */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg",
            isUrgent
              ? "bg-gradient-to-br from-emerald-500 to-green-600"
              : countdownInfo.isSoon
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-slate-600 to-slate-700"
          )}
        >
          {isUrgent ? (
            <Zap className="h-5 w-5 text-white" />
          ) : countdownInfo.isSoon ? (
            <AlertTriangle className="h-5 w-5 text-white" />
          ) : (
            <Calendar className="h-5 w-5 text-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                isUrgent ? "text-emerald-400" : countdownInfo.isSoon ? "text-amber-400" : "text-slate-400"
              )}
            >
              {countdownInfo.isToday ? "PLANTÃO HOJE" : "Próximo Plantão"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-0.5">
            {countdownInfo.isToday ? (
              <span className="text-lg font-black text-emerald-300">
                às {countdownInfo.time}
              </span>
            ) : (
              <>
                <span
                  className={cn(
                    "text-2xl font-black tabular-nums",
                    countdownInfo.isSoon ? "text-amber-300" : "text-slate-200"
                  )}
                >
                  {countdownInfo.days}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    countdownInfo.isSoon ? "text-amber-400/80" : "text-slate-400"
                  )}
                >
                  dia{countdownInfo.days !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>

          <p className="text-[10px] text-slate-500 mt-0.5 truncate capitalize">
            {countdownInfo.dateFormatted}
          </p>
        </div>

        {/* Time badge */}
        {!countdownInfo.isToday && (
          <div
            className={cn(
              "flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-bold",
              countdownInfo.isSoon
                ? "bg-amber-500/20 text-amber-400"
                : "bg-slate-700/50 text-slate-400"
            )}
          >
            <Clock className="h-3 w-3" />
            {countdownInfo.time}
          </div>
        )}
      </div>
    </div>
  );
}
