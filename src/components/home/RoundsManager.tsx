import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock, Users, Plus, Trash2, Copy, Printer, Timer, Shield,
  Play, Pause, RotateCcw, Bell, Radio, ChevronRight, AlertTriangle,
  Save, Star, History,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/* ================= helpers ================= */
const pad = (n: number) => n.toString().padStart(2, '0');

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}
function fromMinutes(total: number): string {
  const t = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}
function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h && m) return `${h}h${pad(m)}`;
  if (h) return `${h}h`;
  return `${m}min`;
}
function fmtHMS(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
}

const TEAM_PRESETS = [
  { key: 'ALFA',    label: 'ALFA',    color: '#f59e0b' },
  { key: 'BRAVO',   label: 'BRAVO',   color: '#3b82f6' },
  { key: 'CHARLIE', label: 'CHARLIE', color: '#22c55e' },
  { key: 'DELTA',   label: 'DELTA',   color: '#ef4444' },
] as const;

type TeamKey = typeof TEAM_PRESETS[number]['key'];
type Mode = 'split' | 'interval';
type Rounding = 'exact' | 'floor' | 'ceil' | 'distribute';

/* ================= templates (localStorage) ================= */
type Template = {
  id: string;
  name: string;
  team: TeamKey;
  mode: Mode;
  startTime: string;
  endTime: string;
  intervalMin: number;
  rounding: Rounding;
  agents: string[];
  updatedAt: number;
};
const TPL_KEY = 'plantaopro_rounds_templates_v1';
const readTemplates = (): Template[] => {
  try {
    const raw = localStorage.getItem(TPL_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};
const writeTemplates = (arr: Template[]) => {
  try { localStorage.setItem(TPL_KEY, JSON.stringify(arr)); } catch { /* ignore */ }
};

/* ================= history (localStorage) ================= */
type HistoryEntry = {
  id: string;
  team: TeamKey;
  mode: Mode;
  startTime: string;
  endTime: string;
  intervalMin: number;
  agents: string[];
  startedAt: number;
  endedAt: number | null;
};
const HIST_KEY = 'plantaopro_rounds_history_v1';
const readHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HIST_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};
const writeHistory = (arr: HistoryEntry[]) => {
  try { localStorage.setItem(HIST_KEY, JSON.stringify(arr.slice(0, 20))); } catch { /* ignore */ }
};

/* ================= alert sound settings ================= */
type SoundSettings = { muted: boolean; volume: number; tone: 'chime' | 'pulse' | 'siren' };
const SND_KEY = 'plantaopro_rounds_sound_v1';
const DEFAULT_SOUND: SoundSettings = { muted: false, volume: 60, tone: 'chime' };
const readSound = (): SoundSettings => {
  try {
    const raw = localStorage.getItem(SND_KEY);
    return raw ? { ...DEFAULT_SOUND, ...JSON.parse(raw) } : DEFAULT_SOUND;
  } catch { return DEFAULT_SOUND; }
};
const writeSound = (s: SoundSettings) => {
  try { localStorage.setItem(SND_KEY, JSON.stringify(s)); } catch { /* ignore */ }
};
function playAlert(settings: SoundSettings) {
  if (settings.muted || settings.volume <= 0) return;
  try {
    const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const gain = ctx.createGain();
    const vol = Math.min(1, Math.max(0, settings.volume / 100)) * 0.35;
    gain.gain.value = vol;
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    const beep = (freq: number, start: number, dur: number, type: OscillatorType = 'sine') => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(vol, now + start + 0.02);
      g.gain.linearRampToValueAtTime(0, now + start + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(now + start); o.stop(now + start + dur + 0.02);
    };

    if (settings.tone === 'chime') {
      beep(880, 0, 0.18, 'sine');
      beep(1320, 0.16, 0.28, 'sine');
    } else if (settings.tone === 'pulse') {
      beep(1000, 0, 0.1, 'square');
      beep(1000, 0.16, 0.1, 'square');
      beep(1000, 0.32, 0.14, 'square');
    } else {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(600, now);
      o.frequency.linearRampToValueAtTime(1200, now + 0.3);
      o.frequency.linearRampToValueAtTime(600, now + 0.6);
      g.gain.setValueAtTime(vol, now);
      g.gain.linearRampToValueAtTime(0, now + 0.65);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.7);
    }
    setTimeout(() => ctx.close(), 1200);
  } catch { /* ignore */ }
}

