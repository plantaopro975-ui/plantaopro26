import { useEffect, useState, useCallback } from 'react';
import { Radio, ShieldCheck, Activity, Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OperationalStatusRibbon } from './OperationalStatusRibbon';
import { RoundsManager } from './RoundsManager';
import { useOperationalMetrics } from '@/hooks/useOperationalMetrics';
import { useOnlineAgents } from '@/hooks/useOnlineAgents';
import { useVisitorPresence } from '@/hooks/useVisitorPresence';
// Fundo do hero agora é 100% SVG vetorial (ver <svg> no <article>) — sem raster.




import agent3dWebp from '@/assets/hero/agent-ise-3d.local.webp';
import agent3d from '@/assets/hero/agent-ise-3d.local.png';
import vehicle3dWebp from '@/assets/hero/vehicle-ise-3d.local.webp';
import vehicle3d from '@/assets/hero/vehicle-ise-3d.local.png';
import agentVehicleSceneAsset from '@/assets/hero/agent-vehicle-scene.webp.asset.json';
const agentVehicleScene = agentVehicleSceneAsset.url;
const agentVehicleSceneWebp = agentVehicleSceneAsset.url;
import objAlfa from '@/assets/teams/alfa-shield-v2.png';
import objAlfaWebp from '@/assets/teams/alfa-shield-v2.webp';
import objBravo from '@/assets/teams/bravo-helmet-v2.png';
import objBravoWebp from '@/assets/teams/bravo-helmet-v2.webp';
import objCharlie from '@/assets/teams/charlie-optics-v2.png';
import objCharlieWebp from '@/assets/teams/charlie-optics-v2.webp';
import objDelta from '@/assets/teams/delta-radio-v2.png';
import objDeltaWebp from '@/assets/teams/delta-radio-v2.webp';



import bgAlfaAsset from '@/assets/teams/bg-alfa.jpg.asset.json';
import bgAlfaAvifAsset from '@/assets/teams/bg-alfa.avif.asset.json';
const bgAlfa = bgAlfaAsset.url;
const bgAlfaAvif = bgAlfaAvifAsset.url;
import bgBravoAsset from '@/assets/teams/bg-bravo.jpg.asset.json';
import bgBravoAvifAsset from '@/assets/teams/bg-bravo.avif.asset.json';
const bgBravo = bgBravoAsset.url;
const bgBravoAvif = bgBravoAvifAsset.url;
import bgCharlieAsset from '@/assets/teams/bg-charlie.jpg.asset.json';
import bgCharlieAvifAsset from '@/assets/teams/bg-charlie.avif.asset.json';
const bgCharlie = bgCharlieAsset.url;
const bgCharlieAvif = bgCharlieAvifAsset.url;
import bgDeltaAsset from '@/assets/teams/bg-delta.jpg.asset.json';
import bgDeltaAvifAsset from '@/assets/teams/bg-delta.avif.asset.json';
const bgDelta = bgDeltaAsset.url;
const bgDeltaAvif = bgDeltaAvifAsset.url;

interface Props {
  onTeamClick: (team: string) => void;
}

type TeamKey = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

const TEAMS: {
  key: TeamKey;
  motto: string;
  op: string;
  role: string;
  accent: string;
  obj: string;
  objWebp: string;
  bg: string;
  bgAvif: string;
}[] = [
  { key: 'ALFA',    motto: 'Escudo · Guarda',      op: 'OP-01', role: 'Defensiva',       accent: '43 96% 56%',  obj: objAlfa,    objWebp: objAlfaWebp,    bg: bgAlfa,    bgAvif: bgAlfaAvif },
  { key: 'BRAVO',   motto: 'Capacete · Investida', op: 'OP-02', role: 'Ofensiva',        accent: '14 82% 58%',  obj: objBravo,   objWebp: objBravoWebp,   bg: bgBravo,   bgAvif: bgBravoAvif },
  { key: 'CHARLIE', motto: 'Óptica · Vigília',     op: 'OP-03', role: 'Reconhecimento',  accent: '38 96% 60%',  obj: objCharlie, objWebp: objCharlieWebp, bg: bgCharlie, bgAvif: bgCharlieAvif },
  { key: 'DELTA',   motto: 'Rádio · Comando',      op: 'OP-04', role: 'Resposta Rápida', accent: '45 96% 64%',  obj: objDelta,   objWebp: objDeltaWebp,   bg: bgDelta,   bgAvif: bgDeltaAvif },

];


