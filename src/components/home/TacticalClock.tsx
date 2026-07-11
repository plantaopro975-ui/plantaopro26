import { useServerTime } from '@/hooks/useServerTime';
import { cn } from '@/lib/utils';

interface TacticalClockProps {
  accent?: string;
  className?: string;
  showSeconds?: boolean;
  showDate?: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const MONTH_ABBR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/**
 * Tactical Monochrome — relógio compacto sincronizado com o servidor.
 * Layout: [ ● LIVE ]  HH:MM:ss  │  DD MMM / YYYY
 * Mono‑cromático com um único accent (cor da equipe) no dot LIVE.
 */
export function TacticalClock({
  accent = '#eab308',
  className,
  showSeconds = true,
  showDate = true,
}: TacticalClockProps) {
  const now = useServerTime(1000);
  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());
  const dd = pad2(now.getDate());
  const mon = MONTH_ABBR[now.getMonth()];
  const yyyy = String(now.getFullYear());

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Hora atual ${hh}:${mm}:${ss}`}
      className={cn(
        'flex items-center h-9 w-[220px] rounded-sm border border-border bg-card/50 px-2.5 gap-3 shadow-inner select-none',
        className,
      )}
    >
      {/* Live status */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-20 animate-ping"
            style={{ background: accent }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}99` }}
          />
        </span>
        <span
          className="text-[9px] font-bold tracking-[0.15em] leading-none"
          style={{ color: accent }}
        >
          LIVE
        </span>
      </div>

      {/* Time segment */}
      <div className="flex-1 flex justify-center items-baseline gap-0.5 font-mono font-medium tracking-tight tabular-nums text-foreground">
        <span className="text-sm leading-none">
          {hh}:{mm}
        </span>
        {showSeconds && (
          <span className="text-[10px] leading-none text-muted-foreground/80">
            :{ss}
          </span>
        )}
      </div>

      {showDate && (
        <>
          {/* Separator */}
          <span aria-hidden className="h-3 w-px bg-border shrink-0" />

          {/* Date segment */}
          <div className="flex flex-col items-end leading-none pr-0.5 font-mono shrink-0">
            <span className="text-[9px] font-bold text-muted-foreground tabular-nums">
              {dd} {mon}
            </span>
            <span className="text-[8px] tracking-tighter text-muted-foreground/70 tabular-nums">
              {yyyy}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
