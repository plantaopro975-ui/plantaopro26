import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useDutyConfig } from '@/hooks/useDutyConfig';
import {
  DEFAULT_DUTY_CONFIG, getDutyTeamForYmd, getOnDutyTeam, getOperationalYmd,
  getUpcomingSchedule, type DutyOverrideRecord, type DutyScheduleConfig, type TeamKey,
} from '@/lib/dutyRotation';
import { ArrowUp, ArrowDown, RotateCcw, Save, CalendarClock, Zap, History } from 'lucide-react';

const TEAM_LABEL: Record<TeamKey, string> = {
  alfa: 'ALFA', bravo: 'BRAVO', charlie: 'CHARLIE', delta: 'DELTA',
};

export function DutyRotationConfig() {
  const { config, loading, save } = useDutyConfig();
  const [draft, setDraft] = useState<DutyScheduleConfig>(config);
  const [saving, setSaving] = useState(false);

  // Override state
  const [overrideTeam, setOverrideTeam] = useState<TeamKey>('alfa');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overriding, setOverriding] = useState(false);

  useEffect(() => { setDraft(config); }, [config]);

  const currentDuty = useMemo(() => getOnDutyTeam(config), [config]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...draft.order];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setDraft({ ...draft, order: next });
  };

  const onSave = async () => {
    setSaving(true);
    const { error } = await save(draft);
    setSaving(false);
    if (error) toast.error('Falha ao salvar', { description: error.message });
    else toast.success('Escala atualizada', { description: 'A rotação de plantões foi salva.' });
  };

  const onReset = () => setDraft(DEFAULT_DUTY_CONFIG);

  const applyOverride = async () => {
    const reason = overrideReason.trim();
    if (reason.length < 5) {
      toast.error('Motivo obrigatório', { description: 'Descreva o motivo da troca (mín. 5 caracteres).' });
      return;
    }
    setOverriding(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      const uname = (userRes.user?.user_metadata as any)?.full_name
        || userRes.user?.email || 'Master';

      const todayYmd = getOperationalYmd(new Date(), config.handover_hour);
      const previous = currentDuty.team;
      const record: DutyOverrideRecord = {
        team: overrideTeam,
        effective_from_ymd: todayYmd,
        reason,
        set_by_id: uid,
        set_by_name: String(uname),
        set_at: new Date().toISOString(),
        previous_team: previous,
      };

      const next: DutyScheduleConfig = {
        ...config,
        anchor_ymd: todayYmd,
        anchor_team: overrideTeam,
        override: record,
        override_history: [record, ...(config.override_history ?? [])].slice(0, 50),
      };

      const { error } = await save(next);
      if (error) throw error;

      // Best-effort audit log
      try {
        await supabase.from('activity_logs').insert({
          agent_id: uid,
          agent_name: String(uname),
          action: 'update',
          resource_type: 'settings',
          resource_id: 'duty_schedule.override',
          details: record as any,
          user_agent: navigator.userAgent.slice(0, 200),
        });
      } catch { /* ignore */ }

      toast.success('Plantão trocado', {
        description: `${TEAM_LABEL[overrideTeam]} assume a partir de agora.`,
      });
      setOverrideOpen(false);
      setOverrideReason('');
    } catch (err: any) {
      toast.error('Falha ao trocar plantão', { description: err?.message ?? 'Erro desconhecido.' });
    } finally {
      setOverriding(false);
    }
  };

  const clearOverride = async () => {
    const next: DutyScheduleConfig = { ...config, override: null };
    const { error } = await save(next);
    if (error) toast.error('Falha ao limpar', { description: error.message });
    else toast.success('Registro de override limpo', {
      description: 'A escala continua a partir do último ajuste, sem o selo de override.',
    });
  };

  const preview = getUpcomingSchedule(draft, draft.anchor_ymd, 8);
  const history = config.override_history ?? [];

  return (
    <Card className="tactical-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="h-4 w-4 text-amber-400" />
          Escala de Plantões — Rotação
        </CardTitle>
        <CardDescription>
          Define a ordem do ciclo de 4 dias, a data-âncora e o horário de troca (handover).
          A troca ocorre diariamente às {String(draft.handover_hour).padStart(2, '0')}:00 (America/Rio_Branco).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando configuração…</div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label className="text-xs uppercase tracking-wider">Data-âncora</Label>
                <Input
                  type="date"
                  value={draft.anchor_ymd}
                  onChange={(e) => setDraft({ ...draft, anchor_ymd: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Equipe da âncora</Label>
                <Select
                  value={draft.anchor_team}
                  onValueChange={(v) => setDraft({ ...draft, anchor_team: v as TeamKey })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['alfa','bravo','charlie','delta'] as TeamKey[]).map(k => (
                      <SelectItem key={k} value={k}>{TEAM_LABEL[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Hora do handover</Label>
                <Input
                  type="number" min={0} max={23}
                  value={draft.handover_hour}
                  onChange={(e) => setDraft({ ...draft, handover_hour: Math.min(23, Math.max(0, Number(e.target.value) || 0)) })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider">Ordem do ciclo</Label>
              <p className="text-xs text-muted-foreground mb-2">
                A ordem determina quem assume o dia seguinte após a equipe atual. Reordene com as setas.
              </p>
              <ul className="space-y-1">
                {draft.order.map((k, i) => (
                  <li key={k} className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2">
                    <span className="w-6 text-center text-xs font-mono text-muted-foreground">{i + 1}º</span>
                    <span className="flex-1 font-semibold tracking-wider">{TEAM_LABEL[k]}</span>
                    <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === draft.order.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider">Horário e observações por equipe</Label>
              <div className="grid gap-3 md:grid-cols-2 mt-2">
                {(['alfa','bravo','charlie','delta'] as TeamKey[]).map(k => (
                  <div key={k} className="rounded-md border border-white/10 bg-black/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold tracking-wider text-sm">{TEAM_LABEL[k]}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground">Início</Label>
                        <Input
                          type="time"
                          value={draft.teams[k]?.start ?? '07:00'}
                          onChange={(e) => setDraft({ ...draft, teams: { ...draft.teams, [k]: { ...draft.teams[k], start: e.target.value } } })}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-muted-foreground">Fim</Label>
                        <Input
                          type="time"
                          value={draft.teams[k]?.end ?? '07:00'}
                          onChange={(e) => setDraft({ ...draft, teams: { ...draft.teams, [k]: { ...draft.teams[k], end: e.target.value } } })}
                        />
                      </div>
                    </div>
                    <Textarea
                      placeholder="Observações (ex.: escala reforçada, evento programado…)"
                      value={draft.teams[k]?.notes ?? ''}
                      onChange={(e) => setDraft({ ...draft, teams: { ...draft.teams, [k]: { ...draft.teams[k], notes: e.target.value } } })}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider">Prévia — próximos 8 dias a partir da âncora</Label>
              <div className="mt-2 grid grid-cols-4 md:grid-cols-8 gap-1.5">
                {preview.map(({ ymd, team }) => (
                  <div key={ymd} className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-center">
                    <div className="text-[10px] font-mono text-muted-foreground">{ymd.slice(5)}</div>
                    <div className="text-xs font-semibold tracking-wider">{TEAM_LABEL[team]}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Hoje (calculado): <span className="font-semibold text-foreground">
                  {TEAM_LABEL[getDutyTeamForYmd(draft, new Date().toISOString().slice(0, 10))]}
                </span>
              </p>
            </div>

            {/* ============ FORÇAR TROCA DE PLANTÃO (OVERRIDE) ============ */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                    <Zap className="h-4 w-4" /> Forçar troca de plantão agora
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-lg">
                    Substitui imediatamente a equipe em serviço. A troca vale a partir de agora
                    e a rotação continua normalmente a partir da equipe escolhida.
                    <span className="block mt-1">
                      Equipe atual: <strong className="text-foreground">{TEAM_LABEL[currentDuty.team]}</strong>
                    </span>
                  </p>
                </div>
                {config.override && (
                  <Button variant="ghost" size="sm" onClick={clearOverride}>
                    Limpar selo
                  </Button>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-[200px,1fr,auto] md:items-end">
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Nova equipe</Label>
                  <Select value={overrideTeam} onValueChange={(v) => setOverrideTeam(v as TeamKey)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['alfa','bravo','charlie','delta'] as TeamKey[]).map(k => (
                        <SelectItem key={k} value={k} disabled={k === currentDuty.team}>
                          {TEAM_LABEL[k]}{k === currentDuty.team ? ' (atual)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Motivo (registrado)</Label>
                  <Input
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Ex.: afastamento emergencial da equipe DELTA por ocorrência…"
                    maxLength={280}
                  />
                </div>
                <Button
                  variant="default"
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                  onClick={() => setOverrideOpen(true)}
                  disabled={overrideTeam === currentDuty.team || overrideReason.trim().length < 5}
                >
                  <Zap className="h-4 w-4 mr-1" /> Trocar agora
                </Button>
              </div>

              {config.override && (
                <div className="text-[11px] rounded-md border border-white/10 bg-black/30 px-3 py-2 space-y-0.5">
                  <div>
                    <span className="text-muted-foreground">Último override:</span>{' '}
                    <strong>{TEAM_LABEL[config.override.team]}</strong>
                    {config.override.previous_team && (
                      <> (antes: {TEAM_LABEL[config.override.previous_team]})</>
                    )}
                    {' '}em {new Date(config.override.set_at).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-muted-foreground">
                    Por: <span className="text-foreground">{config.override.set_by_name ?? '—'}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Motivo: <span className="text-foreground">{config.override.reason}</span>
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <History className="h-3.5 w-3.5" /> Histórico de trocas forçadas ({history.length})
                  </summary>
                  <ul className="mt-2 space-y-1 max-h-52 overflow-auto pr-1">
                    {history.map((h, i) => (
                      <li key={`${h.set_at}-${i}`} className="rounded border border-white/10 bg-black/30 px-2 py-1.5">
                        <div>
                          <strong>{TEAM_LABEL[h.team]}</strong>
                          {h.previous_team && <> (antes: {TEAM_LABEL[h.previous_team]})</>}
                          {' — '}{new Date(h.set_at).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-muted-foreground">Por: {h.set_by_name ?? '—'}</div>
                        <div className="text-muted-foreground">Motivo: {h.reason}</div>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">

              <Button variant="outline" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-1" /> Restaurar padrão
              </Button>
              <Button onClick={onSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? 'Salvando…' : 'Salvar escala'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
