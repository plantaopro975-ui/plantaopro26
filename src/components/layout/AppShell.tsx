import { Outlet } from 'react-router-dom';
import { Header } from './Header';

/**
 * Shared shell that guarantees the global Header is rendered on every
 * route wrapped by it. Use for /, /dashboard, /master (and future pages)
 * to eliminate divergent header implementations.
 */
export function AppShell() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
