import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Users, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const AUTO_CLOSE_SECONDS = 10;

interface Props {
  open: boolean;
  onClose: () => void;
  color: string;
  team: string;
  totalSeconds: number;
  agentsCount: number;
  completedCount: number;
  nextAction?: string;
  silent?: boolean;
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Post-round celebration summary. Locks the UI for a beat with an
 * impressive recap card (total time, progress, next action) before
 * releasing controls again.
 */
export function RoundSummaryDialog({
  open, onClose, color, team,
  totalSeconds, agentsCount, completedCount,
  nextAction = 'Registrar ocorrências e preparar próxima ronda',
  silent = false,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
  const pct = agentsCount > 0 ? Math.round((completedCount / agentsCount) * 100) : 0;

  useEffect(() => {
    if (!open) { setProgress(0); return; }
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setProgress(Math.round(pct * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [open, pct]);

  // Auto-close countdown — releases the divider automatically so the panel
  // is ready for the next team. Cleans timers when dialog is closed manually.
  useEffect(() => {
    if (!open) { setCountdown(AUTO_CLOSE_SECONDS); return; }
    setCountdown(AUTO_CLOSE_SECONDS);
    const tick = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(tick);
          onClose();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md w-[calc(100vw-2rem)] sm:w-full p-0 overflow-hidden border-2 min-h-[520px] flex flex-col"
        style={{ borderColor: `${color}70` }}
      >
        {/* Top glow header */}
        <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}30, transparent 60%), radial-gradient(circle at 30% 20%, ${color}55, transparent 60%)` }}>
          {!silent && (
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${color}22 0 2px, transparent 2px 6px)`,
                animation: 'summaryStripe 6s linear infinite',
              }}
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <div className={!silent ? 'absolute inset-0 rounded-full blur-2xl opacity-60' : ''} style={{ backgroundColor: color }} />
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center border-2" style={{ borderColor: color, background: `${color}22` }}>
                <Trophy className="h-7 w-7" style={{ color }} />
              </div>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color }}>
              EQUIPE {team} · Ronda concluída
            </div>
          </div>
        </div>

        <div className="p-6 pt-2">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-black uppercase tracking-tight flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color }} />
              Missão Cumprida
              <Sparkles className="h-4 w-4" style={{ color }} />
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              Registro consolidado da última ronda executada.
            </DialogDescription>
          </DialogHeader>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span>Progresso alcançado</span>
              <span className="font-bold" style={{ color }}>{progress}%</span>
            </div>
            <div className="mt-1.5 h-2 rounded-full overflow-hidden bg-muted/50">
              <div
                className="h-full transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 12px ${color}` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <StatCard icon={Clock}       label="Tempo Total"   value={fmt(totalSeconds)} color={color} />
            <StatCard icon={Users}       label="Agentes"       value={`${completedCount}/${agentsCount}`} color={color} />
            <StatCard icon={CheckCircle2} label="Status"        value="OK" color={color} />
          </div>

          {/* Next action */}
          <div className="mt-4 rounded-lg border p-3" style={{ borderColor: `${color}40`, background: `${color}0A` }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3" style={{ color }} /> Próxima ação
            </div>
            <div className="mt-1 text-sm font-semibold" style={{ color }}>{nextAction}</div>
          </div>

          <DialogFooter className="mt-5 sm:justify-center flex-col sm:flex-row gap-2 items-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground text-center">
              Encerramento automático em{' '}
              <span className="font-bold tabular-nums" style={{ color }}>
                {String(countdown).padStart(2, '0')}s
              </span>
            </div>
            <Button
              onClick={onClose}
              className="min-w-40 font-bold uppercase tracking-wide"
              style={{ backgroundColor: color, color: '#0b0f14' }}
            >
              Liberar agora
            </Button>
          </DialogFooter>
        </div>


        <style>{`@keyframes summaryStripe { from { background-position: 0 0 } to { background-position: 120px 0 } }`}</style>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Clock; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-2.5 text-center">
      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} />
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground truncate">{label}</div>
      <div className="font-mono text-sm font-bold tabular-nums truncate" style={{ color }}>{value}</div>
    </div>
  );
}

export default RoundSummaryDialog;
