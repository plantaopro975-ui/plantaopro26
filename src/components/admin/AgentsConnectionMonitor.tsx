import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnlineAgents } from '@/hooks/useOnlineAgents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Users, Wifi, WifiOff, RefreshCw, Search, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

type AgentRow = {
  id: string;
  name: string;
  team: string | null;
  matricula: string | null;
  unit_id: string | null;
  unit_name?: string | null;
};

type LastLog = { agent_id: string; action: string; created_at: string };

/**
 * Monitor de Conexões em Tempo Real
 * - Quem está conectado agora (via Realtime Presence)
 * - Último login/logout de cada agente
 * - Duração da sessão atual (para online) ou tempo desde último acesso
 */
export function AgentsConnectionMonitor() {
  const online = useOnlineAgents();
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [lastLogs, setLastLogs] = useState<Map<string, LastLog>>(new Map());
  const [loginTimes, setLoginTimes] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tick, setTick] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: agentsData }, { data: logsData }] = await Promise.all([
        supabase.from('agents').select('id, name, team, matricula, unit_id, unit:units(name)').order('name'),
        supabase
          .from('access_logs')
          .select('agent_id, action, created_at')
          .order('created_at', { ascending: false })
          .limit(3000),
      ]);
      const list: AgentRow[] = (agentsData || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        team: a.team,
        matricula: a.matricula,
        unit_id: a.unit_id,
        unit_name: a.unit?.name ?? null,
      }));
      setAgents(list);

      const lastMap = new Map<string, LastLog>();
      const loginMap = new Map<string, string>();
      for (const row of (logsData || []) as LastLog[]) {
        if (!row.agent_id) continue;
        if (!lastMap.has(row.agent_id)) lastMap.set(row.agent_id, row);
        if (row.action === 'login' && !loginMap.has(row.agent_id)) loginMap.set(row.agent_id, row.created_at);
      }
      setLastLogs(lastMap);
      setLoginTimes(loginMap);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // relógio para durações vivas
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = agents.map((a) => {
      const isOnline = online.has(a.id);
      const last = lastLogs.get(a.id);
      const loginAt = loginTimes.get(a.id);
      return { ...a, isOnline, last, loginAt };
    });
    const withMatch = q
      ? rows.filter(
          (r) =>
            r.name?.toLowerCase().includes(q) ||
            (r.team ?? '').toLowerCase().includes(q) ||
            (r.matricula ?? '').toLowerCase().includes(q) ||
            (r.unit_name ?? '').toLowerCase().includes(q),
        )
      : rows;
    // online primeiro; depois por último acesso desc
    return withMatch.sort((a, b) => {
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      const ax = a.last?.created_at ? new Date(a.last.created_at).getTime() : 0;
      const bx = b.last?.created_at ? new Date(b.last.created_at).getTime() : 0;
      return bx - ax;
    });
  }, [agents, online, lastLogs, loginTimes, search, tick]);

  const onlineCount = filtered.filter((r) => r.isOnline).length;
  const totalCount = filtered.length;

  const fmtRelative = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return formatDistanceToNow(new Date(iso), { locale: ptBR, addSuffix: true });
    } catch {
      return '—';
    }
  };
  const fmtAbs = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return format(new Date(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return '—';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-500" />
              Monitor de Conexões — Tempo Real
            </CardTitle>
            <CardDescription>
              Veja quem está conectado agora e o último acesso de cada agente.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-white" />
              </span>
              {onlineCount} online
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Users className="h-3 w-3" />
              {totalCount} agentes
            </Badge>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, equipe, matrícula ou unidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[520px] rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Equipe / Unidade</TableHead>
                <TableHead>Último evento</TableHead>
                <TableHead>Quando</TableHead>
                <TableHead>Sessão / Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum agente encontrado.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filtered.map((r) => {
                  const sessionInfo = r.isOnline
                    ? r.loginAt
                      ? `há ${formatDistanceToNow(new Date(r.loginAt), { locale: ptBR })}`
                      : 'sessão ativa'
                    : r.loginAt
                      ? fmtAbs(r.loginAt)
                      : '—';
                  return (
                    <TableRow key={r.id} className={r.isOnline ? 'bg-emerald-500/5' : undefined}>
                      <TableCell>
                        {r.isOnline ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                            <Wifi className="h-3 w-3" /> Online
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                            <WifiOff className="h-3 w-3" /> Offline
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        {r.matricula && (
                          <div className="text-xs text-muted-foreground font-mono">Mat. {r.matricula}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{r.team ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{r.unit_name ?? '—'}</div>
                      </TableCell>
                      <TableCell>
                        {r.last ? (
                          <Badge variant={r.last.action === 'login' ? 'default' : 'secondary'} className="capitalize">
                            <Activity className="h-3 w-3 mr-1" />
                            {r.last.action}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">nunca acessou</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{fmtRelative(r.last?.created_at)}</div>
                        <div className="text-xs text-muted-foreground">{fmtAbs(r.last?.created_at)}</div>
                      </TableCell>
                      <TableCell className="text-sm">{sessionInfo}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
