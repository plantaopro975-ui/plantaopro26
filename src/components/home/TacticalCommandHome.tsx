import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import agentVehicleProAsset from '@/assets/hero/agent-vehicle-pro-scene-v5.png.asset.json';
import heroAlfa from '@/assets/heroes/team-alfa-contencao.jpg.asset.json';
import heroBravo from '@/assets/heroes/team-bravo-intervencao.jpg.asset.json';
import heroCharlie from '@/assets/heroes/team-charlie-vigilancia.jpg.asset.json';
import heroDelta from '@/assets/heroes/team-delta-comando.jpg.asset.json';
import TeamDetailsDialog, { type TeamDetail, type TeamKey } from './TeamDetailsDialog';

/**
 * TacticalCommandHome — Homepage "Timeline Operacional".
 * Cards de equipe exibem hero de equipamentos táticos realistas (sem pessoas).
 * Clique abre modal de detalhes com status/turno/ações rápidas.
 */

interface Props {
  onTeamClick: (team: TeamKey) => void;
}

const TEAMS: TeamDetail[] = [
  { key: 'alfa',    label: 'ALFA',    role: 'CONTENÇÃO',   hero: heroAlfa.url,    glowRgb: '16,185,129', status: 'ativo',    agents: 32, shift: '19h → 07h', jurisdiction: 'Rio Branco • Sede', nextRound: '03:30' },
  { key: 'bravo',   label: 'BRAVO',   role: 'INTERVENÇÃO', hero: heroBravo.url,   glowRgb: '249,115,22', status: 'ativo',    agents: 28, shift: '07h → 19h', jurisdiction: 'Rio Branco • Sede', nextRound: '04:00' },
  { key: 'charlie', label: 'CHARLIE', role: 'VIGILÂNCIA',  hero: heroCharlie.url, glowRgb: '14,165,233', status: 'ativo',    agents: 24, shift: '19h → 07h', jurisdiction: 'Perímetro Externo', nextRound: '04:15' },
  { key: 'delta',   label: 'DELTA',   role: 'COMANDO',     hero: heroDelta.url,   glowRgb: '245,158,11', status: 'ativo',    agents: 12, shift: '24h',       jurisdiction: 'Centro de Operações', nextRound: '—' },
];

