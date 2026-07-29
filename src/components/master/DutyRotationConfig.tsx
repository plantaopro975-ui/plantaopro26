import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDutyConfig } from '@/hooks/useDutyConfig';
import { DEFAULT_DUTY_CONFIG, getDutyTeamForYmd, getUpcomingSchedule, type DutyScheduleConfig, type TeamKey } from '@/lib/dutyRotation';
import { ArrowUp, ArrowDown, RotateCcw, Save, CalendarClock } from 'lucide-react';

const TEAM_LABEL: Record<TeamKey, string> = {
  alfa: 'ALFA', bravo: 'BRAVO', charlie: 'CHARLIE', delta: 'DELTA',
};

export function DutyRotationConfig() {
  const { config, loading, save } = useDutyConfig();
  const [draft, setDraft] = useState<DutyScheduleConfig>(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(config); }, [config]);

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

  const preview = getUpcomingSchedule(draft, draft.anchor_ymd, 8);

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
