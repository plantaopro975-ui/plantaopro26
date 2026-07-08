import { useEffect, useState, useCallback } from 'react';
import { Radio, ShieldCheck, Activity, Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OperationalStatusRibbon } from './OperationalStatusRibbon';
import { RoundsManager } from './RoundsManager';
import { useOperationalMetrics } from '@/hooks/useOperationalMetrics';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import loginHeroImage from '@/assets/login-hero.jpg';




import agent3dAsset from '@/assets/hero/agent-ise-3d.png.asset.json';
const agent3d = agent3dAsset.url;
import vehicle3dAsset from '@/assets/hero/vehicle-ise-3d.png.asset.json';
const vehicle3d = vehicle3dAsset.url;
import vehicleMobileAsset from '@/assets/hero/vehicle-ise-mobile.png.asset.json';
const vehicleMobile = vehicleMobileAsset.url;
import agentVehicleSceneAsset from '@/assets/hero/agent-vehicle-scene.png.asset.json';
const agentVehicleScene = agentVehicleSceneAsset.url;
import agentVehicleSceneWebpAsset from '@/assets/hero/agent-vehicle-scene.webp.asset.json';
const agentVehicleSceneWebp = agentVehicleSceneWebpAsset.url;
import objAlfaAsset from '@/assets/teams/alfa-vest-pro.png.asset.json';
const objAlfa = objAlfaAsset.url;
import objBravoAsset from '@/assets/teams/bravo-helmet-pro.png.asset.json';
const objBravo = objBravoAsset.url;
import objCharlieAsset from '@/assets/teams/charlie-badge-pro.png.asset.json';
const objCharlie = objCharlieAsset.url;
import objDeltaAsset from '@/assets/teams/delta-radio-pro.png.asset.json';
const objDelta = objDeltaAsset.url;
import bgAlfaAsset from '@/assets/teams/bg-alfa.jpg.asset.json';
const bgAlfa = bgAlfaAsset.url;
import bgBravoAsset from '@/assets/teams/bg-bravo.jpg.asset.json';
const bgBravo = bgBravoAsset.url;
import bgCharlieAsset from '@/assets/teams/bg-charlie.jpg.asset.json';
const bgCharlie = bgCharlieAsset.url;
import bgDeltaAsset from '@/assets/teams/bg-delta.jpg.asset.json';
const bgDelta = bgDeltaAsset.url;
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
  bg: string;
}[] = [
  { key: 'ALFA',    motto: 'Colete · Proteção',   op: 'OP-01', role: 'Defensiva',       accent: '43 96% 56%',  obj: objAlfa,    bg: bgAlfa },
  { key: 'BRAVO',   motto: 'Capacete · Ação',     op: 'OP-02', role: 'Ofensiva',        accent: '14 82% 58%',  obj: objBravo,   bg: bgBravo },
  { key: 'CHARLIE', motto: 'Distintivo · Honra',  op: 'OP-03', role: 'Reconhecimento',  accent: '38 96% 60%',  obj: objCharlie, bg: bgCharlie },
  { key: 'DELTA',   motto: 'Rádio · Velocidade',  op: 'OP-04', role: 'Resposta Rápida', accent: '210 90% 62%', obj: objDelta,   bg: bgDelta },
];

interface TeamObjectProps {
  team: { key: string; obj: string };
  isAlfa: boolean;
  idx: number;
}
function TeamObject({ team, isAlfa, idx }: TeamObjectProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {/* Skeleton blur-up: fixa espaço, evita CLS */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-3 rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
          'transition-opacity duration-500',
          loaded ? 'opacity-0' : 'opacity-100 animate-pulse',
        )}
      />
      <picture className="relative flex h-full w-full items-center justify-center">
        <img
          src={team.obj}
          alt={`Equipe ${team.key} — equipamento tático 3D`}
          loading={isAlfa ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={isAlfa ? 'high' : 'low'}
          width={512}
          height={512}
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 18vw, 200px"
          onLoad={() => setLoaded(true)}
          className={cn(
            'block h-full w-full max-h-[95%] max-w-[92%] sm:max-h-[80%] sm:max-w-[65%] lg:max-h-[82%] lg:max-w-[72%] xl:max-h-[85%] xl:max-w-[78%] object-contain select-none animate-float3d',
            'drop-shadow-[0_18px_28px_rgba(0,0,0,0.85)]',
            'transition-[transform,opacity] duration-700 ease-out',
            'group-hover:scale-[1.12] group-hover:-translate-y-1',
            'group-active:scale-[1.04]',
            isAlfa && 'alfa-vest',
            loaded ? 'opacity-100' : 'opacity-0 blur-md',
          )}
          draggable={false}
          style={{
            transformOrigin: '50% 60%',
            animationDelay: `${idx * 0.6}s`,
            contentVisibility: 'auto',
          }}
        />
      </picture>
    </>
  );
}