interface TeamObjectProps {
  team: { key: TeamKey; obj: string; objWebp: string };
  isAlfa: boolean;
  idx: number;
}
function TeamObject({ team, isAlfa, idx }: TeamObjectProps) {
  // Envelope QUADRADO IDÊNTICO para todas as equipes.
  // Cada asset foi exportado com padding transparente diferente, então
  // aplicamos um `scale` de compensação por equipe para equilibrar a
  // presença visual (medida via bbox do conteúdo dentro do canvas 640×640):
  //   ALFA escudo   → 60% de preenchimento
  //   BRAVO espada  → 78% (referência, precisa reduzir)
  //   CHARLIE binóc → 62% mas achatado (precisa aumentar)
  //   DELTA rádio   → 32% estreito (precisa aumentar)
  const OBJECT_SCALE: Record<TeamKey, number> = {
    ALFA: 0.94,
    BRAVO: 0.9,
    CHARLIE: 0.92,
    DELTA: 1.02,
  };
  const scale = OBJECT_SCALE[team.key] ?? 1;

  const imgClass = cn(
    'block h-full w-full object-contain object-center select-none animate-float3d',
    'drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]',
    'transition-[transform,opacity] duration-700 ease-out',
    'group-hover:scale-[1.04] group-hover:-translate-y-0.5',
    'group-active:scale-[1.02]',
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Quadrado fixo — mesma "moldura" para todos os 3D */}
      <div className="relative aspect-square w-[82px] min-[390px]:w-[90px] sm:w-[112px] lg:w-[124px] xl:w-[136px] max-h-full flex items-center justify-center">
        <picture className="flex h-full w-full items-center justify-center" style={{ transform: `scale(${scale})`, transformOrigin: '50% 50%' }}>
          <source type="image/webp" srcSet={team.objWebp} />
          <img
            src={team.obj}
            alt={`Equipe ${team.key} — equipamento tático`}
            loading={isAlfa ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={isAlfa ? 'high' : 'low'}
            width={512}
            height={512}
            sizes="(max-width: 640px) 90px, (max-width: 1024px) 112px, 136px"
            draggable={false}
            className={imgClass}
            style={{
              transformOrigin: '50% 50%',
              animationDelay: `${idx * 0.6}s`,
              contentVisibility: 'auto',
            }}
          />
        </picture>
      </div>
    </div>
  );
}


