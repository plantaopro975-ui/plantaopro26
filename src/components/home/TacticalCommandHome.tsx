import { useEffect, useMemo, useState } from 'react';
import { Shield, Radio, Eye, Command, Activity, MapPin, Users, Clock, ChevronRight, Play, Pause, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import commandScene from '@/assets/hero/command-scene-v6.jpg.asset.json';
import heroAlfa from '@/assets/heroes/team-alfa-v2.jpg.asset.json';
import heroBravo from '@/assets/heroes/team-bravo-v2.jpg.asset.json';
import heroCharlie from '@/assets/heroes/team-charlie-v2.jpg.asset.json';
import heroDelta from '@/assets/heroes/team-delta-v2.jpg.asset.json';
import TeamDetailsDialog, { type TeamDetail, type TeamKey } from './TeamDetailsDialog';

/**
 * TacticalCommandHome v2 — Homepage "Centro de Comando".
 *
 * Objetivos:
 *  - Tudo em uma única janela (sem scroll em ≥ lg).
 *  - Cards realistas com temática de segurança pública (escudo, capacete,
 *    óptica, radio/mapa).
 *  - Hero cinematográfico com viatura + agente socioeducativo (giroflex real).
 *  - Gestor de Rondas embutido, sofisticado, com quartos-de-hora dinâmicos,
 *    timeline vertical e status em tempo real.
 *  - Todos os agentes autenticados podem abrir qualquer equipe (o acesso
 *    operacional pleno é aplicado após a autenticação por CPF na tela de
 *    entrada — a home apenas navega).
 */

interface Props {
  onTeamClick: (team: TeamKey) => void;
}

const TEAMS: TeamDetail[] = [
  { key: 'alfa',    label: 'ALFA',    role: 'CONTENÇÃO',   hero: heroAlfa.url,    glowRgb: '16,185,129', status: 'ativo',    agents: 32, shift: '19h → 07h', jurisdiction: 'Rio Branco • Sede',  nextRound: '03:30' },
  { key: 'bravo',   label: 'BRAVO',   role: 'INTERVENÇÃO', hero: heroBravo.url,   glowRgb: '249,115,22', status: 'ativo',    agents: 28, shift: '07h → 19h', jurisdiction: 'Rio Branco • Sede',  nextRound: '04:00' },
  { key: 'charlie', label: 'CHARLIE', role: 'VIGILÂNCIA',  hero: heroCharlie.url, glowRgb: '14,165,233', status: 'ativo',    agents: 24, shift: '19h → 07h', jurisdiction: 'Perímetro Externo',  nextRound: '04:15' },
  { key: 'delta',   label: 'DELTA',   role: 'COMANDO',     hero: heroDelta.url,   glowRgb: '245,158,11', status: 'stand-by', agents: 12, shift: '24h',       jurisdiction: 'Centro de Operações', nextRound: '—'    },
];

const TEAM_ICON: Record<TeamKey, typeof Shield> = {
  alfa: Shield,
  bravo: Command,
  charlie: Eye,
  delta: Radio,
};

function useLiveClock(): { time: string; date: string; seconds: number } {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return {
    time: now.toLocaleTimeString('pt-BR', { hour12: false }),
    date: now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }),
    seconds: now.getSeconds(),
  };
}