/* ================= color helpers ================= */
function hexToHslTriple(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hh = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hh = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hh = (b - r) / d + 2;
    else hh = (r - g) / d + 4;
    hh /= 6;
  }
  return `${Math.round(hh * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/* ================= Team hero (realistic SVG emblem) ================= */
function TeamHero({ team, color }: { team: TeamKey; color: string }) {
  const gId = `th-${team}-grad`;
  const hId = `th-${team}-hi`;
  const mId = `th-${team}-metal`;
  const shadow = `drop-shadow(0 6px 14px ${color}66) drop-shadow(0 2px 4px #00000080)`;
  const defs = (
    <defs>
      <radialGradient id={gId} cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor={color} stopOpacity="0.95" />
        <stop offset="55%" stopColor={color} stopOpacity="0.5" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <radialGradient id={hId} cx="35%" cy="25%" r="35%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={mId} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
  );
  const svgProps = {
    viewBox: '0 0 64 64',
    className: 'h-11 w-11 shrink-0',
    style: { filter: shadow },
    'aria-hidden': true as const,
  };

  if (team === 'ALFA') {
    return (
      <svg {...svgProps}>
        {defs}
        <path d="M32 5 L54 13 V32 C54 46 44 55 32 60 C20 55 10 46 10 32 V13 Z"
              fill={`url(#${gId})`} stroke={color} strokeOpacity="0.75" strokeWidth="1.2" />
        <path d="M32 5 L54 13 V22 C54 24 44 27 32 27 C20 27 10 24 10 22 V13 Z" fill={`url(#${hId})`} />
        <path d="M32 18 V44 M22 30 H42" stroke="#0b0f17" strokeWidth="3.6" strokeLinecap="round" opacity="0.35" />
        <path d="M32 18 V44 M22 30 H42" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (team === 'BRAVO') {
    return (
      <svg {...svgProps}>
        {defs}
        <path d="M32 4 L37 12 V40 L32 46 L27 40 V12 Z" fill={`url(#${gId})`} stroke={color} strokeOpacity="0.8" />
        <path d="M32 4 L34 12 V40" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="0.8" />
        <rect x="16" y="42" width="32" height="4" rx="1.6" fill={`url(#${mId})`} stroke={color} strokeOpacity="0.6" />
        <rect x="28" y="46" width="8" height="12" rx="1" fill={`url(#${mId})`} stroke={color} strokeOpacity="0.6" />
        <circle cx="32" cy="58" r="2.6" fill={color} stroke="#0b0f17" strokeWidth="0.6" />
      </svg>
    );
  }
  if (team === 'CHARLIE') {
    return (
      <svg {...svgProps}>
        {defs}
        <circle cx="32" cy="32" r="26" fill={`url(#${gId})`} stroke={color} strokeOpacity="0.7" />
        <circle cx="32" cy="32" r="18" fill="none" stroke={color} strokeOpacity="0.55" />
        <circle cx="32" cy="32" r="10" fill="none" stroke={color} strokeOpacity="0.5" />
        <line x1="32" y1="4"  x2="32" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="32" y1="44" x2="32" y2="60" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="4"  y1="32" x2="20" y2="32" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="44" y1="32" x2="60" y2="32" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="32" cy="32" r="2.2" fill={color} />
        <ellipse cx="26" cy="24" rx="9" ry="5" fill={`url(#${hId})`} />
      </svg>
    );
  }
  // DELTA — lightning
  return (
    <svg {...svgProps}>
      {defs}
      <circle cx="32" cy="32" r="26" fill={`url(#${gId})`} stroke={color} strokeOpacity="0.6" />
      <path d="M36 8 L18 34 H30 L26 56 L46 28 H34 Z"
            fill={color} stroke="#0b0f17" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M36 8 L20 33 H30" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="0.8" />
      <ellipse cx="26" cy="22" rx="9" ry="5" fill={`url(#${hId})`} />
    </svg>
  );
}

/* ================= SVG time field ================= */

function TimeField({
  id, value, onChange, label, invalid, accent,
}: { id: string; value: string; onChange: (v: string) => void; label: string; invalid?: boolean; accent: string }) {
  const [h, m] = value.split(':');
  const setH = (nh: string) => {
    const v = Math.max(0, Math.min(23, parseInt(nh || '0', 10) || 0));
    onChange(`${pad(v)}:${m ?? '00'}`);
  };
  const setM = (nm: string) => {
    const v = Math.max(0, Math.min(59, parseInt(nm || '0', 10) || 0));
    onChange(`${h ?? '00'}:${pad(v)}`);
  };
  const bump = (which: 'h' | 'm', delta: number) => {
    if (which === 'h') setH(String(((parseInt(h, 10) || 0) + delta + 24) % 24));
    else setM(String(((parseInt(m, 10) || 0) + delta + 60) % 60));
  };
  return (
    <div className="grid gap-1.5">
      <label htmlFor={`${id}-h`} className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <div className={cn(
        'group relative flex items-center gap-2 rounded-md border bg-slate-950/60 pl-2 pr-1 h-11 transition-colors',
        invalid ? 'border-destructive/70' : 'border-slate-700/70 focus-within:border-primary/70',
      )}>
        <svg viewBox="0 0 32 32" className="h-6 w-6 shrink-0" aria-hidden>
          <circle cx="16" cy="16" r="13" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="1.2" />
          <circle cx="16" cy="16" r="13" fill="none" stroke={accent} strokeOpacity="0.9" strokeWidth="1.4"
                  strokeDasharray="4 3" strokeLinecap="round" />
          <line x1="16" y1="16" x2="16" y2="7"   stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="16" y1="16" x2="22" y2="16"  stroke={accent} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <circle cx="16" cy="16" r="1.2" fill={accent} />
        </svg>
        <input id={`${id}-h`} inputMode="numeric" maxLength={2} value={h ?? ''}
          onChange={(e) => setH(e.target.value.replace(/\D/g, '').slice(0, 2))}
          onBlur={(e) => setH(e.target.value || '0')}
          className="w-7 bg-transparent text-center font-mono text-lg font-light tabular-nums text-slate-200 outline-none"
          aria-label={`${label} horas`} autoComplete="off" />
        <span className="font-mono text-lg text-muted-foreground/70 select-none -mt-0.5">:</span>
        <input inputMode="numeric" maxLength={2} value={m ?? ''}
          onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 2))}
          onBlur={(e) => setM(e.target.value || '0')}
          className="w-7 bg-transparent text-center font-mono text-lg font-light tabular-nums text-slate-200 outline-none"
          aria-label={`${label} minutos`} autoComplete="off" />
        <div className="ml-auto flex flex-col">
          <button type="button" onClick={() => bump('m', 1)} aria-label="Mais 1 min"
            className="h-[22px] w-6 flex items-center justify-center rounded-t hover:bg-slate-800/70 text-muted-foreground hover:text-slate-200">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2 8 L6 3 L10 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={() => bump('m', -1)} aria-label="Menos 1 min"
            className="h-[22px] w-6 flex items-center justify-center rounded-b hover:bg-slate-800/70 text-muted-foreground hover:text-slate-200">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2 4 L6 9 L10 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}


