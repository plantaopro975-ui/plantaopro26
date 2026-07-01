import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-noir-gold.jpg';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadar from '@/assets/icons-3d/noir-radar.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconCommand from '@/assets/icons-3d/noir-command.png';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  agentCount?: number;
  unitsCount?: number;
}

const BENTO = [
  { icon: iconShield, label: 'Proteção', value: 'RLS · AES-256' },
  { icon: iconRadar, label: 'Monitoramento', value: 'Tempo real' },
  { icon: iconHelmet, label: 'Operações', value: '24/7 ativo' },
  { icon: iconCommand, label: 'Comando', value: 'Integrado' },
];

/**
 * Noir & Gold — Hero + Bento layout, editorial premium.
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
      style={{ minHeight: 'clamp(360px, 46vh, 520px)' }}
    >
      <img
        src={heroImage}
        alt="Sala de comando noir & gold"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" aria-hidden />

      <div className="relative z-10 h-full flex flex-col justify-between px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* eyebrow */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-primary/30 bg-background/50 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-primary/95 font-sans">
              ISE · Acre · Comando
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-[0.24em] uppercase text-muted-foreground/70 font-medium font-sans">
            <Radio className="h-3 w-3 text-primary/70" />
            Op. 24/7
          </div>
        </div>

        {/* Headline + Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr,1fr] gap-6 lg:gap-10 items-end">
          <div className="max-w-2xl">
            <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.05] tracking-tight text-foreground font-serif">
              Segurança Socioeducativa,{' '}
              <span className="italic text-primary">refinada</span>.
            </h1>
            <p className="mt-4 max-w-lg text-sm sm:text-[15px] text-muted-foreground/90 leading-relaxed font-sans">
              Plataforma institucional de escalas, banco de horas e comando
              operacional — arquitetura blindada, estética editorial.
            </p>

            {onPrimaryAction && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-primary text-primary-foreground text-[13px] font-semibold tracking-[0.14em] uppercase font-sans transition-all hover:bg-primary/90 hover:translate-y-[-1px] shadow-[0_10px_28px_-10px_hsl(42_55%_54%/0.55)]"
                  aria-label="Acessar plataforma"
                >
                  Acessar plataforma
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <div className="flex items-stretch gap-px rounded-sm overflow-hidden border border-border/60 bg-background/40 backdrop-blur-md">
                  <Stat value={agentCount} label="Agentes" />
                  <Stat value={unitsCount} label="Unidades" />
                  <Stat value="24/7" label="Ativo" />
                </div>
              </div>
            )}
          </div>

          {/* Bento — 3D noir & gold icons */}
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {BENTO.map((p, i) => (
              <li
                key={p.label}
                className={`group relative flex items-center gap-3 p-3 sm:p-4 rounded-sm border border-border/60 bg-background/50 backdrop-blur-md hover:border-primary/50 hover:bg-background/65 transition-all ${
                  i === 0 ? 'col-span-2 sm:col-span-1' : ''
                }`}
              >
                <img
                  src={p.icon}
                  alt=""
                  loading="lazy"
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain shrink-0 drop-shadow-[0_4px_12px_rgba(201,168,76,0.35)] transition-transform group-hover:scale-105"
                />
                <div className="min-w-0">
                  <div className="text-[13px] sm:text-sm font-semibold text-foreground tracking-tight font-serif">
                    {p.label}
                  </div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-muted-foreground/75 leading-none mt-1 font-sans">
                    {p.value}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* footer status */}
        <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground/65 tracking-[0.22em] uppercase font-sans">
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
    <div className="px-4 py-2 bg-background/30 text-center">
      <div className="text-base font-bold text-primary leading-none font-serif">
        {value}
      </div>
      <div className="mt-1 text-[9px] tracking-[0.2em] uppercase text-muted-foreground/80 font-sans">
        {label}
      </div>
    </div>
  );
}
