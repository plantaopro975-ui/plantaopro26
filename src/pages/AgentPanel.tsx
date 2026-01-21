import { useEffect, useState, useCallback } from 'react';
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
import { BirthdayCard } from '@/components/agent-panel/BirthdayCard';
import { ProfileCompletionAlert } from '@/components/agent-panel/ProfileCompletionAlert';
import { LicenseWarningBanner } from '@/components/LicenseWarningBanner';
import { TacticalRadar } from '@/components/dashboard/TacticalRadar';
import { SessionMonitorBanner } from '@/components/SessionMonitorBanner';
import { DiagnosticReportButton } from '@/components/DiagnosticReportButton';
import { SafeModeToggle } from '@/components/SafeModeToggle';
import { ThemedPanelBackground } from '@/components/ThemedPanelBackground';
import { WelcomeTrialDialog, shouldShowWelcomeToday, getRemainingTrialDays } from '@/components/WelcomeTrialDialog';
import { PasswordChangeRequest } from '@/components/agent-panel/PasswordChangeRequest';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useOfflineCache';
import { AgentPanelHeader } from '@/components/agent-panel/AgentPanelHeader';
import { UnitSummaryCard } from '@/components/agent-panel/UnitSummaryCard';
import { AdminAnnouncementsPanel } from '@/components/agent-panel/AdminAnnouncementsPanel';
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
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  
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

  // License expiry notification - alerts 7 days before
  const { daysUntilExpiry, isExpiringSoon } = useLicenseExpiryNotification({
    licenseExpiresAt: agent?.license_expires_at ?? null,
    agentId: agent?.id ?? null,
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

  // Redirect only if master session is accessing agent panel (not allowed)
  // IMPORTANT: Do NOT redirect to home when user is temporarily null - this causes session loops
  useEffect(() => {
    if (isLoading || isLoadingAgent) return;

    // Master session must never access the agent panel
    if (masterSession && !user) {
      navigate('/master', { replace: true });
    }
  }, [user, masterSession, isLoading, isLoadingAgent, navigate]);

  // If an admin account lands here (no linked agent profile), route to the admin area instead
  useEffect(() => {
    if (isLoading || isLoadingAgent) return;
    if (user && isAdmin && !agent) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, agent, isLoading, isLoadingAgent, navigate]);


  // Show loading while auth is hydrating - AFTER all hooks
  if (isLoading || isLoadingAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Show error state if no agent - AFTER all hooks
  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="max-w-md w-full rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-white">Perfil não carregou</h1>
          <p className="text-slate-300 text-sm">
            Não foi possível localizar seus dados de agente. Isso acontece quando o CPF da conta não está vinculado a um registro de agente.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-slate-600 hover:bg-slate-800"
            >
              Recarregar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <ThemedPanelBackground team={agent?.team || null} showTeamImage={true}>
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

      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        <main className={`flex-1 p-2 sm:p-3 md:p-4 lg:p-6 overflow-y-auto overflow-x-hidden overscroll-y-auto scroll-smooth pb-safe ${showLicenseWarning ? 'pt-28' : ''}`}>
          <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3 md:space-y-4 animate-fade-in pb-4">
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

            {/* Main Tabs - Professional Control Panel */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-3">
              <div className="bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 rounded-lg sm:rounded-xl border border-amber-500/20 sm:border-2 sm:border-amber-500/30 shadow-xl backdrop-blur-md p-2 sm:p-3 md:p-4">
                {/* Control Panel Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
                      <Shield className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h2 className="text-sm md:text-base font-bold text-amber-100 tracking-wide">PAINEL DE CONTROLE</h2>
                      <p className="text-[10px] text-amber-400/70 uppercase tracking-widest">Sistema Operacional</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-medium">ATIVO</span>
                  </div>
                </div>
                
                {/* Tabs Grid - Compact and Professional */}
                <TabsList className="bg-gradient-to-br from-slate-800/80 via-slate-900/70 to-slate-800/80 border border-amber-500/15 sm:border-2 sm:border-amber-500/20 p-1.5 sm:p-2 md:p-2.5 h-auto grid grid-cols-5 lg:grid-cols-9 gap-1 sm:gap-1.5 md:gap-2 rounded-lg sm:rounded-xl shadow-inner">
                  <TabsTrigger 
                    value="equipe" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-400 data-[state=active]:via-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-amber-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-amber-300 text-amber-200/70 hover:text-amber-100"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Equipe</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="plantoes" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-400 data-[state=active]:via-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-orange-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-orange-300 text-orange-200/70 hover:text-orange-100"
                  >
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Plantões</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="bh" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-400 data-[state=active]:via-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-emerald-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-emerald-300 text-emerald-200/70 hover:text-emerald-100"
                  >
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">BH</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="folgas" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-400 data-[state=active]:via-violet-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-purple-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-purple-300 text-purple-200/70 hover:text-purple-100"
                  >
                    <CalendarOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Folgas</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="agenda" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-400 data-[state=active]:via-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-cyan-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-cyan-300 text-cyan-200/70 hover:text-cyan-100"
                  >
                    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Agenda</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="planejador" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-rose-400 data-[state=active]:via-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-rose-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-rose-300 text-rose-200/70 hover:text-rose-100"
                  >
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Plan</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="permutas" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-400 data-[state=active]:via-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-yellow-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-yellow-300 text-yellow-200/70 hover:text-yellow-100"
                  >
                    <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Troca</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="chat" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-400 data-[state=active]:via-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-blue-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-blue-300 text-blue-200/70 hover:text-blue-100"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Chat</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="config" 
                    className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] md:text-xs p-1.5 sm:p-2 md:p-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-slate-400 data-[state=active]:via-gray-500 data-[state=active]:to-zinc-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-slate-500/20 data-[state=active]:scale-[1.02] rounded-lg sm:rounded-xl font-semibold sm:font-bold transition-all duration-200 hover:bg-slate-500/15 min-h-[42px] sm:min-h-[52px] md:min-h-[60px] border border-slate-600/40 data-[state=active]:border-slate-300 text-slate-200/70 hover:text-slate-100"
                  >
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="tracking-wide leading-tight">Config</span>
                  </TabsTrigger>
                </TabsList>
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

              <TabsContent value="equipe" className="space-y-2 sm:space-y-3 animate-fade-in mt-0">
                {/* Admin Announcements Panel - Priority Display */}
                <AdminAnnouncementsPanel 
                  agentId={agent.id}
                  agentUnitId={agent.unit_id}
                  agentTeam={agent.team}
                />

                {/* Unit Summary Card */}
                <UnitSummaryCard unitId={agent.unit_id} />
                
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 md:gap-4">
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

              <TabsContent value="plantoes" className="space-y-3 md:space-y-4 animate-fade-in">
                {/* Next Shift Countdown - Top Priority */}
                <NextShiftCountdown agentId={agent.id} agentName={agent.name} agentUnitId={agent.unit_id} agentTeam={agent.team} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                  <ProfessionalShiftTimer agentId={agent.id} />
                  <ShiftScheduleCard agentId={agent.id} />
                </div>
                <ShiftCalendarOverview agentId={agent.id} />
              </TabsContent>

              <TabsContent value="bh" className="space-y-5 md:space-y-6 animate-fade-in">
                <BHTracker agentId={agent.id} />
              </TabsContent>

              <TabsContent value="folgas" className="space-y-4 animate-fade-in">
                <LeaveRequestCard 
                  agentId={agent.id} 
                  agentTeam={agent.team}
                  agentUnitId={agent.unit_id}
                />
              </TabsContent>

              <TabsContent value="agenda" className="space-y-4 animate-fade-in">
                <AgentEventsCard agentId={agent.id} />
              </TabsContent>

              <TabsContent value="planejador" className="space-y-4 animate-fade-in">
                <ShiftPlannerCard agentId={agent.id} />
              </TabsContent>

              <TabsContent value="permutas" className="space-y-4 animate-fade-in">
                <SwapRequestsCard 
                  agentId={agent.id} 
                  unitId={agent.unit_id}
                  team={agent.team}
                />
              </TabsContent>

              <TabsContent value="chat" className="space-y-4 animate-fade-in">
                <ChatPanel 
                  agentId={agent.id} 
                  unitId={agent.unit_id}
                  team={agent.team}
                  agentName={agent.name}
                  agentRole={(agent as any).role}
                  agentAvatarUrl={(agent as any).avatar_url}
                />
              </TabsContent>

              <TabsContent value="config" className="space-y-4 md:space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
                  <AgentSettingsCard
                    agentId={agent.id}
                    agentName={agent.name}
                    currentEmail={agent.email}
                    currentAvatarUrl={(agent as any).avatar_url}
                    onUpdate={() => window.location.reload()}
                  />
                  <div className="space-y-4 md:space-y-5">
                    <ChatAndAlertSettings agentId={agent.id} />
                    <NotificationSettings />
                    <BHReminderSettings agentId={agent.id} />
                    
                    {/* Diagnostic Tools Section */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 border-slate-600/50 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
                      <h3 className="font-semibold text-sm md:text-base flex items-center gap-2 text-slate-200">
                        <Settings className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
                        Ferramentas de Diagnóstico
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400">
                        Resolva problemas de conexão ou sessão.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <DiagnosticReportButton />
                        <SafeModeToggle variant="compact" />
                      </div>
                    </div>

                    {/* Password & Security Section */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-slate-900/80 border-2 border-purple-500/30 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
                      <h3 className="font-semibold text-sm md:text-base flex items-center gap-2 text-slate-200">
                        <Key className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
                        Segurança da Conta
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400">
                        Altere sua senha via solicitação.
                      </p>
                      <div className="flex flex-wrap gap-2">
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

            {/* Footer Credits - Compact */}
            <div className="text-center text-[10px] md:text-xs text-muted-foreground py-2 border-t border-border/30">
              <p>Desenvolvido por <span className="text-primary font-semibold">Franc D'nis</span> • Feijó, Acre</p>
            </div>
          </div>
        </main>
      </div>
    </ThemedPanelBackground>

    {/* Welcome Trial Dialog */}
    {showWelcomeDialog && agent && (
      <WelcomeTrialDialog 
        agentName={agent.name} 
        onClose={() => setShowWelcomeDialog(false)} 
      />
    )}

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
