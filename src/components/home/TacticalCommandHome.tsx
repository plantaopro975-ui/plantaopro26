import { useEffect, useMemo, useState } from 'react';
import { Shield, Radio, Eye, Command, Activity, MapPin, Users, Clock, ChevronRight, Play, Pause, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import commandScene from '@/assets/hero/command-scene-v6.jpg.asset.json';
import heroAlfa from '@/assets/heroes/team-alfa-v2.jpg.asset.json';
import heroBravo from '@/assets/heroes/team-bravo-v2.jpg.asset.json';
import heroCharlie from '@/assets/heroes/team-charlie-v2.jpg.asset.json';
import heroDelta from '@/assets/heroes/team-delta-v2.jpg.asset.json';
import TeamDetailsDialog, { type TeamDetail, type TeamKey } from './TeamDetailsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/**
 * TacticalCommandHome v3 — Homepage compacta com CRUD de rondas.
 *
 * Mudanças desta versão:
 *  - Mobile realmente sem quebras: hero com altura fixa, cards de equipe em
 *    grid 2x2 compacto (não vira accordion caótico), Gestor de Rondas com
 *    scroll horizontal em telas <sm quando necessário.
 *  - CRUD de rondas embutido: criar (dialog), editar horário/agente,
 *    cancelar (confirm), com validação HH:MM e alerta de conflito.
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

/* ================= tempo helpers ================= */

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

function hhmmToMinutes(s: string): number | null {
  if (!TIME_RE.test(s)) return null;
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
}

function minutesToHHMM(min: number): string {
  const h = Math.floor(((min % 1440) + 1440) % 1440 / 60);
  const m = ((min % 60) + 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Verifica se duas janelas (em minutos, com wrap 24h) se sobrepõem.
 * end pode ser < start (ronda que cruza meia-noite).
 */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  const expand = (s: number, e: number): Array<[number, number]> => {
    if (e > s) return [[s, e]];
    if (e === s) return [[s, s + 1]];
    return [[s, 1440], [0, e]];
  };
  const A = expand(aStart, aEnd);
  const B = expand(bStart, bEnd);
  for (const [as, ae] of A) {
    for (const [bs, be] of B) {
      if (as < be && bs < ae) return true;
    }
  }
  return false;
}

/* ================= tipos ================= */

interface Round {
  id: string;
  startMin: number;   // 0..1439
  endMin: number;     // 0..1439
  agent: string;      // nome do agente
  note?: string;
}

const DEFAULT_ROUNDS: Round[] = [
  { id: 'r1', startMin: 0,   endMin: 15,  agent: 'Ag. Silva' },
  { id: 'r2', startMin: 15,  endMin: 30,  agent: 'Ag. Santos' },
  { id: 'r3', startMin: 30,  endMin: 45,  agent: 'Ag. Costa' },
  { id: 'r4', startMin: 45,  endMin: 60,  agent: '' },
];

function useLiveClock(): { time: string; date: string; nowMin: number } {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return {
    time: now.toLocaleTimeString('pt-BR', { hour12: false }),
    date: now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }),
    nowMin: now.getHours() * 60 + now.getMinutes(),
  };
}