/* ================= validation ================= */
type Issue = { field: string; message: string };
function validate(input: {
  mode: Mode; startTime: string; endTime: string; intervalMin: number; agents: string[];
}): Issue[] {
  const issues: Issue[] = [];
  const s = toMinutes(input.startTime);
  if (s === null) issues.push({ field: 'start', message: 'Horário de início inválido.' });

  if (input.mode === 'split') {
    const e = toMinutes(input.endTime);
    if (e === null) issues.push({ field: 'end', message: 'Horário de término inválido.' });
    if (s !== null && e !== null) {
      if (s === e) issues.push({ field: 'end', message: 'Início e término não podem ser iguais.' });
      // Wrap-over-midnight is permitted (turno noturno). Only flag when both são iguais.
    }
  } else {
    if (!Number.isFinite(input.intervalMin) || input.intervalMin < 1) {
      issues.push({ field: 'interval', message: 'Intervalo deve ser de pelo menos 1 minuto.' });
    }
    if (input.intervalMin > 240) {
      issues.push({ field: 'interval', message: 'Intervalo máximo é 240 minutos.' });
    }
  }

  if (input.agents.length === 0) {
    issues.push({ field: 'agents', message: 'Adicione ao menos 1 agente.' });
  }
  const trimmed = input.agents.map((a) => a.trim());
  if (trimmed.some((a) => !a)) {
    issues.push({ field: 'agents', message: 'Existem agentes sem nome preenchido.' });
  }
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const a of trimmed) {
    const k = a.toLowerCase();
    if (!k) continue;
    if (seen.has(k)) dupes.add(a);
    seen.add(k);
  }
  if (dupes.size) {
    issues.push({ field: 'agents', message: `Nomes repetidos: ${Array.from(dupes).join(', ')}.` });
  }

  // Total-time vs minimum-per-agent
  const MIN_PER_AGENT = 1; // minutos
  if (input.mode === 'split' && s !== null) {
    const e = toMinutes(input.endTime);
    if (e !== null && s !== e && trimmed.length > 0) {
      let total = e - s;
      if (total <= 0) total += 24 * 60;
      const per = total / trimmed.length;
      if (per < MIN_PER_AGENT) {
        issues.push({
          field: 'end',
          message: `Tempo total (${total}min) insuficiente para ${trimmed.length} agentes — mínimo de ${MIN_PER_AGENT}min por agente.`,
        });
      }
    }
  }
  return issues;
}