export function TacticalCommandHome({ onTeamClick }: Props) {
  const { time, date } = useLiveClock();
  const { agent } = useAgentProfile();
  const [interval, setIntervalMin] = useState<15 | 30 | 60>(15);
  const [activeTeam, setActiveTeam] = useState<TeamDetail | null>(null);
  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [running, setRunning] = useState<boolean>(true);

  const userTeamKey = ((agent?.team ?? '').toString().trim().toLowerCase()) as TeamKey | '';

  const bento = useMemo(
    () =>
      'relative rounded-xl border border-[#1a1a26] bg-gradient-to-b from-[#111119] to-[#0c0c13] shadow-[0_8px_32px_-16px_rgba(0,0,0,0.9)]',
    [],
  );

  const handleTeamPress = (t: TeamDetail) => setActiveTeam(t);

  // Compute slot times based on interval
  const slots = useMemo(() => {
    return [0, 1, 2, 3].map((i) => ({
      idx: i,
      start: i * interval,
      end: (i + 1) * interval,
    }));
  }, [interval]);

  return (
    <div className="tch2-root w-full text-slate-200 font-['DM_Sans'] bg-[#07070b]">
      <div className="w-full max-w-[1440px] mx-auto px-3 md:px-4 pt-3 pb-3 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:flex lg:flex-col">

        {/* HEADER — Mission ID compacto */}
        <header className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#141420] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-[hsl(var(--primary))] to-amber-600 flex items-center justify-center rounded-md shrink-0 shadow-[0_0_18px_hsl(var(--primary)/0.4)]">
              <Shield className="w-4.5 h-4.5 text-black" strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[13px] font-bold tracking-[0.18em] text-white leading-tight truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                CENTRO DE COMANDO
              </h1>
              <p className="text-[9px] text-[hsl(var(--primary))]/90 font-bold uppercase tracking-[0.28em] leading-tight">
                ISE • Acre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
            {agent?.team && (
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[8.5px] text-slate-500 uppercase font-bold tracking-widest">Sua equipe</span>
                <span className="text-[11px] font-bold text-[hsl(var(--primary))] tracking-[0.18em]">
                  {agent.team.toString().toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-right leading-tight">
              <p className="text-[8.5px] text-slate-500 uppercase tracking-widest">{date}</p>
              <p className="text-[17px] md:text-[19px] font-bold text-white tabular-nums leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {time}
              </p>
            </div>
            <div className="hidden md:inline-flex items-center gap-1.5 bg-[#0f0f18] px-2 py-1 rounded-md border border-[#1f1f2e]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
              </span>
              <span className="text-[9.5px] font-bold text-slate-300 tracking-widest">ONLINE</span>
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <main className="mt-3 grid grid-cols-12 gap-3 lg:flex-1 lg:min-h-0">

          {/* === COLUNA 1 — HERO CINEMATOGRÁFICO === */}
          <section className={cn(bento, 'col-span-12 lg:col-span-7 overflow-hidden min-h-[220px] lg:min-h-0')}>
            {/* Background image */}
            <img
              src={commandScene.url}
              alt="Agente socioeducativo em viatura oficial"
              className="absolute inset-0 w-full h-full object-cover object-center"
              width={1600}
              height={912}
            />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#07070b] via-[#07070b]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07070b]/90" />

            {/* Real giroflex overlay — pin at bulb positions */}
            <div className="absolute top-[16%] left-[19%] w-[9%] h-[3.5%] rounded-full opacity-0 tch2-flash tch2-flash-blue pointer-events-none" aria-hidden />
            <div className="absolute top-[16%] left-[34%] w-[9%] h-[3.5%] rounded-full opacity-0 tch2-flash tch2-flash-red pointer-events-none" aria-hidden />

            {/* Scanline overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none tch2-scan" aria-hidden />

            {/* HUD corners */}
            <span className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[hsl(var(--primary))]/70" />
            <span className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[hsl(var(--primary))]/70" />
            <span className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[hsl(var(--primary))]/70" />
            <span className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[hsl(var(--primary))]/70" />

            {/* Top-right telemetry chips */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-red-500/40 rounded px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-bold text-red-300 tracking-widest uppercase">Alta Vigilância</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded px-2 py-1">
                <Activity className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                <span className="text-[9px] font-bold text-emerald-300 tracking-widest tabular-nums">SLA 99.8%</span>
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-5">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[hsl(var(--primary))] uppercase tracking-[0.28em] mb-1.5">
                <span className="w-6 h-px bg-[hsl(var(--primary))]" />
                Operação em curso
              </span>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.05] tracking-tight uppercase"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Monitoramento <span className="text-[hsl(var(--primary))]">tático</span><br className="hidden md:block"/>
                em tempo real
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                <span className="inline-flex items-center gap-1.5 text-[10.5px] text-slate-300">
                  <MapPin className="w-3 h-3 text-[hsl(var(--primary))]" />
                  <span className="font-bold uppercase tracking-wider">Rio Branco • Sede</span>
                </span>
                <span className="w-px h-3 bg-slate-700" />
                <span className="inline-flex items-center gap-1.5 text-[10.5px] text-slate-300">
                  <Users className="w-3 h-3 text-[hsl(var(--primary))]" />
                  <span className="font-bold tabular-nums">96 agentes ativos</span>
                </span>
                <span className="w-px h-3 bg-slate-700" />
                <span className="inline-flex items-center gap-1.5 text-[10.5px] text-slate-300">
                  <Clock className="w-3 h-3 text-[hsl(var(--primary))]" />
                  <span className="font-bold uppercase tracking-wider">4 equipes em operação</span>
                </span>
              </div>
            </div>
          </section>

          {/* === COLUNA 2 — EQUIPES (2x2 vertical) === */}
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-2.5 lg:grid-rows-2">
            {TEAMS.map((t) => {
              const Icon = TEAM_ICON[t.key];
              const isMine = userTeamKey === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTeamPress(t)}
                  aria-label={`Ver detalhes da equipe ${t.label}`}
                  className={cn(
                    'tch2-team group relative overflow-hidden rounded-xl border text-left',
                    'border-[#1a1a26] hover:border-[hsl(var(--primary))]/60',
                    'transition-all duration-300 hover:-translate-y-0.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]',
                    'min-h-[130px] lg:min-h-0',
                  )}
                  style={{ ['--glow' as never]: t.glowRgb }}
                >
                  {/* Hero image */}
                  <img
                    src={t.hero}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    width={912}
                    height={1200}
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Dark cinematic gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-[#07070b]/70 to-[#07070b]/10" />
                  {/* Team accent radial glow */}
                  <div
                    className="absolute inset-y-0 right-0 w-1/2 opacity-60 mix-blend-screen pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at right center, rgba(${t.glowRgb},0.5), transparent 70%)` }}
                  />
                  {/* Left accent bar */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] shadow-[0_0_12px_rgba(var(--glow),0.6)]"
                    style={{ backgroundColor: `rgb(${t.glowRgb})` }}
                  />

                  {/* Top chips */}
                  <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm px-1.5 py-0.5">
                      <span className={cn(
                        'w-1 h-1 rounded-full',
                        t.status === 'ativo' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
                      )} />
                      <span className="text-[8px] font-bold text-slate-100 uppercase tracking-widest">
                        {t.status === 'ativo' ? 'Ativo' : 'Standby'}
                      </span>
                    </span>
                    {isMine && (
                      <span
                        className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 border font-bold text-[8px] uppercase tracking-widest"
                        style={{
                          borderColor: `rgba(${t.glowRgb},0.5)`,
                          backgroundColor: `rgba(${t.glowRgb},0.18)`,
                          color: `rgb(${t.glowRgb})`,
                        }}
                      >
                        Sua equipe
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center border backdrop-blur-sm"
                        style={{
                          borderColor: `rgba(${t.glowRgb},0.6)`,
                          backgroundColor: `rgba(${t.glowRgb},0.14)`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: `rgb(${t.glowRgb})` }} strokeWidth={2.4} />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="text-lg font-bold text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {t.label}
                        </h4>
                        <p className="text-[9px] mt-0.5 font-bold uppercase tracking-widest" style={{ color: `rgb(${t.glowRgb})` }}>
                          {t.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9.5px] text-slate-300 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-2.5 h-2.5 opacity-70" />
                        <span className="font-bold tabular-nums">{t.agents} agentes</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400 font-mono">
                        {t.shift}
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" style={{ color: `rgb(${t.glowRgb})` }} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* === LINHA 2 — GESTOR DE RONDAS === */}
          <section className={cn(bento, 'col-span-12 p-4 lg:p-4 lg:min-h-0 lg:overflow-hidden')}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[hsl(var(--primary))]/15 border border-[hsl(var(--primary))]/40 flex items-center justify-center">
                    <Radio className="w-3.5 h-3.5 text-[hsl(var(--primary))]" strokeWidth={2.4} />
                  </div>
                  <h3 className="text-[15px] font-bold text-white leading-none tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    GESTOR DE RONDAS
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/40 rounded-sm px-1.5 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8.5px] font-bold text-emerald-300 uppercase tracking-widest">Ao vivo</span>
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Divida os quartos de hora entre os agentes • intervalo configurável
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Interval selector */}
                <div className="inline-flex bg-[#0a0a0f] border border-[#1f1f2e] rounded-md p-0.5">
                  {[15, 30, 60].map((m) => {
                    const active = interval === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setIntervalMin(m as 15 | 30 | 60)}
                        className={cn(
                          'px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest transition-all',
                          active
                            ? 'bg-[hsl(var(--primary))] text-black shadow-[0_2px_10px_hsl(var(--primary)/0.4)]'
                            : 'text-slate-400 hover:text-slate-100',
                        )}
                        aria-pressed={active}
                      >
                        {m}m
                      </button>
                    );
                  })}
                </div>
                {/* Play/Pause */}
                <button
                  type="button"
                  onClick={() => setRunning((v) => !v)}
                  aria-label={running ? 'Pausar rondas' : 'Retomar rondas'}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-widest transition-colors',
                    running
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20',
                  )}
                >
                  {running ? <Pause className="w-3 h-3" strokeWidth={2.6} /> : <Play className="w-3 h-3" strokeWidth={2.6} />}
                  {running ? 'Em curso' : 'Pausado'}
                </button>
              </div>
            </div>

            {/* Grid: quartos-de-hora + timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Quartos-de-hora */}
              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-2">
                {slots.map((s) => {
                  const isActive = s.idx === activeSlot;
                  const isDone = s.idx < activeSlot;
                  return (
                    <button
                      key={s.idx}
                      type="button"
                      onClick={() => setActiveSlot(s.idx)}
                      className={cn(
                        'relative overflow-hidden rounded-lg border p-2.5 text-left transition-all min-h-[76px]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]',
                        isActive && 'border-[hsl(var(--primary))]/60 bg-gradient-to-br from-[hsl(var(--primary)/0.14)] to-[hsl(var(--primary)/0.04)] shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]',
                        isDone && 'border-emerald-500/30 bg-emerald-500/[0.04]',
                        !isActive && !isDone && 'border-[#1f1f2e] bg-[#0a0a0f] hover:border-[hsl(var(--primary))]/30',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8.5px] font-bold uppercase text-slate-500 tracking-widest">
                          Q{s.idx + 1}
                        </span>
                        {isActive ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                            <span className="text-[8px] font-bold text-[hsl(var(--primary))] uppercase tracking-widest">Agora</span>
                          </span>
                        ) : isDone ? (
                          <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">OK</span>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Livre</span>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-base font-bold tabular-nums leading-tight',
                          isActive ? 'text-[hsl(var(--primary))]' : isDone ? 'text-emerald-300' : 'text-white',
                        )}
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {String(s.start).padStart(2, '0')}–{String(s.end).padStart(2, '0')}
                      </p>
                      <p className="text-[9.5px] text-slate-400 mt-0.5 truncate">
                        {s.idx === 0 ? 'Ag. Silva' : s.idx === 1 ? 'Ag. Santos' : s.idx === 2 ? 'Ag. Costa' : 'disponível'}
                      </p>
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))] tch2-progress"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}

                {/* Add new slot suggestion */}
                <button
                  type="button"
                  className="col-span-2 md:col-span-4 inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1f1f2e] hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--primary))]/[0.03] py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-[hsl(var(--primary))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
                  onClick={() => window.dispatchEvent(new Event('rounds:open'))}
                >
                  <Plus className="w-3 h-3" strokeWidth={2.6} />
                  Abrir gestor completo
                </button>
              </div>

              {/* Mini timeline */}
              <div className="lg:col-span-5">
                <div className="rounded-lg border border-[#1f1f2e] bg-[#0a0a0f] p-3 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Timeline • hoje</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
                      {String(activeSlot + 1)}/4
                    </span>
                  </div>
                  <div className="relative pl-3">
                    <div className="absolute left-0 top-1 bottom-1 w-px bg-[#1f1f2e]" />
                    <ul className="space-y-1.5">
                      {slots.map((s) => {
                        const isActive = s.idx === activeSlot;
                        const isDone = s.idx < activeSlot;
                        return (
                          <li key={s.idx} className="relative flex items-center gap-2">
                            <span
                              className={cn(
                                'absolute -left-[13px] w-2 h-2 rounded-full border-2 bg-[#0a0a0f]',
                                isActive
                                  ? 'border-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))]'
                                  : isDone
                                  ? 'border-emerald-400'
                                  : 'border-[#1f1f2e]',
                              )}
                            />
                            <span
                              className={cn(
                                'text-[10px] font-mono tabular-nums w-11',
                                isActive ? 'text-[hsl(var(--primary))]' : isDone ? 'text-emerald-300' : 'text-slate-500',
                              )}
                            >
                              {String(s.start).padStart(2, '0')}:{String(s.end % 60).padStart(2, '0')}
                            </span>
                            <span
                              className={cn(
                                'text-[10.5px] truncate',
                                isActive ? 'text-white font-bold' : isDone ? 'text-slate-300' : 'text-slate-500',
                              )}
                            >
                              {isActive ? 'Ronda em curso' : isDone ? 'Concluída' : 'Aguardando'}
                            </span>
                            {isActive && (
                              <span className="ml-auto text-[9px] font-bold text-[hsl(var(--primary))] tabular-nums">
                                65%
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
