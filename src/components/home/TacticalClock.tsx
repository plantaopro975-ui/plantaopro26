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
        'relative inline-flex items-center gap-2 rounded-md border px-2.5 py-1 select-none',
        'bg-background/70 backdrop-blur-sm',
        className,
      )}
      style={{
        borderColor: `${accent}55`,
      }}
    >
      {/* status dot (static) */}
      <span
        aria-hidden
        className="relative inline-flex h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: accent }}
      />

      <span
        className="font-mono text-[16px] sm:text-[18px] font-semibold tabular-nums leading-none tracking-[0.02em] text-foreground"
      >
        {hh}
        <span className={cn('mx-[1px] transition-opacity duration-150', blink ? 'opacity-100' : 'opacity-40')}>:</span>
        {mm}
        {showSeconds && (
          <>
            <span className={cn('mx-[1px] transition-opacity duration-150', blink ? 'opacity-40' : 'opacity-100')}>:</span>
            <span className="opacity-80">{ss}</span>
          </>
        )}
      </span>

      {showDate && (
        <span
          className="hidden sm:inline font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground border-l pl-2"
          style={{ borderColor: `${accent}33` }}
        >
          {date}
        </span>
      )}
    </div>
  );
}

