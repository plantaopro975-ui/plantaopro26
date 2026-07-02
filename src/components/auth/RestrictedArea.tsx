import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface RestrictedAreaProps {
  title?: string;
  message?: string;
  /** Avisos institucionais (unidades do Acre) exibidos antes do acesso. */
  notices?: Array<{ unit: string; text: string }>;
}

const DEFAULT_NOTICES: Array<{ unit: string; text: string }> = [
  { unit: "ISE Rio Branco", text: "Operações normais. Efetivo em prontidão." },
  { unit: "ISE Feijó", text: "Plantão ativo — canal de rádio 24/7 operante." },
  { unit: "ISE Cruzeiro do Sul", text: "Sem ocorrências críticas nas últimas 24h." },
  { unit: "ISE Tarauacá", text: "Rotina institucional sem intercorrências." },
];

/**
 * Tela institucional exibida quando um visitante não autenticado
 * tenta acessar uma área restrita do sistema.
 */
export const RestrictedArea: React.FC<RestrictedAreaProps> = ({
  title = "Área Restrita",
  message = "Este módulo é de acesso exclusivo a agentes autenticados. Faça login para prosseguir.",
  notices = DEFAULT_NOTICES,
}) => {
  const navigate = useNavigate();
  return (
    <main
      role="alert"
      aria-labelledby="restricted-title"
      className="min-h-[70vh] flex items-center justify-center px-6 py-12"
    >
      <div className="max-w-lg w-full text-center space-y-6">
        <svg
          viewBox="0 0 96 96"
          className="mx-auto h-24 w-24 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path
            d="M48 6 L82 20 V46 C82 66 68 82 48 90 C28 82 14 66 14 46 V20 Z"
            fill="hsl(var(--primary) / 0.08)"
          />
          <rect x="34" y="46" width="28" height="22" rx="3" />
          <path d="M40 46 V36 a8 8 0 0 1 16 0 V46" />
          <circle cx="48" cy="56" r="2.5" fill="currentColor" />
          <path d="M48 58 v6" />
        </svg>
        <div className="space-y-2">
          <h1
            id="restricted-title"
            className="text-xl font-bold uppercase tracking-widest text-primary"
          >
            {title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        {notices.length > 0 && (
          <section
            aria-label="Avisos institucionais das unidades do Acre"
            className="text-left rounded-lg border border-border/60 bg-card/60 backdrop-blur px-4 py-3 space-y-2"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-primary/80">
              Painel Institucional — Unidades do Acre
            </h2>
            <ul className="space-y-1.5">
              {notices.map((n) => (
                <li
                  key={n.unit}
                  className="text-xs text-muted-foreground flex gap-2"
                >
                  <span className="font-semibold text-foreground/80 shrink-0">
                    {n.unit}:
                  </span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar à Home
          </Button>
          <Button onClick={() => navigate("/auth")}>Entrar no sistema</Button>
        </div>
      </div>
    </main>
  );
};

export default RestrictedArea;
