import { ArrowRight, Radio, ShieldCheck, FileText } from 'lucide-react';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadio from '@/assets/icons-3d/noir-radio.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconBeacon from '@/assets/icons-3d/noir-beacon.png';

type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  onTeamClick?: (team: TeamName) => void;
  agentCount?: number;
  unitsCount?: number;
}

const TEAMS: {
  name: TeamName;
  icon: string;
  sector: string;
  status: 'active' | 'standby';
  anim: string;
}[] = [
  { name: 'ALFA',    icon: iconShield, sector: 'Setor A · Internação', status: 'active',  anim: 'animate-team-shield' },
  { name: 'BRAVO',   icon: iconHelmet, sector: 'Setor B · Triagem',    status: 'active',  anim: 'animate-team-helmet' },
  { name: 'CHARLIE', icon: iconRadio,  sector: 'Setor C · Educativo',  status: 'standby', anim: 'animate-team-radio'  },
  { name: 'DELTA',   icon: iconBeacon, sector: 'Setor D · Perímetro',  status: 'standby', anim: 'animate-team-beacon' },
];

/**
 * Modern Tactical Interface — Marinho + Caqui + Dourado.
 * Hero com badge de plantão, headline com accent dourado e anel geométrico caqui.
 * Cards de equipes: superfície marinho translúcido, borda caqui, ações duplas (dourado + outline).
 */
export function HeroCinematic({
  onPrimaryAction,
  onTeamClick,
  agentCount = 248,
  unitsCount = 9,
}: HeroCinematicProps) {
  const today = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .format(new Date());

  return (
    <section
      className="relative w-full space-y-6 sm:space-y-8"
      aria-label="Comando Operacional — Sistema Socioeducativo do Acre"
    >
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border-l-4 border-accent bg-gradient-to-br from-background to-[hsl(216_50%_16%)] p-6 sm:p-8 lg:p-10 shadow-[var(--shadow-elevated)]">
        {/* Anel geométrico decorativo caqui */}
        <div
          aria-hidden
          className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border-8 border-secondary/10 pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute right-10 top-10 w-40 h-40 rounded-full bg-accent/5 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Badge de plantão */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-accent text-accent-foreground text-[10px] font-bold tracking-[0.18em] uppercase font-sans">
              <ShieldCheck className="h-3 w-3" />
              Plantão Ativo
            </span>
            <span className="text-secondary text-xs sm:text-sm font-medium font-sans capitalize">
              {today}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-auto text-[10px] tracking-[0.22em] uppercase text-muted-foreground font-medium font-sans">
              <Radio className="h-3 w-3 text-primary" />
              Op. 24/7
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight text-foreground font-serif font-extrabold">
            SISTEMA <span className="text-accent">ISE ACRE</span>
          </h1>
          <p className="text-secondary text-base sm:text-lg max-w-xl font-sans">
            Painel de monitoramento e gestão das equipes socioeducativas.
          </p>

          {/* CTAs + stats */}
          {onPrimaryAction && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground text-[13px] font-bold tracking-[0.14em] uppercase font-sans transition-all hover:bg-accent/90 hover:-translate-y-px shadow-[var(--glow-amber)]"
                aria-label="Acessar plataforma"
              >
                Acessar Plataforma
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-secondary text-secondary text-[13px] font-bold tracking-[0.14em] uppercase font-sans transition-all hover:bg-secondary hover:text-secondary-foreground"
              >
                <FileText className="h-4 w-4" />
                Escala Geral
              </button>

              <div className="flex items-stretch gap-px rounded-lg overflow-hidden border border-border/60 bg-background/40 backdrop-blur-md ml-0 sm:ml-2">
                <Stat value={agentCount} label="Agentes" />
                <Stat value={unitsCount} label="Unidades" />
                <Stat value="24/7" label="Ativo" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TEAMS GRID — Modern tactical cards */}
      <ul
        className="hero-team-grid grid grid-cols-1 sm:grid-cols-2 gap-4"
        role="list"
        aria-label="Equipes operacionais"
      >
        {TEAMS.map((t) => (
          <li key={t.name} className="flex">
            <div className="group w-full bg-[hsl(216_50%_16%)]/50 border border-secondary/20 p-5 sm:p-6 rounded-xl transition-all hover:border-accent/50 hover:-translate-y-0.5 backdrop-blur-md">
              <div className="flex justify-between items-start mb-5 gap-4">
                <div className="min-w-0">
                  <h3 className="text-accent text-xl sm:text-2xl font-extrabold tracking-tight font-serif leading-none">
                    EQUIPE {t.name}
                  </h3>
                  <p className="mt-1.5 text-secondary text-[10px] sm:text-xs uppercase tracking-[0.18em] font-semibold font-sans">
                    {t.sector}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      t.status === 'active'
                        ? 'bg-success shadow-[0_0_10px_hsl(var(--success)/0.6)] animate-pulse'
                        : 'bg-secondary/40'
                    }`}
                    aria-hidden
                  />
                  <img
                    src={t.icon}
                    alt=""
                    loading="lazy"
                    className={`${t.anim} team-icon-3d h-14 w-14 sm:h-16 sm:w-16 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]`}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onTeamClick?.(t.name)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold py-3 px-4 rounded-lg text-[12px] tracking-[0.12em] uppercase font-sans transition-colors hover:bg-accent/90"
                  aria-label={`Iniciar ronda equipe ${t.name}`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Iniciar Ronda
                </button>
                <button
                  type="button"
                  onClick={() => onTeamClick?.(t.name)}
                  className="w-full inline-flex items-center justify-center gap-2 border border-secondary text-secondary font-bold py-3 px-4 rounded-lg text-[12px] tracking-[0.12em] uppercase font-sans transition-all hover:bg-secondary hover:text-secondary-foreground"
                >
                  <FileText className="h-4 w-4" />
                  Relatório
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-4 py-2 bg-background/30 text-center">
      <div className="text-base font-bold text-accent leading-none font-serif">{value}</div>
      <div className="mt-1 text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-sans">
        {label}
      </div>
    </div>
  );
}
