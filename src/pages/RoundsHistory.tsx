import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/BackButton';
import { CheckCircle2, Clock, Radio, Shield, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Row = { name: string };
type Session = {
  id: string;
  team: string;
  mode: string;
  start_time: string;
  end_time: string;
  interval_min: number;
  rows: Row[] | unknown;
  server_started_at: string;
  ended_at: string | null;
  is_active: boolean;
  notified_indices: number[] | null;
  created_at: string;
};

const fmtDT = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function statusOf(idx: number, total: number, notified: number[], isActive: boolean) {
  const done = notified.includes(idx);
  if (done) return 'done' as const;
  if (!isActive) return 'idle' as const;
  // Active session: next unfinished is "current"
  const maxDone = notified.length ? Math.max(...notified) : -1;
  if (idx === maxDone + 1) return 'active' as const;
  return 'idle' as const;
}

export default function RoundsHistory() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData?.user?.id;
    if (!uid) { setLoading(false); return; }
    const { data } = await supabase
      .from('round_sessions')
      .select('*')
      .eq('user_id', uid)
      .order('server_started_at', { ascending: false })
      .limit(100);
    setSessions((data as unknown as Session[]) || []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <BackButton />
            <div>
              <h1 className="font-tactical text-2xl tracking-widest flex items-center gap-2">
                <HistoryIcon className="h-6 w-6 text-primary" />
                HISTÓRICO DE RODADAS
              </h1>
              <p className="text-sm text-muted-foreground">
                Rodadas programadas e concluídas salvas na sua conta.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? 'Carregando…' : 'Atualizar'}
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Carregando histórico…</p>}

        {!loading && sessions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhuma rodada encontrada. Ao iniciar uma contagem no painel, ela aparecerá aqui.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {sessions.map((s) => {
            const rows = Array.isArray(s.rows) ? (s.rows as Row[]) : [];
            const notified = s.notified_indices || [];
            const total = rows.length;
            const doneCount = notified.length;
            const active = s.is_active;
            return (
              <Card key={s.id} className={cn('tactical-card', active && 'border-primary/60')}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        EQUIPE {s.team}
                        <Badge variant={active ? 'default' : 'secondary'} className="ml-2">
                          {active ? 'EM ANDAMENTO' : 'CONCLUÍDA'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                        <Radio className="h-3.5 w-3.5" />
                        {s.mode === 'split' ? 'Divisão automática' : `Intervalo ${s.interval_min}min`}
                        <span>·</span>
                        <Clock className="h-3.5 w-3.5" />
                        {s.start_time}–{s.end_time}
                      </CardDescription>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Início: <span className="text-foreground">{fmtDT(s.server_started_at)}</span></div>
                      <div>Fim: <span className="text-foreground">{fmtDT(s.ended_at)}</span></div>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {doneCount}/{total} concluídos
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {rows.map((r, i) => {
                      const st = statusOf(i, total, notified, active);
                      return (
                        <div
                          key={i}
                          className={cn(
                            'flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm',
                            st === 'done' && 'border-emerald-500/40 bg-emerald-500/5',
                            st === 'active' && 'border-primary/60 bg-primary/10 animate-pulse',
                            st === 'idle' && 'border-border/60 bg-background/40',
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono-mil text-xs text-muted-foreground">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={cn(
                                'truncate font-medium',
                                st === 'done' && 'line-through text-muted-foreground',
                              )}
                            >
                              {r.name || `Agente ${i + 1}`}
                            </span>
                          </div>
                          {st === 'done' && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              MISSÃO CUMPRIDA
                            </span>
                          )}
                          {st === 'active' && (
                            <span className="text-xs font-semibold text-primary">EM RONDA</span>
                          )}
                          {st === 'idle' && (
                            <span className="text-xs text-muted-foreground">
                              {active ? 'AGUARDANDO' : 'NÃO INICIADO'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
