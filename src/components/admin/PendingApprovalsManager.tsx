import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Bell,
  Search,
  RefreshCw,
  Building2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingAgent {
  id: string;
  name: string;
  cpf: string;
  matricula: string | null;
  team: string | null;
  phone: string | null;
  created_at: string;
  approval_status: string;
  unit: {
    id: string;
    name: string;
    municipality: string;
  } | null;
}

interface PendingApprovalsManagerProps {
  onApprovalChange?: () => void;
}

export function PendingApprovalsManager({ onApprovalChange }: PendingApprovalsManagerProps) {
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    agent: PendingAgent | null;
    reason: string;
  }>({ open: false, agent: null, reason: '' });

  const fetchPendingAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          cpf,
          matricula,
          team,
          phone,
          created_at,
          approval_status,
          unit:units(id, name, municipality)
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAgents((data as unknown as PendingAgent[]) || []);
    } catch (error: any) {
      console.error('Error fetching pending agents:', error);
      toast.error('Erro ao carregar cadastros pendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAgents();

    // Realtime subscription for new registrations
    const channel = supabase
      .channel('pending-registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: 'approval_status=eq.pending'
        },
        () => {
          fetchPendingAgents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (agent: PendingAgent) => {
    setProcessing(agent.id);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', agent.id);

      if (error) throw error;

      toast.success(`Cadastro de ${agent.name} aprovado!`, {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      });
      
      fetchPendingAgents();
      onApprovalChange?.();
    } catch (error: any) {
      console.error('Error approving agent:', error);
      toast.error('Erro ao aprovar cadastro');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.agent) return;
    
    setProcessing(rejectDialog.agent.id);
    try {
      // Delete the agent and their auth user
      const { error } = await supabase
        .from('agents')
        .update({
          approval_status: 'rejected',
          rejection_reason: rejectDialog.reason || 'Cadastro não autorizado'
        })
        .eq('id', rejectDialog.agent.id);

      if (error) throw error;

      toast.success(`Cadastro de ${rejectDialog.agent.name} rejeitado`, {
        icon: <XCircle className="w-5 h-5 text-red-400" />
      });
      
      setRejectDialog({ open: false, agent: null, reason: '' });
      fetchPendingAgents();
      onApprovalChange?.();
    } catch (error: any) {
      console.error('Error rejecting agent:', error);
      toast.error('Erro ao rejeitar cadastro');
    } finally {
      setProcessing(null);
    }
  };

  const filteredAgents = pendingAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.cpf.includes(searchTerm) ||
    agent.unit?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/30 shadow-xl shadow-amber-500/5">
      <CardHeader className="border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-amber-400">
                Aprovação de Cadastros
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerencie solicitações de novos agentes
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {pendingAgents.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                {pendingAgents.length} pendente{pendingAgents.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPendingAgents}
              disabled={loading}
              className="border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Buscar por nome, CPF ou unidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700"
          />
        </div>

        {/* Pending list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-sm">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum cadastro pendente'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300",
                  "bg-gradient-to-r from-slate-800/80 to-slate-800/40",
                  "border-amber-500/20 hover:border-amber-500/40",
                  "hover:shadow-lg hover:shadow-amber-500/5"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Agent info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-700/50">
                        <Users className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="font-semibold text-white text-sm">
                        {agent.name}
                      </span>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                        <Clock className="w-3 h-3 mr-1" />
                        PENDENTE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                        <span>CPF: {formatCPF(agent.cpf)}</span>
                      </div>
                      {agent.matricula && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>Mat: {agent.matricula}</span>
                        </div>
                      )}
                      {agent.unit && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{agent.unit.name}</span>
                        </div>
                      )}
                      {agent.team && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>Equipe: {agent.team}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          Solicitado em: {format(new Date(agent.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(agent)}
                      disabled={processing === agent.id}
                      className={cn(
                        "bg-emerald-600 hover:bg-emerald-500 text-white",
                        "shadow-lg shadow-emerald-500/20"
                      )}
                    >
                      <UserCheck className="w-4 h-4 mr-1.5" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRejectDialog({ open: true, agent, reason: '' })}
                      disabled={processing === agent.id}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <UserX className="w-4 h-4 mr-1.5" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialog.open} 
        onOpenChange={(open) => !open && setRejectDialog({ open: false, agent: null, reason: '' })}
      >
        <DialogContent className="bg-slate-900 border-red-500/30 max-w-md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-red-400">Rejeitar Cadastro</h3>
                <p className="text-xs text-slate-400">
                  {rejectDialog.agent?.name}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase">
                Motivo da Rejeição (opcional)
              </label>
              <Textarea
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Informe o motivo da rejeição..."
                className="bg-slate-800/50 border-slate-700 resize-none"
                rows={3}
              />
            </div>

            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 inline mr-1.5" />
                O agente será notificado e não poderá acessar o sistema.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, agent: null, reason: '' })}
              className="border-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing === rejectDialog.agent?.id}
              className="bg-red-600 hover:bg-red-500"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
