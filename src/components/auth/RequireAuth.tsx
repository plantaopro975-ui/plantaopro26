import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RestrictedArea } from "./RestrictedArea";

interface RequireAuthProps {
  children: React.ReactNode;
  /** 'redirect' envia visitantes ao login; 'block' mostra RestrictedArea. */
  mode?: "redirect" | "block";
  redirectTo?: string;
  /** Exige papel master (usuário master ou sessão master ativa). */
  requireMaster?: boolean;
}

/**
 * Loader branded — só aparece após ~350ms para evitar flash preto
 * em transições instantâneas (login/refresh de sessão válida).
 */
const AuthLoader: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 350);
    return () => window.clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,hsl(32_28%_10%)_0%,hsl(222_60%_3%)_70%)] text-amber-100/85"
    >
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border-2 border-amber-400/25" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-mono uppercase tracking-[0.35em] text-amber-300/80">
          Autenticando
        </span>
        <span className="text-xs text-amber-100/60">
          Validando sessão segura…
        </span>
      </div>
    </div>
  );
};

/**
 * Janela de graça (~1200 ms) para cobrir a corrida entre `signInWithPassword`
 * (que já popula a sessão no cliente supabase) e o `onAuthStateChange` que
 * atualiza o `user` no contexto React. Sem isso, o `<Navigate to="/">` dispara
 * antes do estado hidratar e o usuário vê: painel abre → skeleton escuro →
 * volta pro login.
 */
const GRACE_MS = 1200;

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  mode = "redirect",
  redirectTo = "/",
  requireMaster = false,
}) => {
  const { user, isLoading, masterSession, isMaster, userRole } = useAuth();
  const location = useLocation();

  const [graceElapsed, setGraceElapsed] = useState(false);
  const [cachedSession, setCachedSession] = useState<boolean | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Kick off a synchronous session check + start the grace timer on mount.
  useEffect(() => {
    if (mode !== "redirect") {
      setGraceElapsed(true);
      return;
    }
    let cancelled = false;
    // The supabase client caches the session synchronously after
    // signInWithPassword — check it before deciding to redirect.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled && mountedRef.current) {
          setCachedSession(!!data.session);
        }
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) setCachedSession(false);
      });

    const t = window.setTimeout(() => {
      if (mountedRef.current) setGraceElapsed(true);
    }, GRACE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [mode]);

  // Espera hidratação: se há user mas o papel ainda não foi resolvido, aguarda.
  const roleHydrating = !!user && userRole === null && !masterSession;
  if (isLoading || roleHydrating) {
    return <AuthLoader />;
  }

  const isAuthenticated = !!user || !!masterSession;

  if (!isAuthenticated) {
    if (mode === "redirect") {
      // Login race: `user` may still be null while supabase already holds a
      // valid session. Wait through the grace window before bouncing.
      if (!graceElapsed) return <AuthLoader />;
      if (cachedSession === true) return <AuthLoader />;
    }

    if (mode === "block") return <RestrictedArea />;
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname, authRequired: true }}
      />
    );
  }

  if (requireMaster && !isMaster && !masterSession) {
    return (
      <RestrictedArea
        title="Acesso Master Exclusivo"
        message="Este módulo é restrito ao Administrador Master do sistema."
      />
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
