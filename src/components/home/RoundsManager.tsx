import { useEffect, useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Clock, Users, Plus, Trash2, Copy, FileDown, Timer, Shield,
  Play, Pause, RotateCcw, Bell, Radio, ChevronRight, AlertTriangle,
  Save, Star, History, CheckCircle2,
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
import { supabase } from '@/integrations/supabase/client';
import { ConfirmDialog } from './ConfirmDialog';
import { RoundsRadarSVG } from './RoundsRadarSVG';
import { MissionLockDialog } from './MissionLockDialog';
import { MotivationalTicker } from './MotivationalTicker';

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
  // Aceita minutos fracionários — mostra HH:mm:ss quando houver segundos, senão HH:mm.
  const totalSec = Math.round(total * 60);
  const daySec = 24 * 3600;
  const t = ((totalSec % daySec) + daySec) % daySec;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return s === 0 ? `${pad(h)}:${pad(m)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}
function fmtDuration(mins: number): string {
  // Aceita minutos fracionários (com segundos).
  const totalSec = Math.max(0, Math.round(mins * 60));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${pad(m)}min`);
  if (s) parts.push(`${pad(s)}s`);
  return parts.length ? parts.join('') : '0min';
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

/* ================= Emblem FX — reusable metallic / shadow / highlight generator =================
 * Use for any new team emblem to keep the same visual language:
 *   const fx = useEmblemFx('BEAR', color);
 *   <svg viewBox="0 0 64 64" style={{ filter: fx.drop }}>
 *     {fx.defs}
 *     <circle cx="32" cy="32" r="28" fill={fx.url('rim')} />
 *     ...
 *   </svg>
 */
type FxKey = 'dome' | 'gloss' | 'rim' | 'steel' | 'gold' | 'accent' | 'iris' | 'innerShadow';

function useEmblemFx(scope: string, color: string) {
  const id = (k: FxKey) => `fx-${scope}-${k}`;
  const url = (k: FxKey) => `url(#${id(k)})`;
  const drop = `drop-shadow(0 8px 16px ${color}80) drop-shadow(0 2px 4px #00000099)`;
  const defs = (
    <defs>
      {/* Bevelled color dome */}
      <radialGradient id={id('dome')} cx="32%" cy="26%" r="82%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="18%" stopColor={color} stopOpacity="0.95" />
        <stop offset="65%" stopColor={color} stopOpacity="0.55" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      {/* Glossy top highlight */}
      <radialGradient id={id('gloss')} cx="35%" cy="20%" r="38%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      {/* Metallic rim */}
      <linearGradient id={id('rim')} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.9" />
        <stop offset="50%" stopColor={color} stopOpacity="0.6" />
        <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
      </linearGradient>
      {/* Brushed steel */}
      <linearGradient id={id('steel')} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="45%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      {/* Golden accents */}
      <linearGradient id={id('gold')} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="55%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      {/* Accent radial (team-color aura) */}
      <radialGradient id={id('accent')} cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor={color} stopOpacity="0.95" />
        <stop offset="60%" stopColor={color} stopOpacity="0.55" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      {/* Iris (eye) */}
      <radialGradient id={id('iris')} cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="55%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#0b0f17" />
      </radialGradient>
      {/* Inner shadow filter */}
      <filter id={id('innerShadow')} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" />
        <feOffset dy="0.6" />
        <feComponentTransfer><feFuncA type="linear" slope="0.6" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );
  return { defs, url, drop, id };
}

