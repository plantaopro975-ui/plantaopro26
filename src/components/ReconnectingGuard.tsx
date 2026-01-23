import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ReconnectingGuardProps {
  children: React.ReactNode;
  /** Maximum time to wait for session recovery (ms) */
  maxWaitTime?: number;
}

export function ReconnectingGuard({
  children,
  maxWaitTime = 8000,
}: ReconnectingGuardProps) {
  const { user, session, isLoading, masterSession } = useAuth();
  const navigate = useNavigate();
  
  // Track if user was ever authenticated in this component lifecycle
  const wasAuthenticatedRef = useRef(false);
  const graceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingSessionRef = useRef(false);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }
    };
  }, []);

  // Verify if there's actually a session in Supabase
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (isCheckingSessionRef.current) return true;
    
    try {
      isCheckingSessionRef.current = true;
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      return !!currentSession;
    } catch {
      return false;
    } finally {
      isCheckingSessionRef.current = false;
    }
  }, []);

  // Update wasAuthenticated when we have a valid session
  useEffect(() => {
    if (user || session || masterSession) {
      wasAuthenticatedRef.current = true;
    }
  }, [user, session, masterSession]);

  // Handle session loss - NUNCA redirecionar prematuramente
  useEffect(() => {
    // Still loading - do nothing
    if (isLoading) return;

    // Verificar tokens armazenados
    const storedMasterToken = localStorage.getItem('master_token');
    const storedMasterUser = localStorage.getItem('master_user');

    // CRÍTICO: Master session SEMPRE bypassa tudo - NUNCA redirecionar
    if (masterSession || storedMasterToken || storedMasterUser) {
      wasAuthenticatedRef.current = true;
      return;
    }

    // Has valid session - all good
    if (user && session) {
      wasAuthenticatedRef.current = true;
      return;
    }

    // CRÍTICO: Se estamos nas rotas protegidas, NUNCA redirecionar automaticamente
    const protectedRoutes = ['/master', '/admin', '/dashboard', '/agent-panel', '/agents'];
    if (protectedRoutes.some(route => window.location.pathname.startsWith(route))) {
      // Dar tempo para sessão se recuperar
      return;
    }

    // User was authenticated before but now lost session
    if (wasAuthenticatedRef.current && !user && !session) {
      // Clear any existing grace timeout
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }

      // Tempo maior para recuperação
      graceTimeoutRef.current = setTimeout(async () => {
        // CRITICAL: Re-check todos os tokens antes de qualquer redirect
        const finalMasterCheck = localStorage.getItem('master_token');
        const finalMasterUser = localStorage.getItem('master_user');
        
        if (finalMasterCheck || finalMasterUser) {
          return; // Não redirecionar se há token master
        }

        // Double-check if we still don't have a session
        const hasSession = await verifySession();
        
        if (!hasSession) {
          const { data: { session: latestSession } } = await supabase.auth.getSession();
          
          // Só redirecionar se realmente não há sessão e não estamos em rotas protegidas
          if (!latestSession && window.location.pathname === '/agent-panel') {
            wasAuthenticatedRef.current = false;
            navigate('/', { replace: true });
          }
        }
      }, maxWaitTime + 2000); // Tempo extra de segurança
    }
  }, [user, session, isLoading, masterSession, verifySession, navigate, maxWaitTime]);

  // Always render children - no reconnecting UI
  return <>{children}</>;
}
