import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Shield, Clock, LogIn, LogOut, Activity, Users, Loader2 } from 'lucide-react';

type LogRow = {
  id: string;
  agent_id: string | null;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  agent?: { name?: string; team?: string; matricula?: string } | null;
};

type AgentStat = {
  agent_id: string;
  name: string;
  team: string | null;
  matricula: string | null;
  total_logins: number;
  total_logouts: number;
  last_login: string | null;
  last_activity: string | null;
  active_days: number;
};

export function AccessAuditPanel() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('access_logs')
          .select('id, agent_id, action, ip_address, user_agent, created_at, agent:agents(name, team, matricula)')
          .order('created_at', { ascending: false })
          .limit(1000);
        if (error) throw error;
        setLogs((data as any) || []);
      } catch (e) {
        console.error('[AccessAuditPanel] load error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats: AgentStat[] = useMemo(() => {
    const byAgent = new Map<string, AgentStat>();
    for (const l of logs) {
      if (!l.agent_id) continue;
      const key = l.agent_id;
      const cur = byAgent.get(key) || {
        agent_id: key,
        name: l.agent?.name || 'Desconhecido',
        team: l.agent?.team ?? null,
        matricula: l.agent?.matricula ?? null,
        total_logins: 0,
        total_logouts: 0,
        last_login: null,
        last_activity: null,
        active_days: 0,
      };
      const a = (l.action || '').toLowerCase();
      if (a.includes('login') && !a.includes('logout')) {
        cur.total_logins += 1;
        if (!cur.last_login || l.created_at > cur.last_login) cur.last_login = l.created_at;
      }
      if (a.includes('logout')) cur.total_logouts += 1;
      if (!cur.last_activity || l.created_at > cur.last_activity) cur.last_activity = l.created_at;
      byAgent.set(key, cur);
    }
    // Active days
    const daysByAgent = new Map<string, Set<string>>();
    for (const l of logs) {
      if (!l.agent_id) continue;
      const set = daysByAgent.get(l.agent_id) || new Set();
      set.add(l.created_at.slice(0, 10));
      daysByAgent.set(l.agent_id, set);
    }
    for (const [k, v] of daysByAgent) {
      const s = byAgent.get(k);
      if (s) s.active_days = v.size;
    }
    return Array.from(byAgent.values()).sort((a, b) =>
      (b.last_activity || '').localeCompare(a.last_activity || '')
    );
  }, [logs]);

  const filteredStats = stats.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.team || '').toLowerCase().includes(q) ||
      (s.matricula || '').toLowerCase().includes(q)
    );
  });

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.agent?.name || '').toLowerCase().includes(q) ||
      (l.action || '').toLowerCase().includes(q) ||
      (l.ip_address || '').toLowerCase().includes(q)
    );
  });

  return (
    <Card className="glass glass-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Auditoria de Acessos
        </CardTitle>
        <CardDescription>
          Histórico profissional de logins, logouts, tempo de acesso e última atividade por agente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, equipe, matrícula, ação ou IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando registros...
          </div>
        ) : (
          <Tabs defaultValue="agents">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="agents" className="gap-2">
                <Users className="h-4 w-4" /> Por Agente
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2">
                <Activity className="h-4 w-4" /> Eventos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="mt-4">
              <ScrollArea className="h-[540px] pr-2">
                {filteredStats.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">Sem registros de acesso.</div>
                ) : (
                  <div className="grid gap-2">
                    {filteredStats.map((s) => (
                      <Card key={s.agent_id} className="bg-slate-800/40 border-slate-700/50">
                        <CardContent className="p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white truncate">{s.name}</span>
                                {s.team && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {s.team}
                                  </Badge>
                                )}
                                {s.matricula && (
                                  <Badge variant="outline" className="text-[10px] font-mono">
                                    {s.matricula}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                                <span className="flex items-center gap-1">
                                  <LogIn className="h-3 w-3 text-emerald-400" />
                                  {s.total_logins} login{s.total_logins === 1 ? '' : 's'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <LogOut className="h-3 w-3 text-red-400" />
                                  {s.total_logouts} logout{s.total_logouts === 1 ? '' : 's'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-amber-400" />
                                  {s.active_days} dia{s.active_days === 1 ? '' : 's'} ativo{s.active_days === 1 ? '' : 's'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-slate-300">
                                <span className="text-muted-foreground">Último login:</span>{' '}
                                {s.last_login
                                  ? format(new Date(s.last_login), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                  : '—'}
                              </div>
                              <div className="text-slate-400">
                                {s.last_activity
                                  ? `Ativo ${formatDistanceToNow(new Date(s.last_activity), { addSuffix: true, locale: ptBR })}`
                                  : '—'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="events" className="mt-4">
              <ScrollArea className="h-[540px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Agente</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Nenhum evento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {format(new Date(l.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">{l.agent?.name || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{l.action}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {l.ip_address || '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default AccessAuditPanel;
