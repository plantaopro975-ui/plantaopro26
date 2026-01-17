import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleDatePicker } from '@/components/agent-panel/ShiftMiniCalendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, Loader2, RefreshCw, Check, X, AlertTriangle, Palmtree, WifiOff, Settings2, Circle, Clock } from 'lucide-react';
import { format, parseISO, isToday, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShiftScheduleCardProps {
  agentId: string;
}

interface AgentShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  notes: string | null;
  compensation_date: string | null;
  is_vacation: boolean;
  completed_at: string | null;
}

const CACHE_KEY_PREFIX = 'shifts_cache_';
const CACHE_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

function getFromCache(agentId: string): AgentShift[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + agentId);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + agentId);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveToCache(agentId: string, data: AgentShift[]) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + agentId, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore cache errors
  }
}

export function ShiftScheduleCard({ agentId }: ShiftScheduleCardProps) {
  const [shifts, setShifts] = useState<AgentShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [firstShiftDate, setFirstShiftDate] = useState<Date | undefined>();
  const [configMonth, setConfigMonth] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedShift, setSelectedShift] = useState<AgentShift | null>(null);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [compensationDate, setCompensationDate] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const hasFetched = useRef(false);
  const agentIdRef = useRef(agentId);

  // Fetch shifts only once on mount
  useEffect(() => {
    if (hasFetched.current && agentIdRef.current === agentId) return;
    hasFetched.current = true;
    agentIdRef.current = agentId;

    const fetchShifts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('agent_shifts')
          .select('*')
          .eq('agent_id', agentId)
          .order('shift_date', { ascending: true });

        if (!error && data) {
          setShifts(data as AgentShift[]);
          setIsFromCache(false);
          saveToCache(agentId, data as AgentShift[]);
        } else {
          // Fallback to cache
          const cached = getFromCache(agentId);
          if (cached) {
            setShifts(cached);
            setIsFromCache(true);
          }
        }
      } catch {
        const cached = getFromCache(agentId);
        if (cached) {
          setShifts(cached);
          setIsFromCache(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchShifts();
  }, [agentId]);

  const refetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_shifts')
        .select('*')
        .eq('agent_id', agentId)
        .order('shift_date', { ascending: true });

      if (!error && data) {
        setShifts(data as AgentShift[]);
        setIsFromCache(false);
        saveToCache(agentId, data as AgentShift[]);
      }
    } catch {
      // Silent fail
    }
  };

  const generateShifts = async () => {
    if (!firstShiftDate) {
      toast.error('Selecione a data do primeiro plantão');
      return;
    }

    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.rpc('generate_agent_shifts', {
        p_agent_id: agentId,
        p_first_shift_date: format(firstShiftDate, 'yyyy-MM-dd'),
        p_months_ahead: 6
      });

      if (error) throw error;

      toast.success(`${data} plantões gerados com sucesso!`);
      setShowConfig(false);
      refetchShifts();
    } catch (error) {
      console.error('Error generating shifts:', error);
      toast.error('Erro ao gerar plantões');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShiftClick = (shift: AgentShift) => {
    setSelectedShift(shift);
    setEditStatus(shift.status);
    setEditNotes(shift.notes || '');
    setCompensationDate(shift.compensation_date ? parseISO(shift.compensation_date) : undefined);
    setShowShiftDialog(true);
  };

  const handleSaveShift = async () => {
    if (!selectedShift) return;

    try {
      setIsSaving(true);
      
      const updateData: Record<string, unknown> = {
        status: editStatus,
        notes: editNotes || null,
        compensation_date: compensationDate ? format(compensationDate, 'yyyy-MM-dd') : null,
        is_vacation: editStatus === 'vacation',
        updated_at: new Date().toISOString()
      };

      if (editStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('agent_shifts')
        .update(updateData)
        .eq('id', selectedShift.id);

      if (error) throw error;

      toast.success('Plantão atualizado com sucesso!');
      setShowShiftDialog(false);
      refetchShifts();
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Erro ao atualizar plantão');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-emerald-500/20', icon: Check, label: 'Cumprido', textColor: 'text-emerald-400', dotColor: 'bg-emerald-500' };
      case 'missed':
        return { color: 'bg-red-500/20', icon: X, label: 'Faltou', textColor: 'text-red-400', dotColor: 'bg-red-500' };
      case 'compensated':
        return { color: 'bg-blue-500/20', icon: RefreshCw, label: 'Compensado', textColor: 'text-blue-400', dotColor: 'bg-blue-500' };
      case 'vacation':
        return { color: 'bg-purple-500/20', icon: Palmtree, label: 'Férias', textColor: 'text-purple-400', dotColor: 'bg-purple-500' };
      default:
        return { color: 'bg-amber-500/20', icon: Circle, label: 'Agendado', textColor: 'text-amber-400', dotColor: 'bg-amber-500' };
    }
  };

  const upcomingShifts = useMemo(() => 
    shifts
      .filter(s => parseISO(s.shift_date) >= startOfDay(new Date()))
      .slice(0, 6),
    [shifts]
  );

  const pastShifts = useMemo(() => 
    shifts
      .filter(s => isBefore(parseISO(s.shift_date), startOfDay(new Date())))
      .slice(-4)
      .reverse(),
    [shifts]
  );

  return (
    <Card className="bg-slate-900/95 border border-slate-700/80 shadow-lg overflow-hidden">
      {/* Header - Simplified */}
      <CardHeader className="py-3 px-4 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <CalendarIcon className="h-4 w-4 text-white" />
            </div>
            <span>Meus Plantões</span>
            {isFromCache && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/50 text-amber-400">
                <WifiOff className="h-2.5 w-2.5 mr-1" />
                offline
              </Badge>
            )}
          </CardTitle>
          
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50"
              >
                {shifts.length === 0 ? (
                  <Plus className="h-4 w-4" />
                ) : (
                  <Settings2 className="h-4 w-4" />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-xs">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <CalendarIcon className="h-4 w-4 text-amber-500" />
                  Configurar Escala
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Selecione o primeiro plantão (24h + 72h folga).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <SimpleDatePicker
                  month={configMonth}
                  onMonthChange={setConfigMonth}
                  selected={firstShiftDate}
                  onSelect={setFirstShiftDate}
                />

                {firstShiftDate && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium">
                      {format(firstShiftDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={generateShifts} 
                  disabled={!firstShiftDate || isGenerating}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-9"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    'Gerar Escala'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-5">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2">
              <CalendarIcon className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">Sem plantões configurados</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Clique em <Settings2 className="inline h-3 w-3" /> para configurar
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming Shifts - New Timeline Design */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Próximos</h4>
              </div>
              
              <div className="space-y-1.5">
                {upcomingShifts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">Nenhum plantão agendado.</p>
                ) : (
                  upcomingShifts.map((shift) => {
                    const shiftDate = parseISO(shift.shift_date);
                    const isTodayShift = isToday(shiftDate);
                    const daysUntil = differenceInDays(shiftDate, startOfDay(new Date()));
                    
                    return (
                      <button
                        key={shift.id}
                        onClick={() => handleShiftClick(shift)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                          isTodayShift
                            ? 'bg-emerald-500/15 border border-emerald-500/40'
                            : shift.is_vacation 
                              ? 'bg-purple-500/10 border border-purple-500/30'
                              : 'bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800'
                        }`}
                      >
                        {/* Visual Marker - Dot/Ring */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            isTodayShift 
                              ? 'bg-emerald-500 ring-2 ring-emerald-400/50' 
                              : shift.is_vacation 
                                ? 'bg-purple-500'
                                : 'bg-amber-500/80'
                          }`} />
                          {isTodayShift && (
                            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
                          )}
                        </div>

                        {/* Date Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold capitalize ${
                              isTodayShift ? 'text-emerald-400' : shift.is_vacation ? 'text-purple-400' : 'text-slate-200'
                            }`}>
                              {isTodayShift ? 'HOJE' : format(shiftDate, "EEE", { locale: ptBR })}
                            </span>
                            <span className="text-xs text-slate-500">
                              {format(shiftDate, "dd/MM", { locale: ptBR })}
                            </span>
                          </div>
                          {!isTodayShift && daysUntil > 0 && (
                            <span className="text-[10px] text-slate-500">
                              em {daysUntil} dia{daysUntil > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Time & Icons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {shift.is_vacation && (
                            <Palmtree className="h-3.5 w-3.5 text-purple-400" />
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 font-mono ${
                              isTodayShift
                                ? 'text-emerald-400 border-emerald-500/50'
                                : 'text-amber-400 border-amber-500/50'
                            }`}
                          >
                            {shift.start_time?.slice(0, 5) || '07:00'}
                          </Badge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Past Shifts - Compact List */}
            {pastShifts.length > 0 && (
              <div className="pt-2 border-t border-slate-700/50">
                <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Recentes</h4>
                <div className="flex flex-wrap gap-1">
                  {pastShifts.map((shift) => {
                    const shiftDate = parseISO(shift.shift_date);
                    const statusInfo = getStatusInfo(shift.status);
                    
                    return (
                      <button
                        key={shift.id}
                        onClick={() => handleShiftClick(shift)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${statusInfo.color} ${statusInfo.textColor} hover:opacity-80 transition-opacity`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                        {format(shiftDate, "dd/MM", { locale: ptBR })}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend - Ultra Compact */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {[
                { dot: 'bg-amber-500', label: 'Agendado' },
                { dot: 'bg-emerald-500', label: 'Cumprido' },
                { dot: 'bg-red-500', label: 'Falta' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <span className="text-[9px] text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {/* Shift Edit Dialog */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedShift && format(parseISO(selectedShift.shift_date), "dd 'de' MMMM", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Atualize o status deste plantão
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="bg-slate-800 border-slate-700 h-9 text-sm">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="completed">Cumprido</SelectItem>
                  <SelectItem value="missed">Faltou</SelectItem>
                  <SelectItem value="compensated">Compensado</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editStatus === 'missed' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Compensação</Label>
                <SimpleDatePicker
                  month={compensationDate ?? new Date()}
                  onMonthChange={(m) => setCompensationDate(m)}
                  selected={compensationDate}
                  onSelect={setCompensationDate}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">Observações</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Motivo, ocorrência..."
                className="bg-slate-800 border-slate-700 min-h-[60px] text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShiftDialog(false)}
              className="h-8"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveShift}
              disabled={isSaving}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black h-8"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
