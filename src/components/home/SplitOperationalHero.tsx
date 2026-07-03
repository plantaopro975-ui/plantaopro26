import { useEffect, useState } from 'react';
import { ArrowUpRight, Radio, ShieldCheck, Users, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import commandBg from '@/assets/hero/command-navy.jpg';
import agent3d from '@/assets/hero/agent-ise-3d.png';
import vehicle3d from '@/assets/hero/vehicle-ise-3d.png';
import brasao from '@/assets/hero/brasao-ise.png';
import teamAlfa from '@/assets/teams/team-alfa.jpg';
import teamBravo from '@/assets/teams/team-bravo.jpg';
import teamCharlie from '@/assets/teams/team-charlie.jpg';
import teamDelta from '@/assets/teams/team-delta.jpg';

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
  image: string;
}[] = [
  { key: 'ALFA',    motto: 'Escudo · Proteção',      op: 'OP-01', role: 'Defensiva',       accent: '28 92% 58%',  image: teamAlfa },
  { key: 'BRAVO',   motto: 'Espada · Ação',          op: 'OP-02', role: 'Ofensiva',        accent: '14 82% 58%',  image: teamBravo },
  { key: 'CHARLIE', motto: 'Alvo · Precisão',        op: 'OP-03', role: 'Reconhecimento',  accent: '38 96% 60%',  image: teamCharlie },
  { key: 'DELTA',   motto: 'Raio · Velocidade',      op: 'OP-04', role: 'Resposta Rápida', accent: '210 90% 62%', image: teamDelta },
];

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
    <div className="flex items-baseline gap-3 font-mono tabular-nums">
      <span className="text-3xl sm:text-4xl font-bold tracking-[0.06em] text-primary drop-shadow-[0_0_18px_hsl(var(--primary)/0.55)]">
        {hh}:{mm}
        <span className="text-primary/50 text-xl ml-0.5">:{ss}</span>
      </span>
      <span className="uppercase text-[10px] tracking-[0.24em] text-muted-foreground">{day}</span>
    </div>
  );
}

