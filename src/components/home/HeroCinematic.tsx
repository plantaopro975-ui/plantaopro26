import { ShieldCheck, Radio, MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import heroImage from '@/assets/hero-command.jpg';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadio from '@/assets/icons-3d/noir-radio.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconBeacon from '@/assets/icons-3d/noir-beacon.png';
import iconHandcuffs from '@/assets/icons-3d/noir-handcuffs.png';
import agentFigure from '@/assets/tactical-agent-figure.png';
import policeVehicle from '@/assets/police-vehicle-3d.png';
import teamsHubBg from '@/assets/hero-teams-hub.jpg';
import comandoCover from '@/assets/comando-operacional-cover.jpg';
import { getTeamPoster, getTeamColors } from '@/lib/teamAssets';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';


type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  onTeamClick?: (team: TeamName) => void;
  agentCount?: number;
  unitsCount?: number;
}

const TEAMS: { name: TeamName; icon: string; kicker: string; motion: string }[] = [
  { name: 'ALFA',    icon: iconShield,    kicker: '01', motion: 'animate-team-shield' },
  { name: 'BRAVO',   icon: iconHelmet,    kicker: '02', motion: 'animate-team-helmet' },
  { name: 'CHARLIE', icon: iconRadio,     kicker: '03', motion: 'animate-team-radio' },
  { name: 'DELTA',   icon: iconHandcuffs, kicker: '04', motion: 'animate-team-handcuffs' },
];

/**
 * INSTITUCIONAL AMAZÔNICO — Sistema Socioeducativo do Acre.
 * Hero full-viewport com brasão SVG, topografia amazônica e cards oficiais.
 */
