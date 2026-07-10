import { Shield, Lock, KeyRound, Users2 } from 'lucide-react';

/**
 * Resumo institucional das regras de segurança aplicadas.
 * Renderizado apenas para administradores no cabeçalho da Central de Ronda.
 */
export function SecurityDoctrineCard({ color }: { color: string }) {
  const rules = [
    {
      Icon: Shield,
      title: 'RLS ativo em 100% das tabelas',
      body: 'Toda leitura e escrita passa por políticas Row-Level Security. Agentes só enxergam dados da própria unidade e equipe.',
    },
    {
      Icon: Lock,
      title: 'Bloqueio de força bruta',
      body: 'Após tentativas sucessivas com falha, a autenticação é temporariamente bloqueada e o evento é auditado.',
    },
    {
      Icon: KeyRound,
      title: 'Sessão e identidade',
      body: 'Sessões expiram em 72h. Login por CPF com senha forte. Master usa token isolado com escopo administrativo.',
    },
    {
      Icon: Users2,
      title: 'Isolamento por equipe',
      body: 'ALFA · BRAVO · CHARLIE · DELTA operam em canais segregados. Trocas exigem aprovação formal.',
    },
  ];

  return (
    <div
      className="mt-2 rounded-md border bg-card/60 p-2.5 sm:p-3"
      style={{ borderColor: `${color}33` }}
      role="note"
      aria-label="Resumo das regras de segurança"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div
          className="font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color, opacity: 0.85 }}
        >
          Segurança institucional · Somente administradores
        </div>
        <span className="hidden sm:inline text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          RLS · Anti-brute-force · Auditoria
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {rules.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="flex items-start gap-2 rounded-sm border border-border/50 bg-muted/20 px-2 py-1.5"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color }} />
            <div className="min-w-0">
              <div className="text-[11.5px] font-semibold text-foreground/95 leading-tight">
                {title}
              </div>
              <p className="text-[10.5px] leading-snug text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
