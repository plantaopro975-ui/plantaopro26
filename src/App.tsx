import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { useGlobalNavigation } from "@/hooks/useGlobalNavigation";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { GlobalOfflineBanner } from "@/components/OfflineIndicator";
import { ReconnectingGuard } from "@/components/ReconnectingGuard";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import UnitDashboard from "./pages/UnitDashboard";
import Agents from "./pages/Agents";
import AgentProfile from "./pages/AgentProfile";
import AgentPanel from "./pages/AgentPanel";
import AgentProfileEdit from "./pages/AgentProfileEdit";
import Admin from "./pages/Admin";

import Overtime from "./pages/Overtime";
import Units from "./pages/Units";
import UnitsAudit from "./pages/UnitsAudit";
import Settings from "./pages/Settings";

import Master from "./pages/Master";
import Install from "./pages/Install";
import About from "./pages/About";
import Agenda from "./pages/Agenda";
import NotFound from "./pages/NotFound";
import DebugAuth from "./pages/DebugAuth";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ConfirmProvider } from "@/components/ui/confirm-provider";

const queryClient = new QueryClient();

// Wrapper component to handle global navigation (ESC key and logout redirect)
function GlobalNavigationHandler({ children }: { children: React.ReactNode }) {
  useGlobalNavigation({ enabled: true });
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FontSizeProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ConfirmProvider>
              <GlobalNavigationHandler>
                {/* Global Offline Banner */}
                <GlobalOfflineBanner />
                {/* Reconnecting Guard - Shows recovery screen instead of redirecting */}
                <ReconnectingGuard maxWaitTime={15000}>
                  <Routes>
                    {/* Shared shell: Header rendered globally on these routes */}
                    <Route element={<AppShell />}>
                      <Route path="/" element={<Index />} />
                      <Route
                        path="/dashboard"
                        element={
                          <RequireAuth mode="block">
                            <Dashboard />
                          </RequireAuth>
                        }
                      />
                      <Route
                        path="/master"
                        element={
                          <RequireAuth mode="block" requireMaster>
                            <Master />
                          </RequireAuth>
                        }
                      />
                    </Route>

                    <Route path="/auth" element={<Navigate to="/" replace />} />
                    <Route
                      path="/admin"
                      element={
                        <RequireAuth mode="block">
                          <Admin />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/agent-panel"
                      element={
                        <RequireAuth mode="block">
                          <AgentPanel />
                        </RequireAuth>
                      }
                    />
                    <Route path="/agent-profile" element={<AgentProfileEdit />} />
                    <Route path="/agent-profile-edit" element={<AgentProfileEdit />} />
                    <Route path="/unit/:unitId" element={<UnitDashboard />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/agents/:id" element={<AgentProfile />} />

                    <Route path="/overtime" element={<Overtime />} />
                    <Route path="/units" element={<Units />} />
                    <Route
                      path="/admin/units-audit"
                      element={
                        <RequireAuth mode="block" requireMaster>
                          <UnitsAudit />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <RequireAuth mode="block">
                          <Settings />
                        </RequireAuth>
                      }
                    />

                    <Route path="/install" element={<Install />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/agenda" element={<Agenda />} />

                    {/* Debug */}
                    <Route path="/debug/auth" element={<DebugAuth />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ReconnectingGuard>
                {/* PWA Install Prompt - Shows on all pages when installable */}
                <PWAInstallPrompt />
              </GlobalNavigationHandler>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </FontSizeProvider>
  </QueryClientProvider>
);

export default App;
