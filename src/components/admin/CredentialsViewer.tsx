import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, EyeOff, Copy, Shield, Users, Key, Building2 } from 'lucide-react';
import { AdminResetPasswordDialog } from '@/components/agents/AdminResetPasswordDialog';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  cpf: string | null;
  team: string | null;
  is_active: boolean;
  unit: { name: string; municipality: string } | null;
}

export function CredentialsViewer() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCpfs, setShowCpfs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          cpf,
          team,
          is_active,
          unit:units(name, municipality)
        `)
        .order('name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Erro ao carregar agentes',
        description: 'Não foi possível carregar a lista de agentes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCpf = (cpf: string, show: boolean) => {
    if (!cpf) return '---';
    if (!show) return cpf.replace(/\d/g, '•');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '📋 Copiado!',
        description: `${label} copiado para a área de transferência.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar.',
        variant: 'destructive',
      });
    }
  };

  const toggleShowCpf = (id: string) => {
    setShowCpfs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.cpf?.includes(searchTerm.replace(/\D/g, '')) ||
    agent.team?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teamColors: Record<string, string> = {
    'ALFA': 'bg-red-500/20 text-red-400 border-red-500/40',
    'BRAVO': 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    'CHARLIE': 'bg-green-500/20 text-green-400 border-green-500/40',
    'DELTA': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  };

  return (
    <Card className="glass glass-border shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/40">
            <Key className="h-5 w-5 text-purple-400" />
          </div>
          Credenciais dos Agentes
        </CardTitle>
        <CardDescription>
          Visualize e gerencie as credenciais de acesso de todos os agentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF ou equipe..."
            className="pl-10 bg-slate-800/50 border-slate-700"
          />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{filteredAgents.length} agentes</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>{filteredAgents.filter(a => a.is_active).length} ativos</span>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="border-border">
                <TableHead className="w-[200px]">Agente</TableHead>
                <TableHead>CPF (Usuário)</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum agente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          agent.is_active ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className="truncate max-w-[150px]">{agent.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-slate-800/60 rounded text-sm font-mono">
                          {formatCpf(agent.cpf || '', showCpfs[agent.id] || false)}
                        </code>
                        {agent.cpf && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleShowCpf(agent.id)}
                            >
                              {showCpfs[agent.id] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => copyToClipboard(agent.cpf!, 'CPF')}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {agent.team ? (
                        <Badge className={cn("border", teamColors[agent.team] || 'bg-slate-500/20')}>
                          {agent.team}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">---</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {agent.unit ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate max-w-[120px]">{agent.unit.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">---</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {agent.cpf && (
                        <AdminResetPasswordDialog
                          agentName={agent.name}
                          agentCpf={agent.cpf}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
