import { useEffect, useMemo, useState } from 'react';
import { Shield, Radio, Eye, Command, Activity, MapPin, Users, Clock, ChevronRight, Play, Pause, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useServerClockParts } from '@/hooks/useServerTime';
import { supabase } from '@/integrations/supabase/client';


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

/**
 * Relógio ao vivo baseado em America/Rio_Branco (UTC-5) E na hora do
 * servidor (não confia no relógio do dispositivo). Fonte única de verdade
 * para todos os cálculos de ronda desta tela.
 */
const ACRE_TZ = 'America/Rio_Branco';

function useLiveClock(): { time: string; date: string; nowMin: number } {
  const { hours, minutes, seconds, date: now } = useServerClockParts(ACRE_TZ, 1000);
  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const date = new Intl.DateTimeFormat('pt-BR', {
    timeZone: ACRE_TZ, weekday: 'short', day: '2-digit', month: 'short',
  }).format(now);
  return { time, date, nowMin: hours * 60 + minutes };
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

  // Contagens reais vindas do banco (agregadas, sem PII)
  const [teamCounts, setTeamCounts] = useState<Record<TeamKey, { total: number; active: number }>>({
    alfa:    { total: 0, active: 0 },
    bravo:   { total: 0, active: 0 },
    charlie: { total: 0, active: 0 },
    delta:   { total: 0, active: 0 },
  });
  const [ops, setOps] = useState<{ units: number; agentsTotal: number; agentsActive: number }>({
    units: 0, agentsTotal: 0, agentsActive: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [tc, oc] = await Promise.all([
        supabase.rpc('get_public_team_counts'),
        supabase.rpc('get_public_operational_counts'),
      ]);
      if (!alive) return;
      if (tc.data && Array.isArray(tc.data)) {
        const next: Record<TeamKey, { total: number; active: number }> = {
          alfa: { total: 0, active: 0 }, bravo: { total: 0, active: 0 },
          charlie: { total: 0, active: 0 }, delta: { total: 0, active: 0 },
        };
        for (const row of tc.data as Array<{ team: string; total: number; active: number }>) {
          const k = row.team?.toLowerCase() as TeamKey;
          if (k in next) next[k] = { total: row.total ?? 0, active: row.active ?? 0 };
        }
        setTeamCounts(next);
      }
      if (oc.data && Array.isArray(oc.data) && oc.data[0]) {
        const row = oc.data[0] as { units_count: number; agents_total: number; agents_active: number };
        setOps({ units: row.units_count ?? 0, agentsTotal: row.agents_total ?? 0, agentsActive: row.agents_active ?? 0 });
      }
    })();
    return () => { alive = false; };
  }, []);

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

  const statusLabel = (t: TeamDetail): { label: string; color: string; bar: string; barPct: string } => {
    if (t.status === 'stand-by') {
      return { label: 'Em reserva', color: 'text-red-400', bar: 'bg-red-500', barPct: '20%' };
    }
    // Diferencia por role para colorir sem alterar identidade
    switch (t.key) {
      case 'alfa':    return { label: 'Operação ativa', color: 'text-emerald-400', bar: 'bg-emerald-500', barPct: '85%' };
      case 'bravo':   return { label: 'Intervenção',    color: 'text-blue-400',    bar: 'bg-blue-400',    barPct: '70%' };
      case 'charlie': return { label: 'Vigilância',     color: 'text-sky-400',     bar: 'bg-sky-400',     barPct: '60%' };
      default:        return { label: 'Comando',        color: 'text-[#c9a84c]',   bar: 'bg-[#c9a84c]',   barPct: '90%' };
    }
  };

  return (
    <div
      className="w-full h-[100dvh] bg-[#0d0d0d] text-[#f0d78c] font-['DM_Sans'] overflow-hidden flex flex-col p-3 md:p-4 gap-3 md:gap-4 selection:bg-[#c9a84c] selection:text-[#0d0d0d]"
      style={{ ['--hud-gold' as never]: '#c9a84c' }}
    >
      {/* HEADER — Command bar */}
      <header className="shrink-0 flex items-center justify-between bg-[#1a1a1a] border-l-4 border-[#c9a84c] px-4 md:px-6 py-2.5 md:py-3 shadow-2xl rounded-r-md">
        <div className="flex items-center gap-4 md:gap-8 min-w-0">
          <div className="flex flex-col min-w-0">
            <span
              className="text-xl md:text-2xl font-bold tracking-tighter uppercase text-[#c9a84c] leading-none"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Plantão<span className="text-white">Pro</span>
            </span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] opacity-50 mt-0.5">
              Centro de Comando Socioeducativo
            </span>
          </div>
          <div className="hidden md:block h-8 w-px bg-white/10" />
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] uppercase opacity-50 font-bold tracking-widest">Unidade Operacional</span>
            <span className="text-sm font-medium text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ISE • ACRE / SEDE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-right">
            <div className="text-[9px] md:text-[10px] uppercase opacity-50 tracking-widest">America/Rio_Branco</div>
            <div
              className="text-lg md:text-xl font-bold text-white tabular-nums leading-none mt-0.5"
              style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
            >
              {time} <span className="text-[10px] md:text-xs font-normal text-[#c9a84c]">AMT</span>
            </div>
            <div className="text-[9px] uppercase text-slate-500 tracking-widest mt-0.5">{date}</div>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-sm border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-white">Sistema Online</span>
          </div>
        </div>
      </header>

      {/* MAIN GRID — Bento */}
      <main className="flex-1 grid grid-cols-12 grid-rows-6 gap-3 md:gap-4 min-h-0 overflow-hidden">

        {/* TEAMS 2x2 — col-span-8 row-span-3 */}
        <section className="col-span-12 lg:col-span-8 row-span-3 grid grid-cols-2 gap-3 md:gap-4 min-h-0">
          {TEAMS.map((t) => {
            const st = statusLabel(t);
            const isMine = userTeamKey === t.key;
            const Icon = TEAM_ICON[t.key];
            const active = teamCounts[t.key]?.active ?? 0;
            const total = teamCounts[t.key]?.total ?? 0;
            const isStandby = t.status === 'stand-by';
            const teamCode = String(t.key).toUpperCase().slice(0, 2) + '-' + (['01','02','03','04'][['alfa','bravo','charlie','delta'].indexOf(t.key)] || '00');
            const radioCh = { alfa: '01.140', bravo: '02.220', charlie: '03.340', delta: '04.460' }[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTeamClick(t.key)}
                aria-label={`Entrar na equipe ${t.label}`}
                className="duty-card group text-left relative overflow-hidden bg-[#0b0b0d] border border-white/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:shadow-[0_18px_50px_-18px_var(--accent-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                style={{
                  ['--accent' as never]: `rgb(${t.glowRgb})`,
                  ['--accent-glow' as never]: `rgba(${t.glowRgb},0.55)`,
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              >
                {/* Top identification strip — like patrol vehicle placard */}
                <div className="relative flex items-center justify-between px-3 h-6 bg-black/70 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${t.glowRgb})`, boxShadow: `0 0 6px rgb(${t.glowRgb})` }} />
                    <span className="font-mono text-[9px] tracking-[0.22em] text-white/70">{teamCode}</span>
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-white/40">
                    CH {radioCh}
                  </span>
                  <span className={cn('flex items-center gap-1 font-mono text-[9px] tracking-[0.2em]', isStandby ? 'text-amber-400/80' : 'text-emerald-400')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', isStandby ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse')} />
                    {isStandby ? 'STANDBY' : '10-8'}
                  </span>
                </div>

                {/* Body */}
                <div className="relative p-3 md:p-4 pb-14">
                  <div className="flex items-start gap-3">
                    {/* POLICE BADGE — octagonal shoulder patch */}
                    <div className="relative shrink-0 w-16 h-16 md:w-[72px] md:h-[72px]">
                      <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)]">
                        <defs>
                          <linearGradient id={`patch-${t.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2a2a2e" />
                            <stop offset="1" stopColor="#0a0a0c" />
                          </linearGradient>
                          <linearGradient id={`patchring-${t.key}`} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor={`rgb(${t.glowRgb})`} stopOpacity="0.95" />
                            <stop offset="1" stopColor={`rgb(${t.glowRgb})`} stopOpacity="0.35" />
                          </linearGradient>
                        </defs>
                        {/* Octagonal patch outline */}
                        <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill={`url(#patch-${t.key})`} stroke={`url(#patchring-${t.key})`} strokeWidth="1.6" />
                        <polygon points="26,10 54,10 70,26 70,54 54,70 26,70 10,54 10,26" fill="none" stroke={`rgb(${t.glowRgb})`} strokeOpacity="0.3" strokeWidth="0.6" />
                        {/* 5-point police star */}
                        <path d="M40 22 L44.2 34.4 L57 34.4 L46.6 42.1 L50.7 54.6 L40 46.9 L29.3 54.6 L33.4 42.1 L23 34.4 L35.8 34.4 Z" fill={`rgb(${t.glowRgb})`} fillOpacity="0.18" stroke={`rgb(${t.glowRgb})`} strokeWidth="1.1" strokeLinejoin="round" />
                        {/* Center dot */}
                        <circle cx="40" cy="41" r="2.4" fill={`rgb(${t.glowRgb})`} />
                        {/* Bottom scroll banner */}
                        <rect x="14" y="60" width="52" height="7" fill="#000" fillOpacity="0.55" stroke={`rgb(${t.glowRgb})`} strokeOpacity="0.5" strokeWidth="0.5" />
                        <text x="40" y="65.5" textAnchor="middle" fontSize="5.2" fontFamily="JetBrains Mono, monospace" fill={`rgb(${t.glowRgb})`} letterSpacing="1.5">{t.label}</text>
                      </svg>
                      {!isStandby && (
                        <span
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black"
                          style={{ background: `rgb(${t.glowRgb})`, boxShadow: `0 0 10px rgb(${t.glowRgb})` }}
                        />
                      )}
                    </div>

                    {/* Callsign + role */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            'text-xl md:text-2xl font-bold leading-none tracking-tight',
                            isStandby ? 'text-white/60' : 'text-white',
                          )}
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {t.label}
                        </span>
                        {isMine && (
                          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-[#c9a84c] text-black rounded-sm">
                            Sua
                          </span>
                        )}
                      </div>
                      <span className="text-[9.5px] md:text-[10px] uppercase font-semibold tracking-[0.22em] text-white/45 mt-1 block">
                        {t.role}
                      </span>
                      {/* Rank / duty bars — like uniform service stripes */}
                      <div className="flex items-center gap-1 mt-2">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className="h-[3px] w-4 rounded-full"
                            style={{
                              background: i < Math.max(1, Math.round((active / Math.max(total, 1)) * 4))
                                ? `rgb(${t.glowRgb})`
                                : 'rgba(255,255,255,0.08)',
                              boxShadow: i < Math.max(1, Math.round((active / Math.max(total, 1)) * 4))
                                ? `0 0 6px rgba(${t.glowRgb},0.6)`
                                : undefined,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Effective counter — big display */}
                    <div className="text-right shrink-0">
                      <div
                        className={cn(
                          'text-2xl md:text-3xl font-bold tabular-nums leading-none',
                          isStandby ? 'text-white/40' : 'text-white',
                        )}
                        style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
                      >
                        {String(active).padStart(2, '0')}
                        <span className="text-xs md:text-sm text-white/30 font-normal">/{String(total).padStart(2, '0')}</span>
                      </div>
                      <div className="text-[8.5px] md:text-[9px] uppercase opacity-60 mt-1 tracking-widest font-semibold">Efetivo</div>
                    </div>
                  </div>

                  {/* Duty roster row */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="bg-black/40 border border-white/5 px-2 py-1.5 rounded-sm">
                      <div className="text-[8.5px] uppercase tracking-widest text-white/40 font-semibold">Turno</div>
                      <div className="font-mono text-[10.5px] text-white/85 mt-0.5 truncate">{t.shift}</div>
                    </div>
                    <div className="bg-black/40 border border-white/5 px-2 py-1.5 rounded-sm">
                      <div className="text-[8.5px] uppercase tracking-widest text-white/40 font-semibold">Setor</div>
                      <div className="font-mono text-[10.5px] text-white/85 mt-0.5 truncate">{t.jurisdiction.replace(' • ', ' / ')}</div>
                    </div>
                    <div className="bg-black/40 border border-white/5 px-2 py-1.5 rounded-sm">
                      <div className="text-[8.5px] uppercase tracking-widest text-white/40 font-semibold">Próx. Ronda</div>
                      <div className="font-mono text-[10.5px] mt-0.5" style={{ color: `rgb(${t.glowRgb})` }}>{t.nextRound}</div>
                    </div>
                  </div>
                </div>

                {/* Reflective safety chevrons — like patrol vehicle rear */}
                <div
                  className="absolute inset-x-0 bottom-6 h-3 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundImage: `repeating-linear-gradient(135deg, rgb(${t.glowRgb}) 0 8px, rgba(0,0,0,0.85) 8px 18px)`,
                    maskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                    WebkitMaskImage: 'linear-gradient(90deg, transparent, black 15%, black 85%, transparent)',
                  }}
                  aria-hidden
                />

                {/* Bottom access bar */}
                <div
                  className="absolute inset-x-0 bottom-0 h-6 flex items-center justify-between px-3 border-t bg-black/80 backdrop-blur-sm transition-colors"
                  style={{ borderColor: `rgba(${t.glowRgb},0.35)` }}
                >
                  <span className="font-mono text-[9px] tracking-[0.2em] text-white/60 uppercase">
                    {isMine ? 'ACESSAR POSTO' : 'Entrar'}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: `rgb(${t.glowRgb})` }}>
                    Autorizar
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        {/* TELEMETRIA — col-span-4 row-span-3 */}
        <section className="col-span-12 lg:col-span-4 row-span-3 bg-[#1a1a1a] border border-[#c9a84c]/20 p-4 md:p-5 flex flex-col rounded-sm min-h-0">
          <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase mb-4 md:mb-5 flex items-center gap-2 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <span className="w-1 h-4 bg-[#c9a84c]" />
            Telemetria do Sistema
          </h3>
          <div className="space-y-4 md:space-y-5 flex-1 min-h-0 flex flex-col">
            <div>
              <div className="flex justify-between text-[10px] uppercase mb-1.5 font-bold tracking-widest">
                <span className="text-slate-400">Efetivo em atividade</span>
                <span className="text-[#c9a84c] tabular-nums">
                  {ops.agentsTotal > 0 ? Math.round((ops.agentsActive / ops.agentsTotal) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-black w-full rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c9a84c] to-[#f0d78c] transition-all"
                  style={{ width: `${ops.agentsTotal > 0 ? Math.round((ops.agentsActive / ops.agentsTotal) * 100) : 0}%` }}
                />
              </div>
              <div className="mt-1 text-[9.5px] uppercase tracking-widest text-slate-500">
                {ops.agentsActive} de {ops.agentsTotal} agentes ativos
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="text-[9.5px] uppercase opacity-50 block tracking-widest font-bold">Unidades</span>
                <span className="text-lg font-bold text-white tabular-nums" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                  {String(ops.units).padStart(2, '0')}
                </span>
              </div>
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="text-[9.5px] uppercase opacity-50 block tracking-widest font-bold">Agentes</span>
                <span className="text-lg font-bold text-white tabular-nums" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                  {String(ops.agentsTotal).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="text-[9.5px] uppercase opacity-50 block tracking-widest font-bold">Rondas hoje</span>
                <span className="text-lg font-bold text-white tabular-nums" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>
                  {String(sortedRounds.length).padStart(2, '0')}
                </span>
              </div>
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="text-[9.5px] uppercase opacity-50 block tracking-widest font-bold">Estado</span>
                <span className={cn('text-sm font-bold uppercase tracking-widest', running ? 'text-emerald-300' : 'text-amber-300')}>
                  {running ? 'Ativo' : 'Pausado'}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-black/20 p-4 border border-dashed border-white/10 rounded flex flex-col justify-center items-center gap-2 text-center">
              <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Cobertura operacional</div>
              <div className="text-4xl font-light text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {ops.agentsActive}
                <span className="text-sm text-[#c9a84c] ml-1">/{ops.agentsTotal}</span>
              </div>
              <div className="text-[9.5px] uppercase tracking-widest text-emerald-400/80 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {ops.units} unidades sincronizadas
              </div>
            </div>
          </div>

        </section>

        {/* GESTOR DE RONDAS — col-span-12 row-span-3, timeline horizontal */}
        <section className="col-span-12 row-span-3 bg-[#1a1a1a] border border-white/5 flex flex-col overflow-hidden rounded-sm min-h-0">
          <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h3 className="text-base md:text-lg font-bold tracking-tight uppercase text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Gestor de Rondas
              </h3>
              <div className="px-2 py-0.5 bg-[#c9a84c] text-[#0d0d0d] text-[10px] font-bold rounded tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-black/70 animate-pulse" />
                LIVE
              </div>
              <div className="hidden md:inline-flex bg-black/40 border border-white/10 rounded p-0.5">
                {[15, 30, 60].map((m) => {
                  const active = interval === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setIntervalMin(m as 15 | 30 | 60)}
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest transition-all',
                        active ? 'bg-[#c9a84c] text-black' : 'text-slate-400 hover:text-white',
                      )}
                      aria-pressed={active}
                    >
                      {m}m
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRunning((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1 border font-bold transition-colors rounded',
                  running
                    ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                    : 'border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20',
                )}
              >
                {running ? <Pause className="w-3 h-3" strokeWidth={2.6} /> : <Play className="w-3 h-3" strokeWidth={2.6} />}
                {running ? 'Em curso' : 'Pausado'}
              </button>
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest px-3 py-1 bg-[#c9a84c] text-[#0d0d0d] font-bold hover:bg-[#f0d78c] transition-colors rounded"
              >
                <Plus className="w-3 h-3" strokeWidth={2.8} />
                Nova ronda
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Lateral Time Bar */}
            <div className="w-14 md:w-16 bg-black/40 flex flex-col items-center py-2 border-r border-white/5 shrink-0">
              <div className="text-[9px] font-bold opacity-30 py-2 tracking-widest" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>HORA</div>
              <div className="flex-1 flex flex-col justify-between py-2 text-white/50">
                {['00h', '06h', '12h', '18h'].map((h) => (
                  <span key={h} className="text-[10px] font-bold tabular-nums" style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}>{h}</span>
                ))}
              </div>
              <div className="text-[8.5px] opacity-40 py-1 tracking-widest">AMT</div>
            </div>

            {/* Slot columns horizontais */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="h-full grid grid-flow-col auto-cols-[minmax(150px,1fr)]">
                {sortedRounds.map((r) => {
                  const isActive = r.id === activeRoundId;
                  const isPast = !isActive && r.endMin > r.startMin ? nowMin >= r.endMin : false;
                  const label = isActive ? 'EXECUTANDO' : isPast ? 'CONCLUÍDA' : 'PROGRAMADA';
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'border-r border-white/5 flex flex-col min-w-0',
                        isActive && 'bg-[#c9a84c]/5 ring-1 ring-inset ring-[#c9a84c]/25',
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 text-center text-[10px] border-b font-bold tracking-widest tabular-nums',
                          isActive
                            ? 'bg-[#c9a84c]/20 border-[#c9a84c]/30 text-[#c9a84c]'
                            : isPast
                            ? 'bg-emerald-500/5 border-white/5 text-emerald-300/80'
                            : 'bg-white/[0.03] border-white/5 text-white/60',
                        )}
                        style={{ fontFamily: 'JetBrains Mono, ui-monospace, monospace' }}
                      >
                        {minutesToHHMM(r.startMin)} → {minutesToHHMM(r.endMin)}
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-2 min-h-0">
                        <div
                          className={cn(
                            'flex-1 min-h-0 p-2.5 text-[10px] flex flex-col justify-between rounded-sm border transition-colors',
                            isActive
                              ? 'bg-[#c9a84c] text-black border-[#c9a84c] shadow-[0_0_20px_rgba(201,168,76,0.35)]'
                              : isPast
                              ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500 border-emerald-500/20 text-emerald-100'
                              : 'bg-black/40 border-white/10 text-white/80 hover:border-[#c9a84c]/40',
                          )}
                        >
                          <div>
                            <div
                              className={cn('text-[13px] font-bold leading-tight truncate', isActive ? 'text-black' : 'text-white')}
                              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                              title={r.agent || 'Disponível'}
                            >
                              {r.agent || 'Disponível'}
                            </div>
                            {r.note && (
                              <div className={cn('text-[9.5px] mt-0.5 truncate', isActive ? 'text-black/70' : 'text-slate-400')} title={r.note}>
                                {r.note}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className={cn(
                                'text-[8.5px] font-bold uppercase tracking-widest',
                                isActive ? 'text-black/80 animate-pulse' : isPast ? 'text-emerald-300' : 'text-slate-500',
                              )}
                            >
                              {label}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openEdit(r); }}
                                className={cn(
                                  'p-1 rounded-sm border transition-colors',
                                  isActive
                                    ? 'border-black/30 text-black hover:bg-black/10'
                                    : 'border-white/10 text-slate-400 hover:text-[#c9a84c] hover:border-[#c9a84c]/40',
                                )}
                                aria-label={`Editar ronda ${minutesToHHMM(r.startMin)}`}
                              >
                                <Pencil className="w-2.5 h-2.5" strokeWidth={2.6} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setCancelId(r.id); }}
                                className={cn(
                                  'p-1 rounded-sm border transition-colors',
                                  isActive
                                    ? 'border-black/30 text-black hover:bg-red-500/20'
                                    : 'border-white/10 text-slate-400 hover:text-red-300 hover:border-red-500/40',
                                )}
                                aria-label={`Cancelar ronda ${minutesToHHMM(r.startMin)}`}
                              >
                                <Trash2 className="w-2.5 h-2.5" strokeWidth={2.6} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Slot livre — add */}
                <div className="border-r border-white/5 flex flex-col min-w-0">
                  <div className="p-2 text-center text-[10px] bg-white/[0.03] border-b border-white/5 font-bold text-white/40 tracking-widest">
                    LIVRE
                  </div>
                  <div className="flex-1 p-2">
                    <button
                      type="button"
                      onClick={openNew}
                      className="w-full h-full min-h-[80px] border border-dashed border-white/15 hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 rounded-sm flex flex-col items-center justify-center gap-1 text-white/40 hover:text-[#c9a84c] transition-colors"
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.4} />
                      <span className="text-[9.5px] font-bold uppercase tracking-widest">Adicionar slot</span>
                    </button>
                  </div>
                </div>

                {sortedRounds.length === 0 && (
                  <div className="border-r border-white/5 flex flex-col items-center justify-center gap-2 p-4 text-center col-span-2">
                    <p className="text-[11px] text-slate-500">Nenhuma ronda programada.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER — status bar */}
      <footer className="shrink-0 h-6 flex items-center justify-between px-2 text-[9px] uppercase tracking-[0.28em] font-bold opacity-50">
        <div className="flex gap-4 md:gap-6 min-w-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#c9a84c]" />
            PlantãoPro Tactical Suite
          </span>
          <span className="hidden sm:inline text-slate-500">CRPT AES-256</span>
          <span className="hidden md:inline text-slate-500">Node: RBO-01</span>
        </div>
        <div className="flex gap-4 md:gap-6">
          <span className="hidden sm:inline">SLA 99.98%</span>
          <span className="hidden md:inline">UTC −05:00 Acre</span>
          <span className="text-[#c9a84c]/80">© 2026</span>
        </div>
      </footer>

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
