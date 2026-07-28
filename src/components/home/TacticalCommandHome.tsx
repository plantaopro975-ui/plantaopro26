import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import agentVehicleProAsset from '@/assets/hero/agent-vehicle-pro-scene-v5.png.asset.json';
import heroAlfa from '@/assets/heroes/team-alfa-contencao.jpg.asset.json';
import heroBravo from '@/assets/heroes/team-bravo-intervencao.jpg.asset.json';
import heroCharlie from '@/assets/heroes/team-charlie-vigilancia.jpg.asset.json';
import heroDelta from '@/assets/heroes/team-delta-comando.jpg.asset.json';
import TeamDetailsDialog, { type TeamDetail, type TeamKey } from './TeamDetailsDialog';

/**
 * TacticalCommandHome — Homepage compacta "Timeline Operacional".
 *
 * Regras:
 * - Layout otimizado para caber em uma única janela em telas ≥ lg (sem scroll).
 * - Cards de equipe só permitem entrada para o agente da respectiva equipe
 *   (agent.team) ou para usuários admin/master. Cards bloqueados exibem
 *   cadeado e não abrem o modal.
 * - Preview do Gestor de Rondas mostra os 4 quartos de hora (00/15/30/45)
 *   como blocos táticos rápidos.
 */

interface Props {
  onTeamClick: (team: TeamKey) => void;
}

const TEAMS: TeamDetail[] = [
  { key: 'alfa',    label: 'ALFA',    role: 'CONTENÇÃO',   hero: heroAlfa.url,    glowRgb: '16,185,129', status: 'ativo', agents: 32, shift: '19h → 07h', jurisdiction: 'Rio Branco • Sede', nextRound: '03:30' },
  { key: 'bravo',   label: 'BRAVO',   role: 'INTERVENÇÃO', hero: heroBravo.url,   glowRgb: '249,115,22', status: 'ativo', agents: 28, shift: '07h → 19h', jurisdiction: 'Rio Branco • Sede', nextRound: '04:00' },
  { key: 'charlie', label: 'CHARLIE', role: 'VIGILÂNCIA',  hero: heroCharlie.url, glowRgb: '14,165,233', status: 'ativo', agents: 24, shift: '19h → 07h', jurisdiction: 'Perímetro Externo', nextRound: '04:15' },
  { key: 'delta',   label: 'DELTA',   role: 'COMANDO',     hero: heroDelta.url,   glowRgb: '245,158,11', status: 'ativo', agents: 12, shift: '24h',       jurisdiction: 'Centro de Operações', nextRound: '—' },
];

const BORDER_BY_TEAM: Record<TeamKey, string> = {
  alfa: 'border-emerald-500',
  bravo: 'border-orange-500',
  charlie: 'border-sky-500',
  delta: 'border-[hsl(var(--primary))]',
};

const PRIVILEGED_ROLES = new Set(['admin', 'master', 'coordenador', 'diretor']);

function useLiveClock(): string {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString('pt-BR', { hour12: false });
}

