import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UseAuthGuardOptions {
  requireMasterSession?: boolean;
  requireUserSession?: boolean;
  allowBoth?: boolean;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, isLoading, masterSession } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  const { requireMasterSession = false, requireUserSession = false, allowBoth = true } = options;

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // CRÍTICO: Se estamos na rota /master, NUNCA redirecionar
    if (window.location.pathname === '/master') {
      setIsReady(true);
      return;
    }

    // CRÍTICO: Se há masterSession, NUNCA redirecionar
    if (masterSession) {
      setIsReady(true);
      return;
    }

    // Give more time for the session to be fully established
    // This prevents premature redirects during token refresh
    const timer = setTimeout(() => {
      let isAuthenticated = false;

      if (requireMasterSession && !requireUserSession) {
        // Only master session required (Master page)
        isAuthenticated = !!masterSession;
      } else if (requireUserSession && !requireMasterSession) {
        // Only user session required (AgentPanel)
        isAuthenticated = !!user;
      } else if (allowBoth) {
        // Allow either master session or user session (Dashboard, etc)
        isAuthenticated = !!user || !!masterSession;
      }

      // CRITICAL: Only redirect if we're SURE there's no session
      // and enough time has passed for token refresh to complete
      // NUNCA redirecionar se estamos em /master
      if (!isAuthenticated && !isLoading && window.location.pathname !== '/master') {
        // Double-check before redirecting
        setTimeout(() => {
          // Re-check auth state before actually redirecting
          // Check stored master token as well
          const storedMaster = sessionStorage.getItem('masterToken') || localStorage.getItem('masterToken');
          if (!user && !masterSession && !storedMaster && window.location.pathname !== '/master') {
            navigate('/auth', { replace: true });
          } else {
            setIsReady(true);
          }
        }, 500);
      } else {
        setIsReady(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, user, masterSession, navigate, requireMasterSession, requireUserSession, allowBoth]);

  // Return ready state only after auth check is complete
  const shouldRender = !isLoading && isReady && (
    (requireMasterSession && !requireUserSession && !!masterSession) ||
    (requireUserSession && !requireMasterSession && !!user) ||
    (allowBoth && (!!user || !!masterSession))
  );

  return {
    isLoading: isLoading || !isReady,
    isAuthenticated: shouldRender,
    user,
    masterSession,
  };
}
