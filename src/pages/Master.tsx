import { useEffect, useState } from 'react';
import hudPageBg from '@/assets/hero-tactical-ops.jpg';
import { Icon3D } from '@/components/ui/Icon3D';
import icon3dBuilding from '@/assets/icon3d-building.png';
import icon3dTeam from '@/assets/icon3d-team.png';
import icon3dClock from '@/assets/icon3d-clock.png';
import icon3dShield from '@/assets/icon3d-shield.png';
import icon3dCalendar from '@/assets/icon3d-calendar.png';
const hudBgStyle = { ['--hud-bg-url' as any]: `url(${hudPageBg})` };
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PanelSkeleton } from '@/components/ui/panel-skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Shield, Users, Loader2, Activity, LogOut, Calendar, MapPin, Search, 
  ArrowRightLeft, Pencil, KeyRound, Check, Clock, Ban, UserPlus, 
  FileText, Send, CreditCard, Eye, Lock, Unlock, RefreshCw, 
  Trash2, MessageSquare, DollarSign, History, UserX, Building2, Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { TransferApprovalPanel } from '@/components/agents/TransferApprovalPanel';
import { AdminResetPasswordDialog } from '@/components/agents/AdminResetPasswordDialog';
import { EditAgentDialog } from '@/components/admin/EditAgentDialog';
import { EditUnitDialog } from '@/components/admin/EditUnitDialog';
import { DeleteAgentDialog } from '@/components/admin/DeleteAgentDialog';
import { LicenseManagementDialog } from '@/components/admin/LicenseManagementDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import { AgentPasswordManager } from '@/components/admin/AgentPasswordManager';
import { CredentialsViewer } from '@/components/admin/CredentialsViewer';
import { PasswordRequestsManager } from '@/components/admin/PasswordRequestsManager';
import { AnnouncementsManager } from '@/components/admin/AnnouncementsManager';
import { PromosToggleCard } from '@/components/admin/PromosToggleCard';
import { SwapManagementPanel } from '@/components/admin/SwapManagementPanel';
import { LicenseFinanceControl } from '@/components/admin/LicenseFinanceControl';
import { UnitsManagementCard } from '@/components/admin/UnitsManagementCard';
import { AgentAccessControl } from '@/components/admin/AgentAccessControl';
import { PendingApprovalsManager } from '@/components/admin/PendingApprovalsManager';
import { CopyrightFooter } from '@/components/CopyrightFooter';
import { formatCPF, validateCPF } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { getMasterToken, setMasterToken } from '@/lib/masterSession';
import { adminClient } from '@/lib/adminClient';
import { Bell } from 'lucide-react';
import iseAcreBadge from '@/assets/ise-acre-badge.png';
import { PanelNav } from '@/components/ui/panel-nav';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
}

