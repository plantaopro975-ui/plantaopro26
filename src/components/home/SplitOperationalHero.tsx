import { useEffect, useState } from 'react';
import { ArrowUpRight, Radio, ShieldCheck, Activity, Fingerprint, Clock3, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import agent3d from '@/assets/hero/agent-ise-3d.png';
import vehicle3d from '@/assets/hero/vehicle-ise-3d.png';
import agentVehicleScene from '@/assets/hero/agent-vehicle-scene.png';
import hudBg from '@/assets/hero/hud-bg.jpg.asset.json';

import objAlfa from '@/assets/teams/alfa-shield-real.png';
import objBravo from '@/assets/teams/bravo-helmet-real.png';
import objCharlie from '@/assets/teams/charlie-badge-real.png';
import objDelta from '@/assets/teams/delta-radio-real.png';

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
  accent: string;
  obj: string;
}[] = [
  { key: 'ALFA',    motto: 'Escudo · Proteção',   op: 'OP-01', role: 'Defensiva',       accent: '43 96% 56%',  obj: objAlfa.url },
  { key: 'BRAVO',   motto: 'Capacete · Ação',     op: 'OP-02', role: 'Ofensiva',        accent: '14 82% 58%',  obj: objBravo.url },
  { key: 'CHARLIE', motto: 'Distintivo · Honra',  op: 'OP-03', role: 'Reconhecimento',  accent: '38 96% 60%',  obj: objCharlie.url },
  { key: 'DELTA',   motto: 'Rádio · Velocidade',  op: 'OP-04', role: 'Resposta Rápida', accent: '210 90% 62%', obj: objDelta.url },
];

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function pad(n: number) { return n.toString().padStart(2, '0'); }

