import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  onTeamClick: (team: string) => void;
  onPrimaryAction?: () => void;
}

type TeamKey = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

const TEAMS: {
  key: TeamKey;
  motto: string;
  op: string;
  role: string;
  accent: string; // hsl triplet
}[] = [
  { key: 'ALFA',    motto: 'Escudo · Proteção',    op: 'OP-01', role: 'Defensiva',    accent: '46 78% 58%' },
  { key: 'BRAVO',   motto: 'Espada · Ação',        op: 'OP-02', role: 'Ofensiva',     accent: '14 82% 58%' },
  { key: 'CHARLIE', motto: 'Alvo · Precisão',      op: 'OP-03', role: 'Reconhecimento', accent: '190 82% 58%' },
  { key: 'DELTA',   motto: 'Raio · Velocidade',    op: 'OP-04', role: 'Resposta Rápida', accent: '270 68% 68%' },
];

/** Institutional SVG insignia by team. Pure SVG — no images. */
function TeamInsignia({ team, size = 46 }: { team: TeamKey; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 64 64',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (team) {
    case 'ALFA':
      return (
        <svg {...common} aria-hidden>
          <path d="M32 4 L54 12 V32 C54 46 44 56 32 60 C20 56 10 46 10 32 V12 Z" fill="hsl(var(--primary) / 0.10)" />
          <path d="M22 30 L30 38 L44 22" />
          <path d="M32 12 V22" opacity=".5" />
        </svg>
      );
    case 'BRAVO':
      return (
        <svg {...common} aria-hidden>
          <path d="M32 4 L54 12 V32 C54 46 44 56 32 60 C20 56 10 46 10 32 V12 Z" fill="hsl(var(--primary) / 0.10)" />
          <path d="M18 18 L44 44" />
          <path d="M44 20 L20 44" />
          <circle cx="32" cy="32" r="3.5" fill="currentColor" />
        </svg>
      );
    case 'CHARLIE':
      return (
        <svg {...common} aria-hidden>
          <circle cx="32" cy="32" r="24" fill="hsl(var(--primary) / 0.08)" />
          <circle cx="32" cy="32" r="16" />
          <circle cx="32" cy="32" r="8" />
          <path d="M32 4 V16 M32 48 V60 M4 32 H16 M48 32 H60" />
          <circle cx="32" cy="32" r="2" fill="currentColor" />
        </svg>
      );
    case 'DELTA':
      return (
        <svg {...common} aria-hidden>
          <path d="M32 4 L54 12 V32 C54 46 44 56 32 60 C20 56 10 46 10 32 V12 Z" fill="hsl(var(--primary) / 0.10)" />
          <path d="M34 14 L20 36 H30 L26 52 L44 28 H34 Z" fill="currentColor" fillOpacity=".9" stroke="none" />
        </svg>
      );
  }
}

/** Small animated tactical map for the left briefing panel. */
function MissionMap() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="absolute inset-0 h-full w-full opacity-[0.42]"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id="mm-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="hsl(var(--primary) / 0.18)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="mm-fade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#mm-grid)" />
      <rect width="400" height="300" fill="url(#mm-fade)" />
      {/* topographic-ish contours */}
      <path d="M20 220 Q 120 160 200 200 T 380 180" stroke="hsl(var(--primary) / 0.5)" strokeWidth="1" fill="none" />
      <path d="M0 250 Q 100 200 200 240 T 400 220" stroke="hsl(var(--primary) / 0.35)" strokeWidth="1" fill="none" />
      <path d="M40 120 Q 140 60 220 100 T 400 90" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" fill="none" />
      {/* markers */}
      <g>
        <circle cx="120" cy="180" r="4" fill="hsl(var(--primary))" />
        <circle cx="120" cy="180" r="10" fill="none" stroke="hsl(var(--primary))" strokeOpacity=".6">
          <animate attributeName="r" values="10;22;10" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0;0.7" dur="3.2s" repeatCount="indefinite" />
        </circle>
      </g>
      <g>
        <circle cx="280" cy="120" r="3" fill="hsl(var(--accent))" />
        <circle cx="280" cy="120" r="8" fill="none" stroke="hsl(var(--accent))" strokeOpacity=".6">
          <animate attributeName="r" values="8;18;8" dur="4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* connecting route */}
      <path
        d="M120 180 C 180 150, 220 140, 280 120"
        stroke="hsl(var(--primary) / 0.7)"
        strokeWidth="1.2"
        strokeDasharray="4 4"
        fill="none"
      />
    </svg>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono tabular-nums">
      <span className="text-xl sm:text-3xl font-bold tracking-[0.08em] text-primary">
        {hh}:{mm}
        <span className="hidden sm:inline text-primary/50 text-lg">:{ss}</span>
      </span>
      <span className="uppercase text-[9px] sm:text-[10px] tracking-[0.22em] text-muted-foreground">{day}</span>
    </div>

  );
}

