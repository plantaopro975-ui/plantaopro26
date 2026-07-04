import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Clock, Users, Plus, Trash2, Copy, Printer, Timer, Shield,
  Play, Pause, RotateCcw, Bell, Radio, ChevronRight,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type Mode = 'split' | 'interval';

/* ================= component ================= */
export function RoundsManager() {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<typeof TEAM_PRESETS[number]['key']>('ALFA');
  const [mode, setMode] = useState<Mode>('split');

  // split-mode config
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('19:00');

  // interval-mode config (minutes between rounds)
  const [intervalMin, setIntervalMin] = useState(30);

  const [agents, setAgents] = useState<string[]>(['Agente 1', 'Agente 2', 'Agente 3']);

  const addAgent = () => setAgents((a) => [...a, `Agente ${a.length + 1}`]);
  const removeAgent = (i: number) => setAgents((a) => a.filter((_, idx) => idx !== i));
  const updateAgent = (i: number, v: string) => setAgents((a) => a.map((x, idx) => (idx === i ? v : x)));

  const teamColor = TEAM_PRESETS.find((t) => t.key === team)!.color;

  /* ---------- schedule computation ---------- */
  const schedule = useMemo(() => {
    const n = agents.length;
    if (!n) return null;

    if (mode === 'split') {
      const s = toMinutes(startTime);
      const e = toMinutes(endTime);
      if (s === null || e === null) return null;
      let total = e - s;
      if (total <= 0) total += 24 * 60;
      const slot = total / n;
      const rows = agents.map((name, i) => ({
        name: name.trim() || `Agente ${i + 1}`,
        from: fromMinutes(s + i * slot),
        to: fromMinutes(s + (i + 1) * slot),
        duration: slot,
      }));
      return { total, slot, rows, startMin: s };
    }

    // interval mode
    const s = toMinutes(startTime);
    if (s === null) return null;
    const slot = Math.max(1, intervalMin);
    const total = slot * n;
    const rows = agents.map((name, i) => ({
      name: name.trim() || `Agente ${i + 1}`,
      from: fromMinutes(s + i * slot),
      to: fromMinutes(s + (i + 1) * slot),
      duration: slot,
    }));
    return { total, slot, rows, startMin: s };
  }, [mode, startTime, endTime, intervalMin, agents]);

  /* ---------- live timer ---------- */
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0); // forces re-render each second
  const startedAtRef = useRef<number | null>(null); // epoch ms when timer started
  const firedRef = useRef<Set<number>>(new Set()); // slot indices already alerted
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
    const slotSec = schedule.slot * 60;
    const totalSec = schedule.slot * schedule.rows.length * 60;
    if (elapsedSec >= totalSec) {
      return { done: true, index: schedule.rows.length - 1, remaining: 0, elapsed: elapsedSec };
    }
    const idx = Math.min(schedule.rows.length - 1, Math.floor(elapsedSec / slotSec));
    const remaining = slotSec - (elapsedSec - idx * slotSec);
    return { done: false, index: idx, remaining, elapsed: elapsedSec };
  }, [schedule, running, tick]);

  // fire alarm on transitions
  useEffect(() => {
    if (!live || !schedule) return;
    const currentIdx = live.index;
    // fire when we ENTER a new slot (once)
    if (!firedRef.current.has(currentIdx)) {
      firedRef.current.add(currentIdx);
      // don't alert on very first slot mount (t=0)
      if (currentIdx > 0 || live.elapsed > 1) {
        const row = schedule.rows[currentIdx];
        setAlarm({ open: true, index: currentIdx, name: row.name });
        try {
          // short beep
          const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
            || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AC) {
            const ctx = new AC();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square';
            o.frequency.value = 880;
            g.gain.value = 0.05;
            o.connect(g); g.connect(ctx.destination);
            o.start();
            setTimeout(() => { o.stop(); ctx.close(); }, 600);
          }
        } catch { /* ignore audio */ }
      }
    }
    if (live.done) setRunning(false);
  }, [live, schedule]);

  const startTimer = () => {
    if (!schedule) return;
    startedAtRef.current = Date.now();
    firedRef.current = new Set();
    setRunning(true);
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
      <div class="meta">${mode === 'split' ? `Divisão · ${startTime} → ${endTime}` : `Intervalo · ${intervalMin}min desde ${startTime}`} · ${agents.length} agentes · ${fmtDuration(schedule.slot)}/agente</div>
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Abrir Gestor de Rondas"
            className={cn(
              'group relative inline-flex items-center gap-2.5 h-9 pl-2.5 pr-3 rounded-full',
              'border border-primary/30 bg-slate-950/70 backdrop-blur',
              'transition-all duration-200',
              'hover:border-primary/70 hover:bg-slate-900/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            )}
          >
            {/* micro SVG radar */}
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 border border-primary/40">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
                <circle cx="12" cy="12" r="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.4" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.5" />
                <line x1="12" y1="12" x2="18" y2="8" stroke="hsl(var(--primary))" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="12" cy="12" r="1.2" fill="hsl(var(--primary))" />
              </svg>
              <span aria-hidden className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_hsl(142_70%_45%/0.9)] animate-pulse" />
            </span>

            <span className="flex items-baseline gap-2 leading-none">
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary/90">
                Ferramenta
              </span>
              <span className="font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground">
                Gestor de Rondas
              </span>
            </span>

            {running && live && !live.done && schedule && (
              <span className="ml-1 hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-emerald-300">
                <Timer className="h-3 w-3" />
                {fmtHMS(live.remaining)}
              </span>
            )}

            <ChevronRight className="h-3.5 w-3.5 text-primary/70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-primary/30 text-foreground">
          <DialogHeader className="border-b border-primary/20 pb-3">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.28em] text-primary/80">
              <Shield className="h-3 w-3" /> Operação · Divisão de Rondas
            </div>
            <DialogTitle className="font-sans text-xl font-black uppercase tracking-[0.04em]">
              Gestor de <span style={{ color: teamColor }}>Quartos de Hora</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono uppercase tracking-[0.15em]">
              Escala automática, cronômetro em tempo real e alarme de troca.
            </DialogDescription>
          </DialogHeader>

          {/* Team pills */}
          <div className="grid gap-2 py-2">
            <Label className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
              <Radio className="h-3 w-3" /> Equipe
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {TEAM_PRESETS.map((t) => {
                const active = team === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTeam(t.key)}
                    className={cn(
                      'relative rounded-lg border px-2 py-2 font-sans font-black uppercase tracking-[0.14em] text-xs transition-all',
                      active
                        ? 'border-transparent text-slate-950 shadow-lg'
                        : 'border-primary/20 bg-slate-900/60 text-foreground hover:border-primary/50',
                    )}
                    style={active ? { backgroundColor: t.color, boxShadow: `0 0 24px -6px ${t.color}` } : undefined}
                  >
                    {t.label}
                    <span
                      aria-hidden
                      className={cn('absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full transition-opacity', active ? 'opacity-0' : 'opacity-70')}
                      style={{ backgroundColor: t.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-2">
            {(['split', 'interval'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md border px-3 py-2 text-[11px] font-mono uppercase tracking-[0.18em] transition-all',
                  mode === m
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-primary/20 bg-slate-900/60 text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'split' ? 'Dividir turno' : 'Intervalo fixo'}
              </button>
            ))}
          </div>

          {/* Config */}
          <div className="grid gap-3 py-2">
            {mode === 'split' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="rm-start" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Início
                  </Label>
                  <Input id="rm-start" type="time" value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-slate-900/60 border-primary/20 font-mono text-base tabular-nums" autoComplete="off" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rm-end" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Término
                  </Label>
                  <Input id="rm-end" type="time" value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-slate-900/60 border-primary/20 font-mono text-base tabular-nums" autoComplete="off" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="rm-start2" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Início
                  </Label>
                  <Input id="rm-start2" type="time" value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-slate-900/60 border-primary/20 font-mono text-base tabular-nums" autoComplete="off" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="rm-int" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                    <Timer className="h-3 w-3" /> Intervalo (min)
                  </Label>
                  <Input id="rm-int" type="number" min={1} max={240} value={intervalMin}
                    onChange={(e) => setIntervalMin(Math.max(1, Math.min(240, +e.target.value || 1)))}
                    className="bg-slate-900/60 border-primary/20 font-mono text-base tabular-nums" autoComplete="off" onKeyDown={(e) => e.key === 'e' && e.preventDefault()} />
                </div>
              </div>
            )}

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Agentes ({agents.length})
                </Label>
                <Button type="button" size="sm" variant="outline" onClick={addAgent} className="h-7 border-primary/40 text-primary hover:bg-primary/10">
                  <Plus className="h-3 w-3 mr-1" /> Adicionar
                </Button>
              </div>
              <div className="grid gap-1.5 max-h-48 overflow-y-auto pr-1">
                {agents.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-7 text-center font-mono text-[10px] text-primary tabular-nums">{pad(i + 1)}</span>
                    <Input value={a} onChange={(e) => updateAgent(i, e.target.value.slice(0, 40))}
                      placeholder={`Agente ${i + 1}`} className="bg-slate-900/60 border-primary/15 h-8 text-sm" autoComplete="off" />
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

          {/* Live cockpit */}
          {schedule && (
            <div className="mt-1 rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4"
                 style={{ boxShadow: `inset 0 0 30px -8px ${teamColor}66` }}>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 pb-2 mb-3">
                <div className="font-sans font-black uppercase tracking-[0.08em] text-sm" style={{ color: teamColor }}>
                  EQUIPE {team}
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                  <span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary tabular-nums">
                    <Timer className="inline h-3 w-3 mr-1" />
                    {fmtDuration(schedule.slot * schedule.rows.length)} totais
                  </span>
                  <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 tabular-nums">
                    {fmtDuration(schedule.slot)} / agente
                  </span>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-primary/25 bg-slate-950/80 p-3">
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Regressivo</span>
                  <span className="font-mono text-2xl font-black tabular-nums" style={{ color: running ? teamColor : 'hsl(var(--muted-foreground))' }}>
                    {running && live ? fmtHMS(live.remaining) : fmtHMS(schedule.slot * 60)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary/80">
                    {running && live && !live.done ? 'Em ronda' : running && live?.done ? 'Concluído' : 'Aguardando início'}
                  </div>
                  <div className="font-sans font-bold text-base truncate">
                    {running && live ? schedule.rows[live.index].name : schedule.rows[0].name}
                  </div>
                  {running && live && !live.done && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full transition-all"
                           style={{
                             width: `${100 - (live.remaining / (schedule.slot * 60)) * 100}%`,
                             backgroundColor: teamColor,
                           }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {!running ? (
                    <Button type="button" size="sm" onClick={startTimer}
                      className="h-8 bg-emerald-500 hover:bg-emerald-600 text-slate-950">
                      <Play className="h-3.5 w-3.5 mr-1" /> Iniciar
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={pauseTimer}
                      className="h-8 bg-amber-500 hover:bg-amber-600 text-slate-950">
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
                        className={cn(
                          'grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                          isCurrent ? 'bg-slate-900' : 'border-primary/10 bg-slate-950/60',
                        )}
                        style={isCurrent ? { borderColor: teamColor, boxShadow: `0 0 14px -4px ${teamColor}` } : undefined}
                    >
                      <span className="font-mono text-[11px] tabular-nums" style={{ color: isCurrent ? teamColor : 'hsl(var(--primary))' }}>{pad(i + 1)}</span>
                      <span className="font-sans font-semibold text-sm truncate">{r.name}</span>
                      <span className="font-mono text-[11px] tabular-nums flex items-center gap-2">
                        <span className="text-foreground">{r.from}</span>
                        <span style={{ color: teamColor }}>→</span>
                        <span className="text-foreground">{r.to}</span>
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
          {!schedule && (
            <p className="text-xs text-destructive font-mono uppercase tracking-[0.15em]">
              Horários inválidos ou nenhum agente cadastrado.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Alarme de troca de ronda */}
      <Dialog open={alarm.open} onOpenChange={(o) => setAlarm((a) => ({ ...a, open: o }))}>
        <DialogContent className="max-w-md bg-slate-950 border-2 text-center" style={{ borderColor: teamColor, boxShadow: `0 0 60px -10px ${teamColor}` }}>
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
            <div className="font-sans text-2xl font-black uppercase tracking-[0.06em] text-foreground">
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
    </>
  );
}
