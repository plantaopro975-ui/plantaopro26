import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { pushDiagEvent } from '@/lib/diagLog';

type UserRole = 'admin' | 'user' | 'master';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isMaster: boolean;
  masterSession: string | null;
  setMasterSession: (username: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Prevent premature redirects on first paint:
  // some pages gate on isLoading=false && !user and redirect,
  // but Supabase can momentarily report null session before hydration.
  const hasInitializedRef = useRef(false);
  const [masterSession, setMasterSessionState] = useState<string | null>(() => {
    // Check both sessionStorage and localStorage for master session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('masterSession') || localStorage.getItem('master_user');
    }
    return null;
  });

  const setMasterSession = (username: string | null) => {
    if (username) {
      sessionStorage.setItem('masterSession', username);
      localStorage.setItem('master_user', username);
    } else {
      sessionStorage.removeItem('masterSession');
      localStorage.removeItem('master_user');
      localStorage.removeItem('master_token');
    }
    setMasterSessionState(username);
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Ignore abort errors silently - they're expected during cleanup
        if (error.message?.includes('abort') || error.message?.includes('AbortError')) {
          return;
        }
        console.error('Error fetching user role:', error);
        return;
      }

      if (data) {
        setUserRole(data.role as UserRole);
      }
    } catch (err: any) {
      // Ignore abort errors silently - common during component unmount/navigation
      if (err?.name === 'AbortError' || err?.message?.includes('abort') || err?.message?.includes('signal')) {
        return;
      }
      console.error('Error in fetchUserRole:', err);
    }
  };

  useEffect(() => {
    // CRÍTICO: Configurar listener ANTES de getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Diagnostics only (no tokens stored)
        pushDiagEvent('info', 'auth_state_change', {
          event,
          hasSession: !!newSession,
          userId: newSession?.user?.id ?? null,
          expiresAt: (newSession as any)?.expires_at ?? null,
          expiresIn: (newSession as any)?.expires_in ?? null,
        });

        // CRÍTICO: Não fazer nada em eventos de logout forçado durante refresh
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            setTimeout(() => {
              fetchUserRole(newSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          // Só limpa se realmente foi logout intencional
          const storedMaster = localStorage.getItem('master_token');
          if (!storedMaster) {
            setSession(null);
            setUser(null);
            setUserRole(null);
          }
        } else {
          // Para outros eventos, atualiza normalmente
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (newSession?.user) {
            setTimeout(() => {
              fetchUserRole(newSession.user.id);
            }, 0);
          } else if (!newSession) {
            setUserRole(null);
          }
        }

        // Do not end loading state until the initial getSession() completes.
        if (hasInitializedRef.current) {
          setIsLoading(false);
        }
      }
    );

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      pushDiagEvent('info', 'auth_get_session', {
        hasSession: !!initialSession,
        userId: initialSession?.user?.id ?? null,
        expiresAt: (initialSession as any)?.expires_at ?? null,
        expiresIn: (initialSession as any)?.expires_in ?? null,
      });

      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        fetchUserRole(initialSession.user.id);
      }

      hasInitializedRef.current = true;
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check rate limit
      const { data: canAttempt } = await supabase.rpc('check_rate_limit', {
        p_identifier: email,
        p_max_attempts: 5,
        p_window_minutes: 15
      });

      if (!canAttempt) {
        pushDiagEvent('warn', 'login_rate_limited', { identifier: email });
        return { error: new Error('Muitas tentativas de login. Tente novamente em 15 minutos.') };
      }

      pushDiagEvent('info', 'login_attempt', { identifier: email });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      // Record attempt
      await supabase.rpc('record_login_attempt', {
        p_identifier: email,
        p_success: !error,
        p_ip: null
      });

      if (error) {
        pushDiagEvent('error', 'login_failed', { identifier: email, message: error.message });
        return { error };
      }

      // Register access log for successful login
      if (data?.user?.id) {
        try {
          await supabase.from('access_logs').insert({
            agent_id: data.user.id,
            action: 'login',
            ip_address: null,
            user_agent: navigator.userAgent || null,
          });
        } catch (logErr) {
          console.warn('Failed to log access:', logErr);
        }
      }

      pushDiagEvent('info', 'login_success', { identifier: email });
      return { error: null };
    } catch (err) {
      pushDiagEvent('error', 'login_exception', { identifier: email, message: String((err as any)?.message ?? err) });
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      pushDiagEvent('info', 'signup_attempt', { identifier: email });

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        pushDiagEvent('error', 'signup_failed', { identifier: email, message: error.message });
        return { error };
      }

      pushDiagEvent('info', 'signup_success', { identifier: email });
      return { error: null };
    } catch (err) {
      pushDiagEvent('error', 'signup_exception', { identifier: email, message: String((err as any)?.message ?? err) });
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    pushDiagEvent('info', 'signout');
    
    // Register logout in access_logs before signing out
    if (user?.id) {
      try {
        await supabase.from('access_logs').insert({
          agent_id: user.id,
          action: 'logout',
          ip_address: null,
          user_agent: navigator.userAgent || null,
        });
      } catch (logErr) {
        console.warn('Failed to log logout:', logErr);
      }
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setMasterSession(null);
  };

  // IMPORTANT: do not derive privileges from client-side storage.
  // masterSession is only a UI session marker; actual privileges must come from backend roles.
  const isAdmin = userRole === 'admin' || userRole === 'master';
  const isMaster = userRole === 'master';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      userRole,
      signIn,
      signUp,
      signOut,
      isAdmin,
      isMaster,
      masterSession,
      setMasterSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