export function HeroCinematic({ onTeamClick }: HeroCinematicProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const onlineCount = useOnlinePresence();

  const [agentPos, setAgentPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const v = localStorage.getItem('hero_agent_pos');
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  });
  const [vehiclePos, setVehiclePos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const v = localStorage.getItem('hero_vehicle_pos');
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  });
  const dragging = useRef<null | 'agent' | 'vehicle'>(null);
  const offset = useRef({ x: 0, y: 0 });

  const makeHandlers = (kind: 'agent' | 'vehicle', setter: (p: { x: number; y: number }) => void, storageKey: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      dragging.current = kind;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore */ }
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (dragging.current !== kind) return;
      setter({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      if (dragging.current !== kind) return;
      dragging.current = null;
      try {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        localStorage.setItem(storageKey, JSON.stringify({ x: rect.left, y: rect.top }));
      } catch { /* ignore */ }
    },
  });

  const agentHandlers = makeHandlers('agent', setAgentPos, 'hero_agent_pos');
  const vehicleHandlers = makeHandlers('vehicle', setVehiclePos, 'hero_vehicle_pos');


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


      {/* Viatura policial — arrastável, com giroflex funcional */}
      <div
        className="police-vehicle z-30 block h-[20%] sm:h-[22%] lg:h-[28%] max-h-[36vh] w-auto max-w-[55%] sm:max-w-[38%] lg:max-w-[32%] select-none touch-none"
        style={
          vehiclePos
            ? { position: 'fixed', left: vehiclePos.x, top: vehiclePos.y }
            : { position: 'absolute', bottom: '32%', left: '1rem' }
        }
      >
        <img
          src={policeVehicle}
          alt="Arraste para posicionar viatura"
          title="Arraste para posicionar"
          loading="lazy"
          draggable={false}
          {...vehicleHandlers}
          className="h-full w-auto object-contain cursor-grab active:cursor-grabbing opacity-95 [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.75))]"
        />
      </div>

      {/* Agente tático — arrastável (triple-click abre login master/admin) */}
      <img
        src={agentFigure}
        alt="Arraste para posicionar · toque 3× para acesso administrador"
        title="Toque 3× para acesso do administrador"
        loading="lazy"
        draggable={false}
        {...agentHandlers}
        onClick={() => {
          const w = window as unknown as { __agentClicks?: number; __agentTimer?: number };
          w.__agentClicks = (w.__agentClicks || 0) + 1;
          if (w.__agentTimer) window.clearTimeout(w.__agentTimer);
          w.__agentTimer = window.setTimeout(() => { w.__agentClicks = 0; }, 700);
          if ((w.__agentClicks ?? 0) >= 3) {
            w.__agentClicks = 0;
            toast('Acesso do administrador', {
              description: 'Confirme para abrir o login restrito.',
              duration: 6000,
              action: {
                label: 'Confirmar',
                onClick: () => window.dispatchEvent(new CustomEvent('open-master-login')),
              },
              cancel: { label: 'Cancelar', onClick: () => {} },
            });
          }
        }}
        style={
          agentPos
            ? { position: 'fixed', left: agentPos.x, top: agentPos.y, transform: 'none' }
            : undefined
        }
        className="agent-figure absolute z-40 block bottom-[30%] sm:bottom-[24%] lg:bottom-[18%] right-1 sm:right-2 h-[30%] sm:h-[30%] lg:h-[38%] max-h-[46vh] w-auto max-w-[46%] sm:max-w-[28%] lg:max-w-[22%] object-contain object-bottom select-none cursor-grab active:cursor-grabbing touch-none opacity-95"
      />



      {/* Foreground content */}
      <div className="pointer-events-none relative z-20 h-full min-h-0 flex flex-col justify-start sm:justify-between gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 py-3 sm:py-5 [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
        {/* Top eyebrow */}
        <div
          className="relative rounded-lg overflow-hidden border border-accent/40 p-3 sm:p-4"
        >
          {/* Capa realista — sala de comando */}
          <img
            src={comandoCover}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          {/* Overlays para legibilidade */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--card)/0.94) 0%, hsl(var(--card)/0.82) 35%, hsl(var(--primary)/0.45) 70%, hsl(var(--accent)/0.25) 100%)',
            }}
          />
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full pointer-events-none opacity-60"
            viewBox="0 0 800 300"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="top-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0 H0 V24" fill="none" stroke="hsl(var(--accent))" strokeOpacity="0.18" strokeWidth="0.6" />
              </pattern>
              <linearGradient id="top-stripe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="800" height="300" fill="url(#top-grid)" />
            <rect x="0" y="2" width="800" height="1" fill="url(#top-stripe)" />
            <rect x="0" y="297" width="800" height="1" fill="url(#top-stripe)" />
          </svg>


          <div className="relative flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
              <div className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-accent/90 font-mono">
                <span className="h-px w-6 bg-accent/60" />
                Segurança Pública · Sistema Socioeducativo
              </div>
              <h1 className="font-mono uppercase text-[20px] sm:text-[26px] lg:text-[34px] leading-[1] font-extrabold text-foreground tracking-[0.04em] max-w-[18ch]">
                Comando <span className="text-accent">Operacional</span>
                <br />
                <span className="text-primary-glow">para quem está na linha de frente</span>
              </h1>
              <p className="max-w-[46ch] text-[11px] sm:text-[13px] leading-snug text-muted-foreground font-mono">
                Coordenação tática em tempo real, escalas inteligentes e comunicação segura entre equipes — feito por agentes, para agentes.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground font-mono">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                Feijó · AC · Amazônia Ocidental
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-primary/40 bg-background/70 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-success font-mono tabular-nums">
                {onlineCount} online
              </span>
              <span className="h-3 w-px bg-success/30" aria-hidden />
              <Radio className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-success font-mono">
                Rede 24/7
              </span>
            </div>

          </div>
        </div>

        {/* Cards — 2x2 mobile, 4x1 desktop */}
        <div className="mt-2 sm:mt-auto min-h-0">
          <div
            className="relative rounded-lg overflow-hidden border border-accent/40 p-2 sm:p-3"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--card)/0.95) 0%, hsl(var(--primary)/0.35) 55%, hsl(var(--accent)/0.25) 100%)',
            }}
          >
            {/* SVG tático institucional */}
            <svg
              aria-hidden
              className="absolute inset-0 h-full w-full pointer-events-none opacity-70"
              viewBox="0 0 800 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="hub-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M24 0 H0 V24" fill="none" stroke="hsl(var(--accent))" strokeOpacity="0.18" strokeWidth="0.6" />
                </pattern>
                <radialGradient id="hub-glow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="hub-stripe" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="800" height="300" fill="url(#hub-grid)" />
              <rect width="800" height="300" fill="url(#hub-glow)" />
              {/* Escudo institucional central */}
              <g opacity="0.09" transform="translate(400 150)">
                <path
                  d="M0 -90 L75 -55 L75 30 Q75 75 0 105 Q-75 75 -75 30 L-75 -55 Z"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 -65 L55 -38 L55 25 Q55 60 0 82 Q-55 60 -55 25 L-55 -38 Z"
                  fill="none"
                  stroke="hsl(var(--primary-glow))"
                  strokeWidth="1"
                />
              </g>
              {/* Faixas superiores/inferiores */}
              <rect x="0" y="2" width="800" height="1" fill="url(#hub-stripe)" />
              <rect x="0" y="297" width="800" height="1" fill="url(#hub-stripe)" />
            </svg>


          <div className="relative mb-1.5 sm:mb-2 flex items-center gap-2 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.32em] text-muted-foreground/80 font-mono">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/60" />
            Selecione sua equipe operacional
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/60" />
          </div>

          <ul
            className="relative hero-team-grid grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full max-w-6xl mx-auto"
            role="list"
            aria-label="Equipes operacionais"
          >
            {TEAMS.map((t) => {
              const tc = getTeamColors(t.name);
              return (
              <li key={t.name} className="flex">
                <button
                  type="button"
                  data-team-card
                  onClick={() => onTeamClick?.(t.name)}
                  className="team-card-3d group relative w-full flex flex-col items-center justify-center text-center gap-1.5 p-3 sm:p-3 lg:p-4 min-h-[140px] sm:min-h-[144px] lg:min-h-[172px] rounded-md border border-accent/40 hover:border-accent/70 overflow-hidden focus:outline-none focus-visible:ring-2 transition-all duration-300"
                  style={{
                    // @ts-ignore CSS var
                    ['--team-ring' as any]: tc.ring,
                    // @ts-ignore CSS var
                    ['--team-glow' as any]: tc.glow,
                    boxShadow: `0 0 0 1px hsl(var(--accent) / 0.15), 0 10px 24px -12px ${tc.glow}`,
                  }}
                  aria-label={`Acessar equipe ${t.name}`}
                >
                  {/* Capa hero realista — poster oficial da equipe (background) */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-md overflow-hidden"
                  >
                    <img
                      src={getTeamPoster(t.name)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                      style={{ filter: 'saturate(0.9) contrast(1.08) brightness(0.92)' }}
                    />
                    {/* Grade navy uniforme — mesma base cromática dos posters */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, hsl(var(--background)/0.35) 0%, hsl(var(--background)/0.15) 45%, hsl(var(--background)/0.9) 100%)',
                      }}
                    />
                    {/* Key light dourado no canto superior direito — replica iluminação dos posters */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 82% 12%, hsl(var(--accent)/0.28) 0%, transparent 45%)',
                      }}
                    />
                    {/* Vinheta noir */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
                      }}
                    />
                    {/* Borda interna dourada */}
                    <span aria-hidden className="absolute inset-0 ring-1 ring-inset ring-accent/15 rounded-md" />
                  </span>
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

                  <span
                    className="relative inline-flex items-center justify-center"
                    title={`Equipe ${t.name} — clique para acessar`}
                  >
                    <img
                      src={t.icon}
                      alt=""
                      loading="lazy"
                      className={`team-icon-3d ${t.motion} relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] group-hover:scale-110 group-active:scale-95`}
                    />
                  </span>
                  <div className="relative mt-0.5">
                    <div className="font-mono uppercase text-base sm:text-lg lg:text-xl font-extrabold text-foreground leading-none tracking-[0.18em]">
                      {t.name}
                    </div>
                    <div className="mt-1 h-px w-8 mx-auto bg-gradient-to-r from-transparent via-accent to-transparent" />
                    <div className="mt-1 text-[9px] sm:text-[9px] uppercase tracking-[0.24em] sm:tracking-[0.32em] text-muted-foreground font-mono">
                      Equipe
                    </div>
                  </div>
                </button>
              </li>
            );})}
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
