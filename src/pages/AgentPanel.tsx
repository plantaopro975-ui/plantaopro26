import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useLicenseCheck } from '@/hooks/useLicenseCheck';
import { useLicenseExpiryNotification } from '@/hooks/useLicenseExpiryNotification';
import { useShiftNotifications } from '@/hooks/useShiftNotifications';
import { useBHReminder } from '@/hooks/useBHReminder';
import { useBHReminderHour } from '@/components/agent-panel/BHReminderSettings';
import { useAlarmNotifications } from '@/hooks/useAlarmNotifications';
import { TeamMembersCard } from '@/components/agent-panel/TeamMembersCard';
import { ProfessionalShiftTimer } from '@/components/agent-panel/ProfessionalShiftTimer';
import { OnDutyOverlay } from '@/components/agent-panel/OnDutyOverlay';
import { BHTracker } from '@/components/agent-panel/BHTracker';
import { ShiftScheduleCard } from '@/components/agent-panel/ShiftScheduleCard';
import { NextShiftCountdown } from '@/components/agent-panel/NextShiftCountdown';
import { ChatPanel } from '@/components/agent-panel/ChatPanel';
import { NotificationsPanel } from '@/components/agent-panel/NotificationsPanel';
import { SwapRequestsCard } from '@/components/agent-panel/SwapRequestsCard';
import { AgentRoleSelector } from '@/components/agent-panel/AgentRoleSelector';
import { LeaveRequestCard } from '@/components/agent-panel/LeaveRequestCard';
import { ShiftSetupPrompt } from '@/components/agent-panel/ShiftSetupPrompt';
import { ShiftAlertsBanner, useShiftAlertsBanner } from '@/components/agent-panel/ShiftAlertsBanner';
import { NotificationSettings } from '@/components/agent-panel/NotificationSettings';
import { AgentSettingsCard } from '@/components/agent-panel/AgentSettingsCard';
import { AgentEventsCard } from '@/components/agent-panel/AgentEventsCard';
import { ChatAndAlertSettings } from '@/components/agent-panel/ChatAndAlertSettings';
import ShiftPlannerCard from '@/components/agent-panel/ShiftPlannerCard';
import { ShiftCalendarOverview } from '@/components/agent-panel/ShiftCalendarOverview';
import { BHReminderSettings } from '@/components/agent-panel/BHReminderSettings';
import { BHEvolutionChart } from '@/components/agent-panel/BHEvolutionChart';
import { BHHistoryTracker } from '@/components/agent-panel/BHHistoryTracker';
import { BirthdayCard } from '@/components/agent-panel/BirthdayCard';
import { ProfileCompletionAlert } from '@/components/agent-panel/ProfileCompletionAlert';
import { LicenseWarningBanner } from '@/components/LicenseWarningBanner';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';
import { SessionMonitorBanner } from '@/components/SessionMonitorBanner';
import { DiagnosticReportButton } from '@/components/DiagnosticReportButton';
import { SessionDiagnosticCard } from '@/components/agent-panel/SessionDiagnosticCard';
import { SafeModeToggle } from '@/components/SafeModeToggle';
import { CopyrightFooter } from '@/components/CopyrightFooter';
import { ThemedPanelBackground } from '@/components/ThemedPanelBackground';
import { WelcomeTrialDialog, shouldShowWelcomeToday, getRemainingTrialDays } from '@/components/WelcomeTrialDialog';
import { PasswordChangeRequest } from '@/components/agent-panel/PasswordChangeRequest';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useOfflineCache';
import { AgentPanelHeader } from '@/components/agent-panel/AgentPanelHeader';
import { UnitSummaryCard } from '@/components/agent-panel/UnitSummaryCard';
import { AdminAnnouncementsPanel } from '@/components/agent-panel/AdminAnnouncementsPanel';
import { AdDisplaySystem } from '@/components/agent-panel/AdDisplaySystem';
import { usePromosEnabled } from '@/hooks/usePromosEnabled';
import { AgentHeroPanel } from '@/components/agent-panel/AgentHeroPanel';
import { PanelHeroHUD } from '@/components/panel/PanelHeroHUD';
import { SmartAlarmClock } from '@/components/agent-panel/SmartAlarmClock';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, MessageCircle, Calendar, Clock, ArrowRightLeft, CalendarOff, Settings, User, CalendarDays, Calculator, Shield, Zap, Key, Bell, Megaphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function AgentPanel() {
  const { user, isLoading, masterSession, isAdmin } = useAuth();
  const { agent, isLoading: isLoadingAgent } = useAgentProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('equipe');
  const [hasShifts, setHasShifts] = useState(true);
  const { enabled: promosEnabled } = usePromosEnabled();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);
  
  // Shift alerts banner control
  const { isDismissed: isShiftBannerDismissed, setIsDismissed: setShiftBannerDismissed, forceShow: forceShowShiftBanner, reactivateBanner: reactivateShiftBanner } = useShiftAlertsBanner();
  // Check for first access or daily welcome
  useEffect(() => {
    if (!agent?.name) return;
    
    // Check if we should show welcome today (once per day on first access)
    if (shouldShowWelcomeToday()) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setShowWelcomeDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [agent?.name]);

  // ESC key navigation - goes back to previous page or home
  useBackNavigation({ enabled: true, fallbackPath: '/' });

  // Session persistence with retry logic
  const { 
    isOnline, 
    isRetrying, 
    retryCount, 
    maxRetries,
    manualRetry 
  } = useSessionPersistence({
    onConnectionLost: () => {
      toast({
        title: 'Conexão perdida',
        description: 'Tentando reconectar automaticamente...',
        variant: 'destructive',
      });
    },
    onConnectionRestored: () => {
      toast({
        title: 'Conexão restaurada',
        description: 'Sua sessão foi recuperada com sucesso.',
      });
    },
    onMaxRetriesReached: () => {
      toast({
        title: 'Falha na reconexão',
        description: 'Não foi possível restaurar a sessão. Por favor, faça login novamente.',
        variant: 'destructive',
      });
    },
  });

  // License check with warning banner
  const {
    showWarning: showLicenseWarning,
    secondsUntilLogout,
    licenseStatus,
  } = useLicenseCheck({
    licenseStatus: agent?.license_status ?? null,
    licenseExpiresAt: agent?.license_expires_at ?? null,
    enabled: !!agent && !masterSession,
    warningDurationSeconds: 15,
    autoLogout: false,
    skipForMaster: true,
    isMasterSession: !!masterSession,
  });

  // License expiry notification - alerts 7 days before with push notifications
  const { daysUntilExpiry, isExpiringSoon, isPushEnabled } = useLicenseExpiryNotification({
    licenseExpiresAt: agent?.license_expires_at ?? null,
    agentId: agent?.id ?? null,
    agentName: agent?.name ?? null,
    enabled: !!agent && !masterSession,
    warningDaysBefore: 7,
  });

  // Shift notifications - checks for upcoming shifts and sends reminders
  useShiftNotifications({
    agentId: agent?.id || '',
    enabled: !!agent?.id,
    reminderHoursBefore: [24, 1], // 24h and 1h before
  });

  // Get saved BH reminder hour preference
  const bhReminderHour = useBHReminderHour(agent?.id || '');

  // BH daily reminder - reminds to register BH if not done today
  useBHReminder({
    agentId: agent?.id || '',
    enabled: !!agent?.id,
    reminderHour: bhReminderHour, // Use saved preference
  });

  // Alarm notifications for shifts
  useAlarmNotifications({
    agentId: agent?.id || '',
    enabled: !!agent?.id,
    alarmBeforeMinutes: 60, // 1 hour before shift
  });

  useEffect(() => {
    if (agent?.id) {
      checkAgentShifts();
    }
  }, [agent?.id]);

  const checkAgentShifts = async () => {
    if (!agent?.id) return;
    try {
      const { count, error } = await (supabase as any)
        .from('agent_shifts')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id);

      if (!error) {
        setHasShifts((count || 0) > 0);
      }
    } catch (error) {
      console.error('Error checking shifts:', error);
    }
  };

  // Track if we had a valid session to prevent aggressive redirects during hydration
  const hadSessionRef = useRef(false);
  
  // Mark that we had a session once user/agent loads successfully
  useEffect(() => {
    if (user || agent) {
      hadSessionRef.current = true;
    }
  }, [user, agent]);

  // Redirect only if master session is accessing agent panel (not allowed)
  // IMPORTANT: Do NOT redirect to home when user is temporarily null - this causes session loops
  useEffect(() => {
    if (isLoading || isLoadingAgent) return;

    // Master session must never access the agent panel
    if (masterSession && !user) {
      navigate('/master', { replace: true });
    }
  }, [user, masterSession, isLoading, isLoadingAgent, navigate]);

  // CRÍTICO: Só redireciona para home se NUNCA teve sessão válida neste ciclo.
  // Isso previne logout durante hidratação/refresh de token.
  useEffect(() => {
    if (isLoading || isLoadingAgent) return;
    
    // Se já teve sessão válida, NÃO redireciona - permite tempo de recuperação
    if (hadSessionRef.current) return;
    
    // Se não há user/master, fazemos UMA verificação de sessão.
    // Importante: não redirecionar automaticamente (evita loop infinito); deixa o usuário decidir.
    if (!user && !masterSession) {
      let cancelled = false;
      setIsVerifyingSession(true);
      setSessionMissing(false);

      const timer = window.setTimeout(async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const hasSession = !!data?.session;

          if (cancelled) return;
          if (hasSession || hadSessionRef.current) {
            setSessionMissing(false);
            return;
          }

          setSessionMissing(true);
        } finally {
          if (!cancelled) setIsVerifyingSession(false);
        }
      }, 2500);

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
      };
    }

    // Reset se recuperou user/master
    setSessionMissing(false);
    setIsVerifyingSession(false);
  }, [user, masterSession, isLoading, isLoadingAgent, navigate]);

  // If an admin account lands here (no linked agent profile), route to the admin area instead
  useEffect(() => {
    if (isLoading || isLoadingAgent) return;
    if (user && isAdmin && !agent) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, agent, isLoading, isLoadingAgent, navigate]);


  // Loading state - mostrar indicador profissional durante carregamento
  if (isLoading || isLoadingAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl animate-pulse">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-5 w-5 text-primary animate-spin" />
          </div>
          <p className="text-zinc-400 text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  // Sem sessão - mostrar loading enquanto verifica
  if (!user && !masterSession) {
    // Se está verificando sessão, mostra loading
    if (isVerifyingSession) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl">
              <Shield className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <p className="text-zinc-400 text-sm">Verificando sessão...</p>
          </div>
        </div>
      );
    }
    
    // Se sessão realmente não existe, redireciona para home
    if (sessionMissing) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
          <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <Shield className="h-10 w-10 text-amber-400" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-100">Sessão não encontrada</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Por favor, faça login novamente para acessar seu painel.
                </p>
              </div>
              <Button
                onClick={() => navigate('/')}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
              >
                Ir para Login
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // Retornar loading enquanto ainda não determinou o estado
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl">
            <Shield className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <p className="text-zinc-400 text-sm">Conectando...</p>
        </div>
      </div>
    );
  }

  // CRÍTICO: Se é admin sem perfil de agente, mostrar loading enquanto redireciona
  // para evitar flash da tela de erro
  if (user && isAdmin && !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="flex flex-col items-center gap-5">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
            <Shield className="h-10 w-10 text-indigo-400" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-zinc-200 font-medium">Acesso Administrativo</p>
            <p className="text-zinc-500 text-sm">Redirecionando para o painel...</p>
          </div>
        </div>
      </div>
    );
  }

  // Apenas bloquear se o cadastro foi rejeitado ou se is_active=false
  // REMOVIDO: Verificação de approval_status='pending' - usuários entram direto após cadastro
  if (agent && (agent.approval_status === 'rejected' || agent.is_active === false)) {
    const isRejected = agent.approval_status === 'rejected';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
        <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-rose-500/30 p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
              <Shield className="h-10 w-10 text-rose-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-100">
                {isRejected ? 'Cadastro Rejeitado' : 'Acesso Bloqueado'}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {isRejected
                  ? 'Seu cadastro foi rejeitado pela administração. Entre em contato com a coordenação.'
                  : 'Seu acesso está temporariamente desativado. Procure a administração.'}
              </p>
            </div>
            <div className="flex flex-col w-full gap-3 pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-xl border border-zinc-700"
              >
                Recarregar Página
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/');
                }}
                className="w-full h-12 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
              >
                Encerrar Sessão
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no agent - AFTER all hooks
  // Mas apenas para usuários normais, não admins
  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
        <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <User className="h-10 w-10 text-amber-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-100">Perfil Não Encontrado</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Não foi possível carregar seus dados. O sistema está tentando reconectar automaticamente.
              </p>
            </div>
            <div className="flex flex-col w-full gap-3 pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20"
              >
                Tentar Novamente
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/');
                }}
                className="w-full h-12 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl"
              >
                Encerrar Sessão
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <ThemedPanelBackground team={agent?.team || null} showTeamImage={true}>
      <div className="hud-scope flex-1 flex flex-col w-full min-w-0 min-h-0">

      {/* License Warning Banner */}
      {showLicenseWarning && (
        <LicenseWarningBanner
          licenseStatus={licenseStatus}
          expiresAt={agent?.license_expires_at || null}
          secondsUntilLogout={secondsUntilLogout}
          onContactAdmin={() => {
            toast({
              title: 'Contato do Administrador',
              description: 'Entre em contato pelo e-mail: admin@plantaopro.app',
            });
          }}
        />
      )}

      {/* Session Monitor Banner - Visual session status */}
      <SessionMonitorBanner />

      <div className="flex-1 flex flex-col w-full min-w-0 min-h-0 no-swipe-back">
        <main 
          className={`flex-1 w-full min-w-0 px-2 py-2 sm:p-3 md:p-4 lg:p-6 overflow-y-auto overflow-x-hidden no-swipe-back ${showLicenseWarning ? 'pt-28' : ''}`}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            overscrollBehaviorX: 'none',
            scrollBehavior: 'auto',
            transform: 'translateZ(0)',
            willChange: 'scroll-position',
            touchAction: 'pan-y pinch-zoom',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
            paddingLeft: 'max(env(safe-area-inset-left, 0px), 8px)',
            paddingRight: 'max(env(safe-area-inset-right, 0px), 8px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 32px)',
          }}
        >
          <div className="max-w-7xl w-full mx-auto space-y-3 md:space-y-4 lg:space-y-5 pb-16 sm:pb-20">
            {/* Futuristic HUD Hero */}
            <PanelHeroHUD
              variant="command"
              icon="shield"
              eyebrow="Painel do Agente"
              title={`Bem-vindo, ${agent.name?.split(' ')[0] || 'Agente'}`}
              subtitle={`Equipe ${agent.team || '—'} • Sistema Operacional Ativo`}
            />

            {/* Professional Header Bar */}
            <AgentPanelHeader 
              agent={{
                id: agent.id,
                name: agent.name,
                team: agent.team,
                role: (agent as any).role,
                blood_type: (agent as any).blood_type,
                avatar_url: (agent as any).avatar_url,
                unit_id: (agent as any).unit_id
              }}
              isOnline={isOnline}
              onShowWelcome={() => setShowWelcomeDialog(true)}
              onReactivateShiftBanner={reactivateShiftBanner}
              isShiftBannerDismissed={isShiftBannerDismissed}
            />

            {/* Shift Alerts Banner */}
            <ShiftAlertsBanner 
              agentId={agent.id} 
              onDismissedChange={setShiftBannerDismissed}
              forceShow={forceShowShiftBanner}
            />

            {/* On Duty Overlay - Discreto e minimizável */}
            <OnDutyOverlay agentId={agent.id} />

            {/* HERO PANEL - Futuristic Status Dashboard */}
            <AgentHeroPanel 
              agentId={agent.id}
              agentName={agent.name}
              agentTeam={agent.team}
            />

            {/* Main Tabs - REDESIGNED: Modern, Legible, Mobile-First */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
              {/* Control Panel Container - Modern Glass Design */}
              <div className="relative tactical-strip bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 rounded-2xl md:rounded-3xl border-2 md:border-3 border-amber-500/50 shadow-2xl shadow-amber-500/15 backdrop-blur-xl overflow-hidden hover-lift">
                {/* Decorative glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
                
                {/* Control Panel Header - MUCH LARGER & Professional */}
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 md:p-6 border-b border-amber-500/20">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-3 md:p-4 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-xl md:rounded-2xl shadow-xl shadow-amber-500/40 ring-2 ring-amber-300/30">
                      <Shield className="h-7 w-7 md:h-9 md:w-9 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-amber-100 tracking-tight leading-tight">
                        PAINEL DE CONTROLE
                      </h2>
                      <p className="text-sm md:text-base text-amber-400/90 font-medium tracking-wide mt-0.5">
                        Sistema Operacional Integrado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 bg-emerald-500/25 px-4 md:px-5 py-2 md:py-2.5 rounded-xl border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20">
                    <Zap className="h-5 w-5 md:h-6 md:w-6 text-emerald-400 animate-pulse" />
                    <span className="text-sm md:text-base font-bold text-emerald-300 tracking-wider">ONLINE</span>
                  </div>
                </div>
                
                {/* Tabs Grid - MODERN, LARGE, FULLY READABLE */}
                <div className="p-3 md:p-5 lg:p-6">
                  <TabsList className="bg-gradient-to-br from-slate-800/95 via-slate-900/90 to-slate-800/95 border-2 border-amber-500/25 p-2 md:p-3 lg:p-4 h-auto grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 md:gap-3 rounded-xl md:rounded-2xl shadow-inner">
                    {/* Equipe Tab */}
                    <TabsTrigger 
                      value="equipe" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-amber-500/15 hover:border-amber-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-400 data-[state=active]:via-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-black data-[state=active]:shadow-xl data-[state=active]:shadow-amber-500/40 data-[state=active]:border-amber-300 data-[state=active]:scale-[1.02]"
                    >
                      <Users className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-amber-400 group-data-[state=active]:text-black transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-amber-200 group-data-[state=active]:text-black tracking-wide">Equipe</span>
                    </TabsTrigger>
                    
                    {/* Plantões Tab */}
                    <TabsTrigger 
                      value="plantoes" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-orange-500/15 hover:border-orange-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-400 data-[state=active]:via-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-orange-500/40 data-[state=active]:border-orange-300 data-[state=active]:scale-[1.02]"
                    >
                      <Calendar className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-orange-400 group-data-[state=active]:text-white transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-orange-200 group-data-[state=active]:text-white tracking-wide">Plantões</span>
                    </TabsTrigger>
                    
                    {/* B.Horas Tab */}
                    <TabsTrigger 
                      value="bh" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-emerald-500/15 hover:border-emerald-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-400 data-[state=active]:via-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-black data-[state=active]:shadow-xl data-[state=active]:shadow-emerald-500/40 data-[state=active]:border-emerald-300 data-[state=active]:scale-[1.02]"
                    >
                      <Clock className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-emerald-400 group-data-[state=active]:text-black transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-emerald-200 group-data-[state=active]:text-black tracking-wide">B.Horas</span>
                    </TabsTrigger>
                    
                    {/* Folgas Tab */}
                    <TabsTrigger 
                      value="folgas" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-purple-500/15 hover:border-purple-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:via-violet-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-purple-500/40 data-[state=active]:border-purple-300 data-[state=active]:scale-[1.02]"
                    >
                      <CalendarOff className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-purple-400 group-data-[state=active]:text-white transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-purple-200 group-data-[state=active]:text-white tracking-wide">Folgas</span>
                    </TabsTrigger>
                    
                    {/* Agenda Tab */}
                    <TabsTrigger 
                      value="agenda" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-cyan-500/15 hover:border-cyan-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-400 data-[state=active]:via-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-black data-[state=active]:shadow-xl data-[state=active]:shadow-cyan-500/40 data-[state=active]:border-cyan-300 data-[state=active]:scale-[1.02]"
                    >
                      <CalendarDays className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-cyan-400 group-data-[state=active]:text-black transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-cyan-200 group-data-[state=active]:text-black tracking-wide">Agenda</span>
                    </TabsTrigger>
                    
                    {/* Planejar Tab */}
                    <TabsTrigger 
                      value="planejador" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-rose-500/15 hover:border-rose-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-400 data-[state=active]:via-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-rose-500/40 data-[state=active]:border-rose-300 data-[state=active]:scale-[1.02]"
                    >
                      <Calculator className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-rose-400 group-data-[state=active]:text-white transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-rose-200 group-data-[state=active]:text-white tracking-wide">Planejar</span>
                    </TabsTrigger>
                    
                    {/* Permutas Tab */}
                    <TabsTrigger 
                      value="permutas" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-yellow-500/15 hover:border-yellow-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-400 data-[state=active]:via-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-black data-[state=active]:shadow-xl data-[state=active]:shadow-yellow-500/40 data-[state=active]:border-yellow-300 data-[state=active]:scale-[1.02]"
                    >
                      <ArrowRightLeft className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-yellow-400 group-data-[state=active]:text-black transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-yellow-200 group-data-[state=active]:text-black tracking-wide">Permutas</span>
                    </TabsTrigger>
                    
                    {/* Chat Tab */}
                    <TabsTrigger 
                      value="chat" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-blue-500/15 hover:border-blue-500/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-400 data-[state=active]:via-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/40 data-[state=active]:border-blue-300 data-[state=active]:scale-[1.02]"
                    >
                      <MessageCircle className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-blue-400 group-data-[state=active]:text-white transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-blue-200 group-data-[state=active]:text-white tracking-wide">Chat</span>
                    </TabsTrigger>
                    
                    {/* Config Tab */}
                    <TabsTrigger 
                      value="config" 
                      className="group flex flex-col items-center justify-center gap-1.5 md:gap-2 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl font-bold transition-all duration-300 min-h-[80px] md:min-h-[100px] lg:min-h-[110px] border-2 border-slate-600/50 bg-slate-800/50 hover:bg-slate-500/15 hover:border-slate-400/50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-400 data-[state=active]:via-gray-500 data-[state=active]:to-zinc-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-slate-500/40 data-[state=active]:border-slate-300 data-[state=active]:scale-[1.02]"
                    >
                      <Settings className="h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9 text-slate-400 group-data-[state=active]:text-white transition-colors" />
                      <span className="text-sm md:text-base lg:text-lg font-bold text-slate-200 group-data-[state=active]:text-white tracking-wide">Config</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Profile Completion Alert */}
              <ProfileCompletionAlert agentId={agent.id} agentName={agent.name} />


              {/* Shift Setup Prompt */}
              <ShiftSetupPrompt
                agentId={agent.id}
                agentName={agent.name}
                hasShifts={hasShifts}
                onComplete={checkAgentShifts}
              />

              <TabsContent value="equipe" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                {/* Ad Display System temporariamente desativado a pedido do administrador */}
                {promosEnabled && <AdDisplaySystem />}

                
                {/* Admin Announcements Panel - Priority Display */}
                <AdminAnnouncementsPanel 
                  agentId={agent.id}
                  agentUnitId={agent.unit_id}
                  agentTeam={agent.team}
                />

                {/* Unit Summary Card */}
                <UnitSummaryCard unitId={agent.unit_id} />
                
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
                  <div className="xl:col-span-3">
                    <TeamMembersCard 
                      unitId={agent.unit_id} 
                      team={agent.team} 
                      currentAgentId={agent.id}
                      currentAgentName={agent.name}
                      unitName={agent.unit?.name}
                    />
                  </div>
                  <div className="xl:col-span-1 grid grid-cols-2 xl:grid-cols-1 gap-3 md:gap-4">
                    <TacticalRadar 
                      unitId={agent.unit_id || undefined}
                      compact={true}
                    />
                    <BirthdayCard 
                      agentId={agent.id}
                      team={agent.team}
                      unitId={agent.unit_id}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="plantoes" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                {/* Next Shift Countdown - Top Priority */}
                <NextShiftCountdown agentId={agent.id} agentName={agent.name} agentUnitId={agent.unit_id} agentTeam={agent.team} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  <ProfessionalShiftTimer agentId={agent.id} />
                  <ShiftScheduleCard agentId={agent.id} />
                </div>
                <ShiftCalendarOverview agentId={agent.id} />
              </TabsContent>

              <TabsContent value="bh" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <BHTracker agentId={agent.id} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  <BHEvolutionChart agentId={agent.id} />
                  <BHHistoryTracker agentId={agent.id} />
                </div>
              </TabsContent>

              <TabsContent value="folgas" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <LeaveRequestCard 
                  agentId={agent.id} 
                  agentTeam={agent.team}
                  agentUnitId={agent.unit_id}
                />
              </TabsContent>

              <TabsContent value="agenda" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <AgentEventsCard agentId={agent.id} />
              </TabsContent>

              <TabsContent value="planejador" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <ShiftPlannerCard agentId={agent.id} />
              </TabsContent>

              <TabsContent value="permutas" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <SwapRequestsCard 
                  agentId={agent.id} 
                  unitId={agent.unit_id}
                  team={agent.team}
                />
              </TabsContent>

              <TabsContent value="chat" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <ChatPanel 
                  agentId={agent.id} 
                  unitId={agent.unit_id}
                  team={agent.team}
                  agentName={agent.name}
                  agentRole={(agent as any).role}
                  agentAvatarUrl={(agent as any).avatar_url}
                />
              </TabsContent>

              <TabsContent value="config" className="space-y-3 md:space-y-4 animate-fade-in mt-0">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 lg:gap-5">
                  <AgentSettingsCard
                    agentId={agent.id}
                    agentName={agent.name}
                    currentEmail={agent.email}
                    currentAvatarUrl={(agent as any).avatar_url}
                    onUpdate={() => window.location.reload()}
                  />
                  <div className="space-y-3 md:space-y-4">
                    {/* Smart Alarm Clock - Futuristic Design */}
                    <SmartAlarmClock agentId={agent.id} />
                    
                    <ChatAndAlertSettings agentId={agent.id} />
                    <NotificationSettings />
                    <BHReminderSettings agentId={agent.id} />
                    
                    {/* Session Diagnostic Card */}
                    <SessionDiagnosticCard />
                    
                    {/* Diagnostic Tools Section - IMPROVED */}
                    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-slate-600/60 rounded-2xl p-4 md:p-5 space-y-3 shadow-xl">
                      <h3 className="font-bold text-base md:text-lg flex items-center gap-2 md:gap-3 text-slate-100">
                        <Settings className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
                        Ferramentas de Diagnóstico
                      </h3>
                      <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                        Resolva problemas de conexão ou sessão.
                      </p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <DiagnosticReportButton />
                        <SafeModeToggle variant="compact" />
                      </div>
                    </div>

                    {/* Password & Security Section - IMPROVED */}
                    <div className="bg-gradient-to-br from-purple-900/40 to-slate-900/90 border-2 border-purple-500/40 rounded-2xl p-4 md:p-5 space-y-3 shadow-xl">
                      <h3 className="font-bold text-base md:text-lg flex items-center gap-2 md:gap-3 text-slate-100">
                        <Key className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                        Segurança da Conta
                      </h3>
                      <p className="text-sm md:text-base text-slate-400 leading-relaxed">
                        Altere sua senha via solicitação ao administrador.
                      </p>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <PasswordChangeRequest 
                          agentId={agent.id} 
                          agentName={agent.name} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <BHEvolutionChart agentId={agent.id} />
              </TabsContent>
            </Tabs>

            {/* Mural de Comunicados Rápidos */}
            <AnnouncementsMural className="mt-4" />

            {/* Footer Copyright - Compacto */}
            <CopyrightFooter className="border-t border-border/30 mt-2" />
          </div>
        </main>
      </div>
      </div>
    </ThemedPanelBackground>

    {/* Welcome Trial Dialog */}
    {showWelcomeDialog && agent && (
      <WelcomeTrialDialog 
        agentName={agent.name} 
        onClose={() => setShowWelcomeDialog(false)} 
      />
    )}
    </>
  );
}
