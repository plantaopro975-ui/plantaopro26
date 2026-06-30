import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-tactical-ops.jpg';
import iconShield from '@/assets/icons-3d/shield.png';
import iconRadar from '@/assets/icons-3d/radar.png';
import iconHelmet from '@/assets/icons-3d/helmet.png';
import iconCommand from '@/assets/icons-3d/command.png';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  agentCount?: number;
  unitsCount?: number;
}

const PILLARS = [
  { icon: iconShield, label: 'Proteção', value: 'RLS · AES-256' },
  { icon: iconRadar, label: 'Monitoramento', value: 'Tempo real' },
  { icon: iconHelmet, label: 'Operações', value: '24/7 ativo' },
  { icon: iconCommand, label: 'Comando', value: 'Integrado' },
];

/**
 * Obsidian Steel — Tactical public-safety hero with realistic 3D icons.
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
      style={{ minHeight: 'clamp(320px, 42vh, 480px)' }}
    >
      <img
        src={heroImage}
        alt="Centro de operações táticas"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" aria-hidden />

      <div className="relative z-10 h-full flex flex-col justify-between px-5 sm:px-8 lg:px-12 py-5 sm:py-7 lg:py-8">
        {/* eyebrow */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/30 bg-background/50 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary/95">
              ISE · Acre · Tático
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground/70 font-medium">
            <Radio className="h-3 w-3 text-primary/70" />
            Op. 24/7
          </div>
        </div>

        {/* headline + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6 items-end">
          <div className="max-w-2xl">
            <h1
              className="text-2xl sm:text-3xl lg:text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-foreground"
              style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
            >
              Comando integrado da{' '}
              <span className="text-primary">Segurança Socioeducativa</span>
            </h1>
            <p className="mt-2.5 max-w-lg text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
              Plataforma tática dos agentes — escalas, banco de horas e
              controle operacional sob arquitetura blindada.
            </p>

            {onPrimaryAction && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-semibold tracking-wide transition-all hover:bg-primary/90 hover:translate-y-[-1px] shadow-[0_8px_24px_-8px_hsl(199_75%_52%/0.55)]"
                  aria-label="Acessar plataforma"
                >
                  Acessar plataforma
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <div className="flex items-stretch gap-px rounded-md overflow-hidden border border-border/50 bg-background/40 backdrop-blur-md">
                  <Stat value={agentCount} label="Agentes" />
                  <Stat value={unitsCount} label="Unidades" />
                  <Stat value="24/7" label="Ativo" />
                </div>
              </div>
            )}
          </div>

          {/* 3D realistic icon grid */}
          <ul className="grid grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
            {PILLARS.map((p) => (
              <li
                key={p.label}
                className="group relative flex flex-col items-center lg:flex-row lg:items-center lg:gap-3 p-2 sm:p-3 rounded-lg border border-border/50 bg-background/40 backdrop-blur-md hover:border-primary/45 hover:bg-background/55 transition-all"
              >
                <img
                  src={p.icon}
                  alt=""
                  loading="lazy"
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(46,163,216,0.35)] transition-transform group-hover:scale-105"
                />
                <div className="text-center lg:text-left mt-1 lg:mt-0">
                  <div className="text-[10px] sm:text-xs font-semibold text-foreground tracking-wide">
                    {p.label}
                  </div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-muted-foreground/75 leading-none mt-0.5">
                    {p.value}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* footer status */}
        <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground/65 tracking-wider uppercase">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Status nominal
          </span>
          <span className="hidden md:inline font-mono text-[9px] text-muted-foreground/55">
            ENC-AES256 · RLS-VERIFIED
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
