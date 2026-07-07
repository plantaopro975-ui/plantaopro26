import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgentDetailsDialog } from '@/components/agents/AgentDetailsDialog';
import { useOnlineAgents } from '@/hooks/useOnlineAgents';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Users, Search, Eye, Circle, Shield, Snowflake, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentRow {
  id: string;
  name: string;
  team: string | null;
  position: string | null;
  role: string | null;
  matricula: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_frozen: boolean | null;
  approval_status: string | null;
  license_status: string | null;
  unit: { name: string } | null;
}

const teamColors: Record<string, string> = {
  ALFA: 'bg-red-500/15 text-red-300 border-red-500/40',
  BRAVO: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  CHARLIE: 'bg-green-500/15 text-green-300 border-green-500/40',
  DELTA: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
};

export function AgentsDirectoryCard({ currentAgentId }: { currentAgentId?: string }) {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 200);
  const { onlineIds } = useOnlineAgents();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, name, team, position, role, matricula, avatar_url, is_active, is_frozen, approval_status, license_status, unit:units(name)')
          .order('name');
        if (error) throw error;
        setAgents((data || []) as any);
      } catch (e) {
        console.error('Failed to load agents directory', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return agents.filter((a) => {
      if (teamFilter !== 'all' && (a.team || '') !== teamFilter) return false;
      if (statusFilter === 'active' && !(a.is_active && a.approval_status === 'approved')) return false;
      if (statusFilter === 'inactive' && a.is_active && a.approval_status === 'approved') return false;
      if (statusFilter === 'online' && !onlineIds.has(a.id)) return false;
      if (statusFilter === 'frozen' && !a.is_frozen) return false;
      if (!term) return true;
      return (
        a.name.toLowerCase().includes(term) ||
        (a.matricula || '').toLowerCase().includes(term) ||
        (a.position || '').toLowerCase().includes(term) ||
        (a.team || '').toLowerCase().includes(term) ||
        (a.unit?.name || '').toLowerCase().includes(term)
      );
    });
  }, [agents, debouncedSearch, teamFilter, statusFilter, onlineIds]);

  const totalActive = agents.filter((a) => a.is_active && a.approval_status === 'approved').length;
  const totalOnline = agents.filter((a) => onlineIds.has(a.id)).length;

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <Card className="tactical-cards border-amber-500/25 bg-slate-900/70 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <div className="p-1.5 rounded-md bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/40">
                  <Users className="h-4 w-4 text-amber-400" />
                </div>
                Diretório de Agentes
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Lista completa de agentes cadastrados da sua unidade
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
                <Circle className="h-2 w-2 mr-1 fill-emerald-400 text-emerald-400" />
                {totalOnline} online
              </Badge>
              <Badge variant="outline" className="border-amber-500/40 text-amber-200 bg-amber-500/10">
                <Shield className="h-3 w-3 mr-1" /> {totalActive}/{agents.length} ativos
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, matrícula, cargo, equipe ou unidade..."
                className="pl-10 bg-slate-800/60 border-slate-700 h-9"
                autoComplete="new-password"
              />
            </div>
            <div className="flex gap-2">
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-slate-800/60 border-slate-700">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder="Equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas equipes</SelectItem>
                  <SelectItem value="ALFA">ALFA</SelectItem>
                  <SelectItem value="BRAVO">BRAVO</SelectItem>
                  <SelectItem value="CHARLIE">CHARLIE</SelectItem>
                  <SelectItem value="DELTA">DELTA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-9 bg-slate-800/60 border-slate-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="online">Online agora</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="frozen">Congelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[420px] rounded-lg border border-slate-700/60 bg-slate-950/40">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2" />
                Carregando agentes...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-sm text-muted-foreground">
                Nenhum agente encontrado com os filtros atuais.
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/70">
                {filtered.map((a) => {
                  const isOnline = onlineIds.has(a.id);
                  const isActive = a.is_active && a.approval_status === 'approved';
                  const isMe = a.id === currentAgentId;
                  return (
                    <li
                      key={a.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 hover:bg-amber-500/5 transition-colors',
                        isMe && 'bg-amber-500/10'
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-slate-700">
                          <AvatarImage src={a.avatar_url || undefined} alt={a.name} />
                          <AvatarFallback className="bg-slate-800 text-amber-300 text-xs font-bold">
                            {initials(a.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-950',
                            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
                          )}
                          aria-label={isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-zinc-100 truncate">
                            {a.name}
                            {isMe && (
                              <span className="ml-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                (você)
                              </span>
                            )}
                          </p>
                          {a.is_frozen && (
                            <Badge variant="outline" className="h-4 px-1 text-[9px] border-cyan-500/40 text-cyan-300 bg-cyan-500/10">
                              <Snowflake className="h-2.5 w-2.5 mr-0.5" /> Congelado
                            </Badge>
                          )}
                          {!isActive && !a.is_frozen && (
                            <Badge variant="outline" className="h-4 px-1 text-[9px] border-rose-500/40 text-rose-300 bg-rose-500/10">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                          {a.matricula && <span className="font-mono">Mat. {a.matricula}</span>}
                          {a.position && <span>• {a.position}</span>}
                          {a.unit?.name && <span>• {a.unit.name}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {a.team ? (
                          <Badge className={cn('border text-[10px] font-bold', teamColors[a.team] || 'bg-slate-500/20 border-slate-500/40 text-slate-300')}>
                            {a.team}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-amber-500/20 hover:text-amber-300"
                          onClick={() => setSelectedAgent(a.id)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </ScrollArea>

          <div className="text-[11px] text-muted-foreground text-center">
            Mostrando {filtered.length} de {agents.length} agentes
          </div>
        </CardContent>
      </Card>

      <AgentDetailsDialog
        agentId={selectedAgent}
        open={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </>
  );
}
