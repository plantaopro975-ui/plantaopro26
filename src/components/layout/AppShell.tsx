import { Outlet } from 'react-router-dom';

import { FirstLoginPasswordHint } from '@/components/onboarding/FirstLoginPasswordHint';

/**
 * Shared shell that guarantees the global Header is rendered on every
 * route wrapped by it. Use for /, /dashboard, /master (and future pages)
 * to eliminate divergent header implementations.
 */
export function AppShell() {
  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <main className="flex-1 min-h-0 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
      <FirstLoginPasswordHint />
    </div>
  );
}