export function SplitOperationalHero({ onTeamClick, onPrimaryAction }: Props) {
  return (
    <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 pb-4">
      {/* ============ TOP: Cinematic Command Panel with 3D Agent ============ */}
      <article
        className="relative overflow-hidden rounded-2xl border border-primary/25 mb-4 shadow-[0_40px_90px_-45px_hsl(var(--primary)/0.6)]"
        aria-labelledby="mission-title"
      >
        {/* Background — command center */}
        <img
          src={commandBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          loading="eager"
        />
        {/* Deep navy gradient overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,hsl(217_62%_4%/0.96)_0%,hsl(217_62%_6%/0.75)_50%,hsl(217_50%_8%/0.45)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.22),transparent_60%)]" />
        {/* Grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary)/0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.35) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
          }}
        />

        <div className="relative grid gap-4 p-5 sm:p-8 lg:p-10 lg:grid-cols-[1.15fr_1fr_0.8fr] items-center min-h-[440px] sm:min-h-[500px]">
          {/* LEFT — Mission text */}
          <div className="min-w-0 flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <img
                src={brasao}
                alt="Brasão Instituto Socioeducativo do Acre"
                className="h-12 w-auto drop-shadow-[0_4px_10px_hsl(217_62%_2%/0.8)] select-none"
                draggable={false}
              />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operacional · Online
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary backdrop-blur">
                <Radio className="h-3 w-3" />
                ISE · Acre
              </span>
            </div>

            <h1
              id="mission-title"
              className="font-serif text-[26px] leading-[1.05] sm:text-4xl lg:text-[44px] text-foreground"
            >
              Sistema <span className="text-primary italic">Socioeducativo</span>
              <br />
              <span className="text-foreground/80 text-[18px] sm:text-2xl lg:text-[26px] font-light">
                Gestão profissional de escalas
              </span>
            </h1>

            <p className="max-w-lg text-sm sm:text-base text-muted-foreground leading-relaxed">
              Plataforma integrada para agentes socioeducativos do Acre. Escalas, plantões,
              folgas e comunicação em tempo real com precisão institucional.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-mono text-[12px] uppercase tracking-[0.22em] text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_40px_hsl(var(--primary)/0.55)] transition-all"
              >
                Iniciar Autenticação
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-muted-foreground">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em]">
                <ShieldCheck className="h-4 w-4 text-primary" /> RLS Ativo
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em]">
                <Activity className="h-4 w-4 text-emerald-400" /> Realtime
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em]">
                <Zap className="h-4 w-4 text-primary" /> PWA
              </div>
            </div>
          </div>

          {/* CENTER — 3D Agent (hero visual) */}
          <div className="relative flex justify-center items-end h-full min-h-[320px] lg:min-h-[440px] order-first lg:order-none">
            {/* Radial platform glow */}
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-[80%] rounded-[50%]"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(var(--primary)/0.35) 0%, transparent 70%)',
                filter: 'blur(18px)',
              }}
            />
            {/* Concentric HUD rings */}
            <svg
              aria-hidden
              viewBox="0 0 400 400"
              className="absolute inset-0 h-full w-full opacity-40 animate-[spin_60s_linear_infinite]"
            >
              <circle cx="200" cy="200" r="180" fill="none" stroke="hsl(var(--primary)/0.4)" strokeWidth="0.8" strokeDasharray="4 8" />
              <circle cx="200" cy="200" r="140" fill="none" stroke="hsl(var(--primary)/0.3)" strokeWidth="0.6" strokeDasharray="2 6" />
              <circle cx="200" cy="200" r="100" fill="none" stroke="hsl(var(--primary)/0.25)" strokeWidth="0.5" />
            </svg>
            <img
              src={agent3d}
              alt="Agente Socioeducativo — figura 3D"
              className="relative z-10 h-full max-h-[420px] lg:max-h-[500px] w-auto object-contain drop-shadow-[0_30px_40px_hsl(217_62%_2%/0.9)] select-none"
              draggable={false}
            />
          </div>

          {/* RIGHT — Glass HUD */}
          <div className="relative rounded-2xl border border-primary/25 bg-background/50 backdrop-blur-xl p-4 sm:p-5 shadow-[inset_0_1px_0_hsl(var(--primary)/0.18)] z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Status Tático</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Live</span>
            </div>
            <LiveClock />
            <dl className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-primary/15">
              {[
                { label: 'Equipes', value: '04', icon: Users },
                { label: 'Ciclo', value: '24H', icon: Activity },
                { label: 'Folga', value: '72H', icon: ShieldCheck },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex flex-col gap-1">
                  <Icon className="h-3.5 w-3.5 text-primary/70" />
                  <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
                  <dd className="font-mono text-xl font-bold text-foreground tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </article>

      {/* ============ BOTTOM: Team Selector Grid ============ */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          Selecione sua Equipe
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/80">
          4 Divisões Ativas
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TEAMS.map((t) => (
          <button
            key={t.key}
            data-team-card
            onClick={() => onTeamClick(t.key)}
            className={cn(
              'group relative flex min-h-[168px] sm:h-[300px] flex-col justify-end overflow-hidden rounded-2xl border p-4 text-left',
              'border-primary/20 bg-card',
              'transition-all duration-500 hover:border-primary/60 hover:-translate-y-1',
              'shadow-[0_10px_30px_-15px_hsl(0_0%_0%/0.9)] hover:shadow-[0_25px_60px_-20px_hsl(var(--primary)/0.55)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
            )}
            style={{ ['--team-accent' as any]: t.accent }}
          >
            <img
              src={t.image}
              alt={`Equipe ${t.key}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_25%,hsl(217_62%_3%/0.65)_55%,hsl(217_62%_2%/0.98)_100%)]" />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 opacity-40 group-hover:opacity-70 transition-opacity duration-500"
              style={{ background: `linear-gradient(180deg, transparent 0%, hsl(${t.accent} / 0.35) 100%)` }}
            />
            <span
              aria-hidden
              className="absolute top-0 left-0 h-1 w-full"
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
            <div className="relative flex flex-col gap-1.5">
              <span
                className="font-serif text-3xl sm:text-4xl leading-none font-bold tracking-tight"
                style={{ color: `hsl(${t.accent})` }}
              >
                {t.key}
              </span>
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-foreground/90 truncate">
                {t.motto}
              </span>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">
                  {t.role}
                </span>
                <span
                  className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] opacity-80 group-hover:opacity-100 transition-opacity"
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
