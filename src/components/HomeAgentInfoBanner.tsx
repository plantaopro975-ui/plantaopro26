import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  Bell, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Sparkles,
  Timer,
  CalendarCheck,
  Shield
} from 'lucide-react';
import { format, differenceInDays, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgentInfoItem {
  id: string;
  type: 'shift' | 'bh' | 'announcement' | 'leave' | 'event';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentColor: string;
  priority: number;
}

export function HomeAgentInfoBanner() {
  const { user } = useAuth();
  const { agent } = useAgentProfile();
  const { themeConfig } = useTheme();
  const [infoItems, setInfoItems] = useState<AgentInfoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const fetchAgentInfo = useCallback(async () => {
    if (!agent?.id) return;

    const items: AgentInfoItem[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      // 1. Next Shift
      const { data: shifts } = await supabase
        .from('agent_shifts')
        .select('shift_date, start_time, end_time, shift_type')
        .eq('agent_id', agent.id)
        .gte('shift_date', today)
        .order('shift_date', { ascending: true })
        .limit(1);

      if (shifts?.[0]) {
        const shiftDate = parseISO(shifts[0].shift_date);
        const daysUntil = differenceInDays(shiftDate, new Date());
        let dateLabel = format(shiftDate, "EEEE, dd 'de' MMM", { locale: ptBR });
        
        if (isToday(shiftDate)) {
          dateLabel = 'HOJE';
        } else if (isTomorrow(shiftDate)) {
          dateLabel = 'AMANHÃ';
        }

        items.push({
          id: 'shift',
          type: 'shift',
          icon: <CalendarCheck className="h-4 w-4" />,
          title: `Próximo Plantão: ${dateLabel}`,
          subtitle: `${shifts[0].start_time?.slice(0, 5) || '07:00'} - ${shifts[0].end_time?.slice(0, 5) || '19:00'}`,
          accentColor: isToday(shiftDate) ? 'text-red-400' : isTomorrow(shiftDate) ? 'text-amber-400' : 'text-primary',
          priority: isToday(shiftDate) ? 100 : isTomorrow(shiftDate) ? 90 : 50,
        });
      }

      // 2. BH Balance
      const { data: bhData } = await supabase
        .from('overtime_bank')
        .select('hours, operation_type')
        .eq('agent_id', agent.id);

      if (bhData) {
        const balance = bhData.reduce((acc, entry) => {
          return entry.operation_type === 'credit' ? acc + (entry.hours || 0) : acc - (entry.hours || 0);
        }, 0);

        items.push({
          id: 'bh',
          type: 'bh',
          icon: <TrendingUp className="h-4 w-4" />,
          title: `Banco de Horas: ${balance >= 0 ? '+' : ''}${balance.toFixed(0)}h`,
          subtitle: balance >= 0 ? 'Saldo positivo' : 'Saldo a compensar',
          accentColor: balance >= 0 ? 'text-emerald-400' : 'text-amber-400',
          priority: 40,
        });
      }

      // 3. Upcoming Events
      const { data: events } = await supabase
        .from('agent_events')
        .select('title, event_date, event_type')
        .eq('agent_id', agent.id)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(1);

      if (events?.[0]) {
        const eventDate = parseISO(events[0].event_date);
        const daysUntil = differenceInDays(eventDate, new Date());

        items.push({
          id: 'event',
          type: 'event',
          icon: <Bell className="h-4 w-4" />,
          title: events[0].title,
          subtitle: daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`,
          accentColor: 'text-violet-400',
          priority: 60,
        });
      }

      // 4. Active Leaves
      const { data: leaves } = await supabase
        .from('agent_leaves')
        .select('leave_type, start_date, end_date, status')
        .eq('agent_id', agent.id)
        .eq('status', 'approved')
        .or(`start_date.lte.${today},end_date.gte.${today}`)
        .limit(1);

      if (leaves?.[0]) {
        const leaveTypes: Record<string, string> = {
          vacation: 'Férias',
          sick: 'Licença Médica',
          personal: 'Licença Pessoal',
          training: 'Treinamento',
        };

        items.push({
          id: 'leave',
          type: 'leave',
          icon: <Timer className="h-4 w-4" />,
          title: leaveTypes[leaves[0].leave_type] || 'Afastamento',
          subtitle: `Até ${format(parseISO(leaves[0].end_date), "dd 'de' MMM", { locale: ptBR })}`,
          accentColor: 'text-cyan-400',
          priority: 80,
        });
      }

      // 5. Admin Announcements
      const { data: announcements } = await supabase
        .from('admin_announcements')
        .select('title, priority')
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .limit(1);

      if (announcements?.[0]) {
        items.push({
          id: 'announcement',
          type: 'announcement',
          icon: <AlertCircle className="h-4 w-4" />,
          title: announcements[0].title,
          subtitle: 'Comunicado oficial',
          accentColor: announcements[0].priority === 'urgent' ? 'text-red-400' : 'text-amber-400',
          priority: announcements[0].priority === 'urgent' ? 95 : 70,
        });
      }

      // Sort by priority
      items.sort((a, b) => b.priority - a.priority);
      setInfoItems(items);
      setIsVisible(items.length > 0);
    } catch (error) {
      console.error('Error fetching agent info:', error);
    }
  }, [agent?.id]);

  useEffect(() => {
    fetchAgentInfo();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAgentInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAgentInfo]);

  // Auto-rotate items
  useEffect(() => {
    if (infoItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % infoItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [infoItems.length]);

  if (!user || !agent || !isVisible || infoItems.length === 0) {
    return null;
  }

  const currentItem = infoItems[currentIndex];
  const firstName = agent.name?.split(' ')[0] || 'Agente';

  return (
    <div className="w-full animate-fade-in">
      <div className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95",
        "border border-primary/30 shadow-lg shadow-primary/10",
        "backdrop-blur-md"
      )}>
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-50" />
        
        {/* Glow effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at center, ${themeConfig.colors.primary} 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: User greeting */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={cn(
                "p-1.5 rounded-lg",
                "bg-gradient-to-br from-primary/20 to-primary/5",
                "border border-primary/30"
              )}>
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Olá,
                </p>
                <p className="text-sm font-bold text-primary truncate max-w-[100px]">
                  {firstName}
                </p>
              </div>
            </div>

            {/* Center: Info Item (rotating) */}
            <div 
              key={currentItem.id}
              className="flex-1 flex items-center gap-3 animate-fade-in min-w-0"
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                "bg-slate-800/60 border border-slate-700/50",
                currentItem.accentColor
              )}>
                {currentItem.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  "text-sm font-semibold truncate",
                  currentItem.accentColor
                )}>
                  {currentItem.title}
                </p>
                <p className="text-xs text-muted-foreground/80 truncate">
                  {currentItem.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Dots indicator + Action */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Dots */}
              {infoItems.length > 1 && (
                <div className="flex items-center gap-1">
                  {infoItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        idx === currentIndex 
                          ? "bg-primary w-3" 
                          : "bg-slate-600 hover:bg-slate-500"
                      )}
                    />
                  ))}
                </div>
              )}
              
              {/* Sparkle indicator */}
              <Sparkles className="h-4 w-4 text-primary/60 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </div>
  );
}
