import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { RestrictedAccessDialog } from '@/components/auth/RestrictedAccessDialog';
import {
  Users,
  Clock,
  LayoutDashboard,
  Settings,
  Shield,
  UserCircle,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: UserCircle, label: 'Meu Painel', href: '/agent-panel' },
  { icon: Users, label: 'Agentes', href: '/agents' },
  { icon: Clock, label: 'Banco de Horas', href: '/overtime' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

interface MobileSidebarProps {
  onNavigate: () => void;
}

export function MobileSidebar({ onNavigate }: MobileSidebarProps) {
  const location = useLocation();
  const { masterSession, user } = useAuth();
  const [restricted, setRestricted] = useState<string | null>(null);
  const isAuthed = !!user || !!masterSession;

  const renderItem = (
    item: { icon: typeof Users; label: string; href: string },
    opts?: { master?: boolean }
  ) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={(e) => {
          if (!isAuthed && !opts?.master) {
            e.preventDefault();
            setRestricted(item.label);
            return;
          }
          onNavigate();
        }}
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
          'text-sm font-medium tracking-tight',
          isActive
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
        )}
      >
        <span
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full transition-all',
            isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/40'
          )}
        />
        <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 transition-opacity',
            isActive ? 'opacity-60 text-primary' : 'opacity-0 group-hover:opacity-40'
          )}
        />
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-sidebar-border/60">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Shield className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-base leading-none tracking-wide text-gradient">
              PlantaoPro
            </h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
              Comando Operacional
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.16em]">
          Navegação
        </p>
        {navItems.map((item) => renderItem(item))}

        {masterSession && (
          <>
            <div className="my-3 h-px bg-sidebar-border/60" />
            <p className="px-3 pb-2 text-[10px] font-semibold text-primary/70 uppercase tracking-[0.16em]">
              Master
            </p>
            {renderItem(
              { icon: Shield, label: 'Painel Master', href: '/master' },
              { master: true }
            )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-sidebar-border/60 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          v1.0
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          © PlantaoPro
        </span>
      </div>

      <RestrictedAccessDialog
        open={!!restricted}
        onOpenChange={(o) => !o && setRestricted(null)}
        targetLabel={restricted ?? undefined}
      />
    </div>
  );
}
