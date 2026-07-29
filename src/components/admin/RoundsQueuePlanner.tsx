import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { CalendarClock, Clock, Users, Save, ListOrdered, Timer } from 'lucide-react';

interface Unit { id: string; name: string; municipality: string | null }
interface Agent { id: string; name: string; team: string | null; unit_name: string | null }

const TEAMS = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'] as const;

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtMin(m: number) {
  if (m <= 0) return '00:00';
  const h = Math.floor(m / 60); const mm = m % 60;
  return `${pad(h)}:${pad(mm)}`;
}
function addMinutes(hhmm: string, add: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (h * 60 + m + add) % (24 * 60);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
function todayLocalISODate(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Rio_Branco' }));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function RoundsQueuePlanner() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('Ronda programada');
  const [unitId, setUnitId] = useState<string>('');
  const [team, setTeam] = useState<typeof TEAMS[number]>('ALFA');
  const [date, setDate] = useState<string>(todayLocalISODate());
  const [time, setTime] = useState<string>('07:00');
  const [durationMin, setDurationMin] = useState<number>(60);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [u, a] = await Promise.all([
        supabase.rpc('list_units_basic'),
        supabase.rpc('list_agents_system'),
      ]);
      if (u.data) setUnits((u.data as Unit[]) ?? []);
      if (a.data) setAgents((a.data as any[]).map(x => ({ id: x.id, name: x.name, team: x.team, unit_name: x.unit_name })));
      setLoading(false);
    })();
  }, []);

  const filteredAgents = useMemo(() => {
    if (!unitId) return [];
    const unitName = units.find(u => u.id === unitId)?.name ?? null;
    return agents.filter(a =>
      (a.unit_name === unitName) &&
      (a.team ?? '').toUpperCase() === team
    );
  }, [agents, units, unitId, team]);

  const queue = useMemo(() => {
    const n = filteredAgents.length;
    if (n === 0 || durationMin <= 0) return [];
    const slot = Math.max(1, Math.floor(durationMin / n));
    let cursor = time;
    return filteredAgents.map((a, i) => {
      const start = cursor;
      // Last agent absorbs remainder to close exactly at end
      const isLast = i === n - 1;
      const remainingBudget = durationMin - slot * i;
      const use = isLast ? remainingBudget : slot;
      const end = addMinutes(start, use);
      cursor = end;
      return { ...a, start, end, minutes: use };
    });
  }, [filteredAgents, durationMin, time]);

  const endTime = queue.length ? queue[queue.length - 1].end : addMinutes(time, durationMin);

  async function handleSave() {
    if (!unitId) { toast({ title: 'Selecione a unidade', variant: 'destructive' }); return; }
    if (queue.length === 0) { toast({ title: 'Sem agentes na equipe selecionada', description: 'Nenhum agente ativo encontrado para esta unidade e equipe.', variant: 'destructive' }); return; }
    const scheduledAt = new Date(`${date}T${time}:00-05:00`); // Acre = UTC-5
    if (Number.isNaN(scheduledAt.getTime())) { toast({ title: 'Data/hora inválida', variant: 'destructive' }); return; }

    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const perAgent = Math.max(1, Math.floor(durationMin / queue.length));
    const { error } = await supabase.from('scheduled_rounds').insert({
      unit_id: unitId,
      team,
      name: name.trim() || 'Ronda programada',
      mode: 'once',
      scheduled_at: scheduledAt.toISOString(),
      recur_times: [],
      recur_weekdays: [0, 1, 2, 3, 4, 5, 6],
      interval_minutes: null,
      ronda_duration_min: durationMin,
      round_mode: 'interval',
      round_start_time: time,
      round_end_time: endTime,
      round_interval_min: perAgent,
      require_confirmation_to_stop: true,
      is_enabled: true,
      created_by: userRes.user?.id ?? null,
      notes: `Fila proporcional: ${queue.length} agente(s), ~${perAgent} min por posto.`,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Ronda agendada', description: `Início: ${date} às ${time} (Acre)` });
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-300">
          <CalendarClock className="h-5 w-5" />
          Programar Rondas — Fila Proporcional
        </CardTitle>
        <CardDescription className="text-slate-400">
          Defina data, hora e duração total. O sistema divide o tempo proporcionalmente
          entre os agentes ativos da equipe e mostra a fila na ordem de atendimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide">Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Ronda noturna" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Unidade
            </Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger><SelectValue placeholder={loading ? 'Carregando…' : 'Selecione a unidade'} /></SelectTrigger>
              <SelectContent className="max-h-72">
                {units.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}{u.municipality ? ` — ${u.municipality}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide">Equipe</Label>
            <Select value={team} onValueChange={v => setTeam(v as typeof TEAMS[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEAMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" /> Duração total (min)
            </Label>
            <Input
              type="number" min={1} max={1440}
              value={durationMin}
              onChange={e => setDurationMin(Math.max(1, Math.min(1440, Number(e.target.value) || 0)))}
              onKeyDown={e => { if (e.key === 'e' || e.key === 'E') e.preventDefault(); }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide">Data (Acre)</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs uppercase tracking-wide flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Hora de início
            </Label>
            <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-slate-900/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-amber-400" />
              <span className="font-mono text-sm text-amber-200 uppercase tracking-wider">Fila de atendimento</span>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300">
                {queue.length} agente(s)
              </Badge>
            </div>
            <div className="font-mono text-xs text-slate-400">
              {time} → {endTime} · total {fmtMin(durationMin)}
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-center text-slate-500 text-sm">Carregando agentes…</div>
          ) : queue.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-sm">
              {unitId ? 'Nenhum agente ativo nesta unidade/equipe.' : 'Selecione unidade e equipe para ver a fila.'}
            </div>
          ) : (
            <ScrollArea className="max-h-72">
              <ol className="space-y-1.5">
                {queue.map((a, i) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 rounded-md border border-slate-700/60 bg-slate-950/40 px-2.5 py-2"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/15 border border-amber-500/40 font-mono text-xs text-amber-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 truncate text-sm text-slate-100">{a.name}</span>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {a.start} → {a.end}
                    </span>
                    <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-[10px]">
                      {a.minutes} min
                    </Badge>
                  </li>
                ))}
              </ol>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || loading || queue.length === 0}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Agendando…' : 'Agendar ronda'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RoundsQueuePlanner;
