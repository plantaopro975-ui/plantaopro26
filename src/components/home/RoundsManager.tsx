import { useMemo, useState } from 'react';
import { Clock, Users, Plus, Trash2, Copy, Printer, Timer, Shield, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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

/* ================= component ================= */
export function RoundsManager() {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState('Equipe ALFA');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('19:00');
  const [agents, setAgents] = useState<string[]>(['Agente 1', 'Agente 2', 'Agente 3']);

  const addAgent = () => setAgents((a) => [...a, `Agente ${a.length + 1}`]);
  const removeAgent = (i: number) => setAgents((a) => a.filter((_, idx) => idx !== i));
  const updateAgent = (i: number, v: string) => setAgents((a) => a.map((x, idx) => (idx === i ? v : x)));

  const calc = useMemo(() => {
    const s = toMinutes(startTime);
    const e = toMinutes(endTime);
    if (s === null || e === null) return null;
    let total = e - s;
    if (total <= 0) total += 24 * 60; // wrap over midnight
    const n = agents.length;
    if (!n) return null;
    const slot = total / n;
    const rows = agents.map((name, i) => {
      const from = s + i * slot;
      const to = s + (i + 1) * slot;
      return {
        name: name.trim() || `Agente ${i + 1}`,
        from: fromMinutes(from),
        to: fromMinutes(to),
        duration: slot,
      };
    });
    return { total, slot, rows };
  }, [startTime, endTime, agents]);

  const copyToClipboard = async () => {
    if (!calc) return;
    const header = `📋 ${teamName.toUpperCase()} — Escala de Rondas\n⏱ ${startTime} → ${endTime} · ${fmtDuration(calc.total)} · ${agents.length} agentes\n\n`;
    const body = calc.rows
      .map((r, i) => `${pad(i + 1)}. ${r.name}\n   ${r.from} — ${r.to}  (${fmtDuration(r.duration)})`)
      .join('\n');
    await navigator.clipboard.writeText(header + body);
    toast({ title: 'Copiado', description: 'Escala copiada para a área de transferência.' });
  };

  const printSchedule = () => {
    if (!calc) return;
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (!w) return;
    w.document.write(`
      <html><head><title>${teamName} — Rondas</title>
      <style>
        body{font-family:'Segoe UI',system-ui,sans-serif;padding:32px;color:#0a0f1a;}
        h1{margin:0 0 4px;letter-spacing:.05em;text-transform:uppercase;font-size:22px}
        .meta{color:#475569;font-size:12px;margin-bottom:24px;font-family:ui-monospace,monospace;text-transform:uppercase;letter-spacing:.15em}
        table{width:100%;border-collapse:collapse}
        th,td{padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:14px}
        th{background:#0a0f1a;color:#f59e0b;text-transform:uppercase;font-size:11px;letter-spacing:.2em}
        tr:nth-child(even) td{background:#f8fafc}
        .win{font-family:ui-monospace,monospace;font-weight:700;color:#0a0f1a}
        .dur{color:#f59e0b;font-family:ui-monospace,monospace}
      </style></head><body>
      <h1>${teamName}</h1>
      <div class="meta">Rondas · ${startTime} → ${endTime} · ${fmtDuration(calc.total)} · ${agents.length} agentes · ${fmtDuration(calc.slot)}/agente</div>
      <table><thead><tr><th>#</th><th>Agente</th><th>Início</th><th>Término</th><th>Duração</th></tr></thead><tbody>
      ${calc.rows.map((r, i) => `<tr><td>${pad(i + 1)}</td><td>${r.name}</td><td class="win">${r.from}</td><td class="win">${r.to}</td><td class="dur">${fmtDuration(r.duration)}</td></tr>`).join('')}
      </tbody></table>
      </body></html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'group relative w-full overflow-hidden rounded-xl border border-primary/30 bg-slate-950/80 backdrop-blur',
            'px-4 py-3 text-left transition-all duration-300',
            'hover:border-primary/70 hover:shadow-[0_0_30px_-6px_hsl(var(--primary)/0.55)] hover:-translate-y-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          )}
          aria-label="Abrir Gestor de Rondas"
        >
          {/* backdrop gradient */}
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.18),transparent_60%)]" />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="relative flex items-center gap-3">
            {/* icon SVG */}
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/40 shadow-inner">
              <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden>
                <defs>
                  <linearGradient id="rm-clock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="15" fill="none" stroke="url(#rm-clock)" strokeWidth="2" />
                <circle cx="20" cy="20" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="3 5" opacity="0.4" />
                <line x1="20" y1="20" x2="20" y2="8"  stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="20" x2="29" y2="24" stroke="hsl(var(--primary))" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
                <circle cx="20" cy="20" r="1.6" fill="hsl(var(--primary))" />
              </svg>
              <span aria-hidden className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_hsl(142_70%_45%/0.9)] animate-pulse" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-primary/90">
                  Ferramenta Tática
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.24em] text-emerald-400/90">
                  · Online
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-sans text-base font-black uppercase tracking-[0.04em] text-foreground">
                  Gestor de Rondas
                </span>
                <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  · Quartos de Hora
                </span>
              </div>
            </div>

            <span className="hidden sm:flex items-center gap-1 shrink-0 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary group-hover:bg-primary/20 transition-colors">
              <Sparkles className="h-3 w-3" strokeWidth={2.4} />
              Abrir
            </span>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-primary/30 text-foreground">
        <DialogHeader className="border-b border-primary/20 pb-3">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.28em] text-primary/80">
            <Shield className="h-3 w-3" /> Operação · Divisão de Rondas
          </div>
          <DialogTitle className="font-sans text-xl font-black uppercase tracking-[0.04em]">
            Gestor de <span className="text-primary">Quartos de Hora</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-mono uppercase tracking-[0.15em]">
            Distribuição automática e proporcional do tempo entre os agentes de plantão.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="rm-team" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80">
              Nome da Equipe
            </Label>
            <Input
              id="rm-team"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value.slice(0, 40))}
              placeholder="Ex.: Equipe ALFA — Plantão Diurno"
              className="bg-slate-900/60 border-primary/20 font-mono uppercase tracking-[0.08em]"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="rm-start" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Início
              </Label>
              <Input
                id="rm-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-slate-900/60 border-primary/20 font-mono text-lg tabular-nums"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rm-end" className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Término
              </Label>
              <Input
                id="rm-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-slate-900/60 border-primary/20 font-mono text-lg tabular-nums"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80 flex items-center gap-1">
                <Users className="h-3 w-3" /> Agentes ({agents.length})
              </Label>
              <Button type="button" size="sm" variant="outline" onClick={addAgent} className="h-7 border-primary/40 text-primary hover:bg-primary/10">
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="grid gap-1.5 max-h-52 overflow-y-auto pr-1">
              {agents.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-7 text-center font-mono text-[10px] text-primary tabular-nums">{pad(i + 1)}</span>
                  <Input
                    value={a}
                    onChange={(e) => updateAgent(i, e.target.value.slice(0, 40))}
                    placeholder={`Agente ${i + 1}`}
                    className="bg-slate-900/60 border-primary/15 h-8 text-sm"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeAgent(i)}
                    disabled={agents.length <= 1}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Remover agente ${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result */}
        {calc && (
          <div className="mt-2 rounded-xl border border-primary/30 bg-gradient-to-b from-slate-900/80 to-slate-950 p-4 shadow-[inset_0_0_30px_-8px_hsl(var(--primary)/0.35)]">
            {/* header badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 pb-2 mb-3">
              <div className="font-sans font-black uppercase tracking-[0.06em] text-primary text-sm">
                {teamName || 'Equipe'}
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-primary tabular-nums">
                  <Timer className="inline h-3 w-3 mr-1" />
                  {fmtDuration(calc.total)} totais
                </span>
                <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 tabular-nums">
                  {fmtDuration(calc.slot)} / agente
                </span>
              </div>
            </div>

            {/* SVG timeline */}
            <div className="mb-3">
              <svg viewBox={`0 0 ${agents.length * 100} 44`} className="w-full h-11" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="rm-band" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                {calc.rows.map((r, i) => (
                  <g key={i}>
                    <rect
                      x={i * 100 + 2}
                      y={4}
                      width={96}
                      height={36}
                      rx={4}
                      fill="url(#rm-band)"
                      stroke="hsl(var(--primary))"
                      strokeOpacity={0.7}
                      strokeWidth={0.6}
                    />
                    <text x={i * 100 + 50} y={20} textAnchor="middle" fill="#0a0f1a" fontSize={10} fontWeight={800} fontFamily="ui-monospace,monospace">
                      {r.from}
                    </text>
                    <text x={i * 100 + 50} y={34} textAnchor="middle" fill="#0a0f1a" fontSize={9} fontFamily="ui-monospace,monospace" opacity={0.85}>
                      {r.to}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* rows */}
            <ul className="grid gap-1.5">
              {calc.rows.map((r, i) => (
                <li key={i} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-md border border-primary/10 bg-slate-950/60 px-3 py-2">
                  <span className="font-mono text-[11px] text-primary tabular-nums">{pad(i + 1)}</span>
                  <span className="font-sans font-semibold text-sm truncate">{r.name}</span>
                  <span className="font-mono text-[11px] tabular-nums flex items-center gap-2">
                    <span className="text-foreground">{r.from}</span>
                    <span className="text-primary">→</span>
                    <span className="text-foreground">{r.to}</span>
                    <span className="rounded bg-primary/15 text-primary px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em]">
                      {fmtDuration(r.duration)}
                    </span>
                  </span>
                </li>
              ))}
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
        {!calc && (
          <p className="text-xs text-destructive font-mono uppercase tracking-[0.15em]">
            Horários inválidos ou nenhum agente cadastrado.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
