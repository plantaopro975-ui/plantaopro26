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
 * Chronograph HUD — relógio tático de alta precisão sincronizado com o servidor.
 * Estética instrumental: dígitos segmentados com sombra interna, colon pulsante,
 * micro-badge LIVE, filete acento inferior. Dimensões preservadas (px-2.5 py-1).
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

  const digitCls =
    'inline-flex items-baseline justify-center rounded-[3px] px-[3px] font-mono font-semibold tabular-nums text-foreground bg-foreground/[0.04] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),inset_0_-1px_0_hsl(var(--background)/0.6)]';

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={`Hora atual ${hh}:${mm}:${ss}`}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-md border px-2.5 py-1 select-none overflow-hidden',
        'bg-gradient-to-b from-background/85 to-background/60 backdrop-blur-sm',
        className,
      )}
      style={{
        borderColor: `${accent}55`,
        boxShadow: `inset 0 0 0 1px ${accent}12, 0 1px 0 hsl(var(--background)/0.4)`,
      }}
    >
      {/* filete acento inferior */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-1.5 bottom-0 h-[1.5px] rounded-t-sm opacity-80"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />

      {/* LIVE micro-badge com dot pulsante */}
      <span
        aria-hidden
        className="inline-flex items-center gap-1 rounded-sm border px-1 py-[1px] font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] leading-none"
        style={{
          color: accent,
          borderColor: `${accent}40`,
          background: `${accent}0d`,
        }}
      >
        <span
          className="relative inline-flex h-1 w-1 rounded-full"
          style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
        >
          <span
            className={cn(
              'absolute inset-0 rounded-full transition-opacity duration-500',
              blink ? 'opacity-70' : 'opacity-0',
            )}
            style={{ background: accent, filter: 'blur(2px)' }}
          />
        </span>
        LIVE
      </span>

      {/* Dígitos segmentados */}
      <span className="inline-flex items-center gap-[2px] text-[16px] sm:text-[18px] leading-none tracking-[0.01em]">
        <span className={digitCls}>{hh}</span>
        <span
          className={cn(
            'font-mono font-semibold text-foreground/80 transition-opacity duration-150',
            blink ? 'opacity-100' : 'opacity-25',
          )}
          style={{ textShadow: `0 0 6px ${accent}66` }}
        >
          :
        </span>
        <span className={digitCls}>{mm}</span>
        {showSeconds && (
          <>
            <span
              className={cn(
                'font-mono font-semibold text-foreground/80 transition-opacity duration-150',
                blink ? 'opacity-25' : 'opacity-100',
              )}
              style={{ textShadow: `0 0 6px ${accent}66` }}
            >
              :
            </span>
            <span className={cn(digitCls, 'text-foreground/85 text-[13px] sm:text-[14px]')}>
              {ss}
            </span>
          </>
        )}
      </span>

      {showDate && (
        <span
          className="hidden sm:inline-flex flex-col items-start font-mono leading-none border-l pl-2"
          style={{ borderColor: `${accent}33` }}
        >
          <span
            className="text-[8.5px] font-bold uppercase tracking-[0.22em]"
            style={{ color: `${accent}cc` }}
          >
            Data
          </span>
          <span className="mt-[3px] text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
            {date}
          </span>
        </span>
      )}
    </div>
  );
}
