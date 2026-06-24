import { ArrowRight, Shield, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-ise-acre.jpg';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  agentCount?: number;
  unitsCount?: number;
}

/**
 * Cinematic institutional hero — Sistema Socioeducativo do Acre.
 * Realistic photography overlay with navy-amber palette and Sora display type.
 */
export function HeroCinematic({ onPrimaryAction, agentCount, unitsCount }: HeroCinematicProps) {
  return (
    <section
      className="relative w-full overflow-hidden hero-cinematic rounded-2xl border border-border/60"
      aria-label="Sistema Socioeducativo Integrado do Acre"
    >
      {/* Background photograph */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />

      {/* Cinematic overlay (left-weighted readability) */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--gradient-hero-overlay)' }}
        aria-hidden="true"
      />

      {/* Bottom navy fade for footer separation */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-10 lg:px-14 py-8 sm:py-12 lg:py-16 max-w-6xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="command-badge">
            <Radio className="h-3 w-3 animate-pulse" />
            Operação Ativa
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            <Shield className="h-3 w-3" />
            ISE / ACRE
          </span>
        </div>

        <h1 className="font-display font-extrabold leading-[0.95] text-foreground text-glow-amber">
          <span className="block text-3xl sm:text-5xl lg:text-6xl">Sistema Socioeducativo</span>
          <span className="block text-2xl sm:text-4xl lg:text-5xl mt-1 bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
            Integrado do Acre
          </span>
        </h1>

        <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base lg:text-lg text-muted-foreground/90 leading-relaxed">
          Plataforma operacional dos agentes socioeducativos — escalas, banco de horas,
          comunicação tática e controle institucional em tempo real.
        </p>

        {onPrimaryAction && (
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="group inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm sm:text-base uppercase tracking-wider transition-all hover:scale-[1.02] glow-ring-amber"
              aria-label="Acessar painel operacional"
            >
              Acessar Painel
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="hidden sm:flex items-center gap-4 ml-2 text-xs text-muted-foreground">
              {typeof agentCount === 'number' && (
                <div className="flex flex-col">
                  <span className="font-display font-bold text-foreground text-base">{agentCount}</span>
                  <span className="uppercase tracking-widest text-[10px]">Agentes</span>
                </div>
              )}
              {typeof unitsCount === 'number' && (
                <>
                  <span className="h-8 w-px bg-border" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-foreground text-base">{unitsCount}</span>
                    <span className="uppercase tracking-widest text-[10px]">Unidades</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Corner tactical accents */}
      <div className="absolute top-0 left-0 w-10 h-10 border-l-2 border-t-2 border-primary/60 rounded-tl-2xl" aria-hidden="true" />
      <div className="absolute top-0 right-0 w-10 h-10 border-r-2 border-t-2 border-primary/60 rounded-tr-2xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-10 h-10 border-l-2 border-b-2 border-primary/60 rounded-bl-2xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-10 h-10 border-r-2 border-b-2 border-primary/60 rounded-br-2xl" aria-hidden="true" />
    </section>
  );
}
