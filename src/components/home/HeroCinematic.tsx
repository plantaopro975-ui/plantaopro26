import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-command-3d.jpg';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  agentCount?: number;
  unitsCount?: number;
}

/**
 * Compact premium hero — Noir & Gold.
 * Photorealistic 3D command-room render, restrained typography.
 */
export function HeroCinematic({
  onPrimaryAction,
  agentCount = 248,
  unitsCount = 9,
}: HeroCinematicProps) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-xl border border-border/60 hero-cinematic"
      aria-label="Comando Operacional — Sistema Socioeducativo do Acre"
      style={{ minHeight: 'clamp(260px, 36vh, 420px)' }}
    >
      <img
        src={heroImage}
        alt="Sala de comando institucional"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />

      <div
        className="absolute inset-0"
        style={{ background: 'var(--gradient-hero-overlay)' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" aria-hidden />

      <div className="relative z-10 h-full flex flex-col justify-between px-5 sm:px-8 lg:px-12 py-5 sm:py-7 lg:py-9">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/25 bg-background/40 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-primary/90">
              ISE · Acre
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground/70 font-medium">
            <Radio className="h-3 w-3 text-primary/60" />
            24/7
          </div>
        </div>

        <div className="max-w-2xl">
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-[1.1] tracking-tight text-foreground"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            Comando integrado do{' '}
            <span className="text-primary">Sistema Socioeducativo</span>
          </h1>
          <p className="mt-2.5 max-w-lg text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
            Plataforma institucional dos agentes — escalas, banco de horas e
            controle operacional sob arquitetura segura.
          </p>

          {onPrimaryAction && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-semibold tracking-wide transition-all hover:bg-primary/90 hover:translate-y-[-1px]"
                aria-label="Acessar plataforma"
              >
                Acessar plataforma
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex items-stretch gap-px rounded-md overflow-hidden border border-border/50 bg-background/40 backdrop-blur-md">
                <Stat value={agentCount} label="Agentes" />
                <Stat value={unitsCount} label="Unidades" />
                <Stat value="24/7" label="Operação" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground/60 tracking-wider uppercase">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Status nominal
          </span>
          <span className="hidden md:inline font-mono text-[9px] text-muted-foreground/50">
            ENC-AES256 · RLS
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-3 sm:px-4 py-1.5 bg-background/30 text-center">
      <div className="text-sm sm:text-base font-semibold text-primary leading-none" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
        {value}
      </div>
      <div className="mt-1 text-[9px] tracking-[0.16em] uppercase text-muted-foreground/80">
        {label}
      </div>
    </div>
  );
}