export function SplitOperationalHero({ onTeamClick, onPrimaryAction }: Props) {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 sm:gap-4 px-2 sm:px-4 pb-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* LEFT — Mission Briefing */}
      <article
        className="relative overflow-hidden rounded-lg border border-primary/25 bg-[linear-gradient(155deg,hsl(var(--card))_0%,hsl(220_45%_5%)_100%)] p-3 sm:p-6 shadow-[0_20px_60px_-30px_hsl(var(--primary)/0.35)] order-2 lg:order-1"
        aria-labelledby="mission-title"
      >
        <MissionMap />

        {/* corner brackets */}
        <span aria-hidden className="pointer-events-none absolute top-2 left-2 h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-primary/60" />
        <span aria-hidden className="pointer-events-none absolute top-2 right-2 h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-primary/60" />
        <span aria-hidden className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-b-2 border-primary/60" />
        <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-b-2 border-primary/60" />

        <div className="relative flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/40 bg-primary/10 px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Briefing
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              ISE · Acre
            </span>
          </div>

          <div>
            <h1
              id="mission-title"
              className="font-serif text-xl sm:text-3xl lg:text-4xl leading-[1.08] text-foreground"
            >
              Comando Operacional
              <br />
              <span className="text-primary italic">Socioeducativo</span>
            </h1>
            <p className="mt-1.5 font-mono text-[10px] sm:text-[12px] uppercase tracking-[0.22em] sm:tracking-[0.24em] text-muted-foreground">
              Gestão de Escalas · Agentes
            </p>
          </div>

          <LiveClock />

          <dl className="grid grid-cols-3 gap-2 pt-2 border-t border-primary/15">
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Equipes</dt>
              <dd className="font-mono text-base sm:text-lg font-bold text-foreground tabular-nums">04</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Ciclo</dt>
              <dd className="font-mono text-base sm:text-lg font-bold text-foreground tabular-nums">24H</dd>
            </div>
            <div>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Descanso</dt>
              <dd className="font-mono text-base sm:text-lg font-bold text-foreground tabular-nums">72H</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="group mt-1 inline-flex w-full sm:w-fit items-center justify-center sm:justify-start gap-2 rounded-sm border border-primary/50 bg-primary/10 px-4 py-2.5 sm:py-2 font-mono text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-primary hover:bg-primary/20 hover:border-primary transition-all"
          >
            <span>Iniciar Autenticação</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </article>

      {/* RIGHT — Team Selector Grid */}
      <div className="relative order-1 lg:order-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-muted-foreground">
            Selecione a Equipe
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-primary/80">
            4 Divisões
          </span>
        </div>


        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {TEAMS.map((t) => (
            <button
              key={t.key}
              data-team-card
              onClick={() => onTeamClick(t.key)}
              className={cn(
                'group relative flex flex-col items-start gap-3 overflow-hidden rounded-lg border p-3 sm:p-4 text-left',
                'border-primary/25 bg-[linear-gradient(160deg,hsl(var(--card))_0%,hsl(220_50%_4%)_100%)]',
                'transition-all duration-300 hover:border-primary/70 hover:-translate-y-0.5',
                'shadow-[0_10px_28px_-16px_hsl(0_0%_0%/0.9)] hover:shadow-[0_18px_44px_-16px_hsl(var(--primary)/0.45)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
              )}
              style={{ ['--team-accent' as any]: t.accent }}
            >
              {/* accent bar */}
              <span
                aria-hidden
                className="absolute top-0 left-0 h-full w-[3px] transition-all duration-300 group-hover:w-1.5"
                style={{ background: `linear-gradient(180deg, hsl(${t.accent}) 0%, transparent 100%)` }}
              />
              {/* corner brackets */}
              <span aria-hidden className="pointer-events-none absolute top-1.5 right-1.5 h-3 w-3 border-r border-t border-primary/40 transition-colors group-hover:border-primary" />
              <span aria-hidden className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-r border-b border-primary/40 transition-colors group-hover:border-primary" />
              {/* subtle sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,hsl(var(--primary)/0.10)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-full"
              />

              <div className="flex w-full items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-md border ring-1 transition-all group-hover:scale-105"
                  style={{
                    color: `hsl(${t.accent})`,
                    borderColor: `hsl(${t.accent} / 0.45)`,
                    background: `hsl(${t.accent} / 0.08)`,
                    boxShadow: `0 0 0 1px hsl(${t.accent} / 0.15), 0 8px 24px -12px hsl(${t.accent} / 0.6)`,
                  }}
                >
                  <TeamInsignia team={t.key} />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary/80 border border-primary/30 rounded-sm px-1.5 py-0.5">
                  {t.op}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="font-serif text-xl sm:text-2xl leading-none text-foreground group-hover:text-primary transition-colors">
                  {t.key}
                </span>
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {t.motto}
                </span>
              </div>

              <div className="mt-auto flex w-full items-center justify-between border-t border-primary/15 pt-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t.role}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                  Acessar
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