interface TeamCardProps {
  team: (typeof TEAMS)[number];
  idx: number;
  isSelected: boolean;
  onSelect: (k: TeamKey) => void;
  className?: string;
}
function TeamCard({ team: t, idx, isSelected, onSelect, className }: TeamCardProps) {
  return (
    <button
      data-team-card
      data-team={t.key}
      aria-pressed={isSelected}
      onClick={() => onSelect(t.key)}
      className={cn(
        'group relative flex h-[clamp(100px,15vh,126px)] min-[390px]:h-[clamp(104px,15.5vh,132px)] sm:h-[clamp(98px,16vh,158px)] lg:h-[clamp(132px,23vh,168px)] xl:h-[clamp(148px,25vh,220px)] flex-col overflow-hidden rounded-xl border-[1.5px] text-left bg-transparent isolate',
        'transition-all duration-300 ease-out will-change-transform [transform-style:preserve-3d]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:ring-[hsl(var(--team-accent)/0.8)]',
        isSelected
          ? 'border-[hsl(var(--team-accent))] -translate-y-0.5 scale-[1.005] sm:-translate-y-1.5 sm:scale-[1.02] shadow-[0_0_0_2px_hsl(var(--team-accent)/0.85),0_0_0_4px_rgba(2,6,23,0.9),0_18px_40px_-12px_hsl(var(--team-accent)/0.6),0_10px_20px_-8px_rgba(0,0,0,0.85)] ring-1 ring-[hsl(var(--team-accent)/0.45)]'
          : 'border-slate-300/25 shadow-[0_0_0_1px_rgba(15,23,42,0.75),inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:border-[hsl(var(--team-accent)/0.85)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_0_1.5px_hsl(var(--team-accent)/0.7),0_14px_30px_-14px_hsl(var(--team-accent)/0.5),0_8px_18px_-10px_rgba(0,0,0,0.75)] active:translate-y-0 active:scale-[0.99]',
        className,
      )}
      style={{ ['--team-accent' as any]: t.accent }}
    >
      <picture className="pointer-events-none absolute inset-0 z-0 block h-full w-full">
        <source type="image/avif" srcSet={t.bgAvif} />
        <source type="image/webp" srcSet={t.bg} />
        <img
          src={t.bg}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={cn(
            'pointer-events-none absolute inset-0 z-0 h-full w-full object-cover select-none',
            'transition-all duration-500 ease-out',
            isSelected
              ? 'opacity-100 scale-105 saturate-125 contrast-110'
              : 'opacity-80 saturate-110 contrast-105 group-hover:opacity-100 group-hover:scale-[1.04] group-hover:saturate-125',
          )}
          draggable={false}
        />
      </picture>

      <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.78)_100%)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-slate-950/90 to-transparent" />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-[2] transition-opacity duration-500 mix-blend-overlay',
          isSelected ? 'opacity-40' : 'opacity-0 group-hover:opacity-25',
        )}
        style={{ background: `radial-gradient(ellipse at 50% 40%, hsl(${t.accent} / 0.6) 0%, transparent 70%)` }}
      />
      {isSelected && (
        <>
          <span aria-hidden className="absolute top-1 left-1 z-30 h-3 w-3 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: `hsl(${t.accent})` }} />
          <span aria-hidden className="absolute top-1 right-1 z-30 h-3 w-3 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: `hsl(${t.accent})` }} />
          <span aria-hidden className="absolute bottom-1 left-1 z-30 h-3 w-3 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: `hsl(${t.accent})` }} />
          <span aria-hidden className="absolute bottom-1 right-1 z-30 h-3 w-3 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: `hsl(${t.accent})` }} />
        </>
      )}
      {t.key === 'ALFA' ? (
        <span aria-hidden className="alfa-halo" />
      ) : (
        <span aria-hidden className="team-halo" />
      )}
      <div className="relative z-20 flex items-center justify-center flex-1 min-h-0 p-0 pt-0.5 sm:p-0.5 sm:pt-2 [perspective:600px]">
        <TeamObject team={t} isAlfa={t.key === 'ALFA'} idx={idx} />
      </div>
      <span aria-hidden className="absolute top-0 left-0 h-px w-full" style={{ background: `linear-gradient(90deg, hsl(${t.accent}), transparent)` }} />
      <span aria-hidden className="absolute top-1.5 left-1.5 z-30 flex h-2.5 w-2.5 items-center justify-center rounded-full" style={{ border: `1px solid hsl(${t.accent} / 0.55)` }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${t.accent})`, boxShadow: `0 0 4px hsl(${t.accent} / 0.7)` }} />
      </span>
      <span
        className="absolute top-1.5 right-1.5 z-30 font-mono text-[8.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded backdrop-blur-md border"
        style={{ color: `hsl(${t.accent})`, borderColor: `hsl(${t.accent} / 0.5)`, background: `hsl(${t.accent} / 0.12)` }}
      >
        {t.op}
      </span>
      {(() => {
        const [h, s] = t.accent.split(' ');
        const L = { hi: 88, up: 62, mid: 32, lo: 55, base: 24, deep: 12, bevelHi: 96, bevelLo: 18, glow: 95 } as const;
        const c = (l: number, a?: number) => a === undefined ? `hsl(${h} ${s} ${l}%)` : `hsl(${h} ${s} ${l}% / ${a})`;
        const uid = `tn-${t.key}-${idx}`;
        const stops: { off: string; l: number }[] = [
          { off: '0%',   l: L.hi },
          { off: '35%',  l: L.up },
          { off: '52%',  l: L.mid },
          { off: '68%',  l: L.lo },
          { off: '100%', l: L.base },
        ];
        return (
          <div className="relative z-20 flex flex-col gap-0.5 px-1.5 pb-1.5 sm:gap-1 sm:px-2.5 sm:pb-2">
            <svg viewBox="0 0 300 72" className="block w-full h-9 min-[390px]:h-10 sm:h-12 lg:h-14 xl:h-16" aria-label={t.key} role="img">
              <defs>
                <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
                  {stops.map((st) => (
                    <stop key={st.off} offset={st.off} stopColor={c(st.l)} />
                  ))}
                </linearGradient>
                <linearGradient id={`${uid}-bevel`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={c(L.bevelHi, 0.95)} />
                  <stop offset="50%"  stopColor={c(L.up, 0.25)} />
                  <stop offset="100%" stopColor={c(L.bevelLo, 0.95)} />
                </linearGradient>
                <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={c(L.glow, 0.55)} />
                  <stop offset="100%" stopColor={c(L.glow, 0)} />
                </linearGradient>
                <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="160%">
                  <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#000" floodOpacity="0.95" />
                  <feDropShadow dx="0" dy="4" stdDeviation="3"   floodColor="#000" floodOpacity="0.65" />
                </filter>
              </defs>
              <g
                filter={`url(#${uid}-shadow)`}
                fontFamily="'Stardos Stencil','Saira Condensed','Oswald','Impact',sans-serif"
                fontWeight={700}
                textAnchor="middle"
                style={{ fontStretch: 'condensed' }}
              >
                <text x="150" y="54" fontSize="56" fill={c(L.deep)}  transform="translate(0,3)" letterSpacing="6">{t.key}</text>
                <text x="150" y="54" fontSize="56" fill={c(L.base)}  transform="translate(0,1.5)" letterSpacing="6">{t.key}</text>
                <text x="150" y="54" fontSize="56" fill={`url(#${uid}-fill)`} stroke={`url(#${uid}-bevel)`} strokeWidth="1.4" paintOrder="stroke" letterSpacing="6">{t.key}</text>
                <text x="150" y="54" fontSize="56" fill={`url(#${uid}-sheen)`} letterSpacing="6" clipPath="inset(0 0 58% 0)">{t.key}</text>
              </g>
            </svg>
            <span
              className="font-mono text-[8px] min-[390px]:text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.14em] sm:tracking-[0.28em] truncate text-slate-200"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
            >
              {t.motto}
            </span>
          </div>
        );
      })()}
    </button>
  );
}

