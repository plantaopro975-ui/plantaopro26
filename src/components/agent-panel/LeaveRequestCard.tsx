import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CalendarOff, Loader2, Trash2, Palmtree, Stethoscope, Star, GraduationCap, CalendarPlus, Users, User, MessageCircle } from 'lucide-react';
import { format, parseISO, differenceInDays, isAfter, startOfDay, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TeamMemberDialog } from './TeamMemberDialog';

interface LeaveRequestCardProps {
  agentId: string;
  agentTeam?: string | null;
  agentUnitId?: string | null;
}

interface AgentLeave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at: string;
  agent_id?: string;
}

interface TeamMemberLeave extends AgentLeave {
  agent_name: string;
  agent_avatar_url?: string | null;
  agent_phone?: string | null;
  agent_role?: string | null;
  agent_blood_type?: string | null;
  agent_birth_date?: string | null;
  agent_address?: string | null;
  agent_email?: string | null;
}

const leaveTypes = [
  { value: 'special', label: 'Folga Especial', icon: Star, color: 'text-amber-400', bgColor: 'bg-amber-500/20 border-amber-500/30' },
  { value: 'vacation', label: 'Férias', icon: Palmtree, color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30' },
  { value: 'medical', label: 'Licença Médica', icon: Stethoscope, color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' },
  { value: 'training', label: 'Treinamento', icon: GraduationCap, color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30' },
];

const leaveTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  vacation: { label: 'Férias', icon: <Palmtree className="h-4 w-4" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  medical: { label: 'Licença Médica', icon: <Stethoscope className="h-4 w-4" />, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  special: { label: 'Folga Especial', icon: <Star className="h-4 w-4" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  training: { label: 'Treinamento', icon: <GraduationCap className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  approved: { label: 'Aprovado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export function LeaveRequestCard({ agentId, agentTeam, agentUnitId }: LeaveRequestCardProps) {
  const [leaves, setLeaves] = useState<AgentLeave[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<TeamMemberLeave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedType, setSelectedType] = useState('special');
  const [selectedPeriod, setSelectedPeriod] = useState<'manha' | 'tarde' | 'noite' | 'integral'>('integral');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [leaveDates, setLeaveDates] = useState<Date[]>([]);
  const [teamLeaveDates, setTeamLeaveDates] = useState<Date[]>([]);
  const [leaveDescription, setLeaveDescription] = useState('');
  const [activeTab, setActiveTab] = useState('minhas');

  const [selectedTeamDate, setSelectedTeamDate] = useState<Date | undefined>();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  useEffect(() => {
    fetchLeaves();
    if (agentTeam && agentUnitId) {
      fetchTeamLeaves();
    }
  }, [agentId, agentTeam, agentUnitId]);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('agent_leaves')
        .select('*')
        .eq('agent_id', agentId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      
      const leavesData = (data || []) as AgentLeave[];
      setLeaves(leavesData);

      const dates: Date[] = [];
      leavesData.forEach(leave => {
        const startDate = parseISO(leave.start_date);
        const endDate = parseISO(leave.end_date);
        let currentDate = startDate;
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }
      });
      setLeaveDates(dates);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamLeaves = async () => {
    if (!agentTeam || !agentUnitId) return;
    
    try {
      const { data: teamMembers, error: teamError } = await supabase
        .from('agents')
        .select('id, name, avatar_url, phone, role, blood_type, birth_date, address, email, is_active, team')
        .eq('team', agentTeam)
        .eq('unit_id', agentUnitId)
        .neq('id', agentId);

      if (teamError) throw teamError;

      if (teamMembers && teamMembers.length > 0) {
        const memberIds = teamMembers.map(m => m.id);
        const today = new Date();
        const thirtyDaysLater = addDays(today, 30);
        
        const { data: leavesData, error: leavesError } = await (supabase as any)
          .from('agent_leaves')
          .select('*')
          .in('agent_id', memberIds)
          .gte('end_date', format(today, 'yyyy-MM-dd'))
          .lte('start_date', format(thirtyDaysLater, 'yyyy-MM-dd'))
          .order('start_date', { ascending: true });

        if (leavesError) throw leavesError;

        const leavesWithNames = (leavesData || []).map((leave: any) => {
          const member = teamMembers.find(m => m.id === leave.agent_id);
          return { 
            ...leave, 
            agent_name: member?.name || 'Agente',
            agent_avatar_url: member?.avatar_url || null,
            agent_phone: member?.phone || null,
            agent_role: member?.role || null,
            agent_blood_type: member?.blood_type || null,
            agent_birth_date: member?.birth_date || null,
            agent_address: member?.address || null,
            agent_email: member?.email || null,
            agent_is_active: member?.is_active ?? true,
            agent_team: member?.team || null
          };
        });

        setTeamLeaves(leavesWithNames);

        const teamDates: Date[] = [];
        leavesWithNames.forEach((leave: TeamMemberLeave) => {
          const startDate = parseISO(leave.start_date);
          const endDate = parseISO(leave.end_date);
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            teamDates.push(new Date(currentDate));
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          }
        });
        setTeamLeaveDates(teamDates);
      }
    } catch (error) {
      console.error('Error fetching team leaves:', error);
    }
  };

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;
    
    const alreadyRegistered = leaveDates.some(d => isSameDay(d, date));
    
    if (alreadyRegistered) {
      toast.error('Este dia já possui folga registrada');
      return;
    }

    setSelectedDate(date);
    setSelectedType('special');
    setSelectedPeriod('integral');
    setLeaveDescription('');
    setShowConfirmDialog(true);
  };

  const handleConfirmLeave = async () => {
    if (!selectedDate) return;

    try {
      setIsSubmitting(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await (supabase as any)
        .from('agent_leaves')
        .insert({
          agent_id: agentId,
          leave_type: selectedType,
          period: selectedPeriod,
          start_date: dateStr,
          end_date: dateStr,
          reason: leaveDescription.trim() || null,
        });

      if (error) throw error;

      const typeLabel = leaveTypes.find(t => t.value === selectedType)?.label || selectedType;
      toast.success(`${typeLabel} registrada para ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`);
      setShowConfirmDialog(false);
      setSelectedDate(undefined);
      setLeaveDescription('');
      fetchLeaves();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Erro ao registrar folga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (leaveId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('agent_leaves')
        .delete()
        .eq('id', leaveId);

      if (error) throw error;
      toast.success('Folga cancelada');
      fetchLeaves();
    } catch (error) {
      console.error('Error deleting leave:', error);
      toast.error('Erro ao cancelar folga');
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const approvedLeaves = leaves.filter(l => l.status === 'approved');

  return (
    <Card className="card-night-purple bg-gradient-to-br from-[hsl(222,60%,3%)] via-[hsl(222,55%,5%)] to-[hsl(270,40%,8%)] border-3 border-purple-500/50 overflow-hidden transition-all duration-300 hover:border-purple-400/70 group relative">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-500/20 border border-purple-500/40">
            <CalendarOff className="h-6 w-6 md:h-7 md:w-7 text-purple-400" />
          </div>
          <span className="font-bold bg-gradient-to-r from-purple-200 to-violet-300 bg-clip-text text-transparent">
            Folgas Programadas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 border-2 border-purple-500/30 rounded-xl p-1.5 h-auto">
            <TabsTrigger value="minhas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 rounded-lg py-2.5 px-4 font-semibold transition-all duration-200">
              <User className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              <span className="text-sm md:text-base">Minhas Folgas</span>
            </TabsTrigger>
            <TabsTrigger value="equipe" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 rounded-lg py-2.5 px-4 font-semibold transition-all duration-200">
              <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
              <span className="text-sm md:text-base">Equipe</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="minhas" className="space-y-4 mt-4">
            {/* Calendar for clicking dates */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-300">Clique na data para registrar folga</span>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-2">
                <Calendar
                  mode="single"
                  selected={undefined}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  onSelect={handleDateClick}
                  locale={ptBR}
                  modifiers={{ leave: leaveDates }}
                  modifiersStyles={{
                    leave: {
                      backgroundColor: 'rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      fontWeight: 'bold',
                      borderRadius: '50%'
                    }
                  }}
                  className="rounded-md pointer-events-auto"
                />
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <span className="text-slate-400">Dias com folga registrada</span>
                </div>
              </div>
            </div>

            {/* Leaves List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">Nenhuma folga programada.</p>
                <p className="text-xs text-slate-500 mt-1">Clique em uma data no calendário para registrar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">Pendentes de Aprovação</h4>
                    <div className="space-y-2">
                      {pendingLeaves.map((leave) => (
                        <LeaveItem key={leave.id} leave={leave} onDelete={handleDelete} />
                      ))}
                    </div>
                  </div>
                )}
                
                {approvedLeaves.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Aprovadas</h4>
                    <div className="space-y-2">
                      {approvedLeaves.map((leave) => (
                        <LeaveItem key={leave.id} leave={leave} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="equipe" className="space-y-4 mt-4">
            {(() => {
              const today = startOfDay(new Date());
              const isInRange = (leave: AgentLeave, d: Date) => {
                const start = startOfDay(parseISO(leave.start_date));
                const end = startOfDay(parseISO(leave.end_date));
                return d >= start && d <= end;
              };

              const teamToday = teamLeaves.filter((l) => isInRange(l, today));
              const selectedDay = selectedTeamDate ? startOfDay(selectedTeamDate) : null;
              const teamSelectedDay = selectedDay ? teamLeaves.filter((l) => isInRange(l, selectedDay)) : [];

              return (
                <>
                  {/* Destaque: hoje */}
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-200">
                          Quem está de folga hoje
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                        {format(today, 'dd/MM', { locale: ptBR })}
                      </Badge>
                    </div>

                    {teamToday.length === 0 ? (
                      <p className="text-xs text-slate-400 mt-2">Nenhum colega de folga hoje.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2.5">
                        <TooltipProvider delayDuration={200}>
                          {teamToday.map((leave) => {
                            const agentName = (leave as any).agent_name || '';
                            const avatarUrl = (leave as any).agent_avatar_url;
                            const agentPhone = (leave as any).agent_phone;
                            const nameParts = agentName.split(' ');
                            const displayName = nameParts.length > 1 
                              ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
                              : nameParts[0];
                            const initials = nameParts.length > 1
                              ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
                              : nameParts[0]?.charAt(0) || '?';
                            const leaveInfo = leaveTypeLabels[leave.leave_type] || { label: leave.leave_type, color: '' };
                            const startDate = format(parseISO(leave.start_date), 'dd/MM', { locale: ptBR });
                            const endDate = format(parseISO(leave.end_date), 'dd/MM', { locale: ptBR });
                            const isSingleDay = leave.start_date === leave.end_date;
                            
                            const handleCardClick = () => {
                              setSelectedMember({
                                id: leave.agent_id,
                                name: agentName,
                                role: (leave as any).agent_role,
                                team: (leave as any).agent_team,
                                blood_type: (leave as any).agent_blood_type,
                                avatar_url: avatarUrl,
                                is_active: (leave as any).agent_is_active ?? true,
                                phone: agentPhone,
                                address: (leave as any).agent_address,
                                birth_date: (leave as any).agent_birth_date,
                                email: (leave as any).agent_email
                              });
                              setShowMemberDialog(true);
                            };
                            
                            return (
                              <Tooltip key={leave.id}>
                                <TooltipTrigger asChild>
                                  <div 
                                    onClick={handleCardClick}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-slate-500/30 hover:border-blue-500/50 hover:from-slate-700/80 hover:to-slate-800/80 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-blue-500/10 active:scale-95"
                                  >
                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center flex-shrink-0 ring-2 ring-slate-400/30 shadow-inner">
                                      {avatarUrl ? (
                                        <img 
                                          src={avatarUrl} 
                                          alt={agentName}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-xs font-bold text-white uppercase tracking-tight">{initials}</span>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-white leading-tight">{displayName}</span>
                                      <span className={`text-[10px] font-medium ${leaveInfo.color.includes('green') ? 'text-green-400' : leaveInfo.color.includes('red') ? 'text-red-400' : leaveInfo.color.includes('amber') ? 'text-amber-400' : 'text-blue-400'}`}>
                                        {leaveInfo.label}
                                      </span>
                                    </div>
                                    {agentPhone && (
                                      <MessageCircle className="h-3.5 w-3.5 text-green-400 ml-auto" />
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="bg-slate-900 border border-slate-700 p-3 max-w-xs shadow-xl"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center flex-shrink-0">
                                        {avatarUrl ? (
                                          <img src={avatarUrl} alt={agentName} className="h-full w-full object-cover" />
                                        ) : (
                                          <span className="text-[9px] font-bold text-slate-300 uppercase">{initials}</span>
                                        )}
                                      </div>
                                      <span className="font-bold text-white text-sm">{agentName}</span>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`${leaveInfo.color} text-[10px] px-1.5 py-0.5`}>
                                          {leaveInfo.label}
                                        </Badge>
                                      </div>
                                      <p className="text-slate-400">
                                        {isSingleDay 
                                          ? `Dia: ${startDate}`
                                          : `Período: ${startDate} até ${endDate}`
                                        }
                                      </p>
                                      {leave.reason && (
                                        <p className="text-slate-500 italic text-[11px]">"{leave.reason}"</p>
                                      )}
                                      <p className="text-blue-400 text-[10px] mt-1">Clique para ver perfil e WhatsApp</p>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    )}
                  </div>

                  {/* Team Calendar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-300">Folgas da Equipe (próximos 30 dias)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTeamDate && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                            {format(selectedTeamDate, 'dd/MM', { locale: ptBR })}
                          </Badge>
                        )}
                        {selectedTeamDate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-slate-400 hover:text-slate-200"
                            onClick={() => setSelectedTeamDate(undefined)}
                          >
                            Limpar
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <Calendar
                        mode="single"
                        selected={selectedTeamDate}
                        month={selectedMonth}
                        onMonthChange={setSelectedMonth}
                        onSelect={setSelectedTeamDate}
                        locale={ptBR}
                        modifiers={{ teamLeave: teamLeaveDates }}
                        modifiersStyles={{
                          teamLeave: {
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            fontWeight: 'bold',
                            borderRadius: '50%'
                          }
                        }}
                        className="rounded-md pointer-events-auto"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                        <span className="text-slate-400">Colegas de folga</span>
                      </div>
                      <span className="text-slate-500">Toque em um dia para ver quem sai</span>
                    </div>
                  </div>

                  {/* Team Leaves List */}
                  {selectedDay ? (
                    teamSelectedDay.length === 0 ? (
                      <div className="text-center py-3">
                        <p className="text-slate-400 text-sm">Ninguém de folga nesta data.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {teamSelectedDay.map((leave) => (
                          <div
                            key={leave.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${leaveTypeLabels[leave.leave_type]?.color || 'bg-slate-600'}`}>
                                {leaveTypeLabels[leave.leave_type]?.icon || <Star className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-white">{leave.agent_name}</p>
                                <p className="text-sm text-slate-400">
                                  {leaveTypeLabels[leave.leave_type]?.label || leave.leave_type}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className={statusLabels[leave.status]?.color || ''}>
                              {statusLabels[leave.status]?.label || leave.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )
                  ) : teamLeaves.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-slate-400 text-sm">Nenhuma folga programada pela equipe nos próximos 30 dias.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {teamLeaves.map((leave) => (
                        <div
                          key={leave.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${leaveTypeLabels[leave.leave_type]?.color || 'bg-slate-600'}`}>
                              {leaveTypeLabels[leave.leave_type]?.icon || <Star className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-white">{leave.agent_name}</p>
                              <p className="text-sm text-slate-400">
                                {leaveTypeLabels[leave.leave_type]?.label || leave.leave_type} • {format(parseISO(leave.start_date), "dd/MM", { locale: ptBR })}
                                {leave.start_date !== leave.end_date && ` - ${format(parseISO(leave.end_date), "dd/MM", { locale: ptBR })}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={statusLabels[leave.status]?.color || ''}>
                            {statusLabels[leave.status]?.label || leave.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar Folga</DialogTitle>
            <DialogDescription className="text-slate-400">
              Selecione o tipo de folga para o dia escolhido.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedDate && (
              <>
                <p className="text-lg text-white font-medium text-center">
                  {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                
                {/* Leave Type Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Tipo de Folga</Label>
                  <RadioGroup
                    value={selectedType}
                    onValueChange={setSelectedType}
                    className="grid grid-cols-2 gap-2"
                  >
                    {leaveTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <div key={type.value}>
                          <RadioGroupItem
                            value={type.value}
                            id={`type-${type.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`type-${type.value}`}
                            className={`flex items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-all
                              ${selectedType === type.value 
                                ? `border-amber-500 ${type.bgColor}` 
                                : 'border-slate-600 hover:border-slate-500'
                              }`}
                          >
                            <IconComponent className={`h-4 w-4 ${type.color}`} />
                            <span className={`text-sm ${selectedType === type.value ? type.color : 'text-slate-300'}`}>
                              {type.label}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Period Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Período</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: 'manha', l: 'Manhã', emoji: '🌅' },
                      { v: 'tarde', l: 'Tarde', emoji: '☀️' },
                      { v: 'noite', l: 'Noite', emoji: '🌙' },
                      { v: 'integral', l: 'Integral', emoji: '⏱️' },
                    ].map((p) => (
                      <button
                        key={p.v}
                        type="button"
                        onClick={() => setSelectedPeriod(p.v as any)}
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                          selectedPeriod === p.v
                            ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                            : 'border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-lg leading-none">{p.emoji}</span>
                        <span className="text-[11px] font-semibold">{p.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Descrição (opcional)</Label>
                  <Textarea
                    value={leaveDescription}
                    onChange={(e) => setLeaveDescription(e.target.value)}
                    placeholder="Motivo ou observações sobre a folga..."
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                    rows={2}
                  />
                </div>

                {/* Summary */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const type = leaveTypes.find(t => t.value === selectedType);
                      if (!type) return null;
                      const IconComponent = type.icon;
                      return (
                        <>
                          <div className={`p-2 rounded-lg ${type.bgColor}`}>
                            <IconComponent className={`h-5 w-5 ${type.color}`} />
                          </div>
                          <div>
                            <p className={`font-medium ${type.color}`}>{type.label}</p>
                            <p className="text-sm text-slate-400">
                              {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} (1 dia)
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmLeave}
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar Folga'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Member Dialog */}
      <TeamMemberDialog 
        member={selectedMember}
        open={showMemberDialog}
        onOpenChange={setShowMemberDialog}
        isCurrentUser={false}
      />
    </Card>
  );
}

function LeaveItem({ leave, onDelete }: { leave: AgentLeave; onDelete?: (id: string) => void }) {
  const typeInfo = leaveTypeLabels[leave.leave_type] || { label: leave.leave_type, icon: null, color: '' };
  const statusInfo = statusLabels[leave.status] || { label: leave.status, color: '' };
  const startDate = parseISO(leave.start_date);
  const endDate = parseISO(leave.end_date);
  const days = differenceInDays(endDate, startDate) + 1;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
          {typeInfo.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{typeInfo.label}</span>
            <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-400">
            {format(startDate, "dd/MM", { locale: ptBR })}{days > 1 ? ` - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}` : `/${format(startDate, "yyyy", { locale: ptBR })}`} ({days} dia{days > 1 ? 's' : ''})
          </p>
          {leave.reason && (
            <p className="text-xs text-slate-500 mt-1 italic">"{leave.reason}"</p>
          )}
        </div>
      </div>
      {leave.status === 'pending' && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(leave.id)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