/* ================= Team hero (realistic 3D SVG emblem) ================= */
function TeamHero({ team, color }: { team: TeamKey; color: string }) {
  const fx = useEmblemFx(team, color);
  const svgProps = {
    viewBox: '0 0 64 64',
    className: 'h-12 w-12 shrink-0',
    style: { filter: fx.drop },
    'aria-hidden': true as const,
  };

  if (team === 'ALFA') {
    // Shield with bevelled rim, glossy dome and golden cross
    return (
      <svg {...svgProps}>
        {fx.defs}
        <path d="M32 3 L55 12 V33 C55 47 44 56 32 61 C20 56 9 47 9 33 V12 Z" fill={fx.url('rim')} />
        <path d="M32 6 L52 14 V32 C52 44 43 53 32 57 C21 53 12 44 12 32 V14 Z" fill={fx.url('dome')} />
        <path d="M32 6 L52 14 V22 C52 25 43 28 32 28 C21 28 12 25 12 22 V14 Z" fill={fx.url('gloss')} />
        <path d="M32 18 V46 M20 30 H44" stroke="#000000" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
        <path d="M32 18 V46 M20 30 H44" stroke={fx.url('gold')} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M32 18 V46 M20 30 H44" stroke="#fef3c7" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="32" cy="30" r="1.4" fill="#fef3c7" />
      </svg>
    );
  }

  if (team === 'BRAVO') {
    // Distintivo tático realista — estrela de 7 pontas em ouro sobre disco metálico com faixa colorida
    return (
      <svg {...svgProps}>
        {fx.defs}
        {/* Disco base bevelado */}
        <circle cx="32" cy="32" r="28" fill={fx.url('rim')} />
        <circle cx="32" cy="32" r="25" fill={fx.url('steel')} stroke="#0f172a" strokeWidth="0.6" />

        {/* Anel interno (accent da equipe) */}
        <circle cx="32" cy="32" r="22" fill="none" stroke={fx.url('accent')} strokeWidth="1.2" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#0b0f17" strokeOpacity="0.6" strokeWidth="0.6" />

        {/* Estrela 7 pontas — sombra */}
        <path
          d="M32 6 L36 22 L52 22 L39 31 L44 47 L32 37 L20 47 L25 31 L12 22 L28 22 Z"
          fill="#000000" fillOpacity="0.6" transform="translate(0.8 1)"
        />
        {/* Estrela 7 pontas — ouro */}
        <path
          d="M32 6 L36 22 L52 22 L39 31 L44 47 L32 37 L20 47 L25 31 L12 22 L28 22 Z"
          fill={fx.url('gold')} stroke="#78350f" strokeWidth="0.7" strokeLinejoin="round"
        />
        {/* Highlight nas pontas superiores */}
        <path
          d="M32 6 L34 20 M32 6 L30 20"
          stroke="#fef3c7" strokeOpacity="0.75" strokeWidth="0.5" strokeLinecap="round"
        />

        {/* Medalhão central */}
        <circle cx="32" cy="30" r="7" fill={fx.url('dome')} stroke="#0b0f17" strokeWidth="0.8" />
        <circle cx="32" cy="30" r="7" fill="none" stroke={fx.url('gold')} strokeOpacity="0.9" strokeWidth="0.6" />

        {/* Sigla "B" (BRAVO) em ouro */}
        <text
          x="32" y="33.6" textAnchor="middle"
          fontFamily="ui-serif, Georgia, serif" fontSize="9" fontWeight="700"
          fill={fx.url('gold')} stroke="#78350f" strokeWidth="0.3"
        >
          B
        </text>

        {/* Faixa "POLICE-BAR" inferior */}
        <path d="M14 46 L50 46 L46 52 L18 52 Z" fill={fx.url('accent')} stroke="#0b0f17" strokeWidth="0.6" />
        <path d="M15 46.6 L49 46.6" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.4" />
        <text
          x="32" y="50.6" textAnchor="middle"
          fontFamily="ui-monospace, monospace" fontSize="3.6" fontWeight="700"
          letterSpacing="0.6" fill="#f8fafc"
        >
          BRAVO
        </text>

        {/* Rebites nas pontas cardinais */}
        <circle cx="32" cy="10" r="0.9" fill="#fef3c7" />
        <circle cx="32" cy="54" r="0.9" fill="#fef3c7" opacity="0.6" />
        <circle cx="10" cy="32" r="0.9" fill="#fef3c7" opacity="0.6" />
        <circle cx="54" cy="32" r="0.9" fill="#fef3c7" opacity="0.6" />

        {/* Highlight especular superior */}
        <ellipse cx="26" cy="14" rx="11" ry="4" fill={fx.url('gloss')} />
      </svg>
    );
  }







  if (team === 'CHARLIE') {
    // Target: bevelled ring, colored bullseye, crosshair with drop shadow
    return (
      <svg {...svgProps}>
        {fx.defs}
        <circle cx="32" cy="32" r="28" fill={fx.url('rim')} />
        <circle cx="32" cy="32" r="25" fill={fx.url('dome')} />
        <circle cx="32" cy="32" r="19" fill="none" stroke="#0b0f17" strokeOpacity="0.6" strokeWidth="1.4" />
        <circle cx="32" cy="32" r="19" fill="none" stroke={color} strokeOpacity="0.9" strokeWidth="0.7" />
        <circle cx="32" cy="32" r="12" fill="none" stroke="#0b0f17" strokeOpacity="0.55" strokeWidth="1.2" />
        <circle cx="32" cy="32" r="12" fill="none" stroke={color} strokeOpacity="0.85" strokeWidth="0.6" />
        <circle cx="32" cy="32" r="5" fill={color} stroke="#0b0f17" strokeWidth="0.8" />
        <line x1="32" y1="2"  x2="32" y2="18" stroke="#000000" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="32" y1="46" x2="32" y2="62" stroke="#000000" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="2"  y1="32" x2="18" y2="32" stroke="#000000" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="46" y1="32" x2="62" y2="32" stroke="#000000" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="32" y1="2"  x2="32" y2="18" stroke={fx.url('steel')} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="32" y1="46" x2="32" y2="62" stroke={fx.url('steel')} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="2"  y1="32" x2="18" y2="32" stroke={fx.url('steel')} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="46" y1="32" x2="62" y2="32" stroke={fx.url('steel')} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="32" cy="32" r="1.4" fill="#fef3c7" />
        <ellipse cx="26" cy="22" rx="10" ry="5" fill={fx.url('gloss')} />
      </svg>
    );
  }

  // DELTA — lightning inside a bevelled disc
  return (
    <svg {...svgProps}>
      {fx.defs}
      <circle cx="32" cy="32" r="28" fill={fx.url('rim')} />
      <circle cx="32" cy="32" r="25" fill={fx.url('dome')} />
      <path d="M37 8 L18 34 H30 L26 56 L47 28 H34 Z"
            fill="#000000" fillOpacity="0.55" transform="translate(0.6 0.8)" />
      <path d="M36 8 L18 34 H30 L26 56 L46 28 H34 Z"
            fill={fx.url('gold')} stroke="#78350f" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M36 8 L21 32 H29" fill="none" stroke="#fef3c7" strokeOpacity="0.85" strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="26" cy="22" rx="10" ry="5" fill={fx.url('gloss')} />
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
      <label htmlFor={`${id}-h`} className="text-[11px] font-sans uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className={cn(
        'group relative flex items-center gap-2 rounded-md border bg-background/60 pl-2 pr-1 h-11 transition-colors',
        invalid ? 'border-destructive/70' : 'border-border focus-within:border-primary/70',
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
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => setH(e.target.value || '0')}
          className="w-7 bg-transparent text-center font-mono text-lg font-light tabular-nums text-foreground outline-none"
          aria-label={`${label} horas`} autoComplete="off" />
        <div className="flex flex-col">
          <button type="button" onClick={() => bump('h', 1)} aria-label="Mais 1 hora"
            className="h-[22px] w-5 flex items-center justify-center rounded-t hover:bg-muted/60 text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2 8 L6 3 L10 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={() => bump('h', -1)} aria-label="Menos 1 hora"
            className="h-[22px] w-5 flex items-center justify-center rounded-b hover:bg-muted/60 text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2 4 L6 9 L10 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <span className="font-mono text-lg text-muted-foreground/70 select-none -mt-0.5">:</span>
        <input inputMode="numeric" maxLength={2} value={m ?? ''}
          onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 2))}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => setM(e.target.value || '0')}
          className="w-7 bg-transparent text-center font-mono text-lg font-light tabular-nums text-foreground outline-none"
          aria-label={`${label} minutos`} autoComplete="off" />
        <div className="ml-auto flex flex-col">
          <button type="button" onClick={() => bump('m', 1)} aria-label="Mais 1 min"
            className="h-[22px] w-5 flex items-center justify-center rounded-t hover:bg-muted/60 text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5"><path d="M2 8 L6 3 L10 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={() => bump('m', -1)} aria-label="Menos 1 min"
            className="h-[22px] w-5 flex items-center justify-center rounded-b hover:bg-muted/60 text-muted-foreground hover:text-foreground">
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
/* ================= Section colapsável (mobile/tablet) — sempre aberta em lg+ ================= */
function Section({
  icon, title, defaultOpen = false, children,
}: { icon?: React.ReactNode; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    const sync = () => { if (mql.matches) setOpen(true); };
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group min-w-0"
    >
      <summary className="lg:hidden flex items-center gap-2 cursor-pointer py-2 select-none list-none [&::-webkit-details-marker]:hidden border-b border-border/60">
        {icon}
        <span className="font-sans text-[12px] uppercase tracking-[0.14em] text-muted-foreground">{title}</span>
        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      <div className="hidden lg:flex items-center gap-2 pb-2 mb-3 border-b border-border/40">
        {icon}
        <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</span>
      </div>
      <div className="grid gap-3 pt-3 lg:pt-0">{children}</div>
    </details>
  );
}

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

  /* server clock offset (server_ms - local_ms) */
  const clockOffsetRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const syncServerClock = async () => {
    try {
      const t0 = Date.now();
      const { data, error } = await supabase.rpc('get_server_now');
      if (error || !data) return;
      const rtt = (Date.now() - t0) / 2;
      const serverMs = new Date(data as string).getTime() + rtt;
      clockOffsetRef.current = serverMs - Date.now();
    } catch { /* offline: keep local clock */ }
  };
  const nowServer = () => Date.now() + clockOffsetRef.current;


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

  /* ---------- schedule com RECALIBRAGEM AUTOMÁTICA (precisão em segundos) ---------- */
  const schedule = useMemo(() => {
    if (issues.length) return null;
    const n = agents.length;
    if (n === 0) return null;
    const s = toMinutes(startTime)!;
    const startSec = s * 60;

    // Total em segundos (split = janela do turno; interval = intervalo × N)
    let totalSec: number;
    if (mode === 'split') {
      const e = toMinutes(endTime)!;
      let totalMin = e - s;
      if (totalMin <= 0) totalMin += 24 * 60; // suporta virada de meia-noite
      totalSec = totalMin * 60;
    } else {
      totalSec = Math.max(1, Math.round(intervalMin * 60)) * n;
    }

    // Estratégia de fatiamento em SEGUNDOS
    const slotsSec: number[] = new Array(n).fill(0);
    if (mode === 'interval') {
      // Intervalo fixo — cada agente recebe exatamente o intervalo escolhido
      const per = Math.round(intervalMin * 60);
      for (let i = 0; i < n; i++) slotsSec[i] = per;
    } else if (rounding === 'exact') {
      // Distribui em segundos inteiros, encaixando o resto nos primeiros (fecha 100% no endTime)
      const base = Math.floor(totalSec / n);
      let leftover = totalSec - base * n;
      for (let i = 0; i < n; i++) {
        slotsSec[i] = base + (leftover > 0 ? 1 : 0);
        if (leftover > 0) leftover--;
      }
    } else if (rounding === 'floor') {
      const perMin = Math.floor(totalSec / 60 / n);
      for (let i = 0; i < n; i++) slotsSec[i] = perMin * 60;
    } else if (rounding === 'ceil') {
      const perMin = Math.ceil(totalSec / 60 / n);
      for (let i = 0; i < n; i++) slotsSec[i] = perMin * 60;
    } else {
      // distribute (default): minutos inteiros + resto distribuído — recalibra para fechar no endTime
      const totalMin = Math.round(totalSec / 60);
      const baseMin = Math.floor(totalMin / n);
      let leftoverMin = totalMin - baseMin * n;
      for (let i = 0; i < n; i++) {
        const extra = leftoverMin > 0 ? 1 : 0;
        slotsSec[i] = (baseMin + extra) * 60;
        if (leftoverMin > 0) leftoverMin--;
      }
      // Ajuste fino: qualquer sobra/déficit em segundos vai para o último agente,
      // garantindo que o horário final bata exatamente com o solicitado.
      const drift = totalSec - slotsSec.reduce((a, v) => a + v, 0);
      if (drift !== 0) slotsSec[n - 1] += drift;
    }

    // Monta linhas com precisão de segundos; fromAbs/toAbs em minutos (float) mantém compat com o live timer.
    let cursorSec = startSec;
    const rows = agents.map((name, i) => {
      const fromSec = cursorSec;
      const toSec = cursorSec + slotsSec[i];
      cursorSec = toSec;
      return {
        name: name.trim() || `Agente ${i + 1}`,
        from: fromMinutes(fromSec / 60),
        to: fromMinutes(toSec / 60),
        fromAbs: fromSec / 60,
        toAbs: toSec / 60,
        duration: slotsSec[i] / 60, // minutos (pode ser fracionário)
      };
    });

    const totalMinOut = slotsSec.reduce((a, v) => a + v, 0) / 60;
    const baseSlot = totalSec / 60 / n; // slot médio em minutos (referência)
    const hasSeconds = slotsSec.some((v) => v % 60 !== 0);

    return {
      total: totalMinOut,
      slot: baseSlot,
      rows,
      startMin: s,
      hasRemainder: hasSeconds,
    };
  }, [issues, mode, startTime, endTime, intervalMin, rounding, agents]);


  /* ---------- live timer ---------- */
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [lockOpen, setLockOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<{ totalSec: number; completed: number } | null>(null);
  const [silentMode, setSilentMode] = useState<boolean>(() => {
    try { return localStorage.getItem('plantaopro_rounds_silent') === '1'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('plantaopro_rounds_silent', silentMode ? '1' : '0'); } catch { /* ignore */ }
  }, [silentMode]);
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
    const elapsedSec = (nowServer() - startedAtRef.current) / 1000;
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

  // Trava persistida: quais postos já dispararam a notificação
  const notifiedRef = useRef<Set<number>>(new Set());

  const markNotified = async (finishedIdx: number) => {
    if (notifiedRef.current.has(finishedIdx)) return false;
    notifiedRef.current.add(finishedIdx);
    if (sessionIdRef.current) {
      try {
        const arr = Array.from(notifiedRef.current).sort((a, b) => a - b);
        await supabase.from('round_sessions')
          .update({ notified_indices: arr })
          .eq('id', sessionIdRef.current);
      } catch { /* ignore */ }
    }
    return true;
  };

  useEffect(() => {
    if (!live || !schedule) return;
    const currentIdx = live.index;
    if (!firedRef.current.has(currentIdx)) {
      firedRef.current.add(currentIdx);
      // Individual "MISSÃO CUMPRIDA" para o agente que acabou de terminar
      const finishedIdx = live.done ? currentIdx : currentIdx - 1;
      if (finishedIdx >= 0 && !notifiedRef.current.has(finishedIdx)) {
        void markNotified(finishedIdx).then((ok) => {
          if (!ok) return;
          const finishedRow = schedule.rows[finishedIdx];
          toast({
            title: `✅ MISSÃO CUMPRIDA — ${finishedRow.name}`,
            description: `Posto ${pad(finishedIdx + 1)} concluído · EQUIPE ${team}`,
          });
          playAlert(soundRef.current);
          try {
            if (!soundRef.current.muted && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.([220, 90, 220, 90, 380]);
            }
          } catch { /* ignore */ }
          try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              const n = new Notification('Missão cumprida', {
                body: `EQUIPE ${team} · ${finishedRow.name} concluiu o posto ${pad(finishedIdx + 1)}.`,
                tag: `plantaopro-rounds-done-${finishedIdx}`,
                silent: false,
              });
              setTimeout(() => n.close(), 8000);
            }
          } catch { /* ignore */ }
        });
      }
      if (!live.done && currentIdx > 0) {
        const row = schedule.rows[currentIdx];
        setAlarm({ open: true, index: currentIdx, name: row.name });
      }
    }
    if (live.done) {
      setRunning(false);
      if (historyIdRef.current) {
        const finished = readHistory().map((h) =>
          h.id === historyIdRef.current ? { ...h, endedAt: Date.now() } : h,
        );
        writeHistory(finished);
        setHistory(finished);
        historyIdRef.current = null;
      }
      if (sessionIdRef.current) {
        supabase.from('round_sessions').update({ is_active: false, ended_at: new Date().toISOString() })
          .eq('id', sessionIdRef.current).then(() => { sessionIdRef.current = null; });
      }
    }
  }, [live, schedule, team]);

  /* Restaurar sessão ativa ao montar / abrir + Realtime */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const hydrateFrom = (data: {
      id: string; team: string; mode: string; start_time: string; end_time: string;
      interval_min: number; rows: unknown; server_started_at: string;
      notified_indices?: number[] | null; is_active?: boolean;
    }) => {
      setTeam(data.team as TeamKey);
      setMode(data.mode as Mode);
      setStartTime(data.start_time);
      setEndTime(data.end_time);
      setIntervalMin(data.interval_min);
      const rows = (data.rows as Array<{ name: string }>) || [];
      if (rows.length) setAgents(rows.map((r) => r.name));
      sessionIdRef.current = data.id;
      startedAtRef.current = new Date(data.server_started_at).getTime();
      notifiedRef.current = new Set(data.notified_indices || []);
      // Marca como já "vistos" localmente para não re-disparar toasts históricos
      firedRef.current = new Set(data.notified_indices || []);
      setRunning(data.is_active !== false);
    };

    (async () => {
      await syncServerClock();
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid || cancelled) return;
      const { data } = await supabase
        .from('round_sessions')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .order('server_started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) hydrateFrom(data);

      // Realtime: sincroniza status entre navegadores do mesmo usuário
      channel = supabase
        .channel(`round_sessions_${uid}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'round_sessions', filter: `user_id=eq.${uid}` },
          (payload) => {
            const row = (payload.new || payload.old) as {
              id: string; is_active: boolean; notified_indices?: number[] | null;
            } | null;
            if (!row) return;
            // Nova sessão ou sessão ativa detectada em outra aba: hidrata do zero
            if ((payload.eventType === 'INSERT' || !sessionIdRef.current) && row.is_active) {
              hydrateFrom(payload.new as Parameters<typeof hydrateFrom>[0]);
              return;
            }
            if (row.id !== sessionIdRef.current) return;
            // Absorve trava de notificações de outros dispositivos (dedupe)
            const arr = row.notified_indices || [];
            notifiedRef.current = new Set([...notifiedRef.current, ...arr]);
            arr.forEach((i) => firedRef.current.add(i));
            if (row.is_active === false) {
              setRunning(false);
              sessionIdRef.current = null;
            }
          })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [open]);


  const startTimer = async () => {
    if (!schedule) {
      toast({ title: 'Corrija os erros antes de iniciar.', variant: 'destructive' });
      return;
    }
    await syncServerClock();
    const startMs = nowServer();
    startedAtRef.current = startMs;
    firedRef.current = new Set();
    notifiedRef.current = new Set();
    setRunning(true);
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => { /* ignore */ });
      }
    } catch { /* ignore */ }
    // Persist history (localStorage)
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
    // Persist active session (Supabase) — encerra qualquer anterior do mesmo usuário
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (uid) {
        await supabase.from('round_sessions')
          .update({ is_active: false, ended_at: new Date().toISOString() })
          .eq('user_id', uid).eq('is_active', true);
        const { data } = await supabase.from('round_sessions').insert({
          user_id: uid,
          team, mode, start_time: startTime, end_time: endTime,
          interval_min: intervalMin,
          rows: schedule.rows.map((r) => ({ name: r.name, duration: r.duration })),
          server_started_at: new Date(startMs).toISOString(),
          is_active: true,
        }).select('id').maybeSingle();
        if (data?.id) sessionIdRef.current = data.id;
      }
    } catch { /* ignore — offline: sessão só local */ }
  };
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => {
    setRunning(false);
    startedAtRef.current = null;
    firedRef.current = new Set();
    notifiedRef.current = new Set();
    setTick(0);
    if (sessionIdRef.current) {
      supabase.from('round_sessions').update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionIdRef.current).then(() => { sessionIdRef.current = null; });
    }
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

  const exportPDF = () => {
    if (!schedule) return;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const modeTxt = mode === 'split'
      ? `Divisão · ${startTime} → ${endTime}`
      : `Intervalo · ${intervalMin}min desde ${startTime}`;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`EQUIPE ${team} — ESCALA DE RONDAS`, pageW / 2, 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text(`${modeTxt} · ${agents.length} agentes · ${fmtDuration(schedule.slot)}/agente · ${rounding}`, pageW / 2, 25, { align: 'center' });
    doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, pageW / 2, 30, { align: 'center' });
    doc.setTextColor(0);

    const statusFor = (i: number): 'Concluído' | 'Em ronda' | 'Aguardando' => {
      if (!running || !live) return 'Aguardando';
      if (live.done ? i <= live.index : i < live.index) return 'Concluído';
      if (!live.done && i === live.index) return 'Em ronda';
      return 'Aguardando';
    };
    autoTable(doc, {
      startY: 38,
      head: [['#', 'Agente', 'Início', 'Término', 'Duração', 'Status']],
      body: schedule.rows.map((r, i) => [pad(i + 1), r.name, r.from, r.to, fmtDuration(r.duration), statusFor(i)]),
      theme: 'grid',
      headStyles: { fillColor: [10, 15, 26], textColor: 245, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 3 },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        const st = statusFor(data.row.index);
        if (st === 'Concluído') {
          // "Risco" no nome e badge verde "MISSÃO CUMPRIDA"
          if (data.column.index === 1) {
            data.cell.styles.textColor = [120, 120, 120];
            (data.cell.styles as { fontStyle?: string }).fontStyle = 'italic';
          }
          if (data.column.index === 5) {
            data.cell.text = ['✓ MISSÃO CUMPRIDA'];
            data.cell.styles.fillColor = [16, 185, 129];
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = 'bold';
          }
        } else if (st === 'Em ronda' && data.column.index === 5) {
          data.cell.styles.fillColor = [245, 158, 11];
          data.cell.styles.textColor = 20;
          data.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawCell: (data) => {
        // Desenha o "risco" (strike-through) sobre nome de agentes concluídos
        if (data.section === 'body' && data.column.index === 1 && statusFor(data.row.index) === 'Concluído') {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(200, 60, 60);
          doc.setLineWidth(0.6);
          doc.line(x + 1.5, y + height / 2, x + width - 1.5, y + height / 2);
        }
      },
    });

    doc.save(`rondas_equipe_${team}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'PDF exportado', description: 'A escala foi salva como PDF.' });
  };

  const currentIdx = live?.index ?? -1;

  /* Exit guard — evita fechamento acidental */
  const [confirmExit, setConfirmExit] = useState(false);
  const requestExit = () => setConfirmExit(true);
  const confirmAndClose = () => {
    setConfirmExit(false);
    setRunning(false);
    setOpen(false);
    setDrag({ x: 0, y: 0 });
  };

  /* ================= Drag da janela (antes de iniciar o cronômetro) ================= */
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const canDrag = !running;

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag) return;
    // Só arrasta se clicar diretamente no header (não em botões/inputs)
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, [role="button"]')) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: drag.x, baseY: drag.y };
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { startX, startY, baseX, baseY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    // Limita para não sair completamente da tela (mantém 80px visíveis nas bordas)
    const maxX = Math.max(0, window.innerWidth / 2 - 80);
    const maxY = Math.max(0, window.innerHeight / 2 - 60);
    const nx = Math.max(-maxX, Math.min(maxX, baseX + dx));
    const ny = Math.max(-maxY, Math.min(maxY, baseY + dy));
    setDrag({ x: nx, y: ny });
  };
  const onDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current) {
      dragRef.current = null;
      try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch { /* noop */ }
    }
  };
  const resetPosition = () => setDrag({ x: 0, y: 0 });

  /* Auto-fit removido — usamos layout responsivo + scroll interno para evitar cortes/sobreposições */
  const fitRef = useRef<HTMLDivElement>(null);







  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (o) setOpen(true); else requestExit(); }}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Abrir Gestor de Rondas"
            className={cn(
              'group relative inline-flex items-center gap-4 p-1.5 pr-6 rounded-2xl',
              'bg-card/40 backdrop-blur-xl border border-border/80',
              'transition-all duration-300',
              'hover:bg-card/60 hover:border-primary/40 active:scale-[0.98]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {/* Icon module — inset panel with radar crosshair */}
            <span className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-inner">
              {/* subtle radar tint */}
              <span aria-hidden className="absolute inset-0 bg-primary/5 animate-pulse" />
              {/* crosshair */}
              <span aria-hidden className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-primary/20" />
              <span aria-hidden className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-primary/20" />
              <svg viewBox="0 0 24 24" className="relative z-10 h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 17h.01" />
                <path d="M19 10.5c0-3.87-3.13-7-7-7s-7 3.13-7 7" />
                <path d="M16.5 14.5c0-2.48-2.02-4.5-4.5-4.5s-4.5 2.02-4.5 4.5" />
                <circle cx="12" cy="12" r="10" strokeOpacity="0.1" />
              </svg>
            </span>

            {/* Content */}
            <span className="flex flex-col items-start leading-none">
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                <span aria-hidden className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                Ferramenta Tática
              </span>
              <span className="mt-1 text-lg font-bold tracking-tight text-foreground">
                Gestor de Rondas
              </span>
            </span>

            {running && live && !live.done && schedule && (
              <span className="ml-1 hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-emerald-300">
                <Timer className="h-3 w-3" />
                {fmtHMS(live.remaining)}
              </span>
            )}

            <ChevronRight className="ml-2 h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={2.5} />

            {/* glass reflection */}
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </DialogTrigger>

        <DialogContent
          className="w-[min(100vw-0.5rem,72rem)] max-w-none max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-hidden bg-background border border-border text-foreground p-0 gap-0 [&>button.absolute]:hidden transition-colors duration-500 flex flex-col"
          style={{
            ['--primary' as string]: hexToHslTriple(teamColor),
            transform: `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px))`,
          }}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Sticky header — sempre visível */}
          <DialogHeader
            className={cn(
              'sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-3 sm:px-4 py-2 select-none touch-none',
              canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
            )}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            title={canDrag ? 'Arraste para reposicionar a janela' : 'Janela travada durante a operação'}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="hidden sm:flex flex-col gap-0.5 pr-1 opacity-60 shrink-0" aria-hidden>
                <span className="flex gap-0.5"><span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" /><span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" /></span>
                <span className="flex gap-0.5"><span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" /><span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" /></span>
                <span className="flex gap-0.5"><span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" /><span className="h-0.5 w-0.5 rounded-full bg-muted-foreground" /></span>
              </div>
              <div className="shrink-0"><TeamHero team={team} color={teamColor} /></div>

              <div className="min-w-0 flex-1 basis-40">
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans text-[11px] uppercase tracking-wider text-muted-foreground">
                  <Shield className="h-3 w-3 shrink-0" style={{ color: teamColor, opacity: 0.85 }} />
                  <span>Operação · Equipe</span>
                  <span className="font-semibold tracking-wide" style={{ color: teamColor }}>{team}</span>
                </div>
                <DialogTitle className="font-sans text-sm sm:text-base font-normal tracking-tight leading-tight text-foreground break-words">
                  Gestor de <span className="font-medium" style={{ color: teamColor }}>Quartos de Hora</span>
                </DialogTitle>
                <DialogDescription className="hidden sm:block text-[11px] text-muted-foreground font-sans tracking-wide break-words">
                  escala · cronômetro · alarme · histórico
                </DialogDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 ml-auto shrink-0">

              {running && live && !live.done && schedule && (
                <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/50 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-emerald-300">
                  <Timer className="h-3 w-3" />
                  {fmtHMS(live.remaining)}
                </span>
              )}

              {(drag.x !== 0 || drag.y !== 0) && (
                <button type="button" onClick={resetPosition} aria-label="Recentrar janela"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-border bg-card/60 text-muted-foreground hover:text-foreground transition-colors"
                  title="Recentrar janela">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              )}

              <button type="button" onClick={requestExit} aria-label="Sair da ferramenta"
                onPointerDown={(e) => e.stopPropagation()}
                className="shrink-0 inline-flex items-center gap-1.5 h-8 rounded-md border border-border bg-card/60 pl-2 pr-2.5 font-sans text-[11px] uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 8l-4 4 4 4M6 12h11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Sair</span>
              </button>
              </div>
            </div>
          </DialogHeader>

          {/* Corpo rolável — sem caixas, layout aberto e centralizado */}
          <div
            ref={fitRef}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-4 sm:px-6 lg:px-10 py-4 sm:py-6"
          >
            <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 items-start lg:divide-x lg:divide-border/40">
              <div className="min-w-0 lg:pr-6">


              {/* ============ COLUNA ESQUERDA — CONFIGURAÇÃO ============ */}
              <Section icon={<Radio className="h-3.5 w-3.5 text-primary" />} title="Configuração" defaultOpen>
                {/* Team pills */}
                <div className="grid gap-2">
                  <Label className="text-[11px] font-sans tracking-wide text-muted-foreground flex items-center gap-1">
                    <Radio className="h-3 w-3" /> Equipe
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEAM_PRESETS.map((t) => {
                      const active = team === t.key;
                      return (
                        <button key={t.key} type="button" onClick={() => setTeam(t.key)}
                          className={cn(
                            'relative rounded-lg border px-2 py-2 font-sans font-semibold uppercase tracking-wide text-[11px] transition-all',
                            active ? 'border-transparent text-slate-950 shadow-sm' : 'border-border bg-card/60 text-foreground hover:border-border',
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
                        'rounded-md border px-3 py-2 text-[11px] font-mono uppercase tracking-wide transition-all',
                        mode === m ? 'border-border bg-primary/15 text-primary' : 'border-border bg-card/60 text-muted-foreground hover:text-foreground',
                      )}>
                      {m === 'split' ? 'Dividir turno' : 'Intervalo fixo'}
                    </button>
                  ))}
                </div>

                {/* Times / interval */}
                {mode === 'split' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TimeField id="rm-start" label="Início do turno" value={startTime}
                      onChange={setStartTime} invalid={hasError('start')} accent={teamColor} />
                    <TimeField id="rm-end" label="Término do turno" value={endTime}
                      onChange={setEndTime} invalid={hasError('end')} accent={teamColor} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <TimeField id="rm-start2" label="Início" value={startTime}
                      onChange={setStartTime} invalid={hasError('start')} accent={teamColor} />
                    <div className="grid gap-1.5">
                      <label htmlFor="rm-int" className="text-[11px] font-sans uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" /> Intervalo (min)
                      </label>
                      <Input id="rm-int" type="number" min={1} max={240} value={intervalMin}
                        onChange={(e) => setIntervalMin(Math.max(1, Math.min(240, +e.target.value || 1)))}
                        className={cn('bg-background/60 border-border font-mono text-lg font-light tabular-nums h-11', hasError('interval') && 'border-destructive')}
                        autoComplete="off" onKeyDown={(e) => e.key === 'e' && e.preventDefault()} />
                    </div>
                  </div>
                )}

                {mode === 'split' && (
                  <div className="grid gap-1.5">
                    <Label className="text-[11px] font-sans tracking-wide text-muted-foreground">
                      Divisão automática entre {agents.length} agente{agents.length === 1 ? '' : 's'}
                    </Label>
                    <Select value={rounding} onValueChange={(v: Rounding) => setRounding(v)}>
                      <SelectTrigger className="bg-card/60 border-border h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distribute">Automático — minutos inteiros, recalibra no fim (recomendado)</SelectItem>
                        <SelectItem value="exact">Preciso — divide em segundos, fecha 100% no término</SelectItem>
                        <SelectItem value="floor">Truncar — minutos inteiros (sobra livre no fim)</SelectItem>
                        <SelectItem value="ceil">Arredondar — minutos inteiros para cima (pode ultrapassar)</SelectItem>
                      </SelectContent>
                    </Select>
                    {schedule && (
                      <p className="text-[10px] font-mono text-muted-foreground/80 mt-0.5">
                        {agents.length} × ~{fmtDuration(schedule.slot)} · total {fmtDuration(schedule.total)} ({startTime} → {endTime})
                      </p>
                    )}
                  </div>
                )}


                {/* Agents */}
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[11px] font-sans tracking-wide text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Agentes ({agents.length})
                    </Label>
                    <Button type="button" size="sm" variant="outline" onClick={addAgent} className="h-7 border-border text-primary hover:bg-primary/10">
                      <Plus className="h-3 w-3 mr-1" /> Adicionar
                    </Button>
                  </div>
                  <div className={cn('grid gap-1.5 max-h-48 overflow-y-auto pr-1 rounded-md', hasError('agents') && 'ring-1 ring-destructive/40 p-1')}>
                    {agents.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 min-w-0">
                        <span className="w-7 shrink-0 text-center font-mono text-[11px] text-primary tabular-nums">{pad(i + 1)}</span>
                        <Input value={a} onChange={(e) => updateAgent(i, e.target.value.slice(0, 40))}
                          placeholder={`Agente ${i + 1}`}
                          className={cn('bg-card/60 border-border h-8 text-sm min-w-0 flex-1', !a.trim() && 'border-destructive/60')}
                          autoComplete="off" />
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeAgent(i)}
                          disabled={agents.length <= 1} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Remover ${i + 1}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation panel */}
                {issues.length > 0 && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                    <div className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-wider text-destructive mb-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Corrija os itens abaixo
                    </div>
                    <ul className="grid gap-1 text-xs text-destructive/90 list-disc pl-4 break-words">
                      {issues.map((iss, k) => <li key={k}>{iss.message}</li>)}
                    </ul>
                  </div>
                )}

                {/* Sound settings */}
                <div className="grid gap-2 pt-3 border-t border-border/40">

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-wide text-muted-foreground">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                        <path d="M4 10v4h4l5 4V6L8 10H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        {!sound.muted && <path d="M16 8c1.6 1 1.6 7 0 8M19 5c3 2.5 3 12 0 14.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                        {sound.muted && <path d="M17 9l6 6M23 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
                      </svg>
                      Alerta sonoro
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => playAlert({ ...sound, muted: false })}
                        className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground hover:text-primary border border-border rounded px-2 py-0.5">
                        Testar
                      </button>
                      <label className="flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-wide text-muted-foreground cursor-pointer select-none">
                        <input type="checkbox" checked={sound.muted}
                          onChange={(e) => updateSound({ muted: e.target.checked })}
                          className="accent-primary h-3 w-3" />
                        Mudo
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <span className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground">Vol</span>
                    <input type="range" min={0} max={100} value={sound.volume}
                      onChange={(e) => updateSound({ volume: +e.target.value })}
                      disabled={sound.muted}
                      className="w-full accent-primary disabled:opacity-40" />
                    <span className="font-mono text-[11px] tabular-nums text-foreground w-8 text-right">{sound.volume}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['chime', 'pulse', 'siren'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => updateSound({ tone: t })}
                        className={cn(
                          'rounded border px-2 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors',
                          sound.tone === t
                            ? 'border-primary/70 bg-primary/10 text-primary'
                            : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                        )}>
                        {t === 'chime' ? 'Sino' : t === 'pulse' ? 'Pulso' : 'Sirene'}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
              </div>

              {/* ============ COLUNA DIREITA — OPERAÇÃO ============ */}
              <div className="grid gap-6 min-w-0 lg:pl-6">

                <Section icon={<Timer className="h-3.5 w-3.5 text-primary" />} title="Cronograma" defaultOpen={!!schedule}>
                  {!schedule ? (
                    <div className="rounded-lg border border-dashed border-border bg-card/30 p-6 text-center text-[12px] text-muted-foreground font-sans">
                      Preencha a configuração para gerar o cronograma.
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-border/40">
                        <div className="font-sans font-semibold uppercase tracking-[0.16em] text-[13px] truncate" style={{ color: teamColor }}>
                          EQUIPE {team}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[11px] uppercase tracking-wide">
                          <span className="whitespace-nowrap text-primary tabular-nums">
                            <Timer className="inline h-3 w-3 mr-1" />
                            {fmtDuration(schedule.total)} totais
                          </span>
                          <span className="whitespace-nowrap text-emerald-400 tabular-nums">
                            ~{fmtDuration(schedule.slot)} / agente
                          </span>
                        </div>
                      </div>

                      {/* Countdown — aberto, centralizado */}
                      <div className="mb-6 flex flex-col items-center text-center gap-3">
                        <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {running && live && !live.done ? 'Em ronda' : running && live?.done ? 'Concluído' : 'Aguardando início'}
                        </span>

                        {/* Roster dinâmico — aparece ao iniciar a contagem */}
                        {running && live && (
                          <div className="w-full max-w-3xl rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm p-3">
                            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                              Agentes participantes
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {schedule.rows.map((r, i) => {
                                const isActive = !live.done && i === live.index;
                                const isDoneAgent = live.done ? i <= live.index : i < live.index;
                                return (
                                  <span
                                    key={i}
                                    className={cn(
                                      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[11px] uppercase tracking-wide transition-all',
                                      isActive && 'border-primary/70 bg-primary/10 text-foreground font-semibold animate-pulse',
                                      isDoneAgent && 'border-emerald-500/40 bg-emerald-500/5 text-muted-foreground line-through decoration-emerald-500/70',
                                      !isActive && !isDoneAgent && 'border-border/60 bg-background/40 text-muted-foreground',
                                    )}
                                    style={isActive ? { borderColor: teamColor, color: teamColor } : undefined}
                                  >
                                    <span className="font-mono text-[9px] opacity-60 no-underline">{pad(i + 1)}</span>
                                    {r.name}
                                    {isDoneAgent && <CheckCircle2 className="h-3 w-3 text-emerald-500 no-underline" />}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-center gap-4 sm:gap-6">
                          {running && live && !live.done && 'slotSec' in live && (
                            <RoundsRadarSVG
                              color={teamColor}
                              progress={1 - live.remaining / live.slotSec}
                            />
                          )}
                          <span className="font-mono text-4xl sm:text-5xl md:text-6xl font-light tabular-nums tracking-tight leading-none break-all" style={{ color: running ? teamColor : 'hsl(var(--muted-foreground))' }}>
                            {running && live ? fmtHMS(live.remaining) : fmtHMS(schedule.rows[0].duration * 60)}
                          </span>
                        </div>

                        {/* Nome BEM GRANDE do agente em ronda */}
                        {running && live && !live.done && (
                          <div
                            className="font-sans font-black uppercase tracking-tight text-4xl sm:text-5xl md:text-6xl leading-none break-words max-w-full px-2 drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                            style={{ color: teamColor, textShadow: `0 0 24px ${teamColor}55` }}
                          >
                            {schedule.rows[live.index].name}
                          </div>
                        )}
                        {(!running || !live) && (
                          <div className="font-sans font-medium text-base text-foreground break-words max-w-full px-2">
                            {schedule.rows[0].name}
                          </div>
                        )}
                        {running && live?.done && (
                          <div className="font-sans font-black uppercase tracking-[0.15em] text-2xl sm:text-3xl text-emerald-500 flex items-center gap-2">
                            <CheckCircle2 className="h-7 w-7" /> MISSÃO CUMPRIDA
                          </div>
                        )}

                        {running && live && !live.done && 'slotSec' in live && (
                          <div className="h-1 w-40 sm:w-64 overflow-hidden rounded-full bg-border/60">
                            <div className="h-full transition-all"
                                 style={{ width: `${100 - (live.remaining / live.slotSec) * 100}%`, backgroundColor: teamColor }} />
                          </div>
                        )}
                        {/* Motivational strip — only visible while running to keep the agent alert */}
                        <MotivationalTicker color={teamColor} active={running && !!live && !live.done} />

                        <div className="flex items-center gap-2 pt-1">
                          {!running ? (
                            <Button type="button" size="sm" onClick={startTimer} className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950">
                              <Play className="h-3.5 w-3.5 mr-1.5" /> Iniciar
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                if (live && !live.done) { setLockOpen(true); return; }
                                pauseTimer();
                              }}
                              className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950"
                            >
                              <Pause className="h-3.5 w-3.5 mr-1.5" /> Pausar
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (running && live && !live.done) { setLockOpen(true); return; }
                              resetTimer();
                            }}
                            className="h-9 w-9 text-muted-foreground hover:text-primary"
                            aria-label="Reiniciar"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <MissionLockDialog
                        open={lockOpen}
                        onClose={() => setLockOpen(false)}
                        color={teamColor}
                        agentName={live && !live.done ? schedule.rows[live.index]?.name : undefined}
                        remainingLabel={live && !live.done ? fmtHMS(live.remaining) : undefined}
                      />

                      {/* Rows — sem caixas, apenas linhas */}
                      <ul className="divide-y divide-border/40">
                        {schedule.rows.map((r, i) => {
                          const isCurrent = running && !!live && !live.done && i === live.index;
                          const isDone = running && !!live && (live.done ? i <= live.index : i < live.index);
                          return (
                            <li key={i}
                                className={cn('grid grid-cols-[28px_minmax(0,1fr)] sm:grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-2.5 transition-colors',
                                  isCurrent && 'bg-primary/5 -mx-2 px-2 rounded',
                                  isDone && 'opacity-70')}
                                style={isCurrent ? { boxShadow: `inset 3px 0 0 0 ${teamColor}` } : undefined}>
                              <span className="font-mono text-[11px] tabular-nums" style={{ color: isCurrent ? teamColor : 'hsl(var(--muted-foreground))' }}>{pad(i + 1)}</span>
                              <span className={cn(
                                'font-sans font-medium text-sm break-words min-w-0 flex items-center gap-2 flex-wrap',
                                isDone && 'line-through text-muted-foreground decoration-emerald-500/70'
                              )}>
                                {r.name}
                                {isDone && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.15em] text-emerald-400 no-underline">
                                    <CheckCircle2 className="h-2.5 w-2.5" /> Missão cumprida
                                  </span>
                                )}
                              </span>
                              <span className="col-span-2 sm:col-auto font-mono text-[11px] tabular-nums flex flex-wrap items-center gap-2 justify-start sm:justify-end text-muted-foreground">
                                <span className="text-foreground">{r.from}</span>
                                <span style={{ color: teamColor }}>→</span>
                                <span className="text-foreground">{r.to}</span>
                                <span className="uppercase tracking-wide whitespace-nowrap" style={{ color: teamColor }}>
                                  {fmtDuration(r.duration)}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mt-5 flex flex-wrap gap-2 justify-center sm:justify-end pt-3 border-t border-border/40">
                        <Button type="button" variant="ghost" onClick={copyToClipboard} className="text-muted-foreground hover:text-primary">
                          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar
                        </Button>
                        <Button type="button" variant="ghost" onClick={exportPDF} className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10">
                          <FileDown className="h-3.5 w-3.5 mr-1.5" /> Exportar PDF
                        </Button>
                      </div>
                    </div>

                  )}
                </Section>

                <Section icon={<History className="h-3.5 w-3.5 text-primary" />} title={`Histórico (${history.length})`}>
                  <div>
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      <span className="text-[11px] font-sans uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5">
                        <History className="h-3 w-3" /> Registros ({history.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href="/rounds-history"
                          className="font-sans text-[11px] uppercase tracking-wide text-primary hover:underline"
                        >
                          Ver histórico completo →
                        </a>
                        {history.length > 0 && (
                          <button type="button" onClick={clearHistory}
                            className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground hover:text-destructive">
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                    {history.length === 0 ? (
                      <div className="text-[11px] text-muted-foreground font-sans uppercase tracking-wide text-center py-4">
                        Nenhuma ronda registrada ainda.
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/40 max-h-72 overflow-y-auto">
                        {history.map((h) => {
                          const color = TEAM_PRESETS.find((t) => t.key === h.team)?.color ?? '#f59e0b';
                          const dt = new Date(h.startedAt);
                          const dtStr = `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
                          const endStr = h.endedAt ? new Date(h.endedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';
                          return (
                            <li key={h.id} className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
                              <span className="font-sans text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap"
                                    style={{ color }}>{h.team}</span>
                              <div className="min-w-0">
                                <div className="font-mono text-[11px] tabular-nums text-foreground">
                                  {dtStr} <span className="text-muted-foreground">→</span> {endStr}
                                </div>
                                <div className="text-[11px] text-muted-foreground break-words">
                                  {h.agents.slice(0, 4).join(' · ')}{h.agents.length > 4 ? ` +${h.agents.length - 4}` : ''}
                                </div>
                              </div>
                              <span className="col-span-2 sm:col-auto font-sans text-[11px] uppercase tracking-wide text-muted-foreground justify-self-start sm:justify-self-end whitespace-nowrap">
                                {h.mode === 'split' ? `${h.startTime}–${h.endTime}` : `${h.intervalMin}min`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                </Section>
              </div>
            </div>
          </div>
        </DialogContent>

      </Dialog>

      {/* Alarme de troca de ronda — padronizado */}
      <ConfirmDialog
        open={alarm.open}
        onOpenChange={(o) => setAlarm((a) => ({ ...a, open: o }))}
        variant="alarm"
        kicker={`EQUIPE ${team} · POSTO ${pad(alarm.index + 1)}`}
        title="Hora de fazer a ronda"
        description={
          <span>
            Assumir posto:{' '}
            <span className="font-semibold" style={{ color: teamColor }}>
              {alarm.name}
            </span>
          </span>
        }
        accent={teamColor}
        primaryLabel="Ciente · Assumir posto"
        onPrimary={() => setAlarm((a) => ({ ...a, open: false }))}
      />

      {/* Confirmação de saída — padronizada */}
      <ConfirmDialog
        open={confirmExit}
        onOpenChange={setConfirmExit}
        variant="exit"
        kicker="Confirmação"
        title="Encerrar sessão de rondas?"
        description={
          running
            ? 'O cronômetro está ativo. A sessão será interrompida e ficará registrada no histórico.'
            : 'Os dados desta escala permanecerão salvos no histórico local.'
        }
        accent={teamColor}
        primaryLabel="Continuar"
        onPrimary={() => setConfirmExit(false)}
        secondaryLabel="Sim, sair"
        onSecondary={confirmAndClose}
      />

    </>
  );
}
