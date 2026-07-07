import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sun, Moon, Palmtree, Clock, AlertCircle, Timer } from 'lucide-react';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export interface JourneyDetailsData {
  /** Data-alvo do dia (00:00) */
  targetDate: Date;
  /** Início do descanso (ex.: fim do plantão anterior) */
  restStart: Date | null;
  /** Fim do descanso (= início do plantão do dia) */
  restEnd: Date | null;
  /** Início do plantão */
  shiftStart: Date | null;
  /** Fim do plantão */
  shiftEnd: Date | null;
  /** Escala detectada (ex.: 12x12, 24x72) */
  scaleLabel?: string;
  /** Mensagem quando não há dados suficientes */
  emptyMessage?: string;
}

interface JourneyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: JourneyDetailsData | null;
}

const useTicker = (enabled: boolean) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const i = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(i);
  }, [enabled]);
};

const fmtCountdown = (target: Date, now: Date) => {
  const totalMin = Math.max(0, differenceInMinutes(target, now));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}min`;
  if (h < 24) return `${h}h ${m.toString().padStart(2, '0')}min`;
  const d = Math.floor(h / 24);
  return `${d}d ${(h % 24)}h`;
};

export function JourneyDetailsDialog({ open, onOpenChange, data }: JourneyDetailsDialogProps) {
  useTicker(open);
  const now = new Date();

  const isNight = data?.shiftStart
    ? data.shiftStart.getHours() >= 18 || data.shiftStart.getHours() < 6
    : false;
  const PeriodIcon = isNight ? Moon : Sun;
  const periodLabel = isNight ? 'Noturno' : 'Diurno';

  const durationH = data?.shiftStart && data?.shiftEnd
    ? Math.max(0, Math.round((data.shiftEnd.getTime() - data.shiftStart.getTime()) / 3_600_000))
    : null;
  const restH = data?.restStart && data?.restEnd
    ? Math.max(0, differenceInHours(data.restEnd, data.restStart))
    : null;

  const inRest = data?.restStart && data?.restEnd && now >= data.restStart && now < data.restEnd;
  const onShift = data?.shiftStart && data?.shiftEnd && now >= data.shiftStart && now < data.shiftEnd;
  const beforeShift = data?.shiftStart && now < data.shiftStart;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-300">
            <Clock className="h-4 w-4" />
            Jornada • {data ? format(data.targetDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : '—'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Detalhamento do ciclo folga → plantão com horários completos.
          </DialogDescription>
        </DialogHeader>

        {!data || (!data.shiftStart && !data.restStart) ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-400 flex-shrink-0" />
            <div className="text-xs text-slate-300 leading-relaxed">
              {data?.emptyMessage ??
                'Sem plantão cadastrado para este dia. Revise o cadastro do agente (data do primeiro plantão e escala).'}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Contagem regressiva */}
            {beforeShift && data.shiftStart && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2.5">
                <Timer className="h-4 w-4 text-emerald-300" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-300">
                    Plantão em {fmtCountdown(data.shiftStart, now)}
                  </div>
                  <div className="text-[10px] text-emerald-200/70">
                    Início às {format(data.shiftStart, 'HH:mm')}
                  </div>
                </div>
              </div>
            )}
            {onShift && data.shiftEnd && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 animate-pulse">
                <Timer className="h-4 w-4 text-red-300" />
                <div className="text-xs">
                  <div className="font-bold text-red-300">Em plantão agora</div>
                  <div className="text-[10px] text-red-200/70">
                    Termina em {fmtCountdown(data.shiftEnd, now)}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="rounded-md border border-slate-700 bg-slate-800/60 p-3 space-y-3">
              {/* Descanso */}
              {data.restStart && data.restEnd && restH !== null && (
                <div className={cn('flex items-start gap-2', inRest && 'ring-1 ring-emerald-400/40 rounded p-1.5 -m-1.5')}>
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 flex-shrink-0">
                    <Palmtree className="h-3 w-3 text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                      Descanso operacional {inRest && '• em curso'}
                    </div>
                    <div className="text-sm font-bold text-slate-100 tabular-nums">
                      {format(data.restStart, 'HH:mm')} → {format(data.restEnd, 'HH:mm')}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {restH}h de descanso • {format(data.restStart, 'dd/MM', { locale: ptBR })}
                    </div>
                  </div>
                </div>
              )}

              {/* Separador */}
              <div className="ml-3 border-l border-dashed border-slate-600 h-2" />

              {/* Plantão */}
              {data.shiftStart && data.shiftEnd && durationH !== null && (
                <div className={cn('flex items-start gap-2', onShift && 'ring-1 ring-red-400/40 rounded p-1.5 -m-1.5')}>
                  <div
                    className={cn(
                      'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border flex-shrink-0',
                      isNight
                        ? 'bg-indigo-500/20 border-indigo-500/40'
                        : 'bg-amber-500/20 border-amber-500/40'
                    )}
                  >
                    <PeriodIcon className={cn('h-3 w-3', isNight ? 'text-indigo-300' : 'text-amber-300')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'text-[10px] uppercase font-bold tracking-wider',
                        isNight ? 'text-indigo-300' : 'text-amber-300'
                      )}
                    >
                      Plantão {periodLabel} {onShift && '• em curso'}
                    </div>
                    <div className="text-sm font-bold text-slate-100 tabular-nums">
                      {format(data.shiftStart, 'HH:mm')} → {format(data.shiftEnd, 'HH:mm')}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {durationH}h de plantão {isNight ? '(atravessa a madrugada)' : ''}
                      {data.scaleLabel && ` • Escala ${data.scaleLabel}`}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Explicação profissional */}
            <div className="rounded-md border border-slate-700 bg-slate-800/40 p-2.5 text-[11px] leading-relaxed text-slate-300">
              <span className="font-semibold text-amber-300">Como interpretar:</span>{' '}
              o período de descanso é o intervalo entre o fim do plantão anterior e o início do próximo.
              O plantão {periodLabel.toLowerCase()} classifica-se pelo horário de entrada
              ({isNight ? '18h–06h' : '06h–18h'}).
              {data.scaleLabel && ` A escala ${data.scaleLabel} representa a proporção plantão×descanso.`}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
