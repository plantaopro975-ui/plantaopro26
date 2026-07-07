import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  mode = "redirect",
  redirectTo = "/",
  requireMaster = false,
}) => {
  const { user, isLoading, masterSession, isMaster, userRole } = useAuth();
  const location = useLocation();

  // Espera hidratação: se há user mas o papel ainda não foi resolvido, aguarda.
  const roleHydrating = !!user && userRole === null && !masterSession;
  if (isLoading || roleHydrating) {
    return <AuthLoader />;
  }

  const isAuthenticated = !!user || !!masterSession;
  if (!isAuthenticated) {
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

