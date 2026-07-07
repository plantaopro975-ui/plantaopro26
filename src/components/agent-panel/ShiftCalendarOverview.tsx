import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, RefreshCw, Palmtree, AlertCircle, CheckCircle } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShiftCalendarOverviewProps {
  agentId: string;
}

interface Shift {
  id: string;
  shift_date: string;
  start_time: string;
  status: string;
  is_vacation: boolean;
  notes: string | null;
}

interface BHEntry {
  id: string;
  created_at: string;
  hours: number;
  operation_type: string;
}

interface LeaveRequest {
  id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: string;
}

type DayType = 'shift' | 'bh' | 'leave' | 'rest' | 'today' | 'vacation';

interface DayInfo {
  date: Date;
  types: DayType[];
  shift?: Shift;
  bhEntry?: BHEntry;
  leave?: LeaveRequest;
}

export function ShiftCalendarOverview({ agentId }: ShiftCalendarOverviewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [bhEntries, setBhEntries] = useState<BHEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [agentId, currentMonth]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      // Fetch shifts
      const { data: shiftData } = await supabase
        .from('agent_shifts')
        .select('*')
        .eq('agent_id', agentId)
        .gte('shift_date', monthStart)
        .lte('shift_date', monthEnd);

      // Fetch BH entries
      const { data: bhData } = await supabase
        .from('overtime_bank')
        .select('*')
        .eq('agent_id', agentId)
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd);

      // Fetch leaves
      const { data: leaveData } = await supabase
        .from('agent_leaves')
        .select('*')
        .eq('agent_id', agentId)
        .gte('start_date', monthStart)
        .lte('end_date', monthEnd);

      setShifts((shiftData || []) as Shift[]);
      setBhEntries((bhData || []) as BHEntry[]);
      setLeaves((leaveData || []) as LeaveRequest[]);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayInfo = (date: Date): DayInfo => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const types: DayType[] = [];
    let shift: Shift | undefined;
    let bhEntry: BHEntry | undefined;
    let leave: LeaveRequest | undefined;

    // Check if today
    if (isToday(date)) {
      types.push('today');
    }

    // Check for shifts
    shift = shifts.find(s => s.shift_date === dateStr);
    if (shift) {
      if (shift.is_vacation) {
        types.push('vacation');
      } else {
        types.push('shift');
      }
    }

    // Check for BH entries
    bhEntry = bhEntries.find(b => b.created_at.split('T')[0] === dateStr);
    if (bhEntry) {
      types.push('bh');
    }

    // Check for leaves
    leave = leaves.find(l => {
      const start = parseISO(l.start_date);
      const end = parseISO(l.end_date);
      return date >= start && date <= end;
    });
    if (leave) {
      types.push('leave');
    }

    // If no types, it's a rest day
    if (types.length === 0 || (types.length === 1 && types[0] === 'today')) {
      types.push('rest');
    }

    return { date, types, shift, bhEntry, leave };
  };

  const getDayColors = (types: DayType[]): string => {
    if (types.includes('shift')) return 'bg-amber-500/30 border-amber-500/50 text-amber-400';
    if (types.includes('vacation')) return 'bg-purple-500/30 border-purple-500/50 text-purple-400';
    if (types.includes('leave')) return 'bg-blue-500/30 border-blue-500/50 text-blue-400';
    if (types.includes('bh')) return 'bg-green-500/30 border-green-500/50 text-green-400';
    return 'bg-slate-800/30 border-slate-700/30 text-muted-foreground';
  };

  const getDayIcon = (types: DayType[]) => {
    if (types.includes('shift')) return <Clock className="h-2.5 w-2.5" />;
    if (types.includes('vacation')) return <Palmtree className="h-2.5 w-2.5" />;
    if (types.includes('leave')) return <RefreshCw className="h-2.5 w-2.5" />;
    if (types.includes('bh')) return <CheckCircle className="h-2.5 w-2.5" />;
    return null;
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfMonth = startOfMonth(currentMonth);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Stats for the month
  const shiftDays = shifts.filter(s => !s.is_vacation).length;
  const vacationDays = shifts.filter(s => s.is_vacation).length;
  const leaveDays = leaves.length;
  const totalBhHours = bhEntries.reduce((acc, b) => acc + (b.operation_type === 'credit' ? b.hours : -b.hours), 0);

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-slate-800/50 border-slate-700">
      {/* Decoração SVG discreta no fundo */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 opacity-[0.07]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <defs>
          <linearGradient id="cal-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="14" y="20" width="72" height="66" rx="8" stroke="url(#cal-grad)" strokeWidth="2" />
        <line x1="14" y1="34" x2="86" y2="34" stroke="url(#cal-grad)" strokeWidth="2" />
        <line x1="32" y1="12" x2="32" y2="26" stroke="url(#cal-grad)" strokeWidth="3" strokeLinecap="round" />
        <line x1="68" y1="12" x2="68" y2="26" stroke="url(#cal-grad)" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Calendar className="h-4 w-4 md:h-4.5 md:w-4.5 text-primary" />
            <span>Calendário do Mês</span>
          </CardTitle>
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium min-w-[100px] text-center capitalize tabular-nums">
              {format(currentMonth, "MMM yyyy", { locale: ptBR })}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 relative">
        {/* Month Stats — 2 col em telas muito pequenas, 4 col a partir de xs */}
        <div className="grid grid-cols-2 min-[420px]:grid-cols-4 gap-1.5">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md py-1.5 px-1.5 text-center">
            <p className="text-sm md:text-base font-bold text-amber-400 leading-none tabular-nums">{shiftDays}</p>
            <p className="text-[9px] text-muted-foreground uppercase mt-0.5 truncate">Plantões</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-md py-1.5 px-1.5 text-center">
            <p className="text-sm md:text-base font-bold text-purple-400 leading-none tabular-nums">{vacationDays}</p>
            <p className="text-[9px] text-muted-foreground uppercase mt-0.5 truncate">Férias</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md py-1.5 px-1.5 text-center">
            <p className="text-sm md:text-base font-bold text-blue-400 leading-none tabular-nums">{leaveDays}</p>
            <p className="text-[9px] text-muted-foreground uppercase mt-0.5 truncate">Folgas</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-md py-1.5 px-1.5 text-center">
            <p className="text-sm md:text-base font-bold text-green-400 leading-none tabular-nums">{totalBhHours > 0 ? '+' : ''}{totalBhHours}</p>
            <p className="text-[9px] text-muted-foreground uppercase mt-0.5 truncate">BH (h)</p>
          </div>
        </div>

        {/* Calendar Grid — contido com max-width e células responsivas */}
        <div className="bg-slate-900/50 rounded-lg p-1.5 sm:p-2 md:p-2.5 border border-slate-700/50 mx-auto w-full max-w-md">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1.5">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[9px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid — altura fixa e hierarquia clara (data em cima, ícone abaixo) */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 sm:h-10 md:h-11" />
            ))}

            {days.map((day) => {
              const dayInfo = getDayInfo(day);
              const colors = getDayColors(dayInfo.types);
              const icon = getDayIcon(dayInfo.types);
              const isTodayDay = dayInfo.types.includes('today');

              return (
                <div
                  key={day.toISOString()}
                  className={`relative h-9 sm:h-10 md:h-11 rounded-md border flex flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] sm:text-[11px] font-medium transition-all ${colors} ${
                    isTodayDay ? 'ring-2 ring-primary ring-offset-1 ring-offset-slate-900' : ''
                  }`}
                >
                  <span className={`leading-none tabular-nums ${isTodayDay ? 'font-bold' : ''}`}>{format(day, 'd')}</span>
                  {icon && <div className="opacity-80">{icon}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend — quebra bem em telas pequenas, sem cortar textos */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 pt-1.5 border-t border-slate-700/50">
          {[
            { c: 'bg-amber-500/50 border-amber-500/50', label: 'Plantão' },
            { c: 'bg-purple-500/50 border-purple-500/50', label: 'Férias' },
            { c: 'bg-blue-500/50 border-blue-500/50', label: 'Folga' },
            { c: 'bg-green-500/50 border-green-500/50', label: 'BH' },
          ].map((it) => (
            <div key={it.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full border ${it.c}`} />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{it.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