export function TacticalCommandHome({ onTeamClick }: Props) {
  const { time, date, nowMin } = useLiveClock();
  const { agent } = useAgentProfile();
  const [interval, setIntervalMin] = useState<15 | 30 | 60>(15);
  const [activeTeam, setActiveTeam] = useState<TeamDetail | null>(null);
  const [running, setRunning] = useState<boolean>(true);
  const [rounds, setRounds] = useState<Round[]>(DEFAULT_ROUNDS);

  // Dialog CRUD state
  const [editing, setEditing] = useState<{ mode: 'new' | 'edit'; round: Round } | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const userTeamKey = ((agent?.team ?? '').toString().trim().toLowerCase()) as TeamKey | '';

  const bento = 'relative rounded-xl border border-[#1a1a26] bg-gradient-to-b from-[#111119] to-[#0c0c13] shadow-[0_8px_32px_-16px_rgba(0,0,0,0.9)]';

  const sortedRounds = useMemo(
    () => [...rounds].sort((a, b) => a.startMin - b.startMin),
    [rounds],
  );

  // Rond ativa "agora": aquela que contém nowMin
  const activeRoundId = useMemo(() => {
    for (const r of sortedRounds) {
      const inside = r.endMin > r.startMin
        ? nowMin >= r.startMin && nowMin < r.endMin
        : nowMin >= r.startMin || nowMin < r.endMin;
      if (inside) return r.id;
    }
    return null;
  }, [sortedRounds, nowMin]);

  const openNew = () => {
    // sugere a próxima janela livre baseada no interval selecionado
    const last = sortedRounds[sortedRounds.length - 1];
    const suggestedStart = last ? last.endMin % 1440 : nowMin;
    setEditing({
      mode: 'new',
      round: {
        id: `r_${Date.now()}`,
        startMin: suggestedStart,
        endMin: (suggestedStart + interval) % 1440,
        agent: '',
      },
    });
  };

  const openEdit = (r: Round) => setEditing({ mode: 'edit', round: { ...r } });

  const handleSave = (draft: Round) => {
    // valida overlap com todas as outras
    const conflict = rounds.find((r) => r.id !== draft.id && overlaps(r.startMin, r.endMin, draft.startMin, draft.endMin));
    if (conflict) {
      toast.error('Conflito de horário', {
        description: `Sobrepõe a ronda ${minutesToHHMM(conflict.startMin)}–${minutesToHHMM(conflict.endMin)}${conflict.agent ? ` (${conflict.agent})` : ''}.`,
      });
      return;
    }
    setRounds((prev) => {
      const exists = prev.some((r) => r.id === draft.id);
      return exists ? prev.map((r) => (r.id === draft.id ? draft : r)) : [...prev, draft];
    });
    toast.success(editing?.mode === 'new' ? 'Ronda criada' : 'Ronda atualizada', {
      description: `${minutesToHHMM(draft.startMin)}–${minutesToHHMM(draft.endMin)}${draft.agent ? ` • ${draft.agent}` : ''}`,
    });
    setEditing(null);
  };

  const confirmCancel = () => {
    if (!cancelId) return;
    const gone = rounds.find((r) => r.id === cancelId);
    setRounds((prev) => prev.filter((r) => r.id !== cancelId));
    setCancelId(null);
    if (gone) {
      toast('Ronda cancelada', {
        description: `${minutesToHHMM(gone.startMin)}–${minutesToHHMM(gone.endMin)} removida.`,
      });
    }
  };

  return (
    <div className="tch2-root w-full text-slate-200 font-['DM_Sans'] bg-[#07070b]">
      <div className="w-full max-w-[1440px] mx-auto px-3 md:px-4 pt-3 pb-4 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:flex lg:flex-col">

        {/* HEADER — Mission ID compacto */}
        <header className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#141420] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[hsl(var(--primary))] to-amber-600 flex items-center justify-center rounded-md shrink-0 shadow-[0_0_18px_hsl(var(--primary)/0.4)]">
              <Shield className="w-4 h-4 text-black" strokeWidth={2.6} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[11.5px] sm:text-[13px] font-bold tracking-[0.16em] text-white leading-tight truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                CENTRO DE COMANDO
              </h1>
              <p className="text-[8.5px] sm:text-[9px] text-[hsl(var(--primary))]/90 font-bold uppercase tracking-[0.24em] leading-tight">
                ISE • Acre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {agent?.team && (
              <div className="hidden sm:flex flex-col items-end leading-tight">
                <span className="text-[8.5px] text-slate-500 uppercase font-bold tracking-widest">Sua equipe</span>
                <span className="text-[11px] font-bold text-[hsl(var(--primary))] tracking-[0.18em]">
                  {agent.team.toString().toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-right leading-tight">
              <p className="text-[8px] sm:text-[8.5px] text-slate-500 uppercase tracking-widest truncate max-w-[110px]">{date}</p>
              <p className="text-[15px] sm:text-[17px] md:text-[19px] font-bold text-white tabular-nums leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
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
        <main className="mt-3 grid grid-cols-12 gap-2.5 md:gap-3 lg:flex-1 lg:min-h-0">

          {/* === HERO === */}
          <section className={cn(bento, 'col-span-12 lg:col-span-7 overflow-hidden h-[180px] sm:h-[220px] lg:h-auto lg:min-h-0')}>
            <img
              src={commandScene.url}
              alt="Agente socioeducativo em viatura oficial"
              className="absolute inset-0 w-full h-full object-cover object-center"
              width={1600}
              height={912}
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#07070b] via-[#07070b]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07070b]/90" />

            {/* giroflex */}
            <div className="absolute top-[16%] left-[19%] w-[9%] h-[3.5%] rounded-full opacity-0 tch2-flash tch2-flash-blue pointer-events-none" aria-hidden />
            <div className="absolute top-[16%] left-[34%] w-[9%] h-[3.5%] rounded-full opacity-0 tch2-flash tch2-flash-red pointer-events-none" aria-hidden />
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none tch2-scan" aria-hidden />

            <span className="absolute top-2 left-2 w-3.5 h-3.5 border-l-2 border-t-2 border-[hsl(var(--primary))]/70" />
            <span className="absolute top-2 right-2 w-3.5 h-3.5 border-r-2 border-t-2 border-[hsl(var(--primary))]/70" />
            <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-l-2 border-b-2 border-[hsl(var(--primary))]/70" />
            <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-r-2 border-b-2 border-[hsl(var(--primary))]/70" />

            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-red-500/40 rounded px-1.5 py-0.5">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8.5px] font-bold text-red-300 tracking-widest uppercase">Alta Vigilância</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-emerald-500/30 rounded px-1.5 py-0.5">
                <Activity className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                <span className="text-[8.5px] font-bold text-emerald-300 tracking-widest tabular-nums">SLA 99.8%</span>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4 md:p-5">
              <span className="inline-flex items-center gap-1.5 text-[8.5px] sm:text-[9px] font-bold text-[hsl(var(--primary))] uppercase tracking-[0.24em] mb-1">
                <span className="w-5 h-px bg-[hsl(var(--primary))]" />
                Operação em curso
              </span>
              <h2
                className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.05] tracking-tight uppercase"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Monitoramento <span className="text-[hsl(var(--primary))]">tático</span><br className="hidden md:block"/>
                <span className="md:hidden"> </span>em tempo real
              </h2>
              <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 sm:mt-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] text-slate-300">
                  <MapPin className="w-3 h-3 text-[hsl(var(--primary))]" />
                  <span className="font-bold uppercase tracking-wider">Rio Branco • Sede</span>
                </span>
                <span className="w-px h-3 bg-slate-700" />
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] text-slate-300">
                  <Users className="w-3 h-3 text-[hsl(var(--primary))]" />
                  <span className="font-bold tabular-nums">96 agentes</span>
                </span>
                <span className="w-px h-3 bg-slate-700" />
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] text-slate-300">
                  <Clock className="w-3 h-3 text-[hsl(var(--primary))]" />
                  <span className="font-bold uppercase tracking-wider">4 equipes</span>
                </span>
              </div>
            </div>
          </section>

          {/* === EQUIPES === */}
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-2 md:gap-2.5 lg:grid-rows-2">
            {TEAMS.map((t) => {
              const Icon = TEAM_ICON[t.key];
              const isMine = userTeamKey === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTeam(t)}
                  aria-label={`Ver detalhes da equipe ${t.label}`}
                  className={cn(
                    'tch2-team group relative overflow-hidden rounded-xl border text-left',
                    'border-[#1a1a26] hover:border-[hsl(var(--primary))]/60',
                    'transition-all duration-300 hover:-translate-y-0.5',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]',
                    'h-[110px] sm:h-[130px] lg:h-auto lg:min-h-0',
                  )}
                  style={{ ['--glow' as never]: t.glowRgb }}
                >
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-[#07070b]/70 to-[#07070b]/10" />
                  <div
                    className="absolute inset-y-0 right-0 w-1/2 opacity-60 mix-blend-screen pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at right center, rgba(${t.glowRgb},0.5), transparent 70%)` }}
                  />
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] shadow-[0_0_12px_rgba(var(--glow),0.6)]"
                    style={{ backgroundColor: `rgb(${t.glowRgb})` }}
                  />

                  <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm px-1.5 py-0.5">
                      <span className={cn(
                        'w-1 h-1 rounded-full',
                        t.status === 'ativo' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
                      )} />
                      <span className="text-[7.5px] sm:text-[8px] font-bold text-slate-100 uppercase tracking-widest">
                        {t.status === 'ativo' ? 'Ativo' : 'Standby'}
                      </span>
                    </span>
                    {isMine && (
                      <span
                        className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 border font-bold text-[7.5px] sm:text-[8px] uppercase tracking-widest"
                        style={{
                          borderColor: `rgba(${t.glowRgb},0.5)`,
                          backgroundColor: `rgba(${t.glowRgb},0.18)`,
                          color: `rgb(${t.glowRgb})`,
                        }}
                      >
                        Sua
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-end p-2 sm:p-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <div
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border backdrop-blur-sm shrink-0"
                        style={{
                          borderColor: `rgba(${t.glowRgb},0.6)`,
                          backgroundColor: `rgba(${t.glowRgb},0.14)`,
                        }}
                      >
                        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: `rgb(${t.glowRgb})` }} strokeWidth={2.4} />
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="text-[15px] sm:text-lg font-bold text-white leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] truncate"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {t.label}
                        </h4>
                        <p className="text-[8px] sm:text-[9px] mt-0.5 font-bold uppercase tracking-widest truncate" style={{ color: `rgb(${t.glowRgb})` }}>
                          {t.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] sm:text-[9.5px] text-slate-300 mt-0.5">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Users className="w-2.5 h-2.5 opacity-70 shrink-0" />
                        <span className="font-bold tabular-nums">{t.agents}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400 font-mono text-[9px] truncate">
                        {t.shift}
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 shrink-0" style={{ color: `rgb(${t.glowRgb})` }} />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* === GESTOR DE RONDAS (CRUD) === */}
          <section className={cn(bento, 'col-span-12 p-3 sm:p-4 lg:min-h-0 lg:overflow-hidden')}>
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-6 h-6 rounded-md bg-[hsl(var(--primary))]/15 border border-[hsl(var(--primary))]/40 flex items-center justify-center shrink-0">
                    <Radio className="w-3.5 h-3.5 text-[hsl(var(--primary))]" strokeWidth={2.4} />
                  </div>
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-white leading-none tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    GESTOR DE RONDAS
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/40 rounded-sm px-1.5 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8.5px] font-bold text-emerald-300 uppercase tracking-widest">Ao vivo</span>
                  </span>
                </div>
                <p className="text-[10px] sm:text-[10.5px] text-slate-500 mt-1">
                  Crie, edite e cancele rondas • validação de conflitos em tempo real
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex bg-[#0a0a0f] border border-[#1f1f2e] rounded-md p-0.5">
                  {[15, 30, 60].map((m) => {
                    const active = interval === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setIntervalMin(m as 15 | 30 | 60)}
                        className={cn(
                          'px-2 sm:px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-widest transition-all',
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
                <button
                  type="button"
                  onClick={openNew}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/25 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  <Plus className="w-3 h-3" strokeWidth={2.6} />
                  Nova ronda
                </button>
              </div>
            </div>

            {/* Grid: cards de ronda + timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                  {sortedRounds.map((r) => {
                    const isActive = r.id === activeRoundId;
                    const isPast = !isActive && r.endMin > r.startMin ? nowMin >= r.endMin : false;
                    return (
                      <div
                        key={r.id}
                        className={cn(
                          'group relative overflow-hidden rounded-lg border p-2.5 min-h-[92px] transition-all',
                          isActive && 'border-[hsl(var(--primary))]/60 bg-gradient-to-br from-[hsl(var(--primary)/0.14)] to-[hsl(var(--primary)/0.04)] shadow-[0_0_24px_-8px_hsl(var(--primary)/0.6)]',
                          isPast && 'border-emerald-500/30 bg-emerald-500/[0.04]',
                          !isActive && !isPast && 'border-[#1f1f2e] bg-[#0a0a0f] hover:border-[hsl(var(--primary))]/30',
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8.5px] font-bold uppercase text-slate-500 tracking-widest">
                            {minutesToHHMM(r.startMin)} → {minutesToHHMM(r.endMin)}
                          </span>
                          {isActive ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                              <span className="text-[8px] font-bold text-[hsl(var(--primary))] uppercase tracking-widest">Agora</span>
                            </span>
                          ) : isPast ? (
                            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">OK</span>
                          ) : (
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Programada</span>
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-[13px] font-bold leading-tight truncate',
                            isActive ? 'text-white' : isPast ? 'text-emerald-100' : 'text-slate-100',
                          )}
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                          title={r.agent || 'Disponível'}
                        >
                          {r.agent || 'Disponível'}
                        </p>
                        {r.note && (
                          <p className="text-[9.5px] text-slate-500 mt-0.5 truncate" title={r.note}>{r.note}</p>
                        )}

                        {/* actions */}
                        <div className="mt-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-[hsl(var(--primary))] px-1.5 py-0.5 rounded border border-transparent hover:border-[hsl(var(--primary))]/30 transition-colors"
                            aria-label={`Editar ronda ${minutesToHHMM(r.startMin)}`}
                          >
                            <Pencil className="w-2.5 h-2.5" strokeWidth={2.6} />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelId(r.id)}
                            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-300 px-1.5 py-0.5 rounded border border-transparent hover:border-red-500/40 transition-colors"
                            aria-label={`Cancelar ronda ${minutesToHHMM(r.startMin)}`}
                          >
                            <Trash2 className="w-2.5 h-2.5" strokeWidth={2.6} />
                            Cancelar
                          </button>
                        </div>

                        {isActive && (
                          <span
                            className="absolute bottom-0 left-0 h-[2px] bg-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))] tch2-progress"
                            aria-hidden
                          />
                        )}
                      </div>
                    );
                  })}

                  {sortedRounds.length === 0 && (
                    <div className="col-span-full text-center py-6 border border-dashed border-[#1f1f2e] rounded-lg">
                      <p className="text-[11px] text-slate-500">Nenhuma ronda programada.</p>
                      <button
                        type="button"
                        onClick={openNew}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary))] hover:underline"
                      >
                        <Plus className="w-3 h-3" strokeWidth={2.6} />
                        Criar a primeira ronda
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline lateral */}
              <div className="lg:col-span-4">
                <div className="rounded-lg border border-[#1f1f2e] bg-[#0a0a0f] p-3 h-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Timeline • hoje</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--primary))] tabular-nums">
                      {sortedRounds.length} {sortedRounds.length === 1 ? 'ronda' : 'rondas'}
                    </span>
                  </div>
                  <div className="relative pl-3 max-h-[160px] overflow-y-auto pr-1">
                    <div className="absolute left-0 top-1 bottom-1 w-px bg-[#1f1f2e]" />
                    <ul className="space-y-1.5">
                      {sortedRounds.map((r) => {
                        const isActive = r.id === activeRoundId;
                        const isPast = !isActive && r.endMin > r.startMin ? nowMin >= r.endMin : false;
                        return (
                          <li key={r.id} className="relative flex items-center gap-2">
                            <span
                              className={cn(
                                'absolute -left-[13px] w-2 h-2 rounded-full border-2 bg-[#0a0a0f]',
                                isActive
                                  ? 'border-[hsl(var(--primary))] shadow-[0_0_8px_hsl(var(--primary))]'
                                  : isPast
                                  ? 'border-emerald-400'
                                  : 'border-[#1f1f2e]',
                              )}
                            />
                            <span
                              className={cn(
                                'text-[10px] font-mono tabular-nums w-[68px]',
                                isActive ? 'text-[hsl(var(--primary))]' : isPast ? 'text-emerald-300' : 'text-slate-500',
                              )}
                            >
                              {minutesToHHMM(r.startMin)}–{minutesToHHMM(r.endMin)}
                            </span>
                            <span
                              className={cn(
                                'text-[10.5px] truncate flex-1',
                                isActive ? 'text-white font-bold' : isPast ? 'text-slate-300' : 'text-slate-500',
                              )}
                            >
                              {r.agent || (isActive ? 'Ronda em curso' : isPast ? 'Concluída' : 'Sem agente')}
                            </span>
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

      <RoundEditorDialog
        state={editing}
        allRounds={rounds}
        onCancel={() => setEditing(null)}
        onSave={handleSave}
      />

      <AlertDialog open={!!cancelId} onOpenChange={(o) => { if (!o) setCancelId(null); }}>
        <AlertDialogContent className="bg-[#0f0f18] border-[#1f1f2e] max-w-[380px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Cancelar esta ronda?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              A ronda selecionada será removida da programação de hoje. Você pode recriá-la a qualquer momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#1f1f2e] bg-transparent text-slate-300 hover:bg-[#141420]">Manter</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="bg-red-500 hover:bg-red-600 text-white">
              Cancelar ronda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ================= dialog de criar/editar ================= */

function RoundEditorDialog({
  state,
  allRounds,
  onCancel,
  onSave,
}: {
  state: { mode: 'new' | 'edit'; round: Round } | null;
  allRounds: Round[];
  onCancel: () => void;
  onSave: (r: Round) => void;
}) {
  const [startStr, setStartStr] = useState('00:00');
  const [endStr, setEndStr] = useState('00:15');
  const [agentName, setAgentName] = useState('');
  const [note, setNote] = useState('');

  // Sync form when dialog opens
  useEffect(() => {
    if (!state) return;
    setStartStr(minutesToHHMM(state.round.startMin));
    setEndStr(minutesToHHMM(state.round.endMin));
    setAgentName(state.round.agent);
    setNote(state.round.note ?? '');
  }, [state]);

  const startMin = hhmmToMinutes(startStr);
  const endMin = hhmmToMinutes(endStr);
  const timeValid = startMin !== null && endMin !== null && startMin !== endMin;

  const conflict = useMemo(() => {
    if (!state || startMin === null || endMin === null) return null;
    return allRounds.find(
      (r) => r.id !== state.round.id && overlaps(r.startMin, r.endMin, startMin, endMin),
    );
  }, [allRounds, startMin, endMin, state]);

  const nameTrim = agentName.trim().slice(0, 60);
  const noteTrim = note.trim().slice(0, 120);
  const canSave = timeValid && !conflict;

  const handleSubmit = () => {
    if (!state || !canSave || startMin === null || endMin === null) return;
    onSave({
      id: state.round.id,
      startMin,
      endMin,
      agent: nameTrim,
      note: noteTrim || undefined,
    });
  };

  return (
    <Dialog open={!!state} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="bg-[#0f0f18] border-[#1f1f2e] max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {state?.mode === 'new' ? 'Nova ronda' : 'Editar ronda'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Defina o intervalo (HH:MM) e o agente responsável. Conflitos com outras rondas serão bloqueados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rd-start" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Início</Label>
              <Input
                id="rd-start"
                type="time"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="mt-1 bg-[#0a0a0f] border-[#1f1f2e] text-white font-mono tabular-nums"
                aria-invalid={startMin === null}
              />
            </div>
            <div>
              <Label htmlFor="rd-end" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fim</Label>
              <Input
                id="rd-end"
                type="time"
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="mt-1 bg-[#0a0a0f] border-[#1f1f2e] text-white font-mono tabular-nums"
                aria-invalid={endMin === null || startMin === endMin}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rd-agent" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Agente</Label>
            <Input
              id="rd-agent"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Nome do agente responsável"
              maxLength={60}
              autoComplete="off"
              className="mt-1 bg-[#0a0a0f] border-[#1f1f2e] text-white"
            />
          </div>

          <div>
            <Label htmlFor="rd-note" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Observação (opcional)</Label>
            <Input
              id="rd-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: setor B — verificar dormitórios"
              maxLength={120}
              autoComplete="off"
              className="mt-1 bg-[#0a0a0f] border-[#1f1f2e] text-white"
            />
          </div>

          {!timeValid && (
            <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/40 rounded-md p-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Horário inválido. Use HH:MM e garanta que início e fim sejam diferentes.</span>
            </div>
          )}
          {timeValid && conflict && (
            <div className="flex items-start gap-2 text-[11px] text-red-300 bg-red-500/10 border border-red-500/40 rounded-md p-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Conflito com a ronda <strong className="font-mono">{minutesToHHMM(conflict.startMin)}–{minutesToHHMM(conflict.endMin)}</strong>
                {conflict.agent ? ` (${conflict.agent})` : ''}. Ajuste o horário para continuar.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-300 hover:bg-[#141420]">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSave}
            className="bg-[hsl(var(--primary))] text-black hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50"
          >
            {state?.mode === 'new' ? 'Criar ronda' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TacticalCommandHome;
