import { useEffect, useState, useCallback } from 'react';
import { Radio, ShieldCheck, Activity, Radar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { teamEmblems } from '@/lib/teamAssets';
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



// Pôsteres cinematográficos táticos (background dos cards de equipe)
import bgAlfa from '@/assets/teams/alfa-poster.jpg';
import bgBravo from '@/assets/teams/bravo-poster.jpg';
import bgCharlie from '@/assets/teams/charlie-poster.jpg';
import bgDelta from '@/assets/teams/delta-poster.jpg';

// Retratos táticos de equipe — exibidos APENAS na versão mobile (<768px).
// Servidos como <picture> com variantes WebP + JPEG em dois tamanhos
// (320w para 1x, 480w para 2x/retina) para minimizar bytes no mobile.
import mobileAlfaSmWebp from '@/assets/teams/mobile/alfa-squad-sm.webp';
import mobileAlfaMdWebp from '@/assets/teams/mobile/alfa-squad-md.webp';
import mobileAlfaSmJpg  from '@/assets/teams/mobile/alfa-squad-sm.jpg';
import mobileAlfaMdJpg  from '@/assets/teams/mobile/alfa-squad-md.jpg';
import mobileBravoSmWebp from '@/assets/teams/mobile/bravo-squad-sm.webp';
import mobileBravoMdWebp from '@/assets/teams/mobile/bravo-squad-md.webp';
import mobileBravoSmJpg  from '@/assets/teams/mobile/bravo-squad-sm.jpg';
import mobileBravoMdJpg  from '@/assets/teams/mobile/bravo-squad-md.jpg';
import mobileCharlieSmWebp from '@/assets/teams/mobile/charlie-squad-sm.webp';
import mobileCharlieMdWebp from '@/assets/teams/mobile/charlie-squad-md.webp';
import mobileCharlieSmJpg  from '@/assets/teams/mobile/charlie-squad-sm.jpg';
import mobileCharlieMdJpg  from '@/assets/teams/mobile/charlie-squad-md.jpg';
import mobileDeltaSmWebp from '@/assets/teams/mobile/delta-squad-sm.webp';
import mobileDeltaMdWebp from '@/assets/teams/mobile/delta-squad-md.webp';
import mobileDeltaSmJpg  from '@/assets/teams/mobile/delta-squad-sm.jpg';
import mobileDeltaMdJpg  from '@/assets/teams/mobile/delta-squad-md.jpg';

type MobileSquadSources = {
  webpSrcSet: string;
  jpgSrcSet: string;
  jpgFallback: string;
};

const MOBILE_SQUAD: Record<TeamKey, MobileSquadSources> = {
  ALFA:    { webpSrcSet: `${mobileAlfaSmWebp} 1x, ${mobileAlfaMdWebp} 2x`,       jpgSrcSet: `${mobileAlfaSmJpg} 1x, ${mobileAlfaMdJpg} 2x`,       jpgFallback: mobileAlfaMdJpg },
  BRAVO:   { webpSrcSet: `${mobileBravoSmWebp} 1x, ${mobileBravoMdWebp} 2x`,     jpgSrcSet: `${mobileBravoSmJpg} 1x, ${mobileBravoMdJpg} 2x`,     jpgFallback: mobileBravoMdJpg },
  CHARLIE: { webpSrcSet: `${mobileCharlieSmWebp} 1x, ${mobileCharlieMdWebp} 2x`, jpgSrcSet: `${mobileCharlieSmJpg} 1x, ${mobileCharlieMdJpg} 2x`, jpgFallback: mobileCharlieMdJpg },
  DELTA:   { webpSrcSet: `${mobileDeltaSmWebp} 1x, ${mobileDeltaMdWebp} 2x`,     jpgSrcSet: `${mobileDeltaSmJpg} 1x, ${mobileDeltaMdJpg} 2x`,     jpgFallback: mobileDeltaMdJpg },
};

interface Props {
  onTeamClick: (team: string) => void;
}

import { TEAM_COLORS, type TeamKey } from '@/lib/teamColors';

// Accents alinhados com src/lib/teamColors.ts (mesma paleta usada pelo Gestor de Ronda)
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
  { key: 'ALFA',    motto: 'Escudo · Guarda',      op: 'OP-01', role: 'Contenção',    accent: TEAM_COLORS.ALFA.hsl,    obj: objAlfa,    objWebp: objAlfaWebp,    bg: bgAlfa,    bgAvif: bgAlfa },
  { key: 'BRAVO',   motto: 'Capacete · Intervenção Tática', op: 'OP-02', role: 'Intervenção Tática', accent: TEAM_COLORS.BRAVO.hsl,   obj: objBravo,   objWebp: objBravoWebp,   bg: bgBravo,   bgAvif: bgBravo },
  { key: 'CHARLIE', motto: 'Óptica · Vigília',     op: 'OP-03', role: 'Vigilância',   accent: TEAM_COLORS.CHARLIE.hsl, obj: objCharlie, objWebp: objCharlieWebp, bg: bgCharlie, bgAvif: bgCharlie },
  { key: 'DELTA',   motto: 'Rádio · Comando',      op: 'OP-04', role: 'Comando',      accent: TEAM_COLORS.DELTA.hsl,   obj: objDelta,   objWebp: objDeltaWebp,   bg: bgDelta,   bgAvif: bgDelta },
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
        // Formato de distintivo (octogonal) unificado em mobile e desktop.
        // Proporção retrato + tamanho contido garantem alinhamento consistente
        // em todos os breakpoints, com margens simétricas via `mx-auto`.
        'group relative flex flex-col text-left bg-transparent isolate overflow-hidden',
        'h-auto aspect-[4/5] w-full max-w-[172px] min-[390px]:max-w-[188px] min-[430px]:max-w-[200px] sm:max-w-[170px] lg:max-w-[210px] xl:max-w-[232px] 2xl:max-w-[248px] mx-auto rounded-none border-0',
        '[clip-path:polygon(22%_0%,78%_0%,100%_14%,100%_86%,78%_100%,22%_100%,0%_86%,0%_14%)] [-webkit-clip-path:polygon(22%_0%,78%_0%,100%_14%,100%_86%,78%_100%,22%_100%,0%_86%,0%_14%)]',
        'transition-all duration-300 ease-out will-change-transform [transform-style:preserve-3d]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:ring-[hsl(var(--team-accent)/0.8)]',
        isSelected
          ? '-translate-y-0.5 scale-[1.005] sm:-translate-y-1.5 sm:scale-[1.02] drop-shadow-[0_14px_26px_hsl(var(--team-accent)/0.55)]'
          : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.75)] hover:-translate-y-1 hover:scale-[1.01] hover:drop-shadow-[0_12px_24px_hsl(var(--team-accent)/0.5)] active:translate-y-0 active:scale-[0.99]',
        className,
      )}
      style={{ ['--team-accent' as any]: t.accent }}
    >
      {/* Imagem preenche o card inteiro (edge-to-edge, sem faixas vazias) */}
      {/* Pôster institucional único por equipe — evita repetição visual entre cards no mobile. */}
      <picture className="pointer-events-none absolute inset-0 z-0 block h-full w-full">
        <img
          src={t.bg}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          className={cn(
            'absolute inset-0 h-full w-full object-cover object-center select-none',
            'transition-all duration-500 ease-out',
            isSelected
              ? 'opacity-100 scale-[1.03] saturate-125 contrast-110'
              : 'opacity-95 saturate-110 contrast-105 group-hover:opacity-100 group-hover:scale-[1.02] group-hover:saturate-125',
          )}
          draggable={false}
        />
      </picture>

      {/* Vignette + gradient legibility (mais forte no rodapé para o footer institucional) */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_50%_35%,transparent_25%,rgba(2,6,23,0.7)_85%)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-[2] transition-opacity duration-500 mix-blend-overlay',
          isSelected ? 'opacity-35' : 'opacity-0 group-hover:opacity-20',
        )}
        style={{ background: `radial-gradient(ellipse at 50% 40%, hsl(${t.accent} / 0.55) 0%, transparent 70%)` }}
      />

      {/* Faixa lateral institucional (assinatura de cor da equipe) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[3] w-[3px]"
        style={{
          background: `linear-gradient(180deg, hsl(${t.accent}) 0%, hsl(${t.accent} / 0.4) 100%)`,
          boxShadow: `0 0 12px hsl(${t.accent} / 0.6)`,
        }}
      />

      {/* Cantoneiras — sempre visíveis, discretas quando idle */}
      <span aria-hidden className={cn('absolute top-1.5 left-1.5 z-30 h-2.5 w-2.5 border-t border-l transition-all', isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80')} style={{ borderColor: `hsl(${t.accent})` }} />
      <span aria-hidden className={cn('absolute top-1.5 right-1.5 z-30 h-2.5 w-2.5 border-t border-r transition-all', isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80')} style={{ borderColor: `hsl(${t.accent})` }} />
      <span aria-hidden className={cn('absolute bottom-1.5 left-1.5 z-30 h-2.5 w-2.5 border-b border-l transition-all', isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80')} style={{ borderColor: `hsl(${t.accent})` }} />
      <span aria-hidden className={cn('absolute bottom-1.5 right-1.5 z-30 h-2.5 w-2.5 border-b border-r transition-all', isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-80')} style={{ borderColor: `hsl(${t.accent})` }} />

      {/* Status LED (centralizado no topo — dentro da zona segura do octógono) */}
      <span aria-hidden className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: `hsl(${t.accent})`, boxShadow: `0 0 6px hsl(${t.accent})` }} />
        <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-slate-300/85">ATIVA</span>
      </span>

      {/* Nome herói — SVG auto-escalável: nunca ultrapassa o contêiner em nenhuma largura */}
      <div className="relative z-20 flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center px-3 pt-5">
        <div className="flex flex-col items-center w-full min-w-0 max-w-full">
          <svg
            role="img"
            aria-label={t.key}
            viewBox="0 0 260 60"
            preserveAspectRatio="xMidYMid meet"
            className="block w-full max-w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ maxHeight: '58%' }}
          >
            <text
              x="130"
              y="48"
              textAnchor="middle"
              fill={`hsl(${t.accent})`}
              style={{
                fontFamily: '"Rajdhani","Oswald","Bebas Neue",system-ui,sans-serif',
                fontWeight: 900,
                fontSize: '54px',
                letterSpacing: t.key === 'CHARLIE' ? '1px' : '2px',
                paintOrder: 'stroke',
                stroke: 'rgba(0,0,0,0.55)',
                strokeWidth: 1,
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.9)) drop-shadow(0 0 8px hsl(${t.accent} / 0.4))`,
              }}
            >
              {t.key}
            </text>
          </svg>
          <span
            aria-hidden
            className="mt-2 h-[2px] w-16 sm:w-24 max-w-[80%] transition-all duration-500 group-hover:w-24 sm:group-hover:w-32"
            style={{ background: `hsl(${t.accent})`, boxShadow: `0 0 10px hsl(${t.accent} / 0.75)` }}
          />
        </div>
      </div>

      {/* Rodapé institucional — role + OP code, recuado dentro da zona segura do octógono */}
      <div className="pp-team-card-footer relative z-20 flex items-center justify-between gap-2 mx-[16%] mb-[3%] mt-auto rounded-md border border-white/15 backdrop-blur-sm bg-slate-950/70 px-2 py-1.5 min-w-0">
        <span
          className="pp-team-card-role font-mono text-[9px] font-semibold uppercase tracking-[0.22em] truncate min-w-0 flex-1"
          style={{ color: `hsl(${t.accent})` }}
        >
          {t.role}
        </span>
        <span
          className="pp-team-card-op font-mono text-[9px] font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm border text-slate-100 shrink-0"
          style={{ borderColor: `hsl(${t.accent} / 0.55)`, background: 'rgba(2,6,23,0.6)' }}
        >
          {t.op}
        </span>
      </div>

      {/* Fio superior de acento */}
      <span aria-hidden className="absolute top-0 left-0 h-px w-full z-[3]" style={{ background: `linear-gradient(90deg, hsl(${t.accent}), transparent)` }} />
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
    <section className="relative mx-auto w-full max-w-[1600px] flex flex-col h-full lg:h-auto min-h-0 overflow-x-clip">



      {/* ============ SINGLE VIEWPORT STAGE ============ */}
      <article
        className="pp-home-hero relative overflow-hidden mt-1 sm:mt-2 mx-2 sm:mx-3 rounded-2xl shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] sm:flex-1 lg:flex-none min-h-0 flex flex-col"
        aria-labelledby="mission-title"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0A1128 0%, #050505 70%)',
        }}
      >
        {/* Camada SVG vetorial limpa — brilho sem malha quadriculada */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full pointer-events-none opacity-60"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="heroBgGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="hsl(42 90% 55% / 0.10)" />
              <stop offset="100%" stopColor="hsl(42 90% 55% / 0)" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroBgGlow)" />
        </svg>

        {/* ============ D — Grade topográfica sutil + coordenadas UTM ============ */}
        <svg aria-hidden className="hidden sm:block absolute inset-0 h-full w-full pointer-events-none opacity-[0.08]" preserveAspectRatio="none">
          <defs>
            <pattern id="topoGrid" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" fill="none" stroke="hsl(42 90% 55%)" strokeWidth="0.5" />
            </pattern>
            <pattern id="topoDots" x="28" y="28" width="112" height="112" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1" fill="hsl(42 90% 55%)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topoGrid)" />
          <rect width="100%" height="100%" fill="url(#topoDots)" />
        </svg>
        {/* MGRS/UTM removido do desktop — reduzir ruído visual */}


        {/* Overlay de leitura */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,10,0.85) 0%, rgba(10,17,40,0.75) 45%, rgba(5,5,10,0.92) 100%)',
          }}
        />
        {/* removido: glow amarelo inferior sob viatura/agente (solicitação do usuário) */}



        {/* ============ MOBILE-ONLY — Canal Seguro ribbon no topo (substitui título) ============ */}
        <div className="sm:hidden relative z-30 px-2 pt-0 pb-0 mb-0 -mt-0.5 order-1">
          <OperationalStatusRibbon />
        </div>

        {/* ============ TOP ROW — Identification + Agent + HUD ============ */}
        <div className="pp-hero-top-row relative hidden sm:grid gap-1 sm:gap-4 px-0 sm:px-5 pt-0 sm:pt-2 pb-0 md:grid-cols-[0.95fr_1.05fr] items-start shrink-0 sm:order-none mt-0">

          {/* LEFT — CTA + selos */}
          <div className="pp-hero-left relative z-20 min-w-0 flex flex-col gap-2.5 sm:gap-4 items-stretch mt-1 sm:mt-0">

            {/* Radar movido para a coluna direita (scene-stage) — evita sobreposição com o Briefing/Online */}





            <div className="hidden sm:flex flex-col gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-amber-300/90 leading-[1.4]">
                <span className="h-px w-6 bg-amber-400/70" />
                Sistema Operacional
              </span>
              <h2
                className="pp-hero-title font-serif text-white text-[clamp(1.5rem,2.2vw,2rem)] leading-[1.1] tracking-tight"
                style={{ fontFamily: "'Libre Baskerville', 'Playfair Display', Georgia, serif" }}
              >
                Comando <span className="text-amber-300 italic">Tático</span><br />
                <span className="text-white/85">Socioeducativo</span>
              </h2>
              <p className="pp-hero-subtitle font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/50 leading-[1.5] max-w-[42ch]">
                Escala · Banco de horas · Ronda georreferenciada
              </p>
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

            {/* Mission briefing panel — hierarquia reduzida: sutil, sem competir com viatura/agente */}
            <div className="pp-briefing-panel relative mt-1 hidden sm:block w-full max-w-full md:max-w-[92%] lg:max-w-[88%] xl:max-w-[80%]">
              <div
                className="pp-briefing-card relative rounded-md border border-white/8 bg-[linear-gradient(180deg,rgba(8,12,24,0.55)_0%,rgba(3,5,10,0.65)_100%)] backdrop-blur-sm px-3 py-2.5 md:px-3.5 md:py-3 overflow-hidden"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
              >
                {/* corner brackets — mais discretos */}
                <span aria-hidden className="absolute top-0 left-0 h-2 w-2 border-t border-l border-amber-400/30" />
                <span aria-hidden className="absolute top-0 right-0 h-2 w-2 border-t border-r border-amber-400/30" />
                <span aria-hidden className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-amber-400/30" />
                <span aria-hidden className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-amber-400/30" />

                <div className="relative flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-white/55 truncate">
                    Briefing Operacional
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] shrink-0',
                      uplinkTone.text,
                    )}
                    aria-live="polite"
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', uplinkTone.dot)} />
                    Uplink · {uplinkTone.label}
                  </span>
                </div>

                <div className="pp-briefing-metrics relative grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {[
                    { k: 'Unidades', v: metrics.loading ? '——' : fmt2(metrics.units), s: 'Socioeducativas', pulse: false },
                    { k: 'Divisões', v: fmt2(metrics.divisions), s: 'Táticas', pulse: false },
                    { k: 'Efetivo', v: metrics.loading ? '——' : fmt2(metrics.agentsRegistered || metrics.agentsActive), s: 'Agentes cadastrados', pulse: false },
                    { k: 'Online', v: fmt2(onlineAgents), s: 'Presença agora', pulse: true },
                  ].map((it) => (
                    <div key={it.k} className="relative pl-2 md:pl-2.5 border-l border-white/10 min-w-0">
                      <div className="font-mono text-[9px] md:text-[10px] font-medium uppercase tracking-[0.22em] text-white/50 truncate flex items-center gap-1">
                        {it.pulse && (
                          <span className="relative inline-flex h-2 w-2 items-center justify-center rounded-full border border-emerald-400/55 shrink-0">
                            <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.75)]" />
                          </span>
                        )}
                        {it.k}
                      </div>
                      <div
                        className={cn(
                          'font-sans font-semibold text-[14px] md:text-[16px] leading-none mt-1 tabular-nums tracking-tight',
                          it.pulse ? 'text-emerald-300' : 'text-white/95',
                        )}
                      >
                        {it.v}
                      </div>
                      <div className="font-mono text-[9px] md:text-[10px] font-normal uppercase tracking-[0.16em] text-white/40 mt-0.5 truncate">
                        {it.s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Log operacional removido do desktop — reduzir ruído e liberar altura para os cards */}

          </div>







          {/* RIGHT — Agent 3D + HUD tático */}
          <div className="pp-scene-stage relative flex items-end justify-center sm:justify-center min-h-[160px] min-[390px]:min-h-[176px] sm:min-h-[clamp(90px,14vh,220px)] lg:min-h-[clamp(220px,30vh,300px)] xl:min-h-[clamp(260px,34vh,340px)] 2xl:min-h-[clamp(300px,38vh,400px)] md:order-none z-[90] overflow-visible pb-1 sm:pb-0 mt-0 sm:mt-0 mb-0 sm:-mb-1 pt-0 sm:pt-1 lg:pt-2 px-2 sm:px-0">

            {/* ============ RADAR TÁTICO PROFISSIONAL — canto sup. direito da cena (fora do briefing) ============ */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-1 right-2 xl:top-2 xl:right-3 z-[60] pointer-events-none select-none"
              style={{ width: 132, height: 132 }}
            >
              <div className="absolute -top-0.5 left-0 right-0 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.28em] text-white/45 leading-none">
                <span className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
                  Radar
                </span>
                <span className="tabular-nums tracking-[0.18em] text-amber-200/70">R-04</span>
              </div>
              <div
                className="absolute left-1/2 -translate-x-1/2 top-3 h-[108px] w-[108px] rounded-full border border-amber-300/35"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, hsl(150 70% 45% / 0.10) 0%, hsl(150 70% 45% / 0.04) 42%, transparent 72%)',
                  boxShadow:
                    'inset 0 0 22px rgba(52,211,153,0.10), inset 0 0 2px rgba(252,211,77,0.35), 0 0 12px rgba(0,0,0,0.55)',
                }}
              >
                <span aria-hidden className="absolute inset-[10px] rounded-full border border-emerald-300/18" />
                <span aria-hidden className="absolute inset-[22px] rounded-full border border-emerald-300/14" />
                <span aria-hidden className="absolute inset-[36px] rounded-full border border-emerald-300/10" />
                <span aria-hidden className="absolute top-1/2 left-0 right-0 h-px bg-emerald-300/18" />
                <span aria-hidden className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-300/18" />
                <span aria-hidden className="absolute inset-0 rotate-45">
                  <span className="absolute top-1/2 left-1 right-1 h-px bg-emerald-300/10" />
                  <span className="absolute left-1/2 top-1 bottom-1 w-px bg-emerald-300/10" />
                </span>
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 font-mono text-[6.5px] tracking-[0.18em] text-emerald-200/60 leading-none">N</span>
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 font-mono text-[6.5px] tracking-[0.18em] text-emerald-200/45 leading-none">S</span>
                <span className="absolute left-0.5 top-1/2 -translate-y-1/2 font-mono text-[6.5px] tracking-[0.18em] text-emerald-200/45 leading-none">W</span>
                <span className="absolute right-0.5 top-1/2 -translate-y-1/2 font-mono text-[6.5px] tracking-[0.18em] text-emerald-200/45 leading-none">E</span>
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full motion-safe:animate-[spin_4.2s_linear_infinite]"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, hsl(150 84% 55% / 0.55) 55deg, hsl(150 84% 55% / 0.15) 78deg, transparent 92deg)',
                    maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
                  }}
                />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.95)] motion-safe:animate-pulse" style={{ top: '22%', left: '30%' }} />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.95)]" style={{ top: '34%', left: '70%' }} />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.95)]" style={{ top: '66%', left: '36%' }} />
                <span className="absolute h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.95)]" style={{ top: '72%', left: '68%' }} />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full border border-amber-300/70">
                  <span className="absolute inset-0.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]" />
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between font-mono text-[7.5px] uppercase tracking-[0.22em] text-white/40 leading-none">
                <span className="tabular-nums text-emerald-300/75">{fmt2(onlineAgents)} ONLINE</span>
                <span className="tabular-nums text-amber-200/60">2.5 KM</span>
              </div>
            </div>


            {/* Moldura HUD ultra-discreta — hairlines nos quatro cantos, sem competir com a cena */}
            <div aria-hidden className="hidden md:block absolute inset-x-3 top-2 bottom-2 lg:inset-x-5 lg:top-3 lg:bottom-3 pointer-events-none">
              {/* cantoneiras finas */}
              <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-amber-300/25" />
              <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-amber-300/25" />
              <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-amber-300/25" />
              <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-amber-300/25" />
              {/* ticks laterais discretos */}
              <span className="absolute top-1/2 left-0 -translate-y-1/2 h-4 w-px bg-amber-300/20" />
              <span className="absolute top-1/2 right-0 -translate-y-1/2 h-4 w-px bg-amber-300/20" />
            </div>

            {/* Scan line removida: causava faixa vertical sobre a viatura */}



            {/* HUD lateral direito, HUD vertical esquerdo e micro-ribbon inferior removidos do desktop */}
            {/* — reduzir ruído visual e destacar cena principal + cards das equipes.               */}





            {/* Cena composta */}
            <div
              className="pp-scene-composite relative z-50 inline-flex items-end justify-center gap-1 sm:gap-2 lg:gap-3 leading-[0] isolate w-full sm:w-auto h-[184px] min-[390px]:h-[204px] sm:h-[clamp(90px,14vh,220px)] lg:h-[clamp(220px,30vh,300px)] xl:h-[clamp(260px,34vh,340px)] 2xl:h-[clamp(300px,38vh,400px)] translate-y-0 md:-translate-x-[16%] lg:-translate-x-[18%] xl:-translate-x-[20%] lg:translate-y-10 xl:translate-y-14 2xl:translate-y-16 pr-0 sm:pr-0 max-w-full"
            >



              {/* Viatura — mobile: proporcional ao agente | desktop: pousada no chão sem cortes */}
              <picture className="relative block h-full aspect-square leading-[0] translate-y-3 min-[390px]:translate-y-4 sm:translate-y-0">
                <source type="image/webp" srcSet={vehicle3dWebp} />
                <img
                  src={vehicle3d}
                  alt="Viatura tática ISE"
                  width={1024}
                  height={1024}
                  className="block h-full w-auto object-contain object-left-bottom sm:object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] select-none scale-[1.04] sm:scale-[1.04] lg:scale-[1.38] xl:scale-[1.5] 2xl:scale-[1.6] origin-bottom-left"
                  draggable={false}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 scale-[1.04] sm:scale-[1.04] lg:scale-[1.38] xl:scale-[1.5] 2xl:scale-[1.6] origin-bottom-left"

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

              {/* Agente — cresce a partir do chão, sem translate positivo para não cortar os pés */}
              <picture className="relative z-50 block h-full leading-[0] flex items-end -ml-2 sm:ml-0">
                <source type="image/webp" srcSet={agent3dWebp} />
                <img
                  src={agent3d}
                  alt="Agente Socioeducativo ISE"
                  width={1024}
                  height={1024}
                  className="block h-full max-h-full w-auto object-contain object-bottom drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] select-none sm:-ml-2 scale-[1.04] sm:scale-[1.04] lg:scale-[1.12] xl:scale-[1.18] 2xl:scale-[1.24] origin-bottom sm:origin-bottom"
                  draggable={false}
                />

              </picture>

            </div>

            {/* DELTA agora alinhado na mesma grid das outras equipes (4 cols em lg+). */}


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
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300/90 leading-none">
                    Comando · Ronda
                  </span>
                  <span className="font-sans text-[15px] font-extrabold uppercase tracking-[0.02em] text-amber-50 leading-[1.05] mt-1 truncate" style={{ textShadow: '0 0 8px rgba(234,179,8,0.35)' }}>
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
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200 leading-none">
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
        <div className="pp-team-selector relative shrink-0 px-3 sm:px-3 pt-1 sm:pt-1 pb-1 mt-0 sm:mt-0 order-3 sm:order-none">

          <div className="flex items-center justify-between px-1 pb-1.5 lg:pb-2">
            <span className="font-mono text-[10.5px] sm:text-[10px] lg:text-[11.5px] font-semibold uppercase tracking-[0.22em] text-slate-100">
              <span className="text-amber-300/90 mr-1.5">◉</span>Selecione sua Equipe
            </span>
            <span className="font-mono text-[10.5px] sm:text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/95 tabular-nums">
              04 · Divisões Táticas
            </span>

          </div>


          <div className="pp-team-grid grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-4 sm:gap-3 lg:gap-4 xl:gap-5 justify-items-center items-end mx-auto max-w-[440px] sm:max-w-none px-1 sm:px-0" style={{ perspective: '900px' }}>
            {TEAMS.map((t, idx) => (
              <TeamCard
                key={t.key}
                team={t}
                idx={idx}
                isSelected={selectedTeam === t.key}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* ============ E + F — Conformidade institucional + Ticker de status ============ */}
          <div className="pp-compliance-strip hidden sm:flex mt-2 items-stretch gap-3 border-t border-white/8 pt-1.5 select-none">
            {/* E — selos de conformidade */}
            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              {[
                { k: 'LGPD', v: '✓', tone: 'emerald' },
                { k: 'RLS', v: 'ATIVO', tone: 'emerald' },
                { k: 'ISO 27001', v: 'REF.', tone: 'amber' },
                { k: 'UPTIME', v: '99.97%', tone: 'emerald' },
                { k: 'SLA', v: '24/7', tone: 'amber' },
              ].map((it) => (
                <span key={it.k} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className={cn('h-1 w-1 rounded-full', it.tone === 'emerald' ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]' : 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.7)]')} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50 leading-none">{it.k}</span>
                  <span className={cn('font-mono text-[9px] font-semibold uppercase tracking-[0.16em] leading-none tabular-nums', it.tone === 'emerald' ? 'text-emerald-300/90' : 'text-amber-300/90')}>{it.v}</span>
                </span>
              ))}
            </div>
            {/* F — Ticker de status deslizante */}
            <div className="relative flex-1 min-w-0 overflow-hidden [mask-image:linear-gradient(90deg,transparent_0,#000_6%,#000_94%,transparent_100%)]">
              <div className="flex items-center gap-6 whitespace-nowrap animate-[pp-ticker_28s_linear_infinite] will-change-transform">
                {Array.from({ length: 2 }).map((_, dup) => (
                  <span key={dup} className="flex items-center gap-6 shrink-0">
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-300/85">◉ SISTEMA · OPERACIONAL</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">OP-01 · CONTENÇÃO ATIVA</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">UPLINK · ESTÁVEL</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-200/85 tabular-nums">09 UNIDADES ONLINE</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">RONDA · GEORREFERENCIADA</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">CANAL SEGURO · AES-256</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-200/85">ISE · ACRE · 2026</span>
                    <span aria-hidden className="h-2 w-px bg-white/15" />
                  </span>
                ))}
              </div>
            </div>
          </div>




        </div>

        {/* ============ MOBILE-ONLY — Viatura + Agente abaixo dos cards (aproveitando o espaço) ============ */}
        <div className="sm:hidden relative z-30 order-4 px-2 pt-1 pb-3 mt-0 shrink-0 pointer-events-none">
          <div className="relative mx-auto flex items-end justify-center gap-0 h-[220px] min-[390px]:h-[244px] w-full max-w-[440px] overflow-hidden">
            {/* Chão sutil unificando viatura e agente na mesma cena */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 bottom-1 h-3 rounded-[50%] blur-md opacity-70"
              style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)' }}
            />
            <picture className="relative block h-full aspect-square leading-[0] self-end">

              <source type="image/webp" srcSet={vehicle3dWebp} />
              <img
                src={vehicle3d}
                alt="Viatura tática ISE"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                className="block h-full w-auto object-contain object-bottom drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] select-none scale-[0.94] origin-bottom"
                draggable={false}
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 scale-[0.94] origin-bottom">
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
            <picture className="relative block h-full leading-[0] -ml-3 self-end">
              <source type="image/webp" srcSet={agent3dWebp} />
              <img
                src={agent3d}
                alt="Agente Socioeducativo ISE"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                className="block h-full w-auto object-contain object-bottom drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] select-none scale-[1.42] origin-bottom"
                draggable={false}
              />
            </picture>
          </div>
        </div>




      </article>
    </section>
  );
}
