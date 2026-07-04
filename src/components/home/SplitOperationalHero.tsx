import { useEffect, useState } from 'react';
import { ArrowUpRight, Radio, ShieldCheck, Activity, Fingerprint, Clock3, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import agent3d from '@/assets/hero/agent-ise-3d.png';
import vehicle3d from '@/assets/hero/vehicle-ise-3d.png';
import agentVehicleScene from '@/assets/hero/agent-vehicle-scene.png';
import brasao from '@/assets/hero/brasao-ise.png';
import objAlfa from '@/assets/teams/obj-alfa-shield.png';
import objBravo from '@/assets/teams/obj-bravo-sword.png';
import objCharlie from '@/assets/teams/obj-charlie-target.png';
import objDelta from '@/assets/teams/obj-delta-bolt.png';

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
  { key: 'ALFA',    motto: 'Escudo · Proteção',   op: 'OP-01', role: 'Defensiva',       accent: '43 96% 56%',  obj: objAlfa },
  { key: 'BRAVO',   motto: 'Espada · Ação',       op: 'OP-02', role: 'Ofensiva',        accent: '14 82% 58%',  obj: objBravo },
  { key: 'CHARLIE', motto: 'Alvo · Precisão',     op: 'OP-03', role: 'Reconhecimento',  accent: '38 96% 60%',  obj: objCharlie },
  { key: 'DELTA',   motto: 'Raio · Velocidade',   op: 'OP-04', role: 'Resposta Rápida', accent: '210 90% 62%', obj: objDelta },
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
  return (
    <div className="relative w-full border-y border-white/5 bg-slate-950/70 backdrop-blur-md shrink-0">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#eab308_50%,transparent)]" />
      <div className="mx-auto max-w-[1600px] px-3 sm:px-5">
        <div className="grid grid-cols-3 items-center h-7 font-mono text-[10px] uppercase tracking-[0.22em]">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-400" strokeWidth={2.2} />
            <span className="truncate text-slate-300">
              Online<span className="hidden sm:inline text-slate-500"> · Enlace Seguro</span>
            </span>
          </div>
          <div className="hidden md:flex items-center justify-center text-slate-400/80 truncate">
            QSL, Feijó! · Franc.D'nis
          </div>
          <div className="md:hidden" />
          <div className="flex items-center justify-end gap-3 min-w-0">
            <span className="flex items-center gap-1.5 text-amber-400 tabular-nums">
              <Clock3 className="h-3 w-3" strokeWidth={2.2} />
              {clock}
            </span>
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
        <div className="relative grid gap-3 p-3 sm:p-4 lg:grid-cols-[1fr_1.1fr_0.9fr] items-center flex-1 min-h-0">

          {/* LEFT — Identity + CTA */}
          <div className="relative z-20 min-w-0 flex flex-col gap-2.5 justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <img
                src={brasao}
                alt="Brasão ISE Acre"
                className="h-8 w-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)] select-none"
                draggable={false}
              />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.24em] text-red-300 backdrop-blur">
                <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                ISE Acre
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h1
                id="mission-title"
                className="font-sans font-black uppercase tracking-tighter text-white text-[24px] sm:text-[32px] lg:text-[36px] leading-[0.95]"
              >
                Sistema<br />Socioeducativo
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400">
                Comando Operacional de Escalas
              </p>
            </div>

            <p className="hidden sm:block max-w-md text-[12px] text-slate-400 leading-relaxed">
              Plataforma integrada para agentes socioeducativos do Acre.
              Escalas, plantões e comunicação em tempo real.
            </p>

            <button
              type="button"
              onClick={onPrimaryAction}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-amber-500 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] font-bold text-black hover:bg-amber-400 hover:shadow-[0_0_35px_rgba(234,179,8,0.55)] transition-all"
            >
              <Fingerprint className="h-4 w-4" strokeWidth={2.4} />
              Autenticação Segura
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

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

          {/* CENTER — Agent 3D */}
          <div className="relative flex items-end justify-center h-full min-h-[180px] order-first lg:order-none z-30 translate-y-16 sm:translate-y-24 lg:translate-y-32">
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
            <div className="relative inline-block leading-[0] isolate" style={{ height: 'clamp(200px, 28vw, 380px)' }}>
              <img
                src={agentVehicleScene}
                alt="Agente Socioeducativo ao lado da viatura tática ISE"
                className="block h-full w-auto object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.95)] select-none"
                draggable={false}
              />
              {/* Giroflex — halos ancorados em % da bounding box da cena */}
              <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none">
                {/* Lâmpadas azuis (lado esquerdo da barra da viatura) */}
                <span
                  className="absolute rounded-full blur-[6px] bg-[radial-gradient(ellipse,rgba(59,130,246,1)_0%,rgba(59,130,246,0.55)_35%,transparent_70%)] animate-[giroflex-blue_0.8s_steps(2,end)_infinite]"
                  style={{ left: '46%', top: '15%', width: '9%', height: '4%', transformOrigin: '50% 50%', transform: 'translateZ(0)' }}
                />
                {/* Lâmpadas vermelhas (lado direito da barra da viatura) */}
                <span
                  className="absolute rounded-full blur-[6px] bg-[radial-gradient(ellipse,rgba(239,68,68,1)_0%,rgba(239,68,68,0.55)_35%,transparent_70%)] animate-[giroflex-red_0.8s_steps(2,end)_infinite]"
                  style={{ left: '55%', top: '15%', width: '9%', height: '4%', transformOrigin: '50% 50%', transform: 'translateZ(0)' }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Compact HUD */}
          <div className="relative z-20 rounded-xl border border-white/5 bg-slate-950/60 backdrop-blur-md p-3 shadow-[inset_0_1px_0_rgba(234,179,8,0.12)] flex flex-col justify-center gap-2 h-full">
            <span aria-hidden className="absolute top-1.5 left-1.5 h-2.5 w-2.5 border-l border-t border-amber-400/60" />
            <span aria-hidden className="absolute top-1.5 right-1.5 h-2.5 w-2.5 border-r border-t border-amber-400/60" />
            <span aria-hidden className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-l border-b border-amber-400/60" />
            <span aria-hidden className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-r border-b border-amber-400/60" />

            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-400">Status</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="font-mono tabular-nums text-[32px] sm:text-[38px] leading-none font-bold text-amber-400 tracking-[0.02em] drop-shadow-[0_0_25px_rgba(234,179,8,0.35)]">
              {clock}
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-400">{day}</div>

            <dl className="grid grid-cols-3 gap-1.5 pt-2 mt-1 border-t border-white/5 divide-x divide-white/5">
              {[
                { label: 'Equipes', value: '04' },
                { label: 'Ciclo', value: '24H' },
                { label: 'Folga', value: '72H' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-0.5 px-1.5 first:pl-0 last:pr-0">
                  <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-slate-500">{label}</dt>
                  <dd className="font-mono text-[16px] font-bold text-white tabular-nums leading-none">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.22em]">
              <span className="text-slate-500">Enlace</span>
              <span className="text-amber-400">AES-256</span>
            </div>
          </div>
        </div>

        {/* ============ BOTTOM: Team Selector Grid — Compact 3D Security Objects ============ */}
        <div className="relative shrink-0 px-2 sm:px-3 pb-2">
          <div className="flex items-center justify-between px-1 pb-1.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-slate-500">
              Selecione sua Equipe
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-amber-400/80">
              4 Divisões
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TEAMS.map((t) => (
              <button
                key={t.key}
                data-team-card
                onClick={() => onTeamClick(t.key)}
                className={cn(
                  'group relative flex h-[130px] sm:h-[150px] flex-col overflow-hidden rounded-xl border text-left',
                  'border-white/5 bg-slate-950/60 backdrop-blur-md',
                  'transition-all duration-500 hover:border-amber-400/50 hover:-translate-y-0.5',
                  'shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] hover:shadow-[0_20px_45px_-15px_rgba(234,179,8,0.45)]',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70',
                )}
                style={{ ['--team-accent' as any]: t.accent }}
              >
                {/* 3D Security Object — dominant */}
                <div className="relative z-20 flex items-center justify-center flex-1 min-h-0 p-2 pt-4">
                  <img
                    src={t.obj}
                    alt={`Equipe ${t.key} — objeto tático 3D`}
                    loading="lazy"
                    className="max-h-[95%] max-w-[70%] object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-0.5 select-none"
                    draggable={false}
                  />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(2,6,15,0.75)_70%,rgba(2,6,15,0.98)_100%)] z-10 pointer-events-none" />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                  style={{ background: `linear-gradient(180deg, transparent 0%, hsl(${t.accent} / 0.30) 100%)` }}
                />
                <span
                  aria-hidden
                  className="absolute top-0 left-0 h-px w-full"
                  style={{ background: `linear-gradient(90deg, hsl(${t.accent}), transparent)` }}
                />
                <span
                  className="absolute top-1.5 right-1.5 font-mono text-[8.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded backdrop-blur-md border"
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
                    className="font-sans font-black text-xl sm:text-2xl leading-none tracking-tight uppercase"
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
