import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-command-3d.jpg';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  agentCount?: number;
  unitsCount?: number;
}

/**
 * Premium institutional hero — Noir & Gold.
 * Sober 3D command-room render, Sora/Manrope typography, no neon glow.
 */
export function HeroCinematic({
  onPrimaryAction,
  agentCount = 248,
  unitsCount = 9,
}: HeroCinematicProps) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border border-border/70 hero-cinematic"
      aria-label="Comando Operacional — Sistema Socioeducativo do Acre"
      style={{ minHeight: 'clamp(320px, 44vh, 520px)' }}
    >
      <img
        src={heroImage}
        alt="Sala de comando institucional"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Premium overlay — restrained, deep noir */}
      <div
        className="absolute inset-0"
        style={{ background: 'var(--gradient-hero-overlay)' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" aria-hidden />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-8 sm:py-10 lg:py-14">
        {/* Top eyebrow */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-background/40 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-primary/90">
              ISE · Estado do Acre
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground/80 font-medium">
            <Radio className="h-3 w-3 text-primary/70" />
            Operação contínua · 24/7
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-3xl">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground"
            style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
          >
            Comando integrado do
            <span className="block bg-gradient-to-r from-primary via-amber-300/90 to-primary/80 bg-clip-text text-transparent">
              Sistema Socioeducativo
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Plataforma institucional dos agentes em serviço — escalas, banco de horas,
            comunicação e controle operacional sob arquitetura segura.
          </p>

          {onPrimaryAction && (
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold tracking-wide transition-all hover:bg-primary/90 hover:translate-y-[-1px] shadow-[0_8px_24px_-8px_hsl(43_55%_54%/0.5)]"
                aria-label="Iniciar protocolo de acesso"
              >
                Acessar plataforma
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex items-stretch gap-px rounded-md overflow-hidden border border-border/60 bg-background/40 backdrop-blur-md">
                <Stat value={agentCount} label="Agentes" />
                <Stat value={unitsCount} label="Unidades" />
                <Stat value="24/7" label="Operação" />
              </div>
            </div>
          )}
        </div>

        {/* Footer status */}
        <div className="flex items-center justify-between gap-3 text-[10px] sm:text-xs text-muted-foreground/70 tracking-wider uppercase">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Status nominal
          </span>
          <span className="hidden md:inline font-mono text-[10px] text-muted-foreground/60">
            ENC-AES256 · RLS-VERIFIED
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-4 sm:px-5 py-2.5 bg-background/30 text-center">
      <div className="text-lg sm:text-xl font-semibold text-primary leading-none" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>
        {value}
      </div>
      <div className="mt-1 text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