export function TacticalCommandHome({ onTeamClick }: Props) {
  const clock = useLiveClock();
  const heroUrl = (agentVehicleProAsset as { url?: string }).url ?? '';
  const { agent } = useAgentProfile();
  const [interval, setInterval] = useState<15 | 30 | 60>(15);
  const [activeTeam, setActiveTeam] = useState<TeamDetail | null>(null);
  const [deniedTeam, setDeniedTeam] = useState<TeamKey | null>(null);

  const bento = useMemo(() => 'rounded-lg border border-[#1f1f2e] bg-[#141420]', []);

  const userTeamKey = (agent?.team ?? '').toString().trim().toLowerCase() as TeamKey | '';
  const isPrivileged = agent?.role ? PRIVILEGED_ROLES.has(agent.role.toLowerCase()) : false;

  const canAccessTeam = (key: TeamKey) => isPrivileged || userTeamKey === key;

  const handleTeamPress = (t: TeamDetail) => {
    if (!canAccessTeam(t.key)) {
      setDeniedTeam(t.key);
      window.setTimeout(() => setDeniedTeam((prev) => (prev === t.key ? null : prev)), 1800);
      return;
    }
    setActiveTeam(t);
  };

  return (
    <div className="tch-root w-full text-[#d1d5db] font-['DM_Sans']">
      <div className="w-full max-w-7xl mx-auto space-y-3 p-3 md:p-4 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:flex lg:flex-col">

        {/* HEADER COMPACTO */}
        <header className="flex items-center justify-between gap-3 border-b border-[#141420] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[hsl(var(--primary))] flex items-center justify-center rounded-sm shrink-0">
              <span className="font-bold text-black text-lg leading-none">P+</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-widest text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                PLANTÃOPRO
              </h1>
              <p className="text-[9px] text-[hsl(var(--primary))] font-bold uppercase tracking-[0.2em]">
                Socioeducativo • AC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {agent?.team && (
              <div className="hidden sm:flex items-center gap-2 bg-[#141420] px-2.5 py-1 rounded-md border border-[#1f1f2e]">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Sua equipe</span>
                <span className="text-[11px] font-bold text-[hsl(var(--primary))] tracking-widest">
                  {agent.team.toString().toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Operacional</p>
              <p className="text-lg md:text-xl font-bold text-white tabular-nums leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {clock}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-[#141420] px-2.5 py-1.5 rounded-md border border-[#1f1f2e]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-medium text-slate-300">ONLINE</span>
            </div>
          </div>
        </header>

        {/* MAIN BENTO GRID */}
        <main className="grid grid-cols-12 gap-3 lg:flex-1 lg:min-h-0">

          {/* HERO: VIATURA + GIROFLEX */}
          <section className={cn(bento, 'col-span-12 lg:col-span-8 relative overflow-hidden min-h-[200px] lg:min-h-0 flex items-end')}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent z-10 pointer-events-none" />
            {heroUrl && (
              <div
                className="absolute inset-0 opacity-45 bg-no-repeat bg-cover bg-center"
                style={{ backgroundImage: `url(${heroUrl})` }}
                aria-hidden
              />
            )}

            <div className="absolute top-[18%] left-1/2 -translate-x-1/2 flex gap-8 z-20 pointer-events-none">
              <span className="tch-siren tch-siren-red" />
              <span className="tch-siren tch-siren-blue" />
            </div>

            <div className="relative z-20 p-4 md:p-5 w-full">
              <h2
                className="text-2xl md:text-3xl font-bold text-white mb-1 leading-tight uppercase tracking-tighter"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Monitoramento <span className="text-[hsl(var(--primary))]">Em Tempo Real</span>
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Jurisdição</span>
                  <span className="text-xs font-bold text-white">RIO BRANCO • SEDE</span>
                </div>
                <div className="w-px bg-slate-700 h-8" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">Alerta</span>
                  <span className="text-xs font-bold text-red-500">ALTA VIGILÂNCIA</span>
                </div>
                <div className="w-px bg-slate-700 h-8" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">SLA</span>
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">99.8%</span>
                </div>
              </div>
            </div>
          </section>

          {/* SELETOR DE EQUIPES — grid 2×2 compacto */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-2">
            {TEAMS.map((t) => {
              const locked = !canAccessTeam(t.key);
              const denied = deniedTeam === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTeamPress(t)}
                  aria-label={locked
                    ? `Equipe ${t.label} — acesso restrito`
                    : `Ver detalhes da equipe ${t.label}`}
                  aria-disabled={locked}
                  title={locked ? 'Acesso restrito à sua equipe' : undefined}
                  className={cn(
                    'tch-team-card group relative overflow-hidden rounded-lg border border-[#1f1f2e] border-l-4 text-left',
                    'min-h-[110px] sm:min-h-[128px] touch-manipulation active:scale-[0.99]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]',
                    BORDER_BY_TEAM[t.key],
                    locked && 'cursor-not-allowed',
                    denied && 'animate-[wiggle_0.4s_ease-in-out]',
                  )}
                >
                  <img
                    src={t.hero}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={768}
                    height={1024}
                    sizes="(min-width: 1024px) 180px, 45vw"
                    className={cn(
                      'absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out',
                      locked ? 'grayscale opacity-40' : 'group-hover:scale-105',
                    )}
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/55 to-[#0a0a0f]/10" />
                  {!locked && (
                    <div
                      className="absolute inset-y-0 left-0 w-2/3 opacity-35 mix-blend-screen pointer-events-none"
                      style={{ background: `radial-gradient(ellipse at left center, rgba(${t.glowRgb},0.55), transparent 70%)` }}
                    />
                  )}
                  <div className="relative z-10 h-full flex flex-col justify-end p-2 sm:p-2.5">
                    <span className="text-[8px] text-slate-300/80 font-bold uppercase tracking-widest">Equipe</span>
                    <h4
                      className="text-lg sm:text-xl font-bold text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {t.label}
                    </h4>
                    <p
                      className="text-[9px] mt-0.5 font-bold uppercase tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]"
                      style={{ color: locked ? '#94a3b8' : `rgb(${t.glowRgb})` }}
                    >
                      {t.role}
                    </p>
                  </div>
                  {locked ? (
                    <span className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/75 backdrop-blur-sm border border-white/10">
                      <Lock className="w-2.5 h-2.5 text-slate-300" aria-hidden />
                      <span className="text-[8px] font-bold text-slate-200 uppercase tracking-wider">Restrito</span>
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8px] font-bold text-slate-200 uppercase tracking-wider">Ativo</span>
                    </span>
                  )}
                  {denied && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 text-center px-2">
                        Acesso restrito<br/>à sua equipe
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* GESTOR DE RONDAS — timeline + quartos de hora */}
          <section className={cn(bento, 'col-span-12 p-4 lg:p-5 lg:min-h-0 lg:overflow-hidden lg:flex lg:flex-col')}>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <div>
                <h3 className="text-base font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  GESTOR DE RONDAS
                </h3>
                <p className="text-[11px] text-slate-500">Divida os quartos de hora entre os agentes da equipe</p>
              </div>
              <div className="flex gap-1.5">
                {[15, 30, 60].map((m) => {
                  const active = interval === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInterval(m as 15 | 30 | 60)}
                      className={cn(
                        'px-2.5 py-1 text-[10px] font-bold rounded uppercase transition-colors',
                        active
                          ? 'bg-[hsl(var(--primary))] text-black'
                          : 'bg-[#0a0a0f] border border-[#1f1f2e] text-slate-400 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]',
                      )}
                      aria-pressed={active}
                    >
                      {m} min
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quartos de hora — 4 blocos táticos com o intervalo escolhido */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[0, 1, 2, 3].map((i) => {
                const startMin = i * interval;
                const endMin = (i + 1) * interval;
                const isActive = i === 1;
                return (
                  <div
                    key={i}
                    className={cn(
                      'relative overflow-hidden rounded-md border p-2 text-left transition-colors',
                      isActive
                        ? 'border-[hsl(var(--primary)/0.6)] bg-[hsl(var(--primary)/0.08)]'
                        : 'border-[#1f1f2e] bg-[#0a0a0f]',
                    )}
                  >
                    <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Quarto {i + 1}</p>
                    <p
                      className={cn(
                        'text-sm font-bold tabular-nums leading-tight',
                        isActive ? 'text-[hsl(var(--primary))]' : 'text-white',
                      )}
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {String(startMin).padStart(2, '0')}–{String(endMin).padStart(2, '0')}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-0.5 truncate">
                      {isActive ? 'Ag. Santos' : i === 0 ? 'Ag. Silva' : 'livre'}
                    </p>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--primary))]" style={{ width: '65%' }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative py-1 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-[#1f1f2e]" />
              <div className="space-y-2 ml-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500 w-10">02:30</span>
                  <div className="flex-1 h-8 bg-[#0a0a0f] border border-[#1f1f2e] rounded-md flex items-center px-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2" />
                    <span className="text-[11px] text-slate-400">Ronda finalizada • Agente Silva</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-[hsl(var(--primary))] w-10">03:00</span>
                  <div className="flex-1 h-10 bg-[#1a1a2b] border border-[hsl(var(--primary)/0.3)] rounded-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[hsl(var(--primary)/0.05)]" />
                    <div className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--primary))]" style={{ width: '65%' }} />
                    <div className="h-full flex items-center justify-between px-3 relative z-10">
                      <div className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] mr-2 animate-pulse" />
                        <span className="text-[11px] font-bold text-white uppercase">Ronda Ativa • Santos</span>
                      </div>
                      <span className="text-[10px] font-bold text-[hsl(var(--primary))]">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const myKey = userTeamKey as TeamKey;
                const target = TEAMS.find((t) => t.key === myKey) ?? TEAMS[3];
                if (canAccessTeam(target.key)) {
                  onTeamClick(target.key);
                } else {
                  setDeniedTeam(target.key);
                  window.setTimeout(() => setDeniedTeam(null), 1800);
                }
              }}
              className="w-full mt-3 bg-[hsl(var(--primary))] hover:bg-amber-500 text-black py-2.5 rounded font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_hsl(var(--primary)/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
            >
              Iniciar Ronda Operacional
            </button>
          </section>
        </main>
      </div>

      <TeamDetailsDialog
        team={activeTeam}
        open={!!activeTeam}
        onOpenChange={(o) => { if (!o) setActiveTeam(null); }}
        onSelect={onTeamClick}
      />
    </div>
  );
}

export default TacticalCommandHome;