export function SplitOperationalHero({ onTeamClick }: Props) {
  // Preload only the first-in-viewport 3D image (ALFA)
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = objAlfa;
    link.type = 'image/png';
    (link as any).fetchPriority = 'high';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const metrics = useOperationalMetrics();
  const uplinkTone =
    metrics.uplink === 'online'
      ? { dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]', text: 'text-emerald-300/90', label: 'Online' }
      : metrics.uplink === 'degraded'
      ? { dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]', text: 'text-amber-300/90', label: 'Instável' }
      : { dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]', text: 'text-rose-300/90', label: 'Offline' };
  const fmt2 = (n: number) => String(n).padStart(2, '0');
  const onlineAgents = useOnlinePresence('agents-online');
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);
  const handleSelect = useCallback((k: TeamKey) => {
    setSelectedTeam(k);
    onTeamClick(k);
  }, [onTeamClick]);




  return (
    <section className="relative mx-auto w-full max-w-[1600px] flex flex-col h-full min-h-0">



      {/* ============ SINGLE VIEWPORT STAGE ============ */}
      <article
        className="relative overflow-hidden mt-1 sm:mt-2 mx-2 sm:mx-3 rounded-2xl border border-white/5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] sm:flex-1 min-h-0 flex flex-col"
        aria-labelledby="mission-title"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0A1128 0%, #050505 70%)',
        }}
      >
        {/* Imagem de fundo profissional */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${loginHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
          }}
        />
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
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(234,179,8,0.16), transparent 70%)' }}
        />


        {/* ============ MOBILE-ONLY — Canal Seguro ribbon no topo (substitui título) ============ */}
        <div className="sm:hidden relative z-30 px-2 pt-0 pb-0 mb-0 -mt-0.5 order-1">
          <OperationalStatusRibbon />
        </div>

        {/* ============ TOP ROW — Identification + Agent + HUD ============ */}
        <div className="relative grid gap-1 sm:gap-4 px-0 sm:px-5 pt-0 sm:pt-2 pb-0 md:grid-cols-[0.95fr_1.05fr] items-start shrink-0 order-4 sm:order-none mt-0">

          {/* LEFT — CTA + selos */}
          <div className="relative z-20 min-w-0 flex flex-col gap-2.5 sm:gap-4 items-stretch mt-1 sm:mt-0">


            <div className="hidden sm:flex flex-col gap-1 sm:gap-1.5">
              <span className="hidden items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300 leading-[1.4] py-0.5 sm:inline-flex">
                <span className="h-1 w-6 bg-amber-400" />
                Sistema Operacional
              </span>
              <h2 className="font-sans font-black uppercase tracking-[0.02em] text-white text-[20px] sm:text-[26px] lg:text-[32px] leading-[1.05]">

                Comando <span className="text-amber-400">Tático</span><br />
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
                  <span className="font-mono text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300 truncate">
                    Briefing Operacional
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 font-mono text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.24em] shrink-0',
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
                      v: metrics.loading ? '——' : fmt2(metrics.agentsActive),
                      s: 'Agentes ativos',
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
                          <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
                            <span className="absolute inset-0 rounded-full bg-emerald-400/70 animate-ping" />
                            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                          </span>
                        )}
                        {it.k}
                      </div>
                      <div
                        className={cn(
                          'font-sans font-black text-[15px] md:text-[17px] lg:text-[18px] leading-none mt-0.5 tabular-nums',
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
          <div className="relative flex items-end justify-center sm:justify-center min-h-[146px] min-[390px]:min-h-[162px] sm:min-h-[clamp(90px,14vh,220px)] lg:min-h-[clamp(220px,30vh,320px)] xl:min-h-[clamp(260px,34vh,380px)] md:order-none z-[90] overflow-visible pb-0 mb-0 sm:-mb-2 pt-1 sm:pt-0 px-2 sm:px-0">
            {/* Selo "Sistema Operacional" mobile removido a pedido do usuário */}


            <svg
              aria-hidden
              viewBox="0 0 400 400"
              className="absolute inset-x-0 top-0 h-[90%] w-full opacity-30 animate-[spin_80s_linear_infinite]"
            >
              <circle cx="200" cy="200" r="188" fill="none" stroke="#eab308" strokeOpacity="0.35" strokeWidth="0.7" strokeDasharray="3 9" />
              <circle cx="200" cy="200" r="150" fill="none" stroke="#eab308" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="2 6" />
              <circle cx="200" cy="200" r="110" fill="none" stroke="#eab308" strokeOpacity="0.2" strokeWidth="0.5" />
            </svg>
            <div
              aria-hidden
              className="absolute bottom-2 left-1/2 -translate-x-1/2 md:left-[28%] lg:left-[22%] xl:left-[18%] h-12 w-[70%] rounded-[50%]"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.35) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            {/* Cena composta:
                MOBILE  → viatura à esquerda + agente à direita (justify-between, compacto)
                DESKTOP → mantém composição centralizada equilibrada */}
            <div
              className="relative z-50 inline-flex items-end justify-center gap-1 sm:gap-2 lg:gap-3 leading-[0] isolate w-full sm:w-auto h-[146px] min-[390px]:h-[162px] sm:h-[clamp(90px,14vh,240px)] lg:h-[clamp(220px,30vh,320px)] xl:h-[clamp(260px,34vh,380px)] translate-y-0 md:-translate-x-[18%] lg:-translate-x-[22%] xl:-translate-x-[26%] pr-0 sm:pr-0 max-w-full"
            >

              {/* Viatura — mobile: menor, encostada à esquerda | desktop: mantém */}
              <picture className="relative block h-full leading-[0] translate-y-1.5 sm:translate-y-0">
                <img
                  src={vehicle3d}
                  alt="Viatura tática ISE"
                  width={1024}
                  height={1024}
                  className="block h-full w-auto object-contain object-left-bottom sm:object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.9)] sm:drop-shadow-[0_28px_40px_rgba(0,0,0,0.9)] select-none scale-[1.12] sm:scale-100 lg:scale-[1.12] xl:scale-[1.2] origin-bottom-left"
                  draggable={false}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 scale-[1.12] sm:scale-100 lg:scale-[1.12] xl:scale-[1.2] origin-bottom-left"
                >
                  <span
                    aria-hidden
                    className="giroflex-flash giroflex-flash-blue motion-reduce:hidden"
                    style={{ top: '22.4%', left: '48.2%' }}
                  />
                  <span
                    aria-hidden
                    className="giroflex-flash giroflex-flash-red motion-reduce:hidden"
                    style={{ top: '23.1%', left: '64.0%' }}
                  />
                </span>
              </picture>

              {/* Agente — mobile: menor, encostado à direita | desktop: mantém */}
              <picture className="relative z-50 block h-full leading-[0] flex items-end -ml-2 sm:ml-0">
                <img
                  src={agent3d}
                  alt="Agente Socioeducativo ISE"
                  className="block h-full max-h-full w-auto object-contain object-bottom drop-shadow-[0_18px_28px_rgba(0,0,0,0.9)] sm:drop-shadow-[0_28px_40px_rgba(0,0,0,0.9)] select-none sm:-ml-2 scale-100 sm:scale-100 lg:scale-[1.05] xl:scale-[1.12] translate-y-0 lg:translate-y-4 xl:translate-y-6 origin-bottom sm:origin-bottom"
                  draggable={false}
                />
              </picture>
            </div>

          </div>

        </div>

        {/* Mobile-only "Gestor de Rondas" — compacto, para subir os demais elementos */}
        <div className="relative z-30 px-3 sm:hidden mt-0 mb-1 order-2 sm:order-none">
          <RoundsManager
            customTrigger={
              <button
                type="button"
                aria-label="Abrir Gestor de Rondas"
                className="group relative w-full inline-flex items-center justify-center gap-2 rounded-lg border border-amber-400/55 bg-[linear-gradient(135deg,rgba(30,20,5,0.9)_0%,rgba(60,40,8,0.75)_50%,rgba(30,20,5,0.9)_100%)] px-3 py-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6),0_6px_18px_-10px_rgba(234,179,8,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.985] transition overflow-hidden"
              >
                {/* corner brackets — menores */}
                <span aria-hidden className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-amber-300/70" />
                <span aria-hidden className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-amber-300/70" />
                <span aria-hidden className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-amber-300/70" />
                <span aria-hidden className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-amber-300/70" />
                <span aria-hidden className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_0%,rgba(234,179,8,0.15)_50%,transparent_100%)] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <span className="relative inline-flex h-4 w-4 shrink-0">
                  <Radar className="h-4 w-4 text-amber-300 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]" strokeWidth={2.4} />
                  <span className="absolute inset-0 rounded-full bg-amber-400/25 blur-[3px] animate-pulse" />
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]">
                  Gestor de Rondas
                </span>
                <span aria-hidden className="ml-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-300/90">ATIVO</span>
                </span>
              </button>
            }
          />
        </div>


        {/* ============ Team Selector Grid — no mobile vai para o topo (order-2) ============ */}
        <div className="relative shrink-0 px-2 sm:px-3 pt-0 sm:pt-3 pb-1 mt-0 sm:mt-2 order-3 sm:order-none">

          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="font-mono text-[10.5px] sm:text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-200">
              Selecione sua Equipe
            </span>
            <span className="font-mono text-[10.5px] sm:text-[9px] font-semibold uppercase tracking-[0.24em] text-amber-300">
              4 Divisões
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 xl:gap-4" style={{ perspective: '900px' }}>

            {TEAMS.map((t, idx) => {
              const isSelected = selectedTeam === t.key;
              return (
              <button
                key={t.key}
                data-team-card
                data-team={t.key}
                aria-pressed={isSelected}
                onClick={() => handleSelect(t.key)}
                className={cn(
                  'group relative flex h-[clamp(112px,17.5vh,156px)] min-[390px]:h-[clamp(122px,18vh,168px)] sm:h-[clamp(100px,17vh,170px)] lg:h-[clamp(160px,24vh,230px)] xl:h-[clamp(190px,28vh,270px)] flex-col overflow-hidden rounded-xl border-[1.5px] text-left bg-transparent isolate',
                  'transition-all duration-300 ease-out will-change-transform [transform-style:preserve-3d]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:ring-[hsl(var(--team-accent)/0.8)]',
                  isSelected
                    ? 'border-[hsl(var(--team-accent))] -translate-y-1.5 scale-[1.02] shadow-[0_0_0_2px_hsl(var(--team-accent)/0.85),0_0_0_4px_rgba(2,6,23,0.9),0_18px_40px_-12px_hsl(var(--team-accent)/0.6),0_10px_20px_-8px_rgba(0,0,0,0.85)] ring-1 ring-[hsl(var(--team-accent)/0.45)]'
                    : 'border-slate-300/25 shadow-[0_0_0_1px_rgba(15,23,42,0.75),inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:border-[hsl(var(--team-accent)/0.85)] hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_0_1.5px_hsl(var(--team-accent)/0.7),0_14px_30px_-14px_hsl(var(--team-accent)/0.5),0_8px_18px_-10px_rgba(0,0,0,0.75)] active:translate-y-0 active:scale-[0.99]',
                )}
                style={{ ['--team-accent' as any]: t.accent }}
              >
                {/* Realistic background image per team */}
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
                {/* Vignette-only overlay — mantém cores vivas, escurece só as bordas para legibilidade */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.78)_100%)]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-slate-950/90 to-transparent"
                />
                {/* Accent color wash on hover/selected */}
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-0 z-[2] transition-opacity duration-500 mix-blend-overlay',
                    isSelected ? 'opacity-40' : 'opacity-0 group-hover:opacity-25',
                  )}
                  style={{
                    background: `radial-gradient(ellipse at 50% 40%, hsl(${t.accent} / 0.6) 0%, transparent 70%)`,
                  }}
                />
                {/* Scanline sheen removed per request */}
                {/* SELECTED indicator: corner brackets */}
                {isSelected && (
                  <>
                    <span aria-hidden className="absolute top-1 left-1 z-30 h-3 w-3 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: `hsl(${t.accent})` }} />
                    <span aria-hidden className="absolute top-1 right-1 z-30 h-3 w-3 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: `hsl(${t.accent})` }} />
                    <span aria-hidden className="absolute bottom-1 left-1 z-30 h-3 w-3 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: `hsl(${t.accent})` }} />
                    <span aria-hidden className="absolute bottom-1 right-1 z-30 h-3 w-3 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: `hsl(${t.accent})` }} />
                  </>
                )}
                {/* Halo: ALFA usa variante exclusiva; demais compartilham .team-halo */}
                {t.key === 'ALFA' ? (
                  <span aria-hidden className="alfa-halo" />
                ) : (
                  <span aria-hidden className="team-halo" />
                )}

                {/* 3D Security Object — <picture> AVIF/WebP/PNG + skeleton blur-up */}
                <div className="relative z-20 flex items-center justify-center flex-1 min-h-0 p-0.5 pt-2 sm:p-2 sm:pt-4 [perspective:600px]">
                  <TeamObject team={t} isAlfa={t.key === 'ALFA'} idx={idx} />
                </div>




                {/* top accent line */}
                <span
                  aria-hidden
                  className="absolute top-0 left-0 h-px w-full"
                  style={{ background: `linear-gradient(90deg, hsl(${t.accent}), transparent)` }}
                />
                {/* live pulse dot (reação) */}
                <span
                  aria-hidden
                  className="absolute top-2 left-2 z-30 flex h-2 w-2"
                >
                  <span
                    className="absolute inset-0 rounded-full animate-ping opacity-70"
                    style={{ background: `hsl(${t.accent})` }}
                  />
                  <span
                    className="relative h-2 w-2 rounded-full"
                    style={{ background: `hsl(${t.accent})`, boxShadow: `0 0 8px hsl(${t.accent} / 0.9)` }}
                  />
                </span>
                <span
                  className="absolute top-1.5 right-1.5 z-30 font-mono text-[8.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded backdrop-blur-md border"
                  style={{
                    color: `hsl(${t.accent})`,
                    borderColor: `hsl(${t.accent} / 0.5)`,
                    background: `hsl(${t.accent} / 0.12)`,
                  }}
                >
                  {t.op}
                </span>
                {(() => {
                  // Deriva gradiente metálico automaticamente: mantém H e S da equipe,
                  // varia APENAS L em stops fixos (highlight → base → sombra → rebote → base escura).
                  const [h, s] = t.accent.split(' ');
                  const L = { hi: 88, up: 62, mid: 32, lo: 55, base: 24, deep: 12, bevelHi: 96, bevelLo: 18, glow: 95 } as const;
                  const c = (l: number, a?: number) =>
                    a === undefined ? `hsl(${h} ${s} ${l}%)` : `hsl(${h} ${s} ${l}% / ${a})`;
                  const uid = `tn-${t.key}`;
                  const stops: { off: string; l: number }[] = [
                    { off: '0%',   l: L.hi },
                    { off: '35%',  l: L.up },
                    { off: '52%',  l: L.mid },
                    { off: '68%',  l: L.lo },
                    { off: '100%', l: L.base },
                  ];
                  return (
                    <div className="relative z-20 flex flex-col gap-0.5 px-2 pb-2 sm:gap-1 sm:px-2.5 sm:pb-2">
                      <svg viewBox="0 0 300 72" className="block w-full h-11 min-[390px]:h-12 sm:h-12 lg:h-14 xl:h-16" aria-label={t.key} role="img">
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
                          {/* extrusão */}
                          <text x="150" y="54" fontSize="56" fill={c(L.deep)}  transform="translate(0,3)" letterSpacing="6">{t.key}</text>
                          <text x="150" y="54" fontSize="56" fill={c(L.base)}  transform="translate(0,1.5)" letterSpacing="6">{t.key}</text>
                          {/* face */}
                          <text x="150" y="54" fontSize="56" fill={`url(#${uid}-fill)`} stroke={`url(#${uid}-bevel)`} strokeWidth="1.4" paintOrder="stroke" letterSpacing="6">{t.key}</text>
                          {/* sheen superior */}
                          <text x="150" y="54" fontSize="56" fill={`url(#${uid}-sheen)`} letterSpacing="6" clipPath="inset(0 0 58% 0)">{t.key}</text>
                        </g>
                      </svg>

                      <span
                        className="font-mono text-[9px] min-[390px]:text-[9.5px] sm:text-[9.5px] uppercase tracking-[0.24em] sm:tracking-[0.28em] truncate text-slate-200"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                      >
                        {t.motto}
                      </span>
                    </div>
                  );
                })()}
              </button>
              );
            })}
          </div>

          {/* ============ TACTICAL STATUS RIBBON — SVG HUD (desktop; no mobile já está no topo) ============ */}
          <div className="hidden sm:block">
            <OperationalStatusRibbon />
          </div>

        </div>

      </article>
    </section>
  );
}
