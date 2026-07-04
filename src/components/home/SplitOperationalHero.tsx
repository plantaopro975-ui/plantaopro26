import { useEffect, useState } from 'react';
import { ArrowUpRight, Radio, ShieldCheck, Users, Activity, Fingerprint, Clock3, User2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import agent3d from '@/assets/hero/agent-ise-3d.png';
import vehicle3d from '@/assets/hero/vehicle-ise-3d.png';
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
  { key: 'ALFA',    motto: 'Escudo · Proteção',      op: 'OP-01', role: 'Defensiva',       accent: '43 96% 56%',  obj: objAlfa },
  { key: 'BRAVO',   motto: 'Espada · Ação',          op: 'OP-02', role: 'Ofensiva',        accent: '14 82% 58%',  obj: objBravo },
  { key: 'CHARLIE', motto: 'Alvo · Precisão',        op: 'OP-03', role: 'Reconhecimento',  accent: '38 96% 60%',  obj: objCharlie },
  { key: 'DELTA',   motto: 'Raio · Velocidade',      op: 'OP-04', role: 'Resposta Rápida', accent: '210 90% 62%', obj: objDelta },
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

/* ============ TOP HUD BAR ============ */
function TopHudBar() {
  const now = useNow();
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return (
    <div className="relative w-full border-y border-white/5 bg-slate-950/70 backdrop-blur-md">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#eab308_50%,transparent)]" />
      <div className="mx-auto max-w-[1600px] px-3 sm:px-5">
        <div className="grid grid-cols-3 items-center h-9 font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.22em]">
          {/* LEFT */}
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2.2} />
            <span className="truncate text-slate-300">
              Status Operacional
              <span className="text-emerald-400"> [Online]</span>
              <span className="hidden sm:inline text-slate-500"> · Enlace 24/7 Seguro</span>
            </span>
          </div>
          {/* CENTER */}
          <div className="hidden md:flex items-center justify-center text-slate-400/80 truncate">
            QSL, Feijó! · Feito por agente para agente · Franc.D'nis
          </div>
          <div className="md:hidden" />
          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3 min-w-0">
            <span className="flex items-center gap-1.5 text-amber-400 tabular-nums">
              <Clock3 className="h-3.5 w-3.5" strokeWidth={2.2} />
              {clock}
              <span className="hidden sm:inline text-slate-500 ml-1">UTC-5</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <User2 className="h-3.5 w-3.5" strokeWidth={2.2} />
              Agente
            </span>
          </div>
        </div>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,#eab308_50%,transparent)] opacity-40" />
    </div>
  );
}

/* ============ BIG CLOCK (right glass panel) ============ */
function BigClock() {
  const now = useNow();
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  const day = now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase();
  return (
    <div className="flex flex-col gap-1">
      <div className="font-mono tabular-nums text-[44px] sm:text-[52px] leading-none font-bold text-amber-400 tracking-[0.02em] drop-shadow-[0_0_25px_rgba(234,179,8,0.35)]">
        {hh}:{mm}<span className="text-amber-400/50 text-[28px] sm:text-[32px] ml-0.5">:{ss}</span>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">{day}</div>
    </div>
  );
}

