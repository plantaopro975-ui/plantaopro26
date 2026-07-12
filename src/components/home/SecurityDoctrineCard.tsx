import { Shield, Lock, KeyRound, Users2, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Doctrina de segurança — versão compacta.
 * Barra única com chips clicáveis (tooltip com detalhe) para máxima densidade
 * sem sacrificar legibilidade. Renderizada só para administradores.
 */
export function SecurityDoctrineCard({ color }: { color: string }) {
  const rules = [
    {
      Icon: Shield,
      label: 'RLS 100%',
      title: 'RLS ativo em 100% das tabelas',
      body: 'Toda leitura/escrita passa por Row-Level Security. Agentes só enxergam dados da própria unidade e equipe.',
    },
    {
      Icon: Lock,
      label: 'Anti brute-force',
      title: 'Bloqueio de força bruta',
      body: 'Após tentativas sucessivas com falha, a autenticação é temporariamente bloqueada e o evento é auditado.',
    },
    {
      Icon: KeyRound,
      label: 'Sessão 72h · CPF',
      title: 'Sessão e identidade',
      body: 'Sessões expiram em 72h. Login por CPF com senha forte. Master usa token isolado com escopo administrativo.',
    },
    {
      Icon: Users2,
      label: 'Equipes segregadas',
      title: 'Isolamento por equipe',
      body: 'ALFA · BRAVO · CHARLIE · DELTA operam em canais segregados. Trocas exigem aprovação formal.',
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-md border bg-card/50 px-2.5 py-1.5"
        style={{ borderColor: `${color}2e` }}
        role="note"
        aria-label="Doutrina de segurança institucional"
      >
        {/* Header inline */}
        <div className="flex items-center gap-1.5 pr-2 mr-0.5 border-r border-border/40">
          <ShieldCheck className="h-3 w-3" style={{ color }} />
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.22em] whitespace-nowrap"
            style={{ color, opacity: 0.9 }}
          >
            Doutrina · Admin
          </span>
        </div>

        {/* Chips */}
        {rules.map(({ Icon, label, title, body }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-sm border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-border transition-colors px-1.5 py-0.5 cursor-help"
              >
                <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                <span className="text-[10.5px] font-medium text-foreground/90 whitespace-nowrap">
                  {label}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[260px]">
              <div className="text-[11px] font-semibold mb-0.5" style={{ color }}>{title}</div>
              <p className="text-[10.5px] leading-snug text-muted-foreground">{body}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Selo audit */}
        <span className="ml-auto hidden md:inline font-mono text-[9px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
          Auditoria contínua
        </span>
      </div>
    </TooltipProvider>
  );
}