const BORDER_BY_TEAM: Record<TeamKey, string> = {
  alfa: 'border-emerald-500',
  bravo: 'border-orange-500',
  charlie: 'border-sky-500',
  delta: 'border-[hsl(var(--primary))]',
};

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
  const [interval, setInterval] = useState<15 | 30 | 60>(30);

  const bento = useMemo(
    () => 'rounded-lg border border-[#1f1f2e] bg-[#141420]',
    [],
  );

  return (
    <div className="tch-root w-full text-[#d1d5db] font-['DM_Sans']">
      <div className="w-full max-w-7xl mx-auto space-y-4 p-4 md:p-6">

        {/* HEADER INSTITUCIONAL */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#141420] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[hsl(var(--primary))] flex items-center justify-center rounded-sm shrink-0">
              <span className="font-bold text-black text-xl leading-none">P+</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                PLANTÃOPRO
              </h1>
              <p className="text-[10px] text-[hsl(var(--primary))] font-bold uppercase tracking-[0.2em]">
                Socioeducativo • Segurança Pública AC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Horário Operacional</p>
              <p className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {clock}
              </p>
            </div>
            <div className="hidden md:block h-10 w-px bg-[#141420]" />
            <div className="flex items-center gap-3 bg-[#141420] px-4 py-2 rounded-md border border-[#1f1f2e]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-medium text-slate-300">SISTEMA ONLINE</span>
            </div>
          </div>
        </header>

        {/* MAIN BENTO GRID */}
        <main className="grid grid-cols-12 gap-4">

          {/* HERO: VIATURA + GIROFLEX */}
          <section className={cn(bento, 'col-span-12 lg:col-span-8 relative overflow-hidden min-h-[340px] flex items-end')}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent z-10 pointer-events-none" />
            {heroUrl && (
              <div
                className="absolute inset-0 opacity-45 bg-no-repeat bg-cover bg-center"
                style={{ backgroundImage: `url(${heroUrl})` }}
                aria-hidden
              />
            )}

            {/* Giroflex Animation */}
            <div className="absolute top-[22%] left-1/2 -translate-x-1/2 flex gap-10 z-20 pointer-events-none">
              <span className="tch-siren tch-siren-red" />
              <span className="tch-siren tch-siren-blue" />
            </div>

            <div className="relative z-20 p-6 md:p-8 w-full">
              <h2
                className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight uppercase tracking-tighter"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Monitoramento <br />
                <span className="text-[hsl(var(--primary))]">Em Tempo Real</span>
              </h2>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Jurisdição</span>
                  <span className="text-sm font-bold text-white">RIO BRANCO • SEDE CENTRAL</span>
                </div>
                <div className="w-px bg-slate-700 h-10" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Nível de Alerta</span>
                  <span className="text-sm font-bold text-red-500">ALTA VIGILÂNCIA</span>
                </div>
              </div>
            </div>
          </section>

          {/* STATUS OPERACIONAL */}
          <aside className={cn(bento, 'col-span-12 lg:col-span-4 p-6 flex flex-col justify-between')}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Status do Sistema</h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Unidades Ativas</p>
                  <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>09/09</p>
                </div>
                <div className="w-12 h-12 flex items-center justify-center rounded border border-[#1f1f2e] text-[hsl(var(--primary))]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-400">SLA Operacional</span>
                  <span className="text-[hsl(var(--primary))]">99.8%</span>
                </div>
                <div className="w-full h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
                  <div className="h-full bg-[hsl(var(--primary))] rounded-full shadow-[0_0_12px_hsl(var(--primary)/0.5)]" style={{ width: '99.8%' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0a0a0f] p-3 rounded border border-[#1f1f2e]">
                  <p className="text-[9px] text-slate-500 uppercase mb-1">Uplink</p>
                  <p className="text-sm font-bold text-white">850 Mbps</p>
                </div>
                <div className="bg-[#0a0a0f] p-3 rounded border border-[#1f1f2e]">
                  <p className="text-[9px] text-slate-500 uppercase mb-1">Efetivo</p>
                  <p className="text-sm font-bold text-white">128 Agentes</p>
                </div>
              </div>
            </div>
          </aside>

          {/* SELETOR DE EQUIPES — heróis de equipamento realista */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            {TEAMS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTeam(t)}
                aria-label={`Ver detalhes da equipe ${t.label}`}
                className={cn(
                  'tch-team-card group relative overflow-hidden rounded-lg border border-[#1f1f2e] border-l-4 text-left',
                  'min-h-[168px] sm:min-h-[190px] touch-manipulation active:scale-[0.99]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]',
                  BORDER_BY_TEAM[t.key],
                )}
              >
                <img
                  src={t.hero}
                  alt={`Equipamento equipe ${t.label}`}
                  loading="lazy"
                  decoding="async"
                  width={768}
                  height={1024}
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 45vw, 45vw"
                  className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                />
                {/* Overlay: mais denso embaixo para garantir contraste do texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/55 to-[#0a0a0f]/10" />
                {/* Glow lateral com a cor da equipe (não some a foto) */}
                <div
                  className="absolute inset-y-0 left-0 w-2/3 opacity-35 mix-blend-screen pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at left center, rgba(${t.glowRgb},0.55), transparent 70%)` }}
                />
                <div className="relative z-10 h-full flex flex-col justify-end p-2.5 sm:p-3">
                  <span className="text-[9px] text-slate-300/80 font-bold uppercase tracking-widest">Equipe</span>
                  <h4
                    className="text-xl sm:text-2xl font-bold text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {t.label}
                  </h4>
                  <p
                    className="text-[10px] mt-1 font-bold uppercase tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]"
                    style={{ color: `rgb(${t.glowRgb})` }}
                  >
                    {t.role}
                  </p>
                </div>
                <span className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-slate-200 uppercase tracking-wider">Ativo</span>
                </span>
              </button>
            ))}
          </div>

          {/* GESTOR DE RONDAS EMBUTIDO — timeline visual */}
          <section className={cn(bento, 'col-span-12 lg:col-span-8 p-6')}>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  GESTOR DE RONDAS
                </h3>
                <p className="text-xs text-slate-500">Escala de monitoramento presencial</p>
              </div>
              <div className="flex gap-2">
                {[15, 30, 60].map((m) => {
                  const active = interval === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInterval(m as 15 | 30 | 60)}
                      className={cn(
                        'px-3 py-1 text-[10px] font-bold rounded uppercase transition-colors',
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

            <div className="relative py-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-[#1f1f2e]" />

              <div className="space-y-4 ml-6">
                {/* Slot concluído */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-500 w-12">02:30</span>
                  <div className="flex-1 h-10 bg-[#0a0a0f] border border-[#1f1f2e] rounded-md flex items-center px-4">
                    <span className="w-2 h-2 rounded-full bg-slate-600 mr-3" />
                    <span className="text-xs text-slate-400">Ronda finalizada • Agente Silva</span>
                  </div>
                </div>

                {/* Slot ativo */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-[hsl(var(--primary))] w-12">03:00</span>
                  <div className="flex-1 h-12 bg-[#1a1a2b] border border-[hsl(var(--primary)/0.3)] rounded-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-[hsl(var(--primary)/0.05)]" />
                    <div className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--primary))]" style={{ width: '65%' }} />
                    <div className="h-full flex items-center justify-between px-4 relative z-10">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] mr-3 animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase">Ronda Ativa • Agente Santos</span>
                      </div>
                      <span className="text-[10px] font-bold text-[hsl(var(--primary))]">65% CONCLUÍDO</span>
                    </div>
                  </div>
                </div>

                {/* Próximo slot */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-slate-600 w-12">03:30</span>
                  <div className="flex-1 h-10 bg-[#0a0a0f] border border-dashed border-[#1f1f2e] rounded-md flex items-center px-4">
                    <span className="text-xs text-slate-600">Próximo Slot Disponível</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTeamClick('delta')}
              className="w-full mt-6 bg-[hsl(var(--primary))] hover:bg-amber-500 text-black py-3 rounded font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_hsl(var(--primary)/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
            >
              Iniciar Nova Ronda Operacional
            </button>
          </section>
        </main>

        {/* COMPLIANCE FOOTER */}
        <footer className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#141420]">
          <div className="flex flex-wrap gap-6">
            {['LGPD', 'RLS', 'ISO', 'TLS'].map((label) => (
              <div key={label} className="flex items-center gap-2 opacity-60">
                <span className="w-6 h-6 border border-slate-500 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400">
                  {label}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  {label === 'LGPD' ? 'Compliant' : label === 'RLS' ? 'Verified' : label === 'ISO' ? '27001' : 'Encryption'}
                </span>
              </div>
            ))}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">Governo do Estado do Acre</p>
            <p className="text-[9px] text-slate-700">ISE — Sistema Integrado de Segurança Socioeducativa</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default TacticalCommandHome;
