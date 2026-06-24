import { Shield, Calendar, Clock, MessageSquare, BarChart3, Radio } from 'lucide-react';

/**
 * Institutional pillars bento grid — surfaces the platform capabilities
 * to visitors on the public homepage without exposing authenticated routes.
 */
const pillars: Array<{
  icon: typeof Shield;
  title: string;
  desc: string;
  span: string;
  accent?: boolean;
}> = [
    icon: Shield,
    title: 'Controle Tático',
    desc: 'Equipes ALFA, BRAVO, CHARLIE e DELTA com isolamento por unidade e RLS auditável.',
    span: 'sm:col-span-2 sm:row-span-2',
    accent: true,
  },
  {
    icon: Calendar,
    title: 'Escalas Inteligentes',
    desc: 'Plantões, trocas e calendário 24/7 com detecção de conflitos.',
    span: '',
  },
  {
    icon: Clock,
    title: 'Banco de Horas',
    desc: 'Quinzenas independentes com limites hierárquicos.',
    span: '',
  },
  {
    icon: MessageSquare,
    title: 'Chat Tático',
    desc: 'Comunicação por unidade e equipe em tempo real.',
    span: '',
  },
  {
    icon: BarChart3,
    title: 'Painel Master',
    desc: 'Visão consolidada de 9 unidades socioeducativas do Acre.',
    span: '',
  },
  {
    icon: Radio,
    title: 'Operação 24/7',
    desc: 'Alarmes inteligentes, notificações push e modo offline.',
    span: '',
  },
] as const;

export function InstitutionalPillars() {
  return (
    <section
      className="w-full max-w-6xl mx-auto px-3 sm:px-0 py-6 sm:py-10"
      aria-label="Pilares institucionais do sistema"
    >
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-foreground leading-tight">
            Plataforma Operacional
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
            Tecnologia de comando e controle dedicada aos agentes socioeducativos.
          </p>
        </div>
        <span className="hidden sm:inline-flex command-badge">ISE · ACRE</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 auto-rows-[120px] sm:auto-rows-[140px]">
        {pillars.map(({ icon: Icon, title, desc, span, accent }, i) => (
          <article
            key={title}
            className={[
              'group relative overflow-hidden rounded-xl border border-border/60 p-4 sm:p-5',
              'institutional-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50',
              'animate-fade-in',
              span,
              accent ? 'bg-gradient-to-br from-card via-card to-secondary/40' : 'bg-card/80',
            ].join(' ')}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-start justify-between gap-3 h-full">
              <div className="flex flex-col h-full">
                <div
                  className={[
                    'inline-flex items-center justify-center rounded-lg w-9 h-9 mb-3 shrink-0',
                    accent
                      ? 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(38_92%_50%/0.4)]'
                      : 'bg-primary/10 text-primary',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-sm sm:text-base text-foreground leading-tight">
                  {title}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-snug line-clamp-3">
                  {desc}
                </p>
              </div>
            </div>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-primary/30 rounded-tr-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </article>
        ))}
      </div>
    </section>
  );
}
