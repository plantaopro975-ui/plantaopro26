import { ShieldCheck, Radio, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import heroImage from '@/assets/hero-noir-gold.jpg';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadio from '@/assets/icons-3d/noir-radio.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconBeacon from '@/assets/icons-3d/noir-beacon.png';
import agentFigure from '@/assets/tactical-agent-figure.png';
import policeVehicle from '@/assets/police-vehicle-3d.png';

type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  onTeamClick?: (team: TeamName) => void;
  agentCount?: number;
  unitsCount?: number;
}

const TEAMS: { name: TeamName; icon: string; kicker: string }[] = [
  { name: 'ALFA',    icon: iconShield, kicker: '01' },
  { name: 'BRAVO',   icon: iconHelmet, kicker: '02' },
  { name: 'CHARLIE', icon: iconRadio,  kicker: '03' },
  { name: 'DELTA',   icon: iconBeacon, kicker: '04' },
];

/**
 * INSTITUCIONAL AMAZÔNICO — Sistema Socioeducativo do Acre.
 * Hero full-viewport com brasão SVG, topografia amazônica e cards oficiais.
 */
export function HeroCinematic({ onTeamClick }: HeroCinematicProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [agentPos, setAgentPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const v = localStorage.getItem('hero_agent_pos');
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging.current || !sectionRef.current) return;
    const sec = sectionRef.current.getBoundingClientRect();
    const img = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - sec.left - offset.current.x;
    const y = e.clientY - sec.top - offset.current.y;
    const clamped = {
      x: Math.max(0, Math.min(x, sec.width - img.width)),
      y: Math.max(0, Math.min(y, sec.height - img.height)),
    };
    setAgentPos(clamped);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    dragging.current = false;
    try { if (agentPos) localStorage.setItem('hero_agent_pos', JSON.stringify(agentPos)); } catch {}
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-full min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-primary/30 hero-cinematic"
      aria-label="Sistema Socioeducativo do Acre — Comando Operacional"
      style={{ maxHeight: '100%' }}
    >
      {/* Background */}
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/78 to-background/25" aria-hidden />

      {/* Topografia amazônica — SVG orgânico (curvas de nível) */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] mix-blend-screen"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="topo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${120 + i * 55} Q 200 ${80 + i * 55} 400 ${140 + i * 55} T 800 ${110 + i * 55}`}
            fill="none"
            stroke="url(#topo)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Brasão institucional SVG — canto superior direito */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute top-4 right-4 h-14 w-14 sm:h-16 sm:w-16 z-30 opacity-90"
      >
        <defs>
          <linearGradient id="crest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <path
          d="M50 4 L88 20 V52 Q88 78 50 96 Q12 78 12 52 V20 Z"
          fill="hsl(var(--card) / 0.7)"
          stroke="url(#crest)"
          strokeWidth="2"
        />
        <text
          x="50"
          y="46"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontWeight="900"
          fontSize="22"
          fill="hsl(var(--accent))"
        >
          ISE
        </text>
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fontFamily="Inter Tight, sans-serif"
          fontWeight="700"
          fontSize="8"
          letterSpacing="1.5"
          fill="hsl(var(--foreground))"
        >
          ACRE
        </text>
      </svg>

      {/* Viatura policial */}
      <img
        src={policeVehicle}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        style={{ width: 'clamp(130px, 24vw, 340px)' }}
        className="police-vehicle absolute z-10 bottom-1 left-1 sm:bottom-2 sm:left-4 lg:left-8 object-contain pointer-events-none select-none opacity-95 [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.75))]"
      />

      {/* Agente tático — centralizado */}
      <img
        src={agentFigure}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className="absolute z-20 bottom-24 right-0 translate-x-2 sm:bottom-0 sm:right-auto sm:left-1/2 sm:translate-x-0 sm:-translate-x-1/2 h-[34%] sm:h-[58%] lg:h-[68%] max-h-full w-auto object-contain object-bottom pointer-events-none select-none opacity-90 sm:opacity-100 [filter:drop-shadow(0_20px_44px_rgba(0,0,0,0.8))]"
      />

      {/* Foreground content */}
      <div className="relative z-30 h-full min-h-0 flex flex-col justify-between gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 py-3 sm:py-5">
        {/* Top eyebrow */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-sm border border-accent/50 bg-background/70 backdrop-blur-md w-fit max-w-full">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
              <span className="text-[9px] sm:text-[11px] font-bold tracking-[0.22em] sm:tracking-[0.3em] uppercase text-accent font-sans truncate">
                Instituto Socioeducativo · Acre
              </span>
            </div>
            <h1 className="font-serif text-[20px] sm:text-[28px] lg:text-[38px] leading-[0.95] font-black text-foreground tracking-tight max-w-[16ch]">
              Comando <span className="italic text-accent">Operacional</span>
              <br />
              <span className="text-primary-glow">Socioeducativo</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.25em] text-muted-foreground font-mono">
              <MapPin className="h-3 w-3 text-accent" />
              Feijó · AC · Amazônia Ocidental
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-primary/40 bg-background/70 backdrop-blur-md mt-14">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <Radio className="h-3.5 w-3.5 text-success" />
            <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-success font-mono">
              Rede 24/7
            </span>
          </div>
        </div>

        {/* Cards — 2x2 mobile, 4x1 desktop */}
        <div className="mt-2 sm:mt-auto min-h-0">
          <div className="mb-1.5 sm:mb-2 flex items-center gap-2 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.32em] text-muted-foreground/80 font-mono">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/60" />
            Selecione sua equipe operacional
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/60" />
          </div>

          <ul
            className="hero-team-grid grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full max-w-6xl mx-auto"
            role="list"
            aria-label="Equipes operacionais"
          >
            {TEAMS.map((t) => (
              <li key={t.name} className="flex">
                <button
                  type="button"
                  data-team-card
                  onClick={() => onTeamClick?.(t.name)}
                  className="team-card-3d group relative w-full flex flex-col items-center justify-center text-center gap-1 p-2.5 sm:p-3 lg:p-4 min-h-[124px] sm:min-h-[128px] lg:min-h-[148px] rounded-md border border-primary/30 bg-[linear-gradient(160deg,hsl(var(--card)/0.85),hsl(var(--background)/0.7))] backdrop-blur-xl hover:border-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 transition-all duration-300"
                  aria-label={`Acessar equipe ${t.name}`}
                >
                  {/* Canto oficial (cobre) */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-accent/70 rounded-tl-md"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-accent/50 rounded-br-md"
                  />
                  {/* Kicker número */}
                  <span className="absolute top-1.5 right-2 text-[9px] font-mono tracking-[0.2em] text-accent/80">
                    /{t.kicker}
                  </span>

                  <img
                    src={t.icon}
                    alt=""
                    loading="lazy"
                    className="team-icon-3d relative h-16 w-16 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem] object-contain shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-0.5"
                  />
                  <div className="relative mt-0.5">
                    <div className="font-serif text-base sm:text-lg lg:text-xl font-black text-foreground leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {t.name}
                    </div>
                    <div className="mt-1 h-px w-8 mx-auto bg-gradient-to-r from-transparent via-accent to-transparent" />
                    <div className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.24em] sm:tracking-[0.32em] text-muted-foreground font-mono">
                      Equipe
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
