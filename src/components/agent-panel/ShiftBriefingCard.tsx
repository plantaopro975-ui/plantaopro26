import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ClipboardCheck, ShieldAlert, Radio, Users, KeyRound, BookOpen, CalendarClock,
  PenLine, PlusCircle, Trash2, CheckCircle2, FileText, History, Lock,
} from 'lucide-react';
import { addHours, format, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// -------- Types --------
interface Props {
  agentId: string;
  agentName: string;
  agentTeam?: string | null;
  unitId?: string | null;
  agentRole?: string | null;
}

interface Shift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

interface RadioItem {
  number: string;
  status: 'ok' | 'defect';
  notes: string;
}

interface Briefing {
  id: string;
  shift_id: string | null;
  shift_date: string;
  adolescents_expected: number | null;
  adolescents_counted: number | null;
  handcuffs_expected: number | null;
  handcuffs_counted: number | null;
  handcuff_keys_expected: number | null;
  handcuff_keys_counted: number | null;
  radios: RadioItem[];
  schedule_ok: boolean;
  schedule_notes: string | null;
  book_entry: string | null;
  observations: string | null;
  signature: string | null;
  completed_at: string | null;
}

const LEADER_ROLES = ['support', 'team_leader', 'chief', 'apoio', 'chefe_equipe'];

// -------- Component --------
export function ShiftBriefingCard({
  agentId, agentName, agentTeam, unitId, agentRole,
}: Props) {
  const isLeader = !!agentRole && LEADER_ROLES.includes(agentRole);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [history, setHistory] = useState<Briefing[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // form state
  const [adoExp, setAdoExp] = useState('');
  const [adoCnt, setAdoCnt] = useState('');
  const [algExp, setAlgExp] = useState('');
  const [algCnt, setAlgCnt] = useState('');
  const [chvExp, setChvExp] = useState('');
  const [chvCnt, setChvCnt] = useState('');
  const [radios, setRadios] = useState<RadioItem[]>([{ number: '', status: 'ok', notes: '' }]);
  const [scheduleOk, setScheduleOk] = useState(false);
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [bookEntry, setBookEntry] = useState('');
  const [observations, setObservations] = useState('');
  const [signature, setSignature] = useState('');

  // fetch current shift + existing briefing + history
  useEffect(() => {
    if (!isLeader) return;
    (async () => {
      const { data: shifts } = await supabase
        .from('agent_shifts')
        .select('id, shift_date, start_time, end_time')
        .eq('agent_id', agentId)
        .gte('shift_date', new Date(Date.now() - 86400000).toISOString().slice(0, 10))
        .order('shift_date', { ascending: true })
        .limit(4);

      const active = (shifts || []).find((s: any) => {
        const start = parseISO(`${s.shift_date}T${s.start_time}`);
        return isWithinInterval(new Date(), { start, end: addHours(start, 24) });
      }) as Shift | undefined;

      setCurrentShift(active || null);

      // history (unit-wide)
      if (unitId) {
        const { data: hist } = await supabase
          .from('shift_briefings')
          .select('*')
          .eq('unit_id', unitId)
          .order('shift_date', { ascending: false })
          .limit(10);
        setHistory((hist || []) as unknown as Briefing[]);
      }

      // active briefing for current shift
      if (active) {
        const { data: b } = await supabase
          .from('shift_briefings')
          .select('*')
          .eq('shift_id', active.id)
          .maybeSingle();
        if (b) setBriefing(b as unknown as Briefing);
      }
    })();
  }, [agentId, unitId, isLeader]);

  // hydrate form when opening
  useEffect(() => {
    if (!open) return;
    if (briefing) {
      setAdoExp(briefing.adolescents_expected?.toString() ?? '');
      setAdoCnt(briefing.adolescents_counted?.toString() ?? '');
      setAlgExp(briefing.handcuffs_expected?.toString() ?? '');
      setAlgCnt(briefing.handcuffs_counted?.toString() ?? '');
      setChvExp(briefing.handcuff_keys_expected?.toString() ?? '');
      setChvCnt(briefing.handcuff_keys_counted?.toString() ?? '');
      setRadios(briefing.radios?.length ? briefing.radios : [{ number: '', status: 'ok', notes: '' }]);
      setScheduleOk(!!briefing.schedule_ok);
      setScheduleNotes(briefing.schedule_notes ?? '');
      setBookEntry(briefing.book_entry ?? '');
      setObservations(briefing.observations ?? '');
      setSignature(briefing.signature ?? '');
    }
  }, [open, briefing]);

  const progress = useMemo(() => {
    if (!briefing) return 0;
    let done = 0; const total = 5;
    if (briefing.adolescents_counted !== null) done++;
    if (briefing.handcuffs_counted !== null && briefing.handcuff_keys_counted !== null) done++;
    if (briefing.radios?.length > 0) done++;
    if (briefing.schedule_ok) done++;
    if (briefing.book_entry && briefing.book_entry.length > 0) done++;
    return Math.round((done / total) * 100);
  }, [briefing]);

  const addRadio = () => setRadios((r) => [...r, { number: '', status: 'ok', notes: '' }]);
  const rmRadio = (i: number) => setRadios((r) => r.filter((_, idx) => idx !== i));
  const updRadio = (i: number, patch: Partial<RadioItem>) =>
    setRadios((r) => r.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const submit = async (finalize: boolean) => {
    if (!currentShift) {
      toast.error('Nenhum plantão ativo no momento.');
      return;
    }
    if (finalize && !signature.trim()) {
      toast.error('Assine com seu nome para finalizar o briefing.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        shift_id: currentShift.id,
        agent_id: agentId,
        unit_id: unitId,
        team: agentTeam,
        shift_date: currentShift.shift_date,
        adolescents_expected: adoExp ? Number(adoExp) : null,
        adolescents_counted: adoCnt ? Number(adoCnt) : null,
        handcuffs_expected: algExp ? Number(algExp) : null,
        handcuffs_counted: algCnt ? Number(algCnt) : null,
        handcuff_keys_expected: chvExp ? Number(chvExp) : null,
        handcuff_keys_counted: chvCnt ? Number(chvCnt) : null,
        radios: radios.filter((r) => r.number.trim()),
        schedule_ok: scheduleOk,
        schedule_notes: scheduleNotes || null,
        book_entry: bookEntry || null,
        observations: observations || null,
        signature: signature || null,
        completed_at: finalize ? new Date().toISOString() : (briefing?.completed_at ?? null),
      };

      const { data, error } = briefing
        ? await supabase
            .from('shift_briefings')
            .update(payload)
            .eq('id', briefing.id)
            .select()
            .single()
        : await supabase
            .from('shift_briefings')
            .insert(payload)
            .select()
            .single();

      if (error) throw error;
      setBriefing(data as unknown as Briefing);
      toast.success(finalize ? 'Briefing finalizado e registrado.' : 'Rascunho salvo.');
      if (finalize) setOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Falha ao salvar briefing.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  if (!isLeader) return null;

  const finalized = !!briefing?.completed_at;
  const hasCurrentShift = !!currentShift;

  return (
    <>
      <Card className="bg-slate-900/60 border-amber-500/30 overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-300">
              <ClipboardCheck className="h-4 w-4" />
              Briefing de Entrada
              <Badge className={cn(
                'ml-2 text-[10px]',
                finalized
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : hasCurrentShift
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                    : 'bg-slate-700/40 border-slate-600 text-slate-400'
              )}>
                {finalized ? 'REGISTRADO' : hasCurrentShift ? 'PENDENTE' : 'AGUARDANDO PLANTÃO'}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300 uppercase">
                <Lock className="h-3 w-3 mr-1" />
                {agentRole === 'support' ? 'Apoio' : 'Chefia'}
              </Badge>
              <Button
                size="sm"
                onClick={() => setOpen(true)}
                disabled={!hasCurrentShift}
                className={cn(
                  'h-8 font-semibold',
                  finalized
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                )}
              >
                <PenLine className="h-3.5 w-3.5 mr-1.5" />
                {finalized ? 'Revisar Briefing' : 'Iniciar Briefing'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 space-y-3">
          {!hasCurrentShift ? (
            <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-400">
              <ShieldAlert className="h-4 w-4 text-slate-500" />
              O briefing só fica disponível durante um plantão ativo (janela de 24h desde o início).
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniStat icon={<Users className="h-3 w-3" />} label="Adolescentes" value={briefing?.adolescents_counted?.toString() ?? '—'} />
                <MiniStat icon={<ShieldAlert className="h-3 w-3" />} label="Algemas" value={briefing?.handcuffs_counted?.toString() ?? '—'} />
                <MiniStat icon={<KeyRound className="h-3 w-3" />} label="Chaves" value={briefing?.handcuff_keys_counted?.toString() ?? '—'} />
                <MiniStat icon={<Radio className="h-3 w-3" />} label="Rádios" value={briefing?.radios?.length?.toString() ?? '0'} />
                <MiniStat icon={<CalendarClock className="h-3 w-3" />} label="Cronograma" value={briefing?.schedule_ok ? 'OK' : '—'} />
                <MiniStat icon={<BookOpen className="h-3 w-3" />} label="Livro" value={briefing?.book_entry ? 'OK' : '—'} />
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-400">
                <span>Preenchimento</span>
                <span className={cn(progress === 100 ? 'text-emerald-400' : 'text-amber-400')}>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {finalized && briefing?.completed_at && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-300/90 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Registrado por <strong>{briefing.signature || agentName}</strong> em{' '}
                  {format(parseISO(briefing.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
              )}
            </>
          )}

          {history.length > 0 && (
            <>
              <Separator className="bg-slate-800" />
              <details className="group">
                <summary className="cursor-pointer text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5 hover:text-slate-200">
                  <History className="h-3 w-3" />
                  Histórico da unidade ({history.length})
                </summary>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-[11px]">
                      <span className="text-slate-300">
                        {format(parseISO(h.shift_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      <span className="text-slate-500 truncate max-w-[45%]">{h.signature || '—'}</span>
                      <Badge className={cn(
                        'text-[9px]',
                        h.completed_at
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      )}>
                        {h.completed_at ? 'OK' : 'RASCUNHO'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---------- Dialog ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border-amber-500/30 text-slate-100 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 to-transparent">
            <DialogTitle className="flex items-center gap-2 text-amber-300">
              <ClipboardCheck className="h-5 w-5" />
              Briefing de Entrada — Plantão {currentShift && format(parseISO(currentShift.shift_date), 'dd/MM/yyyy', { locale: ptBR })}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Registro operacional obrigatório. Preencha todas as seções antes de finalizar.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh]">
            <div className="px-6 py-4">
              <Tabs defaultValue="counts">
                <TabsList className="grid grid-cols-4 bg-slate-950/60 border border-slate-800">
                  <TabsTrigger value="counts" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                    <Users className="h-3.5 w-3.5 mr-1" /> Contagens
                  </TabsTrigger>
                  <TabsTrigger value="radios" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                    <Radio className="h-3.5 w-3.5 mr-1" /> Rádios
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                    <CalendarClock className="h-3.5 w-3.5 mr-1" /> Cronograma
                  </TabsTrigger>
                  <TabsTrigger value="book" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
                    <BookOpen className="h-3.5 w-3.5 mr-1" /> Livro
                  </TabsTrigger>
                </TabsList>

                {/* Counts */}
                <TabsContent value="counts" className="pt-4 space-y-4">
                  <CountBlock
                    icon={<Users className="h-4 w-4 text-amber-400" />}
                    title="Adolescentes"
                    expected={adoExp} counted={adoCnt}
                    setExpected={setAdoExp} setCounted={setAdoCnt}
                  />
                  <CountBlock
                    icon={<ShieldAlert className="h-4 w-4 text-amber-400" />}
                    title="Algemas"
                    expected={algExp} counted={algCnt}
                    setExpected={setAlgExp} setCounted={setAlgCnt}
                  />
                  <CountBlock
                    icon={<KeyRound className="h-4 w-4 text-amber-400" />}
                    title="Chaves de algemas"
                    expected={chvExp} counted={chvCnt}
                    setExpected={setChvExp} setCounted={setChvCnt}
                  />
                </TabsContent>

                {/* Radios */}
                <TabsContent value="radios" className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Registre cada rádio comunicador verificado.</span>
                    <Button size="sm" variant="outline" onClick={addRadio} className="h-8 border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                      <PlusCircle className="h-3.5 w-3.5 mr-1" />
                      Adicionar rádio
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {radios.map((r, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center rounded-md border border-slate-800 bg-slate-950/60 p-2">
                        <Input
                          placeholder="Nº/ID do rádio"
                          value={r.number}
                          onChange={(e) => updRadio(i, { number: e.target.value })}
                          className="col-span-3 h-9 bg-slate-900 border-slate-700 text-sm"
                        />
                        <div className="col-span-3 flex gap-1">
                          <Button
                            type="button" size="sm"
                            onClick={() => updRadio(i, { status: 'ok' })}
                            className={cn(
                              'h-9 flex-1 text-xs',
                              r.status === 'ok' ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            )}
                          >
                            OK
                          </Button>
                          <Button
                            type="button" size="sm"
                            onClick={() => updRadio(i, { status: 'defect' })}
                            className={cn(
                              'h-9 flex-1 text-xs',
                              r.status === 'defect' ? 'bg-red-500 hover:bg-red-600 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            )}
                          >
                            Defeito
                          </Button>
                        </div>
                        <Input
                          placeholder="Observações (opcional)"
                          value={r.notes}
                          onChange={(e) => updRadio(i, { notes: e.target.value })}
                          className="col-span-5 h-9 bg-slate-900 border-slate-700 text-sm"
                        />
                        <Button
                          type="button" size="icon" variant="ghost"
                          onClick={() => rmRadio(i)}
                          className="col-span-1 h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Schedule */}
                <TabsContent value="schedule" className="pt-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                    <Checkbox checked={scheduleOk} onCheckedChange={(v) => setScheduleOk(!!v)} />
                    <span className="text-sm text-slate-200">Cronograma do dia verificado e conferido</span>
                  </label>
                  <div>
                    <Label className="text-[11px] uppercase tracking-widest text-slate-400">
                      Observações do cronograma
                    </Label>
                    <Textarea
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      placeholder="Ex.: atendimentos, transferências, visitas, atividades pedagógicas..."
                      rows={5}
                      className="bg-slate-950/60 border-slate-700 text-sm resize-none mt-1.5"
                    />
                  </div>
                </TabsContent>

                {/* Book */}
                <TabsContent value="book" className="pt-4 space-y-3">
                  <div>
                    <Label className="text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" /> Preenchimento do livro de ocorrências
                    </Label>
                    <Textarea
                      value={bookEntry}
                      onChange={(e) => setBookEntry(e.target.value)}
                      placeholder="Registre a passagem, ocorrências e efetivo no livro..."
                      rows={6}
                      className="bg-slate-950/60 border-slate-700 text-sm resize-none mt-1.5"
                      maxLength={4000}
                    />
                    <div className="text-[10px] text-slate-500 text-right mt-1">{bookEntry.length}/4000</div>
                  </div>
                  <div>
                    <Label className="text-[11px] uppercase tracking-widest text-slate-400">
                      Observações gerais
                    </Label>
                    <Textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Intercorrências, alertas, informações adicionais..."
                      rows={3}
                      className="bg-slate-950/60 border-slate-700 text-sm resize-none mt-1.5"
                      maxLength={2000}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Signature */}
              <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <Label className="text-[11px] uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Assinatura do responsável (obrigatório para finalizar)
                </Label>
                <Input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder={agentName}
                  className="mt-1.5 bg-slate-950/60 border-slate-700 text-sm font-serif italic"
                  maxLength={120}
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex-row justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => submit(false)}
              disabled={saving || !currentShift}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Salvar rascunho
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Fechar
              </Button>
              <Button
                onClick={() => submit(true)}
                disabled={saving || !currentShift}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Finalizar e registrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------- Helpers --------
function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-1.5">
      <div className="text-[9px] uppercase text-slate-500 flex items-center justify-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-mono text-sm text-slate-100 mt-0.5">{value}</div>
    </div>
  );
}

function CountBlock({
  icon, title, expected, counted, setExpected, setCounted,
}: {
  icon: React.ReactNode; title: string;
  expected: string; counted: string;
  setExpected: (v: string) => void; setCounted: (v: string) => void;
}) {
  const exp = Number(expected || 0);
  const cnt = Number(counted || 0);
  const diff = counted !== '' && expected !== '' ? cnt - exp : null;
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
          {icon}
          {title}
        </div>
        {diff !== null && (
          <Badge className={cn(
            'text-[10px]',
            diff === 0 ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-red-500/20 border-red-500/40 text-red-300'
          )}>
            {diff === 0 ? 'CONFERE' : `DIFERENÇA ${diff > 0 ? '+' : ''}${diff}`}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-[10px] uppercase text-slate-500">Esperado</Label>
          <Input
            type="number" inputMode="numeric" min={0}
            value={expected}
            onChange={(e) => setExpected(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
            className="h-9 bg-slate-900 border-slate-700 text-sm mt-1"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase text-slate-500">Conferido</Label>
          <Input
            type="number" inputMode="numeric" min={0}
            value={counted}
            onChange={(e) => setCounted(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'e' && e.preventDefault()}
            className="h-9 bg-slate-900 border-slate-700 text-sm mt-1"
          />
        </div>
      </div>
    </div>
  );
}
