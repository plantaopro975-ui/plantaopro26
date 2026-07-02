import { ArrowLeft, Home, X, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PanelNavProps {
  onLogout?: () => void;
  onClose?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  showClose?: boolean;
  showLogout?: boolean;
  className?: string;
}

/**
 * Barra unificada de navegação para painéis internos (Master/Admin).
 * Voltar • Início • Fechar • Sair
 */
export function PanelNav({
  onLogout,
  onClose,
  showBack = true,
  showHome = true,
  showClose = true,
  showLogout = true,
  className,
}: PanelNavProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {showBack && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="h-8 gap-1.5 text-xs"
          title="Voltar"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
      )}
      {showHome && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="h-8 gap-1.5 text-xs"
          title="Ir para tela inicial"
        >
          <Home className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Início</span>
        </Button>
      )}
      {showClose && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => (onClose ? onClose() : navigate('/'))}
          className="h-8 gap-1.5 text-xs"
          title="Fechar painel"
        >
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Fechar</span>
        </Button>
      )}
      {showLogout && onLogout && (
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="h-8 gap-1.5 text-xs text-red-400 border-red-400/30 hover:bg-red-500/10"
          title="Encerrar sessão"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      )}
    </div>
  );
}
