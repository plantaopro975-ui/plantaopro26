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

  // Handle session loss - silently redirect to home instead of showing UI
  // CRÍTICO: NUNCA redirecionar se há masterSession (painel Master)
  useEffect(() => {
    // Still loading - do nothing
    if (isLoading) return;

    // CRÍTICO: Master session SEMPRE bypassa tudo - NUNCA redirecionar
    if (masterSession) {
      // Garantir que o ref está setado para evitar redirects futuros
      wasAuthenticatedRef.current = true;
      return;
    }

    // Has valid session - all good
    if (user && session) return;

    // CRÍTICO: Se estamos na rota /master, NUNCA redirecionar
    if (window.location.pathname === '/master') {
      return;
    }

    // User was authenticated before but now lost session - redirect silently
    if (wasAuthenticatedRef.current && !user && !session) {
      // Clear any existing grace timeout
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }

      // Give Supabase time to recover the session before redirecting
      graceTimeoutRef.current = setTimeout(async () => {
        // CRITICAL: Re-check masterSession before any redirect
        const storedMaster = sessionStorage.getItem('masterToken') || localStorage.getItem('masterToken');
        if (storedMaster) {
          return; // Não redirecionar se há token master
        }

        // Double-check if we still don't have a session
        const hasSession = await verifySession();
        
        if (!hasSession) {
          // Check context state again (it may have updated)
          const { data: { session: latestSession } } = await supabase.auth.getSession();
          
          if (!latestSession && window.location.pathname !== '/master') {
            // Silently redirect to home - no UI shown
            wasAuthenticatedRef.current = false;
            navigate('/', { replace: true });
          }
        }
      }, maxWaitTime);
    }
  }, [user, session, isLoading, masterSession, verifySession, navigate, maxWaitTime]);

  // Always render children - no reconnecting UI
  return <>{children}</>;
}