export function SplitOperationalHero({ onTeamClick }: Props) {
  // Preload only the first-in-viewport 3D image (ALFA)

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = objAlfa;
    link.type = 'image/webp';
    (link as any).fetchPriority = 'high';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const metrics = useOperationalMetrics();
  const uplinkTone =
    metrics.uplink === 'online'
      ? { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]', text: 'text-emerald-300/90', label: 'Estável' }
      : metrics.uplink === 'degraded'
      ? { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]', text: 'text-amber-300/90', label: 'Sinal reduzido' }
      : { dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]', text: 'text-rose-300/90', label: 'Offline' };
  const fmt2 = (n: number) => String(n).padStart(2, '0');
  const trackedAgents = useOnlineAgents().size;
  const visitorsNow = useVisitorPresence();
  // "Online agora" = todo mundo com o site aberto (agentes rastreados + visitantes anônimos únicos).
  // Garante que o próprio usuário navegando aqui já apareça na contagem, mesmo antes de logar.
  const onlineAgents = Math.max(trackedAgents, visitorsNow);
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);
  const handleSelect = useCallback((k: TeamKey) => {
    setSelectedTeam(k);
    onTeamClick(k);
  }, [onTeamClick]);




  return (
    <section className="relative mx-auto w-full max-w-[1600px] flex flex-col h-full min-h-0 overflow-x-clip">



      {/* ============ SINGLE VIEWPORT STAGE ============ */}
      <article
        className="relative overflow-hidden mt-1 sm:mt-2 mx-2 sm:mx-3 rounded-2xl shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] sm:flex-1 min-h-0 flex flex-col"
        aria-labelledby="mission-title"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0A1128 0%, #050505 70%)',
        }}
      >
        {/* Camada SVG vetorial (substitui a foto home-command-center.jpg) */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full pointer-events-none opacity-60"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="heroGridFine" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M28 0H0V28" fill="none" stroke="hsl(220 60% 80% / 0.05)" strokeWidth="0.5" />
            </pattern>
            <pattern id="heroGridCoarse" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
              <path d="M140 0H0V140" fill="none" stroke="hsl(42 70% 60% / 0.09)" strokeWidth="0.8" />
            </pattern>
            <radialGradient id="heroBgGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="hsl(42 90% 55% / 0.10)" />
              <stop offset="100%" stopColor="hsl(42 90% 55% / 0)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGridFine)" />
          <rect width="100%" height="100%" fill="url(#heroGridCoarse)" />
          <rect width="100%" height="100%" fill="url(#heroBgGlow)" />
        </svg>

        {/* Overlay de leitura */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,10,0.85) 0%, rgba(10,17,40,0.75) 45%, rgba(5,5,10,0.92) 100%)',
          }}
        />
        {/* Backdrop layers */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(234,179,8,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
        {/* removido: glow amarelo inferior sob viatura/agente (solicitação do usuário) */}



        {/* ============ MOBILE-ONLY — Canal Seguro ribbon no topo (substitui título) ============ */}
        <div className="sm:hidden relative z-30 px-2 pt-0 pb-0 mb-0 -mt-0.5 order-1">
          <OperationalStatusRibbon />
        </div>

        {/* ============ TOP ROW — Identification + Agent + HUD ============ */}
        <div className="relative hidden sm:grid gap-1 sm:gap-4 px-0 sm:px-5 pt-0 sm:pt-2 pb-0 md:grid-cols-[0.95fr_1.05fr] items-start shrink-0 sm:order-none mt-0">

          {/* LEFT — CTA + selos */}
          <div className="relative z-20 min-w-0 flex flex-col gap-2.5 sm:gap-4 items-stretch mt-1 sm:mt-0">


            <div className="hidden sm:flex flex-col gap-1 sm:gap-1.5">
              <span className="hidden items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-amber-300 leading-[1.4] py-0.5 sm:inline-flex">
                <span className="h-1 w-6 bg-amber-400" />
                Sistema Operacional
              </span>
              <h2 className="font-sans font-semibold uppercase tracking-[0.01em] text-white text-[20px] sm:text-[26px] lg:text-[30px] leading-[1.1]">

                Comando <span className="text-amber-400 font-bold">Tático</span><br />
                Socioeducativo
              </h2>
            </div>



            <div className="hidden sm:flex flex-wrap items-center gap-3 text-slate-200">
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em]">
                <ShieldCheck className="h-3 w-3 text-amber-400" /> RLS
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em]">
                <Activity className="h-3 w-3 text-emerald-400" /> Realtime
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em]">
                <Radio className="h-3 w-3 text-amber-400" /> PWA
              </div>
            </div>

            {/* Mission briefing panel — preenche o espaço entre título e cena */}
            <div className="relative mt-1 hidden sm:block w-full max-w-full md:max-w-[92%] lg:max-w-[88%] xl:max-w-[80%]">
              <div
                className="relative rounded-md border border-amber-400/20 bg-[linear-gradient(135deg,rgba(10,17,40,0.85)_0%,rgba(5,5,5,0.9)_100%)] px-3 py-2.5 md:px-3.5 md:py-3 overflow-hidden"
                style={{ boxShadow: 'inset 0 1px 0 rgba(234,179,8,0.12), 0 8px 24px -12px rgba(0,0,0,0.9)' }}
              >
                {/* corner brackets */}
                <span aria-hidden className="absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-amber-400/60" />
                <span aria-hidden className="absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-amber-400/60" />
                <span aria-hidden className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-amber-400/60" />
                <span aria-hidden className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-amber-400/60" />
                {/* hatch backdrop */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(234,179,8,0.6) 0 1px, transparent 1px 8px)',
                  }}
                />

                <div className="relative flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-amber-300 truncate">
                    Briefing Operacional
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 font-mono text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.18em] shrink-0',
                      uplinkTone.text,
                    )}
                    aria-live="polite"
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', uplinkTone.dot)} />
                    Uplink · {uplinkTone.label}
                  </span>
                </div>

                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {[
                    {
                      k: 'Unidades',
                      v: metrics.loading ? '——' : fmt2(metrics.units),
                      s: 'Socioeducativas',
                      pulse: false,
                    },
                    {
                      k: 'Divisões',
                      v: fmt2(metrics.divisions),
                      s: 'Táticas',
                      pulse: false,
                    },
                    {
                      k: 'Efetivo',
                      v: metrics.loading ? '——' : fmt2(metrics.agentsRegistered || metrics.agentsActive),
                      s: 'Agentes cadastrados',
                      pulse: false,
                    },
                    {
                      k: 'Online',
                      v: fmt2(onlineAgents),
                      s: 'Presença agora',
                      pulse: true,
                    },
                  ].map((it) => (
                    <div key={it.k} className="relative pl-2 md:pl-2.5 border-l border-amber-400/25 min-w-0">
                      <div className="font-mono text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/95 truncate flex items-center gap-1">
                        {it.pulse && (
                          <span className="relative inline-flex h-2 w-2 items-center justify-center rounded-full border border-emerald-400/55 shrink-0">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.75)]" />
                          </span>
                        )}
                        {it.k}
                      </div>
                      <div
                        className={cn(
                          'font-sans font-bold text-[15px] md:text-[17px] lg:text-[18px] leading-none mt-0.5 tabular-nums tracking-tight',
                          it.pulse ? 'text-emerald-300' : 'text-white',
                        )}
                      >
                        {it.v}
                      </div>
                      <div className="font-mono text-[9px] md:text-[10px] font-medium uppercase tracking-[0.16em] text-slate-200/90 mt-0.5 truncate">
                        {it.s}
                      </div>
                    </div>
                  ))}
                </div>


                {/* barcode strip */}
                <div className="relative mt-2 flex items-end gap-[2px] h-3 opacity-70 overflow-hidden">
                  {[3,7,4,9,5,3,8,4,6,3,9,4,7,5,3,6,4,8,3,7,5,4,9,6,3].map((h, i) => (
                    <span
                      key={i}
                      className="block w-[2px] bg-amber-400/70 shrink-0"
                      style={{ height: `${h * 10}%` }}
                    />
                  ))}
                  <span className="ml-auto pl-2 font-mono text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300 shrink-0">
                    ISE · AC · BR
                  </span>
                </div>
              </div>
            </div>
          </div>



          {/* RIGHT — Agent 3D */}
          <div className="relative flex items-end justify-center sm:justify-center min-h-[160px] min-[390px]:min-h-[176px] sm:min-h-[clamp(90px,14vh,220px)] lg:min-h-[clamp(200px,27vh,290px)] xl:min-h-[clamp(220px,30vh,340px)] md:order-none z-[90] overflow-visible pb-1 sm:pb-0 mt-0 sm:mt-0 mb-0 sm:-mb-2 pt-0 sm:pt-0 px-2 sm:px-0">
            {/* Selo "Sistema Operacional" mobile removido a pedido do usuário */}


            {/* removido: anéis decorativos rotativos (economia CPU/GPU) */}
            {/* removido: halo amarelo ao pé da viatura/agente (solicitação do usuário) */}
            {/* Cena composta:
                MOBILE  → viatura à esquerda + agente à direita (justify-between, compacto)
                DESKTOP → mantém composição centralizada equilibrada */}
            <div
              className="relative z-50 inline-flex items-end justify-center gap-1 sm:gap-2 lg:gap-3 leading-[0] isolate w-full sm:w-auto h-[184px] min-[390px]:h-[204px] sm:h-[clamp(90px,14vh,220px)] lg:h-[clamp(200px,27vh,290px)] xl:h-[clamp(220px,30vh,340px)] translate-y-0 md:-translate-x-[18%] lg:-translate-x-[20%] xl:-translate-x-[22%] pr-0 sm:pr-0 max-w-full"
            >

              {/* Viatura — mobile: proporcional ao agente | desktop: um pouco mais baixa */}
              <picture className="relative block h-full aspect-square leading-[0] translate-y-3 min-[390px]:translate-y-4 sm:translate-y-0 lg:translate-y-5 xl:translate-y-7">
                <source type="image/webp" srcSet={vehicle3dWebp} />
                <img
                  src={vehicle3d}
                  alt="Viatura tática ISE"
                  width={1024}
                  height={1024}
                  className="block h-full w-auto object-contain object-left-bottom sm:object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] select-none scale-[1.04] sm:scale-[1.04] lg:scale-[1.10] xl:scale-[1.14] 2xl:scale-[1.20] origin-bottom-left"
                  draggable={false}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 scale-[1.04] sm:scale-[1.04] lg:scale-[1.10] xl:scale-[1.14] 2xl:scale-[1.20] origin-bottom-left"
                >
                  <span
                    aria-hidden
                    className="giroflex-flash giroflex-flash-blue motion-reduce:hidden"
                    style={{ top: '23.9%', left: '47.1%' }}
                  />
                  <span
                    aria-hidden
                    className="giroflex-flash giroflex-flash-red motion-reduce:hidden"
                    style={{ top: '23.2%', left: '63.4%' }}
                  />
                </span>
              </picture>

              {/* Agente — proporção alinhada à viatura em todos os breakpoints */}
              <picture className="relative z-50 block h-full leading-[0] flex items-end -ml-2 sm:ml-0">
                <source type="image/webp" srcSet={agent3dWebp} />
                <img
                  src={agent3d}
                  alt="Agente Socioeducativo ISE"
                  width={1024}
                  height={1024}
                  className="block h-full max-h-full w-auto object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] select-none sm:-ml-2 scale-[1.04] sm:scale-[1.04] lg:scale-[1.10] xl:scale-[1.14] 2xl:scale-[1.20] translate-y-0 lg:translate-y-5 xl:translate-y-7 origin-bottom sm:origin-bottom"
                  draggable={false}
                />

              </picture>

            </div>

            {/* DELTA card — desktop only, ao lado do agente */}
            {(() => {
              const delta = TEAMS.find((x) => x.key === 'DELTA');
              if (!delta) return null;
              const idx = TEAMS.indexOf(delta);
              return (
                <div className="hidden lg:block absolute right-3 xl:right-6 bottom-2 z-[70] w-[176px] xl:w-[200px]" style={{ perspective: '900px' }}>
                  <TeamCard
                    team={delta}
                    idx={idx}
                    isSelected={selectedTeam === 'DELTA'}
                    onSelect={handleSelect}
                    className="!h-[180px] xl:!h-[210px] w-full"
                  />
                </div>
              );
            })()}


          </div>


        </div>

        {/* Mobile-only "Gestor de Rondas" — professional command tile */}
        <div className="relative z-30 px-3 sm:hidden mt-1 mb-1.5 order-2 sm:order-none">
          <RoundsManager
            customTrigger={
              <button
                type="button"
                aria-label="Abrir Gestor de Rondas"
                className="group relative w-full flex items-stretch rounded-[10px] overflow-hidden border border-amber-400/50 bg-[linear-gradient(135deg,rgba(20,14,4,0.96)_0%,rgba(48,32,6,0.9)_45%,rgba(20,14,4,0.96)_100%)] shadow-[0_0_0_1px_rgba(0,0,0,0.7),0_10px_22px_-14px_rgba(234,179,8,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] active:scale-[0.985] transition-transform min-h-[46px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* corner brackets */}
                <span aria-hidden className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-amber-300/80" />
                <span aria-hidden className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-amber-300/80" />
                <span aria-hidden className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-amber-300/80" />
                <span aria-hidden className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-amber-300/80" />

                {/* Sheen sweep on tap/hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(90deg,transparent_0%,rgba(234,179,8,0.18)_50%,transparent_100%)] -translate-x-full group-hover:translate-x-full group-active:translate-x-full transition-transform duration-[900ms]"
                />

                {/* LEFT — radar icon block */}
                <span
                  aria-hidden
                  className="relative flex items-center justify-center w-11 shrink-0 border-r border-amber-400/25"
                  style={{ background: 'linear-gradient(180deg, rgba(234,179,8,0.12) 0%, rgba(234,179,8,0.04) 100%)' }}
                >
                  {/* rotating sweep */}
                  <span
                    aria-hidden
                    className="absolute inset-1 rounded-full opacity-70"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(234,179,8,0.55) 60deg, transparent 90deg)',
                      animation: 'spin 3.6s linear infinite',
                      maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                    }}
                  />
                  <Radar className="relative h-[18px] w-[18px] text-amber-200 drop-shadow-[0_0_6px_rgba(234,179,8,0.75)]" strokeWidth={2.4} />
                </span>

                {/* MIDDLE — label stack */}
                <span className="relative flex-1 min-w-0 flex flex-col justify-center px-2.5 py-1 text-left">
                  <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-amber-300/85 leading-none">
                    Comando · Ronda
                  </span>
                  <span className="font-sans text-[12.5px] font-bold uppercase tracking-[0.04em] text-amber-50 leading-tight mt-0.5 truncate" style={{ textShadow: '0 0 8px rgba(234,179,8,0.35)' }}>
                    Gestor de Rondas
                  </span>
                </span>

                {/* RIGHT — status pill + chevron */}
                <span className="relative flex items-center gap-1.5 pr-2.5 pl-1 shrink-0">
                  <span
                    className="inline-flex items-center gap-1 rounded-sm px-1.5 py-[2px]"
                    style={{
                      background: 'hsl(142 72% 45% / 0.14)',
                      border: '1px solid hsl(142 72% 45% / 0.4)',
                    }}
                  >
                    <span className="relative inline-flex h-2 w-2 items-center justify-center rounded-full border border-emerald-400/55">
                      <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.75)]" />
                    </span>
                    <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-emerald-200 leading-none">
                      Ativo
                    </span>
                  </span>
                  <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden className="text-amber-300/85 group-active:translate-x-0.5 transition-transform">
                    <path d="M2 2l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            }
          />
        </div>




        {/* ============ Team Selector Grid — no mobile vai para o topo (order-2) ============ */}
        <div className="relative shrink-0 px-3 sm:px-3 pt-1 sm:pt-3 pb-1 mt-0 sm:mt-2 order-3 sm:order-none">

          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="font-mono text-[10.5px] sm:text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              Selecione sua Equipe
            </span>
            <span className="font-mono text-[10.5px] sm:text-[9px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              <span className="lg:hidden">4 Divisões</span>
              <span className="hidden lg:inline">3 Divisões · DELTA ao lado</span>
            </span>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4" style={{ perspective: '900px' }}>
            {TEAMS.map((t, idx) => (
              <TeamCard
                key={t.key}
                team={t}
                idx={idx}
                isSelected={selectedTeam === t.key}
                onSelect={handleSelect}
                className={t.key === 'DELTA' ? 'lg:hidden' : ''}

              />
            ))}
          </div>


          {/* Ribbon HUD removida a pedido do usuário para dar mais espaço aos cards */}


        </div>

        {/* ============ MOBILE-ONLY — Viatura + Agente abaixo dos cards (compacto) ============ */}
        <div className="sm:hidden relative z-30 order-4 px-2 pt-1 pb-8 mt-0 shrink-0 pointer-events-none">
          <div className="relative mx-auto flex items-end justify-center gap-0 h-[168px] min-[390px]:h-[188px] w-full max-w-[340px]">
            <picture className="relative block h-full aspect-square leading-[0] self-end translate-x-4 translate-y-2">
              <source type="image/webp" srcSet={vehicle3dWebp} />
              <img
                src={vehicle3d}
                alt="Viatura tática ISE"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                className="block h-full w-auto object-contain object-bottom drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] select-none scale-[1.12] origin-bottom"
                draggable={false}
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 scale-[1.12] origin-bottom">
                <span
                  aria-hidden
                  className="giroflex-flash giroflex-flash-blue motion-reduce:hidden"
                  style={{ top: '23.9%', left: '47.1%' }}
                />
                <span
                  aria-hidden
                  className="giroflex-flash giroflex-flash-red motion-reduce:hidden"
                  style={{ top: '23.2%', left: '63.4%' }}
                />
              </span>
            </picture>
            <picture className="relative block h-[100%] leading-[0] -ml-5 self-end mb-1 min-[390px]:mb-2">
              <source type="image/webp" srcSet={agent3dWebp} />
              <img
                src={agent3d}
                alt="Agente Socioeducativo ISE"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                className="block h-full w-auto object-contain object-bottom drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] select-none scale-[0.9] origin-bottom-left"
                draggable={false}
              />
            </picture>
          </div>
        </div>



      </article>
    </section>
  );
}
