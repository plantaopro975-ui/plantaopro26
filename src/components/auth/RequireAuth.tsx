import React from "react";
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
 * Guard de rota. Aguarda o carregamento inicial da sessão para
 * evitar redirecionamentos prematuros durante a hidratação.
 */
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
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm"
      >
        Verificando credenciais…
      </div>
    );
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