/* ============ COMPACT TOP HUD BAR ============ */
function TopHudBar() {
  const now = useNow();
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const weekday = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').slice(0, 3).toUpperCase();
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}`;
  return (
    <div className="relative w-full border-y border-white/5 bg-slate-950/70 backdrop-blur-md shrink-0">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#eab308_50%,transparent)]" />
      <div className="mx-auto max-w-[1600px] px-3 sm:px-5">
        <div className="grid grid-cols-3 items-center h-8 font-mono text-[10px] uppercase tracking-[0.22em]">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-400" strokeWidth={2.2} />
            <span className="truncate text-slate-300">
              Online
            </span>
          </div>
          <div className="hidden md:flex items-center justify-center text-slate-400/80 truncate">
            QSL, Feijó! · Franc.D'nis
          </div>
          <div className="md:hidden" />
          <div className="flex items-center justify-end gap-2 min-w-0">
            {/* Destaque: DATA + HORA agrupadas */}
            <div className="flex items-stretch overflow-hidden rounded-md border border-primary/40 bg-slate-950/80 shadow-[0_0_10px_-4px_hsl(var(--primary)/0.6)]">
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-primary/90 tabular-nums text-[10px] sm:text-[11px] tracking-[0.18em]">
                <span className="hidden xs:inline">{weekday}</span>
                <span className="font-bold">{dateStr}</span>
              </span>
              <span aria-hidden className="w-px bg-primary/30" />
              <span className="flex items-center gap-1 px-1.5 sm:px-2 py-1 text-primary font-bold tabular-nums text-[11px] sm:text-[12px] tracking-[0.14em] drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">
                <Clock3 className="h-3 w-3" strokeWidth={2.4} />
                {clock}
              </span>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <User2 className="h-3 w-3" strokeWidth={2.2} />
              Agente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SplitOperationalHero({ onTeamClick, onPrimaryAction }: Props) {
  const now = useNow();
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const day = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase();

  return (
    <section className="relative mx-auto w-full max-w-[1600px] flex flex-col h-full min-h-0">
      <TopHudBar />

      {/* ============ TACTICAL TITLE STRIP — Noir & Gold (matches Header) ============ */}
      <div className="relative mx-2 sm:mx-3 mt-0 shrink-0 overflow-hidden rounded-md border-b border-t border-primary/25 bg-slate-950 bg-[radial-gradient(ellipse_at_top,hsl(217_60%_10%)_0%,hsl(217_62%_5%)_60%,hsl(217_62%_3%)_100%)] shadow-[0_8px_28px_-12px_hsl(217_62%_2%/0.9)]">
        {/* subtle photo background — low contrast so it doesn't fight the text */}
        <img
          src={hudBg.url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 grayscale-[0.4] blur-[1px] select-none"
          draggable={false}
        />
        {/* strong dark overlay for legibility */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,hsl(217_62%_3%/0.96)_0%,hsl(217_62%_4%/0.82)_50%,hsl(217_62%_3%/0.96)_100%)]"
        />
        {/* blueprint grid */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary)/0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.35) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
          }}
        />
        {/* corner brackets — hidden on very small screens to avoid overlap */}
        <span aria-hidden className="pointer-events-none absolute left-1 top-1 h-2 w-2 sm:h-2.5 sm:w-2.5 border-l border-t border-primary/70 hidden xs:block sm:block" />
        <span aria-hidden className="pointer-events-none absolute right-1 top-1 h-2 w-2 sm:h-2.5 sm:w-2.5 border-r border-t border-primary/70 hidden xs:block sm:block" />
        <span aria-hidden className="pointer-events-none absolute left-1 bottom-1 h-2 w-2 sm:h-2.5 sm:w-2.5 border-l border-b border-primary/70 hidden xs:block sm:block" />
        <span aria-hidden className="pointer-events-none absolute right-1 bottom-1 h-2 w-2 sm:h-2.5 sm:w-2.5 border-r border-b border-primary/70 hidden xs:block sm:block" />
        {/* gold glow lines (match header top/bottom) */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary))_30%,hsl(var(--primary))_70%,transparent_100%)] opacity-90" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative flex items-center justify-between gap-2 sm:gap-4 px-2.5 sm:px-6 py-2 sm:py-2.5 min-w-0">
          {/* left rail — op code */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.8)]" />
            </span>
            <span className="hidden [@media(min-width:380px)]:inline font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-primary drop-shadow-[0_1px_2px_hsl(217_62%_2%/0.9)]">
              OP&nbsp;//&nbsp;01
            </span>
          </div>

          {/* center — title */}
          <div className="flex min-w-0 flex-1 items-baseline justify-center gap-2 sm:gap-3">
            <span aria-hidden className="hidden sm:block h-[2px] w-6 lg:w-10 bg-[linear-gradient(90deg,transparent,hsl(var(--primary)))]" />
            <h1
              id="mission-title"
              className="min-w-0 font-sans font-black uppercase tracking-[0.02em] text-foreground text-[11px] [@media(min-width:380px)]:text-[12px] sm:text-[16px] lg:text-[20px] leading-none truncate drop-shadow-[0_1px_2px_hsl(217_62%_2%/0.9)]"
            >
              Sistema <span className="text-primary">Socioeducativo</span>
            </h1>
            <span aria-hidden className="hidden sm:block h-[2px] w-6 lg:w-10 bg-[linear-gradient(270deg,transparent,hsl(var(--primary)))]" />
          </div>

          {/* right rail — subtitle */}
          <p className="hidden md:block font-mono text-[9px] lg:text-[10px] uppercase tracking-[0.28em] text-muted-foreground shrink-0">
            Comando&nbsp;·&nbsp;Escalas
          </p>
        </div>
      </div>

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
        <div className="relative grid gap-3 sm:gap-4 px-3 sm:px-5 pt-3 pb-0 md:grid-cols-[0.95fr_1.05fr] items-end shrink-0">

          {/* LEFT — CTA + selos */}
          <div className="relative z-20 min-w-0 flex flex-col gap-4 items-stretch">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400/90">
                <span className="h-1 w-6 bg-amber-400/70" />
                Sistema Operacional
              </span>
              <h2 className="font-sans font-black uppercase tracking-[0.02em] text-white text-[20px] sm:text-[26px] lg:text-[32px] leading-[1.05]">
                Comando <span className="text-amber-400">Tático</span><br />
                Socioeducativo
              </h2>
            </div>

            <Button
              type="button"
              onClick={onPrimaryAction}
              size="lg"
              className="group w-full justify-center gap-2 bg-amber-500 text-black font-mono text-[11px] uppercase tracking-[0.24em] font-bold hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(234,179,8,0.55)] focus-visible:ring-amber-400/70 disabled:opacity-50"
            >
              <Fingerprint className="h-4 w-4" strokeWidth={2.4} />
              Autenticação Segura
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>

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
          </div>

          {/* RIGHT — Agent 3D */}
          <div className="relative flex items-end justify-center min-h-[200px] md:min-h-[260px] lg:min-h-[280px] xl:min-h-[310px] 2xl:min-h-[330px] order-first md:order-none z-30 overflow-visible pb-0 -mb-2">

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
              className="absolute bottom-2 left-1/2 -translate-x-1/2 h-16 w-[80%] rounded-[50%]"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.35) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            {/* Cena composta: agente + viatura em escala realista */}
            <div className="relative inline-block leading-[0] isolate" style={{ height: 'clamp(180px, 26vw, 340px)' }}>
              <img
                src={agentVehicleScene}
                alt="Agente Socioeducativo ao lado da viatura tática ISE"
                className="block h-full w-auto object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.95)] select-none"
                draggable={false}
              />




            </div>
          </div>

        </div>

        {/* ============ BOTTOM: Team Selector Grid — Compact 3D Security Objects ============ */}
        <div className="relative shrink-0 px-2 sm:px-3 pt-1 pb-2 mt-auto">
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
                {/* 3D Security Object — real 3D image with continuous 3D idle motion */}
                <div className="relative z-20 flex items-center justify-center flex-1 min-h-0 p-2 pt-4 [perspective:600px]">
                  <img
                    src={t.obj}
                    alt={`Equipe ${t.key} — equipamento tático 3D`}
                    loading="lazy"
                    className={cn(
                      'max-h-[95%] max-w-[75%] object-contain select-none animate-float3d',
                      'drop-shadow-[0_18px_28px_rgba(0,0,0,0.85)]',
                      'transition-transform duration-700 ease-out',
                      'group-hover:scale-[1.20] group-hover:-translate-y-1.5',
                      'group-active:scale-[1.05]',
                    )}
                    draggable={false}
                    style={{
                      transformOrigin: '50% 60%',
                      animationDelay: `${idx * 0.6}s`,
                    }}
                  />
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
                <div className="relative z-20 flex flex-col gap-0.5 px-2.5 pb-2">
                  <span
                    className="font-sans font-black text-xl sm:text-2xl leading-none tracking-tight uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    style={{ color: `hsl(${t.accent})` }}
                  >
                    {t.key}
                  </span>
                  <span className="font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.2em] text-slate-300 truncate">
                    {t.motto}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