/* ================= component ================= */
export function RoundsManager() {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<TeamKey>('ALFA');
  const [mode, setMode] = useState<Mode>('split');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('19:00');
  const [intervalMin, setIntervalMin] = useState(30);
  const [rounding, setRounding] = useState<Rounding>('distribute');
  const [agents, setAgents] = useState<string[]>(['Agente 1', 'Agente 2', 'Agente 3']);

  /* templates */
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tplName, setTplName] = useState('');
  useEffect(() => { setTemplates(readTemplates()); }, [open]);

  const saveTemplate = () => {
    const name = tplName.trim() || `EQUIPE ${team} · ${new Date().toLocaleDateString('pt-BR')}`;
    const tpl: Template = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: name.slice(0, 50),
      team, mode, startTime, endTime, intervalMin, rounding,
      agents: agents.map((a) => a.trim()).filter(Boolean),
      updatedAt: Date.now(),
    };
    const next = [tpl, ...templates].slice(0, 20);
    writeTemplates(next);
    setTemplates(next);
    setTplName('');
    toast({ title: 'Template salvo', description: name });
  };
  const loadTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setTeam(t.team);
    setMode(t.mode);
    setStartTime(t.startTime);
    setEndTime(t.endTime);
    setIntervalMin(t.intervalMin);
    setRounding(t.rounding);
    setAgents(t.agents.length ? t.agents : ['Agente 1']);
    toast({ title: 'Template carregado', description: t.name });
  };
  const deleteTemplate = (id: string) => {
    const next = templates.filter((x) => x.id !== id);
    writeTemplates(next);
    setTemplates(next);
  };

  /* history */
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const historyIdRef = useRef<string | null>(null);
  useEffect(() => { setHistory(readHistory()); }, [open]);
  const clearHistory = () => { writeHistory([]); setHistory([]); };


  const addAgent = () => setAgents((a) => [...a, `Agente ${a.length + 1}`]);
  const removeAgent = (i: number) => setAgents((a) => a.filter((_, idx) => idx !== i));
  const updateAgent = (i: number, v: string) => setAgents((a) => a.map((x, idx) => (idx === i ? v : x)));

  const teamColor = TEAM_PRESETS.find((t) => t.key === team)!.color;

  /* sound settings */
  const [sound, setSound] = useState<SoundSettings>(DEFAULT_SOUND);
  useEffect(() => { setSound(readSound()); }, [open]);
  const updateSound = (patch: Partial<SoundSettings>) => {
    setSound((prev) => { const next = { ...prev, ...patch }; writeSound(next); return next; });
  };
  const soundRef = useRef(sound);
  useEffect(() => { soundRef.current = sound; }, [sound]);


  /* ---------- validation ---------- */
  const issues = useMemo(
    () => validate({ mode, startTime, endTime, intervalMin, agents }),
    [mode, startTime, endTime, intervalMin, agents],
  );
  const hasError = (field: string) => issues.some((i) => i.field === field);

  /* ---------- schedule with rounding ---------- */
  const schedule = useMemo(() => {
    if (issues.length) return null;
    const n = agents.length;
    const s = toMinutes(startTime)!;

    let totalMin: number;
    let baseSlot: number;
    if (mode === 'split') {
      const e = toMinutes(endTime)!;
      let total = e - s;
      if (total <= 0) total += 24 * 60;
      totalMin = total;
      baseSlot = total / n;
    } else {
      baseSlot = Math.max(1, intervalMin);
      totalMin = baseSlot * n;
    }

    // build per-agent slot lengths (in minutes) based on rounding strategy
    const slotsMin: number[] = new Array(n).fill(0);
    if (rounding === 'exact' || mode === 'interval') {
      for (let i = 0; i < n; i++) slotsMin[i] = baseSlot;
    } else if (rounding === 'floor') {
      const f = Math.floor(baseSlot);
      for (let i = 0; i < n; i++) slotsMin[i] = f;
    } else if (rounding === 'ceil') {
      const c = Math.ceil(baseSlot);
      for (let i = 0; i < n; i++) slotsMin[i] = c;
    } else {
      // distribute: floor for all, then spread leftover minutes across first agents
      const base = Math.floor(baseSlot);
      let leftover = Math.round(totalMin - base * n);
      for (let i = 0; i < n; i++) slotsMin[i] = base + (leftover > 0 ? 1 : 0), leftover--;
    }

    // build rows
    let cursor = s;
    const rows = agents.map((name, i) => {
      const from = cursor;
      const to = cursor + slotsMin[i];
      cursor = to;
      return {
        name: name.trim() || `Agente ${i + 1}`,
        from: fromMinutes(from),
        to: fromMinutes(to),
        fromAbs: from,
        toAbs: to,
        duration: slotsMin[i],
      };
    });

    return {
      total: rows.reduce((a, r) => a + r.duration, 0),
      slot: baseSlot,
      rows,
      startMin: s,
      hasRemainder: rounding === 'distribute' && baseSlot % 1 !== 0,
    };
  }, [issues, mode, startTime, endTime, intervalMin, rounding, agents]);

  /* ---------- live timer ---------- */
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const firedRef = useRef<Set<number>>(new Set());
  const [alarm, setAlarm] = useState<{ open: boolean; index: number; name: string }>({
    open: false, index: -1, name: '',
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [running]);

  const live = useMemo(() => {
    if (!schedule || !running || startedAtRef.current == null) return null;
    const elapsedSec = (Date.now() - startedAtRef.current) / 1000;
    const boundaries = schedule.rows.map((r) => (r.toAbs - schedule.startMin) * 60);
    const totalSec = boundaries[boundaries.length - 1];
    if (elapsedSec >= totalSec) {
      return { done: true, index: schedule.rows.length - 1, remaining: 0, elapsed: elapsedSec };
    }
    let idx = 0;
    while (idx < boundaries.length && elapsedSec >= boundaries[idx]) idx++;
    const prevBoundary = idx === 0 ? 0 : boundaries[idx - 1];
    const remaining = boundaries[idx] - elapsedSec;
    return { done: false, index: idx, remaining, elapsed: elapsedSec, prevBoundary, slotSec: boundaries[idx] - prevBoundary };
  }, [schedule, running, tick]);

  useEffect(() => {
    if (!live || !schedule) return;
    const currentIdx = live.index;
    if (!firedRef.current.has(currentIdx)) {
      firedRef.current.add(currentIdx);
      if (currentIdx > 0 || live.elapsed > 1) {
        const row = schedule.rows[currentIdx];
        setAlarm({ open: true, index: currentIdx, name: row.name });
        // Sound (configurable)
        playAlert(soundRef.current);
        // Vibration (mobile)
        try {
          if (!soundRef.current.muted && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate?.([220, 90, 220, 90, 380]);
          }
        } catch { /* ignore */ }
        // Local notification
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            const n = new Notification('Hora de fazer a ronda', {
              body: `EQUIPE ${team} · Posto ${pad(currentIdx + 1)} — ${row.name}`,
              tag: 'plantaopro-rounds',
              silent: false,
            });
            setTimeout(() => n.close(), 8000);
          }
        } catch { /* ignore */ }
      }
    }
    if (live.done) {
      setRunning(false);
      // finalize history entry
      if (historyIdRef.current) {
        const finished = readHistory().map((h) =>
          h.id === historyIdRef.current ? { ...h, endedAt: Date.now() } : h,
        );
        writeHistory(finished);
        setHistory(finished);
        historyIdRef.current = null;
      }
    }
  }, [live, schedule, team]);

  const startTimer = () => {
    if (!schedule) {
      toast({ title: 'Corrija os erros antes de iniciar.', variant: 'destructive' });
      return;
    }
    startedAtRef.current = Date.now();
    firedRef.current = new Set();
    setRunning(true);
    // Request notification permission (best effort)
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => { /* ignore */ });
      }
    } catch { /* ignore */ }
    // Persist history entry
    const entry: HistoryEntry = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      team, mode, startTime, endTime, intervalMin,
      agents: schedule.rows.map((r) => r.name),
      startedAt: Date.now(),
      endedAt: null,
    };
    historyIdRef.current = entry.id;
    const next = [entry, ...readHistory()].slice(0, 20);
    writeHistory(next);
    setHistory(next);
  };
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => {
    setRunning(false);
    startedAtRef.current = null;
    firedRef.current = new Set();
    setTick(0);
  };

  /* ---------- share actions ---------- */
  const copyToClipboard = async () => {
    if (!schedule) return;
    const modeTxt = mode === 'split' ? `Divisão · ${startTime}→${endTime}` : `Intervalo · ${intervalMin}min a partir de ${startTime}`;
    const header = `📋 EQUIPE ${team} — Escala de Rondas\n⏱ ${modeTxt} · ${agents.length} agentes\n\n`;
    const body = schedule.rows
      .map((r, i) => `${pad(i + 1)}. ${r.name}  ${r.from} — ${r.to}  (${fmtDuration(r.duration)})`)
      .join('\n');
    await navigator.clipboard.writeText(header + body);
    toast({ title: 'Copiado', description: 'Escala copiada para a área de transferência.' });
  };

  const printSchedule = () => {
    if (!schedule) return;
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (!w) return;
    w.document.write(`
      <html><head><title>EQUIPE ${team} — Rondas</title>
      <style>
        body{font-family:'Segoe UI',system-ui,sans-serif;padding:32px;color:#0a0f1a;}
        h1{margin:0 0 4px;letter-spacing:.05em;text-transform:uppercase;font-size:22px;color:${teamColor}}
        .meta{color:#475569;font-size:12px;margin-bottom:24px;font-family:ui-monospace,monospace;text-transform:uppercase;letter-spacing:.15em}
        table{width:100%;border-collapse:collapse}
        th,td{padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:14px}
        th{background:#0a0f1a;color:${teamColor};text-transform:uppercase;font-size:11px;letter-spacing:.2em}
        tr:nth-child(even) td{background:#f8fafc}
        .win{font-family:ui-monospace,monospace;font-weight:700}
        .dur{color:${teamColor};font-family:ui-monospace,monospace}
      </style></head><body>
      <h1>Equipe ${team}</h1>
      <div class="meta">${mode === 'split' ? `Divisão · ${startTime} → ${endTime}` : `Intervalo · ${intervalMin}min desde ${startTime}`} · ${agents.length} agentes · ${fmtDuration(schedule.slot)}/agente · Arredondamento: ${rounding}</div>
      <table><thead><tr><th>#</th><th>Agente</th><th>Início</th><th>Término</th><th>Duração</th></tr></thead><tbody>
      ${schedule.rows.map((r, i) => `<tr><td>${pad(i + 1)}</td><td>${r.name}</td><td class="win">${r.from}</td><td class="win">${r.to}</td><td class="dur">${fmtDuration(r.duration)}</td></tr>`).join('')}
      </tbody></table>
      </body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  const currentIdx = live?.index ?? -1;

  /* Exit guard — evita fechamento acidental */
  const [confirmExit, setConfirmExit] = useState(false);
  const requestExit = () => setConfirmExit(true);
  const confirmAndClose = () => {
    setConfirmExit(false);
    setRunning(false);
    setOpen(false);
  };


  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (o) setOpen(true); else requestExit(); }}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Abrir Gestor de Rondas"
            className={cn(
              'group relative inline-flex items-center gap-3 h-11 pl-2.5 pr-4 rounded-full overflow-hidden',
              'border border-primary/50 bg-slate-950/80 backdrop-blur',
              'shadow-[0_0_28px_-8px_hsl(var(--primary)/0.7)]',
              'transition-all duration-300',
              'hover:border-primary hover:shadow-[0_0_40px_-6px_hsl(var(--primary)/0.9)] hover:-translate-y-0.5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            )}
          >
            {/* animated sheen */}
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,hsl(var(--primary)/0.18)_50%,transparent_70%)]" />
            {/* top hairline */}
            <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

            {/* radar */}
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border border-primary/60 shadow-inner">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.4" />
                <circle cx="12" cy="12" r="5" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.5" />
                <line x1="12" y1="12" x2="19" y2="7" stroke="hsl(var(--primary))" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.4" fill="hsl(var(--primary))" />
              </svg>
              <span aria-hidden className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_hsl(142_70%_45%/0.9)] animate-pulse" />
            </span>

            <span className="relative z-10 flex items-baseline gap-2 leading-none">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary">
                Ferramenta Tática
              </span>
              <span className="font-sans text-[13px] font-semibold tracking-[0.06em] text-slate-200">
                Gestor de Rondas
              </span>
            </span>

            {running && live && !live.done && schedule && (
              <span className="relative z-10 ml-1 hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-emerald-300">
                <Timer className="h-3 w-3" />
                {fmtHMS(live.remaining)}
              </span>
            )}

            <ChevronRight className="relative z-10 h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </button>
        </DialogTrigger>

        <DialogContent
          className="max-w-xl max-h-[88vh] overflow-y-auto bg-slate-950 border border-primary/25 text-slate-200 p-4 gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button.absolute]:hidden transition-colors duration-500"
          style={{ ['--primary' as string]: hexToHslTriple(teamColor) }}
          onEscapeKeyDown={(e) => { e.preventDefault(); requestExit(); }}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b border-primary/15 pb-2">
            <div className="flex items-center gap-3">
              {/* Hero realista — reativo à equipe */}
              <TeamHero team={team} color={teamColor} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-slate-500">
                  <Shield className="h-3 w-3" style={{ color: teamColor, opacity: 0.85 }} />
                  <span>Operação · Equipe</span>
                  <span className="font-semibold tracking-[0.2em]" style={{ color: teamColor }}>{team}</span>
                </div>
                <DialogTitle className="font-sans text-base font-normal tracking-tight leading-tight text-slate-100">
                  Gestor de <span className="font-medium" style={{ color: teamColor }}>Quartos de Hora</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] text-slate-500 font-mono tracking-[0.16em]">
                  escala · cronômetro · alarme · histórico
                </DialogDescription>
              </div>
              {/* Botão Sair (única saída) */}
              <button type="button" onClick={requestExit} aria-label="Sair da ferramenta"
                className="shrink-0 inline-flex items-center gap-1.5 h-8 rounded-md border border-slate-700/70 bg-slate-900/60 pl-2 pr-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-colors">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 8l-4 4 4 4M6 12h11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sair
              </button>
            </div>
          </DialogHeader>

          {/* Templates */}
          <div className="grid gap-2 rounded-lg border border-primary/20 bg-slate-900/40 p-3">
            <Label className="text-[10px] font-mono tracking-[0.18em] text-slate-500 flex items-center gap-1">
              <Star className="h-3 w-3" /> Templates salvos
            </Label>
            <div className="flex gap-2">
              <Select onValueChange={loadTemplate}>
                <SelectTrigger className="bg-slate-900/60 border-primary/20 h-8 text-xs flex-1">
                  <SelectValue placeholder={templates.length ? 'Carregar template…' : 'Nenhum template salvo'} />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary">{t.team}</span>
                        <span className="text-xs">{t.name}</span>
                        <span className="text-[10px] text-muted-foreground">· {t.agents.length}ag</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templates.length > 0 && (
                <Select onValueChange={deleteTemplate}>
                  <SelectTrigger className="bg-slate-900/60 border-destructive/30 h-8 w-24 text-[10px] text-destructive">
                    <SelectValue placeholder="Excluir" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex gap-2">
              <Input value={tplName} onChange={(e) => setTplName(e.target.value.slice(0, 50))}
                placeholder="Nome do template (ex.: Plantão diurno ALFA)"
                className="bg-slate-900/60 border-primary/20 h-8 text-xs" autoComplete="off" />
              <Button type="button" size="sm" onClick={saveTemplate} className="h-8 bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="h-3.5 w-3.5 mr-1" /> Salvar
              </Button>
            </div>
          </div>

          {/* Team pills */}
          <div className="grid gap-2 pt-1">
            <Label className="text-[10px] font-mono tracking-[0.18em] text-slate-500 flex items-center gap-1">
              <Radio className="h-3 w-3" /> Equipe
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {TEAM_PRESETS.map((t) => {
                const active = team === t.key;
                return (
                  <button key={t.key} type="button" onClick={() => setTeam(t.key)}
                    className={cn(
                      'relative rounded-lg border px-2 py-2 font-sans font-semibold uppercase tracking-[0.16em] text-[11px] transition-all',
                      active ? 'border-transparent text-slate-950 shadow-lg' : 'border-primary/20 bg-slate-900/60 text-slate-200 hover:border-primary/50',
                    )}
                    style={active ? { backgroundColor: t.color, boxShadow: `0 0 24px -6px ${t.color}` } : undefined}
                  >
                    {t.label}
                    <span aria-hidden
                      className={cn('absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full transition-opacity', active ? 'opacity-0' : 'opacity-70')}
                      style={{ backgroundColor: t.color }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-2">
            {(['split', 'interval'] as Mode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={cn(
                  'rounded-md border px-3 py-2 text-[11px] font-mono uppercase tracking-[0.18em] transition-all',
                  mode === m ? 'border-primary/60 bg-primary/15 text-primary' : 'border-primary/20 bg-slate-900/60 text-muted-foreground hover:text-slate-200',
                )}>
                {m === 'split' ? 'Dividir turno' : 'Intervalo fixo'}
              </button>
            ))}
          </div>

          {/* Config */}
          <div className="grid gap-3">
            {mode === 'split' ? (
              <div className="grid grid-cols-2 gap-3">
                <TimeField id="rm-start" label="Início do turno" value={startTime}
                  onChange={setStartTime} invalid={hasError('start')} accent={teamColor} />
                <TimeField id="rm-end" label="Término do turno" value={endTime}
                  onChange={setEndTime} invalid={hasError('end')} accent={teamColor} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <TimeField id="rm-start2" label="Início" value={startTime}
                  onChange={setStartTime} invalid={hasError('start')} accent={teamColor} />
                <div className="grid gap-1.5">
                  <label htmlFor="rm-int" className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3" /> Intervalo (min)
                  </label>
                  <Input id="rm-int" type="number" min={1} max={240} value={intervalMin}
                    onChange={(e) => setIntervalMin(Math.max(1, Math.min(240, +e.target.value || 1)))}
                    className={cn('bg-slate-950/60 border-slate-700/70 font-mono text-lg font-light tabular-nums h-11', hasError('interval') && 'border-destructive')}
                    autoComplete="off" onKeyDown={(e) => e.key === 'e' && e.preventDefault()} />
                </div>
              </div>
            )}

            {/* Rounding — only meaningful in split mode */}
            {mode === 'split' && (
              <div className="grid gap-1.5">
                <Label className="text-[10px] font-mono tracking-[0.18em] text-slate-500">
                  Arredondamento da divisão
                </Label>
                <Select value={rounding} onValueChange={(v: Rounding) => setRounding(v)}>
                  <SelectTrigger className="bg-slate-900/60 border-primary/20 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distribute">Minutos inteiros — distribuir resto (recomendado)</SelectItem>
                    <SelectItem value="floor">Minutos inteiros — truncar (sobra livre no fim)</SelectItem>
                    <SelectItem value="ceil">Minutos inteiros — arredondar para cima</SelectItem>
                    <SelectItem value="exact">Exato — segundos fracionários</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Agents */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-mono tracking-[0.18em] text-slate-500 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Agentes ({agents.length})
                </Label>
                <Button type="button" size="sm" variant="outline" onClick={addAgent} className="h-7 border-primary/40 text-primary hover:bg-primary/10">
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className={cn('grid gap-1.5 max-h-48 overflow-y-auto pr-1 rounded-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', hasError('agents') && 'ring-1 ring-destructive/40 p-1')}>
                {agents.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-7 text-center font-mono text-[10px] text-primary tabular-nums">{pad(i + 1)}</span>
                    <Input value={a} onChange={(e) => updateAgent(i, e.target.value.slice(0, 40))}
                      placeholder={`Agente ${i + 1}`}
                      className={cn('bg-slate-900/60 border-primary/15 h-8 text-sm', !a.trim() && 'border-destructive/60')}
                      autoComplete="off" />
                    <Button type="button" size="icon" variant="ghost" onClick={() => removeAgent(i)}
                      disabled={agents.length <= 1} className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Remover ${i + 1}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Validation panel */}
          {issues.length > 0 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-destructive mb-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Corrija os itens abaixo
              </div>
              <ul className="grid gap-1 text-xs text-destructive/90 list-disc pl-4">
                {issues.map((iss, k) => <li key={k}>{iss.message}</li>)}
              </ul>
            </div>
          )}

          {/* Sound settings */}
          <div className="rounded-lg border border-slate-700/70 bg-slate-900/40 p-3 grid gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M4 10v4h4l5 4V6L8 10H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  {!sound.muted && <path d="M16 8c1.6 1 1.6 7 0 8M19 5c3 2.5 3 12 0 14.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                  {sound.muted && <path d="M17 9l6 6M23 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                </svg>
                Alerta sonoro
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => playAlert({ ...sound, muted: false })}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-400 hover:text-primary border border-primary/30 rounded px-2 py-0.5">
                  Testar
                </button>
                <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground cursor-pointer select-none">
                  <input type="checkbox" checked={sound.muted}
                    onChange={(e) => updateSound({ muted: e.target.checked })}
                    className="accent-primary h-3 w-3" />
                  Mudo
                </label>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Vol</span>
              <input type="range" min={0} max={100} value={sound.volume}
                onChange={(e) => updateSound({ volume: +e.target.value })}
                disabled={sound.muted}
                className="w-full accent-primary disabled:opacity-40" />
              <span className="font-mono text-[11px] tabular-nums text-slate-200 w-8 text-right">{sound.volume}%</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['chime', 'pulse', 'siren'] as const).map((t) => (
                <button key={t} type="button" onClick={() => updateSound({ tone: t })}
                  className={cn(
                    'rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors',
                    sound.tone === t
                      ? 'border-primary/70 bg-primary/10 text-primary'
                      : 'border-slate-700/70 bg-slate-950/60 text-muted-foreground hover:text-slate-200',
                  )}>
                  {t === 'chime' ? 'Sino' : t === 'pulse' ? 'Pulso' : 'Sirene'}
                </button>
              ))}
            </div>
          </div>


          {/* Live cockpit */}
          {schedule && (
            <div className="mt-1 rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4"
                 style={{ boxShadow: `inset 0 0 30px -8px ${teamColor}66` }}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 pb-2 mb-3">
                <div className="font-sans font-semibold uppercase tracking-[0.14em] text-[13px]" style={{ color: teamColor }}>
                  EQUIPE {team}
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                  <span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary tabular-nums">
                    <Timer className="inline h-3 w-3 mr-1" />
                    {fmtDuration(schedule.total)} totais
                  </span>
                  <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 tabular-nums">
                    ~{fmtDuration(schedule.slot)} / agente
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-primary/25 bg-slate-950/80 p-3">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Regressivo</span>
                  <span className="font-mono text-2xl font-light tabular-nums tracking-tight" style={{ color: running ? teamColor : 'hsl(var(--muted-foreground))' }}>
                    {running && live ? fmtHMS(live.remaining) : fmtHMS(schedule.rows[0].duration * 60)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-400">
                    {running && live && !live.done ? 'Em ronda' : running && live?.done ? 'Concluído' : 'Aguardando início'}
                  </div>
                  <div className="font-sans font-bold text-base truncate">
                    {running && live ? schedule.rows[live.index].name : schedule.rows[0].name}
                  </div>
                  {running && live && !live.done && 'slotSec' in live && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full transition-all"
                           style={{ width: `${100 - (live.remaining / live.slotSec) * 100}%`, backgroundColor: teamColor }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {!running ? (
                    <Button type="button" size="sm" onClick={startTimer} className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950">
                      <Play className="h-3.5 w-3.5 mr-1" /> Iniciar
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={pauseTimer} className="h-8 bg-amber-500 hover:bg-amber-600 text-slate-950">
                      <Pause className="h-3.5 w-3.5 mr-1" /> Pausar
                    </Button>
                  )}
                  <Button type="button" size="icon" variant="outline" onClick={resetTimer}
                    className="h-8 w-8 border-primary/40 text-primary hover:bg-primary/10" aria-label="Reiniciar">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Rows */}
              <ul className="grid gap-1.5">
                {schedule.rows.map((r, i) => {
                  const isCurrent = running && i === currentIdx && live && !live.done;
                  return (
                    <li key={i}
                        className={cn('grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                          isCurrent ? 'bg-slate-900' : 'border-primary/10 bg-slate-950/60')}
                        style={isCurrent ? { borderColor: teamColor, boxShadow: `0 0 14px -4px ${teamColor}` } : undefined}>
                      <span className="font-mono text-[11px] tabular-nums" style={{ color: isCurrent ? teamColor : 'hsl(var(--primary))' }}>{pad(i + 1)}</span>
                      <span className="font-sans font-semibold text-sm truncate">{r.name}</span>
                      <span className="font-mono text-[11px] tabular-nums flex items-center gap-2">
                        <span className="text-slate-200">{r.from}</span>
                        <span style={{ color: teamColor }}>→</span>
                        <span className="text-slate-200">{r.to}</span>
                        <span className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                              style={{ backgroundColor: `${teamColor}22`, color: teamColor }}>
                          {fmtDuration(r.duration)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                <Button type="button" variant="outline" onClick={copyToClipboard} className="border-primary/40 text-primary hover:bg-primary/10">
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar
                </Button>
                <Button type="button" onClick={printSchedule} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir
                </Button>
              </div>
            </div>
          )}

          {/* Histórico de rondas */}
          <div className="mt-1 rounded-lg border border-primary/20 bg-slate-900/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[10px] font-mono tracking-[0.18em] text-slate-500 flex items-center gap-1">
                <History className="h-3 w-3" /> Histórico ({history.length})
              </Label>
              {history.length > 0 && (
                <button type="button" onClick={clearHistory}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive">
                  Limpar
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-[0.14em]">
                Nenhuma ronda registrada ainda.
              </div>
            ) : (
              <ul className="grid gap-1.5 max-h-40 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {history.map((h) => {
                  const color = TEAM_PRESETS.find((t) => t.key === h.team)?.color ?? '#f59e0b';
                  const dt = new Date(h.startedAt);
                  const dtStr = `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
                  const endStr = h.endedAt ? new Date(h.endedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';
                  return (
                    <li key={h.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded border border-primary/10 bg-slate-950/60 px-2 py-1.5">
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
                            style={{ color, backgroundColor: `${color}22` }}>{h.team}</span>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] tabular-nums text-slate-200">
                          {dtStr} <span className="text-muted-foreground">→</span> {endStr}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {h.agents.slice(0, 4).join(' · ')}{h.agents.length > 4 ? ` +${h.agents.length - 4}` : ''}
                        </div>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary/70">
                        {h.mode === 'split' ? `${h.startTime}–${h.endTime}` : `${h.intervalMin}min`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alarme de troca de ronda */}
      <Dialog open={alarm.open} onOpenChange={(o) => setAlarm((a) => ({ ...a, open: o }))}>
        <DialogContent
          className="max-w-md bg-slate-950 border-2 text-center [&>button.absolute]:hidden"
          style={{ borderColor: teamColor, boxShadow: `0 0 60px -10px ${teamColor}` }}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Hora da ronda</DialogTitle>
            <DialogDescription className="sr-only">Alarme de troca de agente</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <Bell className="h-14 w-14 animate-bounce" style={{ color: teamColor }} />
              <span className="absolute inset-0 rounded-full animate-ping" style={{ boxShadow: `0 0 30px ${teamColor}` }} />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em]" style={{ color: teamColor }}>
              EQUIPE {team} · Posto {pad(alarm.index + 1)}
            </div>
            <div className="font-sans text-2xl font-medium tracking-tight text-slate-200">
              Hora de fazer a ronda
            </div>
            <div className="font-sans text-lg font-bold" style={{ color: teamColor }}>
              {alarm.name}
            </div>
            <Button type="button" onClick={() => setAlarm((a) => ({ ...a, open: false }))}
              className="mt-2 text-slate-950 font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: teamColor }}>
              Ciente · Assumir posto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de saída — evita fechamento acidental */}
      <Dialog open={confirmExit} onOpenChange={setConfirmExit}>
        <DialogContent
          className="max-w-sm bg-slate-950 border border-slate-700/70 p-5 gap-4 [&>button.absolute]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden style={{ filter: `drop-shadow(0 4px 10px ${teamColor}55)` }}>
                <defs>
                  <radialGradient id="rmExitG" cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={teamColor} stopOpacity="0.9" />
                    <stop offset="60%" stopColor={teamColor} stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                </defs>
                <path d="M24 4 L42 11 V26 C42 36 34 43 24 46 C14 43 6 36 6 26 V11 Z"
                      fill="url(#rmExitG)" stroke={teamColor} strokeOpacity="0.8" strokeWidth="1.2" />
                <path d="M24 16 V28 M24 33 V34.2" stroke="#0b0f17" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
                <path d="M24 16 V28 M24 33 V34.2" stroke={teamColor} strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <div className="min-w-0">
                <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-500">Confirmação</div>
                <DialogTitle className="font-sans text-base font-normal tracking-tight text-slate-100 leading-tight">
                  Encerrar sessão de rondas?
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-400 mt-1 leading-snug">
                  {running
                    ? 'O cronômetro está ativo. A sessão será interrompida e ficará registrada no histórico.'
                    : 'Os dados desta escala permanecerão salvos no histórico local.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirmExit(false)}
              className="inline-flex items-center justify-center gap-1.5 h-10 rounded-md border border-primary/50 bg-primary/10 font-mono text-[11px] uppercase tracking-[0.16em] text-primary hover:bg-primary/20 transition-colors">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                <path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Continuar
            </button>
            <button type="button" onClick={confirmAndClose}
              className="inline-flex items-center justify-center gap-1.5 h-10 rounded-md border border-slate-700/70 bg-slate-900/60 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300 hover:text-slate-100 hover:border-slate-500 transition-colors">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 8l-4 4 4 4M6 12h11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sim, sair
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
