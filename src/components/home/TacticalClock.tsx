import { useServerTime } from '@/hooks/useServerTime';
import { cn } from '@/lib/utils';

interface TacticalClockProps {
  accent?: string;
  className?: string;
  showSeconds?: boolean;
  showDate?: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Relógio tático profissional (HH:MM:SS) sincronizado com o servidor.
 * Usa o hook `useServerTime` (offset de rede, resiliente ao relógio local).
 * Estética militar: fonte monoespaçada tabular, colon piscante, cor por equipe.
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
  const blink = now.getSeconds() % 2 === 0;

  const date = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Hora atual ${hh}:${mm}:${ss}`}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-md border px-2 py-1 select-none',
        'bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.35))] backdrop-blur-sm',
        className,
      )}
      style={{
        borderColor: `${accent}66`,
        boxShadow: `inset 0 1px 0 ${accent}22, 0 0 12px -6px ${accent}55`,
      }}
    >
      {/* pulse dot */}
      <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
        <span
          className="absolute inset-0 rounded-full opacity-70 animate-ping"
          style={{ background: accent }}
        />
        <span
          className="relative h-1.5 w-1.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
        />
      </span>

      <span
        className="font-mono text-[13px] sm:text-[14px] font-bold tabular-nums leading-none tracking-[0.08em]"
        style={{
          color: accent,
          textShadow: `0 0 8px ${accent}55`,
        }}
      >
        {hh}
        <span className={cn('transition-opacity duration-150', blink ? 'opacity-100' : 'opacity-30')}>:</span>
        {mm}
        {showSeconds && (
          <>
            <span className={cn('transition-opacity duration-150', blink ? 'opacity-30' : 'opacity-100')}>:</span>
            <span className="opacity-90">{ss}</span>
          </>
        )}
      </span>

      {showDate && (
        <span className="hidden sm:inline font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/90 border-l pl-1.5 ml-0.5"
          style={{ borderColor: `${accent}44` }}
        >
          {date}
        </span>
      )}
    </div>
  );
}