interface Unit {
  id: string;
  name: string;
  municipality: string;
  director_name?: string | null;
  coordinator_name?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface Agent {
  id: string;
  name: string;
  cpf: string | null;
  matricula: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  team: string | null;
  is_active: boolean;
  unit_id: string | null;
  license_status?: string | null;
  license_expires_at?: string | null;
  license_notes?: string | null;
  created_at?: string;
  unit: {
    name: string;
    municipality: string;
  } | null;
}

interface AccessLog {
  id: string;
  agent_id: string;
  action: string;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  agent?: { name: string } | null;
}

interface SystemStats {
  totalUsers: number;
  totalAgents: number;
  totalUnits: number;
  pendingTransfers: number;
  activeAgents: number;
  expiredLicenses: number;
  pendingApprovals: number;
}

export default function Master() {
  const { masterSession, setMasterSession, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAgents: 0,
    totalUnits: 0,
    pendingTransfers: 0,
    activeAgents: 0,
    expiredLicenses: 0,
    pendingApprovals: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [agentSearchTerm, setAgentSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialogs state
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editAgentOpen, setEditAgentOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editUnitOpen, setEditUnitOpen] = useState(false);
  
  // New Agent Dialog
  const [newAgentOpen, setNewAgentOpen] = useState(false);
  const [newAgentData, setNewAgentData] = useState({
    name: '',
    cpf: '',
    matricula: '',
    phone: '',
    team: '',
    unit_id: '',
    password: '',
  });
  const [creatingAgent, setCreatingAgent] = useState(false);
  
  // Message Dialog
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<Agent | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Agent Details Dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // CRÍTICO: NÃO redirecionar automaticamente - o Master deve permanecer na tela
  // O painel Master usa masterSession que é gerenciada separadamente do auth.user
  // Removido redirect automático para evitar logout forçado

  useEffect(() => {
    if (masterSession) {
      fetchData();
      
      // Realtime subscription para mudanças em agentes
      const agentsChannel = supabase
        .channel('master-agents-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'agents',
        }, (payload) => {
          console.log('[Master] Realtime agents change:', payload.eventType);
          fetchData(); // Recarrega todos os dados
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: '🔄 Atualização detectada',
              description: 'Dados de agente foram atualizados.',
              duration: 2000,
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: '🗑️ Registro removido',
              description: 'Um agente foi excluído do sistema.',
              duration: 2000,
            });
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: '✨ Novo agente',
              description: 'Um novo agente foi cadastrado.',
              duration: 2000,
            });
          }
        })
        .subscribe();

      // Realtime para transferências
      const transfersChannel = supabase
        .channel('master-transfers-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transfer_requests',
        }, () => {
          console.log('[Master] Realtime transfer change');
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(agentsChannel);
        supabase.removeChannel(transfersChannel);
      };
    }
  }, [masterSession]);

  const fetchData = async () => {
    try {
      setLoadingData(true);

      // Fetch profiles with roles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, created_at');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.full_name || 'Usuário',
          created_at: profile.created_at,
          role: userRole?.role || 'user',
        };
      });

      setUsers(usersWithRoles);

      // Fetch units
      const { data: unitsData } = await supabase
        .from('units')
        .select('*')
        .order('municipality, name');
      
      setUnits(unitsData || []);

      // Fetch agents with license info
      const { data: agentsData } = await (supabase as any)
        .from('agents')
        .select(`
          id, name, cpf, matricula, email, phone, address, team, is_active, unit_id,
          license_status, license_expires_at, license_notes, created_at,
          unit:units(name, municipality)
        `)
        .order('name');

      setAgents((agentsData as unknown as Agent[]) || []);
      
      // Fetch access logs
      const { data: logsData } = await (supabase as any)
        .from('access_logs')
        .select(`
          id, agent_id, action, created_at, ip_address, user_agent,
          agent:agents(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      setAccessLogs((logsData as unknown as AccessLog[]) || []);

      // Fetch system stats
      const [agentsRes, unitsRes, transfersRes, pendingApprovalsRes] = await Promise.all([
        supabase.from('agents').select('*', { count: 'exact', head: true }),
        supabase.from('units').select('*', { count: 'exact', head: true }),
        supabase.from('transfer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('agents').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
      ]);
      
      // Count expired licenses
      const expiredCount = (agentsData || []).filter((a: any) => {
        if (!a.license_expires_at) return false;
        return new Date(a.license_expires_at) < new Date();
      }).length;
      
      // CRÍTICO: Apenas conta como "ativo" agentes que estão is_active=true E approval_status='approved'
      const activeCount = (agentsData || []).filter((a: any) => 
        a.is_active && a.approval_status === 'approved'
      ).length;
      
      // Conta pendentes: approval_status='pending' OU approval_status é null (registros legados)
      const pendingCount = (agentsData || []).filter((a: any) => 
        a.approval_status === 'pending' || a.approval_status === null
      ).length;

      setStats({
        totalUsers: usersWithRoles.length,
        totalAgents: agentsRes.count || 0,
        totalUnits: unitsRes.count || 0,
        pendingTransfers: transfersRes.count || 0,
        activeAgents: activeCount,
        expiredLicenses: expiredCount,
        pendingApprovals: pendingCount,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminClient.setRole({ userId, role: newRole as any });
      toast({ title: 'Sucesso', description: 'Função do usuário atualizada.' });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível atualizar a função.', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setMasterToken(null);
    setMasterSession(null);
    navigate('/auth');
  };
  
  // Create new agent
  const handleCreateAgent = async () => {
    if (!newAgentData.name || !newAgentData.cpf || !newAgentData.unit_id || !newAgentData.team || !newAgentData.password) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    
    const cleanCpf = newAgentData.cpf.replace(/\D/g, '');
    if (!validateCPF(cleanCpf)) {
      toast({ title: 'Erro', description: 'CPF inválido.', variant: 'destructive' });
      return;
    }
    
    setCreatingAgent(true);
    try {
      await adminClient.createAgent({
        name: newAgentData.name,
        cpf: cleanCpf,
        password: newAgentData.password,
        unit_id: newAgentData.unit_id,
        team: newAgentData.team,
        matricula: newAgentData.matricula || null,
        phone: newAgentData.phone || null,
      });
      
      toast({ title: 'Sucesso', description: 'Agente criado com sucesso!' });
      setNewAgentOpen(false);
      setNewAgentData({ name: '', cpf: '', matricula: '', phone: '', team: '', unit_id: '', password: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível criar o agente.', variant: 'destructive' });
    } finally {
      setCreatingAgent(false);
    }
  };
  
  // Toggle agent active status
  const handleToggleAgentStatus = async (agent: Agent) => {
    try {
      await adminClient.toggleAgentStatus({ agentId: agent.id, isActive: !agent.is_active });
      
      toast({ 
        title: 'Sucesso', 
        description: `Agente ${!agent.is_active ? 'ativado' : 'desativado'} com sucesso.` 
      });
      fetchData();
    } catch (error: any) {
      console.error('Error toggling agent status:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível alterar status.', variant: 'destructive' });
    }
  };
  
  // Expire all sessions for an agent
  const handleExpireSession = async (agent: Agent) => {
    try {
      // Log the action
      await supabase.from('access_logs').insert({
        agent_id: agent.id,
        action: 'session_expired_by_admin',
      });
      
      toast({ title: 'Sucesso', description: `Sessão de ${agent.name} expirada.` });
      fetchData();
    } catch (error) {
      console.error('Error expiring session:', error);
      toast({ title: 'Erro', description: 'Não foi possível expirar sessão.', variant: 'destructive' });
    }
  };
  
  // Send message/notification to agent
  const handleSendMessage = async () => {
    if (!messageTarget || !messageContent.trim()) return;
    
    setSendingMessage(true);
    try {
      await supabase.from('notifications').insert({
        agent_id: messageTarget.id,
        title: 'Mensagem do Administrador',
        content: messageContent,
        type: 'admin_message',
      });
      
      toast({ title: 'Sucesso', description: `Mensagem enviada para ${messageTarget.name}.` });
      setMessageOpen(false);
      setMessageContent('');
      setMessageTarget(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Erro', description: 'Não foi possível enviar mensagem.', variant: 'destructive' });
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Bulk renew licenses
  const handleBulkRenewLicenses = async () => {
    try {
      const expiredAgents = agents.filter(a => {
        if (!a.license_expires_at) return false;
        return new Date(a.license_expires_at) < new Date();
      });
      
      if (expiredAgents.length === 0) {
        toast({ title: 'Info', description: 'Nenhuma licença expirada.' });
        return;
      }
      
      const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      for (const agent of expiredAgents) {
        await supabase
          .from('agents')
          .update({ license_status: 'active', license_expires_at: newExpiry })
          .eq('id', agent.id);
      }
      
      toast({ title: 'Sucesso', description: `${expiredAgents.length} licenças renovadas.` });
      fetchData();
    } catch (error) {
      console.error('Error renewing licenses:', error);
      toast({ title: 'Erro', description: 'Não foi possível renovar licenças.', variant: 'destructive' });
    }
  };

  const filteredAgents = agents.filter((agent) => {
    if (!agentSearchTerm) return true;
    const searchTerm = agentSearchTerm.toLowerCase().trim();
    const searchNumbers = searchTerm.replace(/\D/g, '');
    const name = agent.name.toLowerCase();
    if (name.includes(searchTerm)) return true;
    if (searchNumbers && agent.cpf && agent.cpf.includes(searchNumbers)) return true;
    if (searchNumbers && agent.matricula && agent.matricula.includes(searchNumbers)) return true;
    return false;
  });

  if (isLoading || loadingData) {
    return (
      <div className="min-h-dvh p-4 md:p-6 hud-scope hud-page-bg" style={hudBgStyle}>
        <div className="max-w-7xl mx-auto">
          <PanelSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (!masterSession) return null;

  return (
    <div className="min-h-dvh p-4 md:p-6 hud-scope hud-page-bg" style={hudBgStyle}>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in tactical-strip hover-lift rounded-2xl p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={iseAcreBadge}
              alt="Instituto Socioeducativo do Acre"
              className="h-12 w-12 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            />
            <div>
              <h1 className="text-2xl font-bold text-gradient">Painel Master</h1>
              <p className="text-muted-foreground">
                Controle Administrativo Total • <span className="text-primary font-medium">{masterSession}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setLoadingData(true);
                fetchData();
              }}
              disabled={loadingData}
              className="h-8 w-8 border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className={cn("h-4 w-4", loadingData && "animate-spin")} />
            </Button>
            <PanelNav onLogout={handleLogout} />
          </div>
        </div>

        {/* System Stats — cada card abre a aba correspondente (HUD) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {([
            { key: 'users',      label: 'Usuários',        value: stats.totalUsers,      icon: Users,          icon3d: icon3dTeam,     tint: 'primary',   tab: 'users' },
            { key: 'agents',     label: 'Agentes',         value: stats.totalAgents,     icon: Users,          icon3d: icon3dTeam,     tint: 'emerald',   tab: 'agents' },
            { key: 'active',     label: 'Ativos',          value: stats.activeAgents,    icon: Check,          icon3d: icon3dShield,   tint: 'green',     tab: 'agents' },
            { key: 'expired',    label: 'Expirados',       value: stats.expiredLicenses, icon: Clock,          icon3d: icon3dClock,    tint: 'red',       tab: 'licenses' },
            { key: 'units',      label: 'Unidades',        value: stats.totalUnits,      icon: Building2,      icon3d: icon3dBuilding, tint: 'blue',      tab: 'overview' },
            { key: 'transfers',  label: 'Transferências',  value: stats.pendingTransfers,icon: ArrowRightLeft, icon3d: icon3dCalendar, tint: 'yellow',    tab: 'transfers' },
          ] as const).map(({ key, label, value, icon: Icon, icon3d, tint, tab }) => {
            const tintMap: Record<string, string> = {
              primary: 'bg-primary/10 text-primary',
              emerald: 'bg-emerald-500/10 text-emerald-500',
              green:   'bg-green-500/10 text-green-500',
              red:     'bg-red-500/10 text-red-500',
              blue:    'bg-blue-500/10 text-blue-500',
              yellow:  'bg-yellow-500/10 text-yellow-500',
            };
            return (
              <Card
                key={key}
                onClick={() => {
                  setActiveTab(tab);
                  requestAnimationFrame(() => {
                    document.querySelector('[role="tablist"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  });
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveTab(tab);
                  }
                }}
                className={cn(
                  'glass glass-border cursor-pointer transition-all hover-lift',
                  'hover:border-primary/60 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  activeTab === tab && 'border-primary/70 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)]'
                )}
                aria-label={`Abrir ${label}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', tintMap[tint])}>
                      <Icon3D src={icon3d} fallback={Icon} size={22} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>


        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 sm:grid-cols-12">
            <TabsTrigger value="approvals" className="relative">
              <Icon3D src={icon3dShield} fallback={Bell} size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Aprovações</span>
              {stats.pendingApprovals > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-[10px] text-white flex items-center justify-center animate-pulse">
                  {stats.pendingApprovals}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5">
              <Icon3D src={icon3dBuilding} fallback={Building2} size={14} className="hidden sm:inline-flex" />
              Unidades
            </TabsTrigger>
            <TabsTrigger value="access-control" className="relative">
              Acesso
              {agents.filter(a => !a.is_active || (a as any).is_frozen).length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-[10px] text-white flex items-center justify-center">
                  !
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-1.5">
              <Icon3D src={icon3dTeam} fallback={Users} size={14} className="hidden sm:inline-flex" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="password-requests">Senhas</TabsTrigger>
            <TabsTrigger value="licenses" className="relative">
              Licenças
              {stats.expiredLicenses > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center animate-pulse">
                  {stats.expiredLicenses}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements">Anúncios</TabsTrigger>
            <TabsTrigger value="swaps">Permutas</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="transfers">Transfer.</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6 mt-6">
            <PendingApprovalsManager onApprovalChange={fetchData} />
          </TabsContent>

          {/* Overview Tab - Units */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <UnitsManagementCard 
              units={units}
              agents={agents.map(a => ({
                id: a.id,
                name: a.name,
                team: a.team,
                unit_id: a.unit_id,
                is_active: a.is_active
              }))}
              onEditUnit={(unit) => {
                setEditingUnit(unit);
                setEditUnitOpen(true);
              }}
              onRefresh={fetchData}
            />
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access-control" className="space-y-4 mt-6">
            <AgentAccessControl 
              agents={agents.map(a => ({
                id: a.id,
                name: a.name,
                cpf: a.cpf,
                team: a.team,
                is_active: a.is_active,
                is_frozen: (a as any).is_frozen,
                license_status: a.license_status,
                license_expires_at: a.license_expires_at,
                unit: a.unit
              }))}
              onRefresh={fetchData}
            />
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4 mt-6">
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por CPF, Matrícula ou Nome..."
                  value={agentSearchTerm}
                  onChange={(e) => setAgentSearchTerm(e.target.value)}
                  className="pl-10 bg-input"
                />
              </div>
              
              <Dialog open={newAgentOpen} onOpenChange={setNewAgentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Agente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-green-500" />
                      Criar Novo Agente
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados para criar uma nova conta de agente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Completo *</label>
                      <Input
                        placeholder="Nome do agente"
                        value={newAgentData.name}
                        onChange={(e) => setNewAgentData({ ...newAgentData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CPF *</label>
                        <Input
                          placeholder="00000000000"
                          value={newAgentData.cpf}
                          onChange={(e) => setNewAgentData({ ...newAgentData, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Matrícula</label>
                        <Input
                          placeholder="00000000"
                          value={newAgentData.matricula}
                          onChange={(e) => setNewAgentData({ ...newAgentData, matricula: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Input
                        placeholder="(00) 00000-0000"
                        value={newAgentData.phone}
                        onChange={(e) => setNewAgentData({ ...newAgentData, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Unidade *</label>
                        <Select
                          value={newAgentData.unit_id}
                          onValueChange={(v) => setNewAgentData({ ...newAgentData, unit_id: v })}
                        >
                          <SelectTrigger className="bg-input">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name} - {unit.municipality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Equipe *</label>
                        <Select
                          value={newAgentData.team}
                          onValueChange={(v) => setNewAgentData({ ...newAgentData, team: v })}
                        >
                          <SelectTrigger className="bg-input">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="ALFA">ALFA</SelectItem>
                            <SelectItem value="BRAVO">BRAVO</SelectItem>
                            <SelectItem value="CHARLIE">CHARLIE</SelectItem>
                            <SelectItem value="DELTA">DELTA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Senha Inicial *</label>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newAgentData.password}
                        onChange={(e) => setNewAgentData({ ...newAgentData, password: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewAgentOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateAgent} disabled={creatingAgent}>
                      {creatingAgent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                      Criar Agente
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="glass glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Agentes Cadastrados ({filteredAgents.length})
                </CardTitle>
                <CardDescription>
                  Gerenciamento completo de agentes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredAgents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {agentSearchTerm ? 'Nenhum agente encontrado' : 'Nenhum agente cadastrado'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Equipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.map((agent) => (
                        <TableRow key={agent.id} className="border-border">
                          <TableCell>
                            <button
                              onClick={() => {
                                setSelectedAgent(agent);
                                setDetailsOpen(true);
                              }}
                              className="font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                            >
                              {agent.name}
                              <Eye className="h-3 w-3 opacity-50" />
                            </button>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {agent.cpf ? formatCPF(agent.cpf) : '-'}
                          </TableCell>
                          <TableCell>
                            {agent.unit ? (
                              <div>
                                <div className="font-medium text-sm">{agent.unit.name}</div>
                                <div className="text-xs text-muted-foreground">{agent.unit.municipality}</div>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {agent.team ? <Badge variant="outline">{agent.team}</Badge> : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                              {agent.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <AgentPasswordManager
                                agent={agent}
                                onSuccess={fetchData}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setMessageTarget(agent);
                                  setMessageOpen(true);
                                }}
                                className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                                title="Enviar Mensagem"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleAgentStatus(agent)}
                                className={cn(
                                  agent.is_active 
                                    ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10' 
                                    : 'text-green-500 hover:text-green-400 hover:bg-green-500/10'
                                )}
                                title={agent.is_active ? 'Desativar' : 'Ativar'}
                              >
                              {agent.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingAgent(agent);
                                  setEditAgentOpen(true);
                                }}
                                className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {agent.cpf && (
                                <AdminResetPasswordDialog 
                                  agentName={agent.name}
                                  agentCpf={agent.cpf}
                                />
                              )}
                              <DeleteAgentDialog
                                agentId={agent.id}
                                agentName={agent.name}
                                onSuccess={fetchData}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-4 mt-6">
            <CredentialsViewer />
          </TabsContent>

          {/* Password Requests Tab */}
          <TabsContent value="password-requests" className="space-y-4 mt-6">
            <PasswordRequestsManager />
          </TabsContent>

          {/* Licenses & Finance Tab */}
          <TabsContent value="licenses" className="mt-6">
            <LicenseFinanceControl />
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card className="glass glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Logs de Acesso
                </CardTitle>
                <CardDescription>
                  Histórico de atividades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {accessLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum log encontrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Agente</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLogs.map((log) => (
                        <TableRow key={log.id} className="border-border">
                          <TableCell className="text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">{log.agent?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.ip_address || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="mt-6">
            <TransferApprovalPanel />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="glass glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription>
                  Controle de funções e permissões
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum usuário encontrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead>Nome</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Cadastrado em</TableHead>
                        <TableHead>Alterar Função</TableHead>
                        <TableHead className="w-20">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="border-border">
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                u.role === 'master'
                                  ? 'default'
                                  : u.role === 'admin'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {u.role === 'master' && 'Master'}
                              {u.role === 'admin' && 'Admin'}
                              {u.role === 'user' && 'Usuário'}
                              {!u.role && 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(u.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.role || 'user'}
                              onValueChange={(value) => handleRoleChange(u.id, value)}
                            >
                              <SelectTrigger className="w-32 bg-input">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover border-border">
                                <SelectItem value="user">Usuário</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="master">Master</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                title="Forçar logout"
                                onClick={async () => {
                                  try {
                                    await adminClient.forceLogout(u.id);
                                    toast({ title: 'Sessões encerradas', description: `${u.email} foi deslogado.` });
                                  } catch (e: any) {
                                    toast({ title: 'Erro', description: e?.message || 'Falha ao deslogar', variant: 'destructive' });
                                  }
                                }}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                              <DeleteUserDialog 
                                userId={u.id} 
                                userName={u.email} 
                                onSuccess={fetchData} 
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6 mt-6">
            <PromosToggleCard />
            <AnnouncementsManager />
          </TabsContent>

          {/* Swaps Management Tab */}
          <TabsContent value="swaps" className="space-y-6 mt-6">
            <SwapManagementPanel />
          </TabsContent>
        </Tabs>

        {/* Developer Credit */}
        <div className="text-center pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            Desenvolvido por <span className="text-primary font-semibold">FRANC D'NIS</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Feijó, Acre • © {new Date().getFullYear()} PlantãoPro</p>
        </div>
      </div>

      {/* Edit Agent Dialog */}
      <EditAgentDialog
        agent={editingAgent}
        open={editAgentOpen}
        onOpenChange={setEditAgentOpen}
        onSuccess={fetchData}
      />

      {/* Edit Unit Dialog */}
      <EditUnitDialog
        unit={editingUnit}
        open={editUnitOpen}
        onOpenChange={setEditUnitOpen}
        onSuccess={fetchData}
      />
      
      {/* Agent Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Detalhes do Agente
            </DialogTitle>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedAgent.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p className="font-mono">{selectedAgent.cpf ? formatCPF(selectedAgent.cpf) : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Matrícula</p>
                  <p className="font-mono">{selectedAgent.matricula || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p>{selectedAgent.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unidade</p>
                  <p>{selectedAgent.unit?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Equipe</p>
                  <p>{selectedAgent.team || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedAgent.is_active ? 'default' : 'secondary'}>
                    {selectedAgent.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Licença</p>
                  <Badge variant={selectedAgent.license_status === 'active' ? 'default' : 'secondary'}>
                    {selectedAgent.license_status || 'active'}
                  </Badge>
                </div>
              </div>
              {selectedAgent.address && (
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p>{selectedAgent.address}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                <p>{selectedAgent.created_at ? format(new Date(selectedAgent.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Enviar Mensagem
            </DialogTitle>
            <DialogDescription>
              Enviar notificação para {messageTarget?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendMessage} disabled={sendingMessage || !messageContent.trim()}>
              {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer Copyright */}
      <CopyrightFooter className="border-t border-border/30 mt-6" />
    </div>
  );
}
