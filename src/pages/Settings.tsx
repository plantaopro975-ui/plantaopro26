import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Shield, Loader2, Palette, Sparkles, ArrowLeft, Bell, Volume2 } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/ChangePasswordDialog';
import { useBackNavigation } from '@/hooks/useBackNavigation';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ConnectedDevicesCard } from '@/components/settings/ConnectedDevicesCard';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const { user, isLoading, userRole, masterSession } = useAuth();
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  
  // Enable ESC key navigation - get goBack function
  const { goBack } = useBackNavigation({ enabled: true, fallbackPath: '/dashboard' });

  // Redirect only after loading is complete and ONLY if not offline
  useEffect(() => {
    if (isLoading) return;
    
    // Don't redirect if we have any valid session
    if (user || masterSession) return;
    
    // Check if offline - don't redirect
    if (!navigator.onLine) return;
    
    // Small delay to ensure state is settled
    const timer = setTimeout(() => {
      // Final check before redirect
      if (!navigator.onLine) return;
      navigate('/', { replace: true });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, masterSession, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !masterSession) return null;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            {/* Page Header */}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                Configurações Gerais
              </h1>
              <p className="text-muted-foreground">
                Personalize o sistema e gerencie preferências globais
              </p>
            </div>

            {/* Theme Section */}
            <Card className="glass glass-border shadow-card overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Tema Visual
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-sm">
                    <div className="text-muted-foreground">
                      Tema atual: <span className="font-medium text-primary">{themeConfig.emoji} {themeConfig.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      A personalização do tema visual do sistema é definida pelo administrador no painel administrativo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card className="glass glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure alertas e avisos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas de plantão no navegador
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sons do Sistema</Label>
                    <p className="text-sm text-muted-foreground">
                      Tocar sons para alertas importantes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Connected Devices - Only for logged in users */}
            {user && <ConnectedDevicesCard />}

            {/* Password Section - Only for regular users, not master session */}
            {user && (
              <Card className="glass glass-border shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Segurança da Conta
                  </CardTitle>
                  <CardDescription>
                    Gerencie a segurança do seu acesso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm text-muted-foreground">
                        Mantenha sua conta segura com uma senha forte
                      </p>
                    </div>
                    <ChangePasswordDialog />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Role Section */}
            <Card className="glass glass-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permissões
                </CardTitle>
                <CardDescription>
                  Seu nível de acesso no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label>Função atual:</Label>
                  <Badge
                    variant={userRole === 'master' || userRole === 'admin' || masterSession ? 'default' : 'secondary'}
                    className="text-sm"
                  >
                    {masterSession && !userRole && 'Master'}
                    {userRole === 'master' && 'Master'}
                    {userRole === 'admin' && 'Administrador'}
                    {userRole === 'user' && 'Usuário'}
                    {!userRole && !masterSession && 'Usuário'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {userRole === 'master' || userRole === 'admin' || masterSession
                    ? 'Você tem acesso total ao sistema, incluindo gestão de agentes, escalas e banco de horas.'
                    : 'Você tem acesso de visualização às escalas e informações do sistema.'}
                </p>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card className="glass glass-border shadow-card">
              <CardHeader>
                <CardTitle>Sobre o PlantãoPro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-mono">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build</span>
                  <span className="font-mono">2024.01</span>
                </div>
              </CardContent>
            </Card>

            {/* Developer Credit */}
            <div className="text-center pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Desenvolvido por <span className="text-primary font-semibold">CS FEIJÓ</span>
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Feijó, Acre • © {new Date().getFullYear()} PlantãoPro</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
