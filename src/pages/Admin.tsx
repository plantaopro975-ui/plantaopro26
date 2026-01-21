import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ThemedPanelBackground } from '@/components/ThemedPanelBackground';
import { UnitsManagementCard } from '@/components/dashboard/UnitsManagementCard';
import { TeamShiftsPanel } from '@/components/dashboard/TeamShiftsPanel';
import { BHControlCard } from '@/components/dashboard/BHControlCard';
import { AnnouncementsCard } from '@/components/dashboard/AnnouncementsCard';
import { ActivityLogsCard } from '@/components/dashboard/ActivityLogsCard';
import { SystemOverviewCard } from '@/components/dashboard/SystemOverviewCard';
import { ShiftConflictsBanner } from '@/components/dashboard/ShiftConflictsBanner';
import { useShiftConflictDetection } from '@/hooks/useShiftConflictDetection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, 
  LogOut, 
  Shield, 
  Users, 
  Building2, 
  Clock, 
  Bell,
  BarChart3,
  Home,
  Lock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface AdminPermissions {
  can_manage_agents: boolean;
  can_manage_units: boolean;
  can_manage_licenses: boolean;
  can_manage_screens: boolean;
  can_manage_ads: boolean;
  can_view_analytics: boolean;
  can_manage_roles: boolean;
  can_delete_agents: boolean;
  can_manage_announcements: boolean;
  can_approve_transfers: boolean;
}

export default function Admin() {
  const { user, isLoading, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  
  const { conflicts, hasConflicts, isChecking, checkForConflicts, dismissConflict } = useShiftConflictDetection({
    enabled: true,
    isAdmin: true,
  });
  
  useBackNavigation({ enabled: true, fallbackPath: '/' });

  // Fetch admin permissions
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const { data, error } = await supabase
          .from('admin_permissions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setPermissions(data as AdminPermissions);
        } else {
          // Default permissions for admin role without explicit permissions
          setPermissions({
            can_manage_agents: true,
            can_manage_units: true,
            can_manage_licenses: false,
            can_manage_screens: false,
            can_manage_ads: false,
            can_view_analytics: true,
            can_manage_roles: false,
            can_delete_agents: false,
            can_manage_announcements: true,
            can_approve_transfers: true,
          });
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoadingPermissions(false);
      }
    };
    
    fetchPermissions();
  }, [user?.id]);

  // Auth and role check
  useEffect(() => {
    if (isLoading) return;
    
    // Not logged in
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    
    // Not an admin
    if (userRole !== 'admin' && userRole !== 'master') {
      toast({
        title: 'Acesso negado',
        description: 'Você não tem permissão para acessar o painel administrativo.',
        variant: 'destructive',
      });
      navigate('/agent-panel', { replace: true });
    }
  }, [user, userRole, isLoading, navigate]);

  const handleExit = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading || loadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user || (userRole !== 'admin' && userRole !== 'master')) {
    return null;
  }

  return (
    <ThemedPanelBackground team={null}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                    <p className="text-sm text-muted-foreground">Gestão operacional do sistema</p>
                  </div>
                  <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/40">
                    ADMIN
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="border-slate-600"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleExit}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>

              {/* Permissions Card */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-400" />
                    Suas Permissões
                  </CardTitle>
                  <CardDescription>
                    Funcionalidades disponíveis para sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {permissions && Object.entries(permissions).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        can_manage_agents: 'Agentes',
                        can_manage_units: 'Unidades',
                        can_manage_licenses: 'Licenças',
                        can_manage_screens: 'Telas',
                        can_manage_ads: 'Anúncios',
                        can_view_analytics: 'Analytics',
                        can_manage_roles: 'Roles',
                        can_delete_agents: 'Excluir',
                        can_manage_announcements: 'Avisos',
                        can_approve_transfers: 'Transf.',
                      };
                      
                      return (
                        <div 
                          key={key}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            value ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/50 border border-slate-600/50'
                          }`}
                        >
                          {value ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-500" />
                          )}
                          <span className={`text-xs ${value ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {labels[key] || key}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Conflicts Banner */}
              {hasConflicts && conflicts.length > 0 && (
                <ShiftConflictsBanner 
                  conflicts={conflicts}
                  isChecking={isChecking}
                  onRefresh={checkForConflicts}
                  onDismiss={dismissConflict}
                />
              )}

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-slate-800/80 border border-slate-700 p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Visão Geral
                  </TabsTrigger>
                  {permissions?.can_manage_units && (
                    <TabsTrigger value="units" className="data-[state=active]:bg-blue-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      Unidades
                    </TabsTrigger>
                  )}
                  {permissions?.can_manage_agents && (
                    <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600">
                      <Users className="h-4 w-4 mr-2" />
                      Agentes
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="bh" className="data-[state=active]:bg-blue-600">
                    <Clock className="h-4 w-4 mr-2" />
                    B.Horas
                  </TabsTrigger>
                  {permissions?.can_manage_announcements && (
                    <TabsTrigger value="announcements" className="data-[state=active]:bg-blue-600">
                      <Bell className="h-4 w-4 mr-2" />
                      Avisos
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SystemOverviewCard />
                    <ActivityLogsCard />
                  </div>
                  <TeamShiftsPanel />
                </TabsContent>

                {permissions?.can_manage_units && (
                  <TabsContent value="units">
                    <UnitsManagementCard />
                  </TabsContent>
                )}

                {permissions?.can_manage_agents && (
                  <TabsContent value="agents">
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle>Gestão de Agentes</CardTitle>
                        <CardDescription>
                          Visualize e gerencie os agentes do sistema
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => navigate('/agents')}>
                          <Users className="h-4 w-4 mr-2" />
                          Acessar Lista de Agentes
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="bh">
                  <BHControlCard />
                </TabsContent>

                {permissions?.can_manage_announcements && (
                  <TabsContent value="announcements">
                    <AnnouncementsCard />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ThemedPanelBackground>
  );
}