export function SplitOperationalHero({ onTeamClick, onPrimaryAction }: Props) {
  return (
    <section className="relative mx-auto w-full max-w-[1600px] pb-4">
      {/* ============ Global tactical backdrop (behind hero card) ============ */}
      {/* rendered outside as page has its own bg; local layer inside card below */}

      {/* ============ TOP HUD BAR ============ */}
      <TopHudBar />

      {/* ============ COMMAND STAGE ============ */}
      <article
        className="relative overflow-hidden mt-4 mx-3 sm:mx-4 rounded-2xl border border-white/5 shadow-[0_60px_120px_-60px_rgba(0,0,0,0.9)]"
        aria-labelledby="mission-title"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, #0A1128 0%, #050505 70%)',
        }}
      >
        {/* Topographic / grid layers */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.10] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(234,179,8,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.35) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(148,163,184,0.25) 0 1px, transparent 1px 6px)',
          }}
        />
        {/* Amber ambient glow (bottom) */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(234,179,8,0.18), transparent 70%)' }}
        />

        <div className="relative grid gap-5 p-5 sm:p-8 lg:p-10 lg:grid-cols-[1.05fr_1.2fr_0.95fr] items-stretch min-h-[520px] sm:min-h-[560px]">

          {/* ============ LEFT PANEL — Identificação + CTA ============ */}
          <div className="relative z-20 min-w-0 flex flex-col gap-5 justify-center">
            <div className="flex items-center gap-3 flex-wrap">
              <img
                src={brasao}
                alt="Brasão ISE Acre"
                className="h-11 w-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)] select-none"
                draggable={false}
              />
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-red-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
                Operacional · ISE Acre
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h1
                id="mission-title"
                className="font-sans font-black uppercase tracking-tighter text-white text-[34px] sm:text-[44px] lg:text-[52px] leading-[0.95]"
              >
                Sistema<br />Socioeducativo
              </h1>
              <p className="font-mono text-[11px] sm:text-[13px] uppercase tracking-[0.32em] text-amber-400">
                Comando Operacional de Escalas
              </p>
            </div>

            <p className="max-w-md text-sm sm:text-[15px] text-slate-400 leading-relaxed">
              Plataforma integrada para agentes socioeducativos do Acre. Escalas,
              plantões, folgas e comunicação em tempo real com precisão institucional.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-md bg-amber-500 px-6 py-3.5 font-mono text-[12px] uppercase tracking-[0.24em] font-bold text-black hover:bg-amber-400 hover:shadow-[0_0_45px_rgba(234,179,8,0.55)] transition-all"
              >
                <Fingerprint className="h-4 w-4" strokeWidth={2.4} />
                Iniciar Autenticação Segura
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-500">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> RLS Ativo
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em]">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> Realtime
              </div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-[0.2em]">
                <Radio className="h-3.5 w-3.5 text-amber-400" /> PWA
              </div>
            </div>
          </div>

          {/* ============ CENTER — 3D STAGE (Vehicle + Agent) ============ */}
          <div className="relative flex items-end justify-center min-h-[380px] lg:min-h-[520px] order-first lg:order-none z-30">
            {/* Concentric HUD rings */}
            <svg
              aria-hidden
              viewBox="0 0 400 400"
              className="absolute inset-x-0 top-0 h-[80%] w-full opacity-30 animate-[spin_80s_linear_infinite]"
            >
              <circle cx="200" cy="200" r="188" fill="none" stroke="#eab308" strokeOpacity="0.35" strokeWidth="0.7" strokeDasharray="3 9" />
              <circle cx="200" cy="200" r="150" fill="none" stroke="#eab308" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="2 6" />
              <circle cx="200" cy="200" r="110" fill="none" stroke="#eab308" strokeOpacity="0.2" strokeWidth="0.5" />
            </svg>
            {/* Ground platform glow */}
            <div
              aria-hidden
              className="absolute bottom-4 left-1/2 -translate-x-1/2 h-24 w-[85%] rounded-[50%]"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.35) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* Vehicle — behind agent, offset left */}
            <div className="absolute z-[5] bottom-2 left-0 sm:-left-4 lg:-left-6 w-[72%] max-w-[420px]">
              <img
                src={vehicle3d}
                alt="Viatura ISE — SW4 tática institucional"
                className="w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.95)] select-none"
                draggable={false}
                loading="lazy"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-full bg-red-500 blur-md"
                style={{ top: '21%', left: '42%', width: '10%', height: '4%', animation: 'giroflex-red 0.9s steps(2,end) infinite' }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-full bg-sky-400 blur-md"
                style={{ top: '21%', left: '54%', width: '10%', height: '4%', animation: 'giroflex-blue 0.9s steps(2,end) infinite' }}
              />
            </div>

            {/* Agent — front, offset right */}
            <img
              src={agent3d}
              alt="Agente Socioeducativo — figura 3D"
              className="relative z-10 h-auto max-h-[340px] sm:max-h-[420px] lg:max-h-[500px] w-auto object-contain drop-shadow-[0_35px_50px_rgba(0,0,0,0.95)] select-none translate-x-[14%] sm:translate-x-[18%]"
              draggable={false}
            />
          </div>

          {/* ============ RIGHT — Glassmorphism HUD ============ */}
          <div className="relative z-20 rounded-2xl border border-white/5 bg-slate-950/60 backdrop-blur-md p-5 shadow-[inset_0_1px_0_rgba(234,179,8,0.12),0_30px_60px_-30px_rgba(0,0,0,0.9)] flex flex-col justify-center">
            {/* Corner brackets */}
            <span aria-hidden className="absolute top-2 left-2 h-3 w-3 border-l border-t border-amber-400/60" />
            <span aria-hidden className="absolute top-2 right-2 h-3 w-3 border-r border-t border-amber-400/60" />
            <span aria-hidden className="absolute bottom-2 left-2 h-3 w-3 border-l border-b border-amber-400/60" />
            <span aria-hidden className="absolute bottom-2 right-2 h-3 w-3 border-r border-b border-amber-400/60" />

            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">Status Tático</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                Live
              </span>
            </div>

            <BigClock />

            <dl className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-white/5 divide-x divide-white/5">
              {[
                { label: 'Equipes', value: '04' },
                { label: 'Ciclo', value: '24H' },
                { label: 'Folga', value: '72H' },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 px-2 first:pl-0 last:pr-0">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-500">{label}</dt>
                  <dd className="font-mono text-[22px] sm:text-2xl font-bold text-white tabular-nums leading-none">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.24em]">
              <span className="text-slate-500">Enlace</span>
              <span className="text-amber-400">Seguro · AES-256</span>
            </div>
          </div>
        </div>
      </article>

      {/* ============ BOTTOM: Team Selector Grid ============ */}
      <div className="mx-3 sm:mx-4 mt-6 mb-2 flex items-center justify-between px-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
          Selecione sua Equipe
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-amber-400/80">
          4 Divisões Ativas
        </span>
      </div>

      <div className="mx-3 sm:mx-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TEAMS.map((t) => (
          <button
            key={t.key}
            data-team-card
            onClick={() => onTeamClick(t.key)}
            className={cn(
              'group relative flex min-h-[220px] sm:h-[300px] flex-col overflow-hidden rounded-2xl border text-left',
              'border-white/5 bg-slate-950/60 backdrop-blur-md',
              'transition-all duration-500 hover:border-amber-400/50 hover:-translate-y-1',
              'shadow-[0_10px_30px_-15px_rgba(0,0,0,0.9)] hover:shadow-[0_25px_60px_-20px_rgba(234,179,8,0.45)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70',
            )}
            style={{ ['--team-accent' as any]: t.accent }}
          >
            <div className="relative z-20 flex items-center justify-center flex-1 min-h-0 p-3 pt-6">
              <img
                src={t.obj}
                alt={`Equipe ${t.key} — objeto 3D tático`}
                loading="lazy"
                className="max-h-[90%] max-w-[75%] object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 select-none"
                draggable={false}
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(2,6,15,0.7)_65%,rgba(2,6,15,0.98)_100%)] z-10 pointer-events-none" />
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
              className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-md backdrop-blur-md border"
              style={{
                color: `hsl(${t.accent})`,
                borderColor: `hsl(${t.accent} / 0.5)`,
                background: `hsl(${t.accent} / 0.12)`,
              }}
            >
              {t.op}
            </span>
            <div className="relative z-20 flex flex-col gap-1.5 p-4">
              <span
                className="font-sans font-black text-3xl sm:text-4xl leading-none tracking-tight uppercase"
                style={{ color: `hsl(${t.accent})` }}
              >
                {t.key}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-slate-300 truncate">
                {t.motto}
              </span>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-slate-500 truncate">
                  {t.role}
                </span>
                <span
                  className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em] opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ color: `hsl(${t.accent})` }}
                >
                  Acessar
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
