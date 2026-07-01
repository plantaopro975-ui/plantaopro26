import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-noir-gold.jpg';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadio from '@/assets/icons-3d/noir-radio.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconCommand from '@/assets/icons-3d/noir-command.png';
import agentFigure from '@/assets/tactical-agent-figure.png';


type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  onTeamClick?: (team: TeamName) => void;
  agentCount?: number;
  unitsCount?: number;
}

const TEAMS: { name: TeamName; icon: string; motto: string; accent: string; anim: string }[] = [
  { name: 'ALFA',    icon: iconShield,  motto: 'Escudo · Proteção',   accent: 'from-emerald-400/25 to-transparent', anim: 'animate-team-shield' },
  { name: 'BRAVO',   icon: iconHelmet,  motto: 'Espada · Ação',       accent: 'from-orange-400/25 to-transparent', anim: 'animate-team-helmet' },
  { name: 'CHARLIE', icon: iconRadio,   motto: 'Rádio · Comunicação', accent: 'from-sky-400/25 to-transparent',    anim: 'animate-team-radio'  },
  { name: 'DELTA',   icon: iconCommand, motto: 'Raio · Resposta',     accent: 'from-amber-400/25 to-transparent',  anim: 'animate-team-float'  },
];


/**
 * Noir & Gold — Hero + Bento (equipes 3D).
 */
export function HeroCinematic({
  onPrimaryAction,
  onTeamClick,
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

      {/* Agente tático interativo — desktop only */}
      <img
        src={agentFigure}
        alt=""
        aria-hidden
        width={768}
        height={1280}
        loading="lazy"
        className="hidden lg:block pointer-events-none select-none absolute z-20 bottom-0 left-[38%] xl:left-[42%] h-[92%] w-auto object-contain object-bottom animate-team-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
        style={{ animationDuration: '6s' }}
      />


      <div className="relative z-10 h-full flex flex-col gap-6 px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
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

        {/* Headline + Team Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,1.15fr] gap-6 lg:gap-10 items-center flex-1">
          <div className="max-w-2xl">
            <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.05] tracking-tight text-foreground font-serif">
              Segurança Socioeducativa,{' '}
              <span className="italic text-primary">refinada</span>.
            </h1>
            <p className="mt-4 max-w-lg text-sm sm:text-[15px] text-muted-foreground/90 leading-relaxed font-sans">
              Selecione sua equipe para acessar o comando operacional —
              arquitetura blindada, estética editorial.
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

          {/* Teams — 3D noir & gold, clicáveis */}
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full" role="list" aria-label="Equipes operacionais">
            {TEAMS.map((t) => (
              <li key={t.name} className="flex">
                <button
                  type="button"
                  data-team-card
                  onClick={() => onTeamClick?.(t.name)}
                  className="group relative w-full flex flex-col items-center justify-center text-center gap-3 p-4 sm:p-5 lg:p-6 min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] rounded-sm border border-border/60 bg-background/55 backdrop-blur-md hover:border-primary/60 hover:bg-background/70 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"

                  aria-label={`Acessar equipe ${t.name}`}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${t.accent}`}
                  />
                  <img
                    src={t.icon}
                    alt=""
                    loading="lazy"
                    style={{ animationDelay: `${TEAMS.indexOf(t) * 0.6}s` }}
                    className={`${t.anim} relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 object-contain shrink-0 drop-shadow-[0_6px_18px_rgba(201,168,76,0.45)] transition-transform group-hover:scale-110 group-hover:-translate-y-1`}
                  />


                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="text-lg sm:text-xl lg:text-2xl uppercase tracking-[0.22em] text-foreground font-bold font-sans leading-[1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {t.name}
                    </div>
                    <div className="text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium font-sans leading-[1.2]">
                      {t.motto}
                    </div>
                  </div>


                </button>
              </li>
            ))}
          </ul>
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
