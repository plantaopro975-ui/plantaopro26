import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { useGlobalNavigation } from "@/hooks/useGlobalNavigation";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { GlobalOfflineBanner } from "@/components/OfflineIndicator";
import { ReconnectingGuard } from "@/components/ReconnectingGuard";
import Index from "./pages/Index"; // eager: LCP route
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ConfirmProvider } from "@/components/ui/confirm-provider";
import { SingleDeviceGuard } from "@/components/SingleDeviceGuard";
import { SplashScreen } from "@/components/SplashScreen";
import { PanelSkeleton } from "@/components/ui/panel-skeleton";
import { InactivityGuard } from "@/components/InactivityGuard";

// Lazy-loaded routes — split into async chunks to shrink initial bundle
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UnitDashboard = lazy(() => import("./pages/UnitDashboard"));
const Agents = lazy(() => import("./pages/Agents"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
const AgentPanel = lazy(() => import("./pages/AgentPanel"));
const AgentProfileEdit = lazy(() => import("./pages/AgentProfileEdit"));
const Admin = lazy(() => import("./pages/Admin"));
const Overtime = lazy(() => import("./pages/Overtime"));
const Units = lazy(() => import("./pages/Units"));
const UnitsAudit = lazy(() => import("./pages/UnitsAudit"));
const Settings = lazy(() => import("./pages/Settings"));
const Master = lazy(() => import("./pages/Master"));
const Install = lazy(() => import("./pages/Install"));
const About = lazy(() => import("./pages/About"));
const Agenda = lazy(() => import("./pages/Agenda"));
const RoundsHistory = lazy(() => import("./pages/RoundsHistory"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DebugAuth = lazy(() => import("./pages/DebugAuth"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Wrapper component to handle global navigation (ESC key and logout redirect)
function GlobalNavigationHandler({ children }: { children: React.ReactNode }) {
  useGlobalNavigation({ enabled: true });
  return <>{children}</>;
}

// Prefetch the most likely next-routes while browser is idle,
// so authenticated users open the panel/admin instantly on weak links.
function RoutePrefetcher() {
  useEffect(() => {
    const idle =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => setTimeout(cb, 1200));
    const cancel =
      (window as any).cancelIdleCallback || ((id: number) => clearTimeout(id));
    const handle = idle(() => {
      // Fire-and-forget dynamic imports; Vite will fetch the chunks.
      import("./pages/AgentPanel");
      import("./pages/Dashboard");
      import("./pages/Admin");
    });
    return () => cancel(handle);
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FontSizeProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SplashScreen />
          <BrowserRouter>
            <AuthProvider>
              <ConfirmProvider>
              <GlobalNavigationHandler>
                <RoutePrefetcher />
                <SingleDeviceGuard />
                {/* Global Offline Banner */}
                <GlobalOfflineBanner />

                {/* Reconnecting Guard - Shows recovery screen instead of redirecting */}
                <ReconnectingGuard maxWaitTime={15000}>
                  <Suspense fallback={<PanelSkeleton />}>
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
                      <Route
                        path="/rounds-history"
                        element={
                          <RequireAuth mode="block">
                            <RoundsHistory />
                          </RequireAuth>
                        }
                      />

                      {/* Debug */}
                      <Route path="/debug/auth" element={<DebugAuth />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ReconnectingGuard>
                {/* PWA Install Prompt - Shows on all pages when installable */}
                <PWAInstallPrompt />
              </GlobalNavigationHandler>
              </ConfirmProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </FontSizeProvider>
  </QueryClientProvider>
);

export default App;
