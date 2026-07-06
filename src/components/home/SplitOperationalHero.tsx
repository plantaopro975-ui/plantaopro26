import { useEffect, useState, useCallback } from 'react';
import { Radio, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OperationalStatusRibbon } from './OperationalStatusRibbon';
import { useOperationalMetrics } from '@/hooks/useOperationalMetrics';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';


import agent3d from '@/assets/hero/agent-ise-3d.png';
import agent3dWebp from '@/assets/hero/agent-ise-3d.webp';
import vehicle3d from '@/assets/hero/vehicle-ise-3d.png';
import vehicle3dWebp from '@/assets/hero/vehicle-ise-3d.webp';
import agentVehicleScene from '@/assets/hero/agent-vehicle-scene.png';
import agentVehicleSceneWebp from '@/assets/hero/agent-vehicle-scene.webp';


import objAlfa from '@/assets/teams/alfa-vest-pro.png';
import objBravo from '@/assets/teams/bravo-helmet-pro.png';
import objCharlie from '@/assets/teams/charlie-badge-pro.png';
import objDelta from '@/assets/teams/delta-radio-pro.png';

import bgAlfa from '@/assets/teams/bg-alfa.jpg';
import bgBravo from '@/assets/teams/bg-bravo.jpg';
import bgCharlie from '@/assets/teams/bg-charlie.jpg';
import bgDelta from '@/assets/teams/bg-delta.jpg';

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
          sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 200px"
          onLoad={() => setLoaded(true)}
          className={cn(
            'block h-full w-full max-h-[80%] max-w-[65%] object-contain select-none animate-float3d',
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




  return (
    <section className="relative mx-auto w-full max-w-[1600px] flex flex-col h-full min-h-0">



      {/* ============ SINGLE VIEWPORT STAGE ============ */}
      <article
        className="relative overflow-hidden mt-2 mx-2 sm:mx-3 rounded-2xl border border-white/5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] flex-1 min-h-0 flex flex-col"
        aria-labelledby="mission-title"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #0A1128 0%, #050505 70%)',
        }}
      >
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

        {/* ============ TOP ROW — Identification + Agent + HUD ============ */}
        <div className="relative grid gap-3 sm:gap-4 px-3 sm:px-5 pt-2 pb-0 md:grid-cols-[0.95fr_1.05fr] items-start shrink-0">

          {/* LEFT — CTA + selos */}
          <div className="relative z-20 min-w-0 flex flex-col gap-4 items-stretch">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/90 leading-[1.4] py-0.5">
                <span className="h-1 w-6 bg-amber-400/70" />
                Sistema Operacional
              </span>
              <h2 className="font-sans font-black uppercase tracking-[0.02em] text-white text-[20px] sm:text-[26px] lg:text-[32px] leading-[1.05]">

                Comando <span className="text-amber-400">Tático</span><br />
                Socioeducativo
              </h2>
            </div>



            <div className="flex flex-wrap items-center gap-3 text-slate-500">
              <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.18em]">
                <ShieldCheck className="h-3 w-3 text-amber-400" /> RLS
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.18em]">
                <Activity className="h-3 w-3 text-emerald-400" /> Realtime
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.18em]">
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
                  <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-[0.32em] text-amber-400/90 truncate">
                    Briefing Operacional
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-1 font-mono text-[8px] md:text-[9px] uppercase tracking-[0.28em] shrink-0',
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
                      <div className="font-mono text-[7.5px] md:text-[8px] uppercase tracking-[0.24em] text-slate-400 truncate flex items-center gap-1">
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
                      <div className="font-mono text-[7.5px] md:text-[8px] uppercase tracking-[0.2em] text-slate-500 mt-0.5 truncate">
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
                  <span className="ml-auto pl-2 font-mono text-[7.5px] md:text-[8px] uppercase tracking-[0.24em] text-amber-300/80 shrink-0">
                    ISE · AC · BR
                  </span>
                </div>
              </div>
            </div>
          </div>



          {/* RIGHT — Agent 3D */}
          <div className="relative flex items-end justify-center min-h-[140px] md:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px] 2xl:min-h-[240px] order-first md:order-none z-30 overflow-visible pb-0 -mb-2">

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
            {/* Cena composta: agente + viatura em escala realista */}
            <div className="relative inline-block leading-[0] isolate md:-translate-x-[22%] lg:-translate-x-[28%] xl:-translate-x-[32%]" style={{ height: 'clamp(130px, 18vw, 240px)' }}>
              <picture>
                <source srcSet={agentVehicleSceneWebp} type="image/webp" />
                <img
                  src={agentVehicleScene}
                  alt="Agente Socioeducativo ao lado da viatura tática ISE"
                  className="block h-full w-auto object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.95)] select-none"
                  draggable={false}
                />
              </picture>




            </div>
          </div>

        </div>

        {/* ============ BOTTOM: Team Selector Grid — Compact 3D Security Objects ============ */}
        <div className="relative shrink-0 px-2 sm:px-3 pt-0 pb-2 -mt-2 sm:-mt-4">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500">
              Selecione sua Equipe
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-amber-400/80">
              4 Divisões
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2" style={{ perspective: '900px' }}>
            {TEAMS.map((t, idx) => (
              <button
                key={t.key}
                data-team-card
                data-team={t.key}
                onClick={() => onTeamClick(t.key)}
                className={cn(
                  'group relative flex h-[140px] sm:h-[170px] flex-col overflow-hidden rounded-xl border text-left bg-transparent',
                  'border-white/10',
                  'transition-all duration-500 will-change-transform [transform-style:preserve-3d]',
                  'hover:border-[hsl(var(--team-accent)/0.6)] hover:-translate-y-1',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--team-accent)/0.7)]',
                )}
                style={{ ['--team-accent' as any]: t.accent }}
              >
                {/* Realistic background image per team */}
                <picture className="pointer-events-none absolute inset-0 z-0 block h-full w-full">
                  <source srcSet={t.bgWebp} type="image/webp" />
                  <img
                    src={t.bg}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover opacity-90 saturate-125 contrast-110 transition-opacity duration-500 group-hover:opacity-100"
                    draggable={false}
                  />
                </picture>
                {/* Vignette-only overlay — mantém cores vivas, escurece só as bordas para legibilidade */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.75)_100%)]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-t from-slate-950/90 to-transparent"
                />
                {/* Halo: ALFA usa variante exclusiva; demais compartilham .team-halo */}
                {t.key === 'ALFA' ? (
                  <span aria-hidden className="alfa-halo" />
                ) : (
                  <span aria-hidden className="team-halo" />
                )}

                {/* 3D Security Object — <picture> AVIF/WebP/PNG + skeleton blur-up */}
                <div className="relative z-20 flex items-center justify-center flex-1 min-h-0 p-2 pt-4 [perspective:600px]">
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
                    <div className="relative z-20 flex flex-col gap-1 px-2.5 pb-2">
                      <svg viewBox="0 0 300 72" className="block w-full h-10 sm:h-12" aria-label={t.key} role="img">
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
                        className="font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.28em] truncate text-slate-200"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
                      >
                        {t.motto}
                      </span>
                    </div>
                  );
                })()}
              </button>
            ))}
          </div>

          {/* ============ TACTICAL STATUS RIBBON — SVG HUD ============ */}
          <OperationalStatusRibbon />

        </div>

      </article>
    </section>
  );
}
