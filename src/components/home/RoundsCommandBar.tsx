import { Activity, Radio, ShieldCheck, Signal, Users, Clock3, type LucideIcon } from 'lucide-react';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';
import { useServerTime } from '@/hooks/useServerTime';
import { RoundsManager } from './RoundsManager';
import { cn } from '@/lib/utils';

/**
 * Barra unificada: Gestor de Rondas + status operacional (header info)
 * numa única faixa compacta, profissional e tática.
 */
type Tone = 'ok' | 'primary' | 'warn' | 'neutral';

export function RoundsCommandBar() {
  const online = useOnlinePresence();
  const now = useServerTime(1000);

  const hh = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dd = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

  const cells: Array<{ icon: LucideIcon; label: string; value: string; tone?: Tone; live?: boolean; hide?: string }> = [
    { icon: ShieldCheck, label: 'Status',  value: 'Operacional',          tone: 'ok',      live: true },
    { icon: Radio,       label: 'Rede',    value: 'Online',               tone: 'primary', live: true, hide: 'hidden md:flex' },
    { icon: Signal,      label: 'Enlace',  value: 'Seguro',               hide: 'hidden lg:flex' },
    { icon: Users,       label: 'Agentes', value: `${online}`,            tone: 'primary' },
    { icon: Activity,    label: 'Setor',   value: 'Feijó · AC',           hide: 'hidden lg:flex' },
    { icon: Clock3,      label: 'Hora',    value: `${hh} · ${dd}`,        tone: 'neutral' },
  ];

  const toneText = (t?: Tone) =>
    t === 'ok' ? 'text-success'
    : t === 'primary' ? 'text-primary'
    : t === 'warn' ? 'text-warning'
    : 'text-foreground/90';

  const toneDot = (t?: Tone) =>
    t === 'ok' ? 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.7)]'
    : t === 'primary' ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)]'
    : t === 'warn' ? 'bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.7)]'
    : 'bg-muted-foreground/60';

  return (
    <div
      role="group"
      aria-label="Barra tática — Gestor de Rondas e status operacional"
      className={cn(
        'relative w-full rounded-2xl overflow-hidden',
        'border border-primary/20',
        'bg-[linear-gradient(180deg,hsl(215_55%_7%/0.85)_0%,hsl(217_62%_4%/0.95)_100%)]',
        'backdrop-blur-xl',
        'shadow-[0_8px_24px_-12px_hsl(217_62%_2%/0.9)]',
      )}
    >
      {/* Gold accent line top */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.9)_30%,hsl(var(--primary)/0.9)_70%,transparent_100%)]"
      />
      {/* Faint grid */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative flex items-stretch gap-2 sm:gap-3 px-2 sm:px-3 py-1.5">
        {/* Left — Gestor de Rondas trigger */}
        <div className="shrink-0 flex items-center">
          <RoundsManager />
        </div>

        {/* Divider */}
        <span
          aria-hidden
          className="hidden sm:block w-px my-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
        />

        {/* Right — Status HUD cells */}
        <div className="flex-1 min-w-0 flex items-center justify-end">
          <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-3">
            {cells.map((c, i) => {
              const Icon = c.icon;
              const text = toneText(c.tone);
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-1.5 min-w-0',
                    c.hide,
                  )}
                >
                  <span
                    className={cn(
                      'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                      'bg-gradient-to-br from-primary/10 to-primary/0 ring-1 ring-primary/25',
                    )}
                  >
                    <Icon className={cn('h-3 w-3', text)} strokeWidth={2.4} />
                    {c.live && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                        <span className={cn('absolute inset-0 rounded-full opacity-60 animate-ping', toneDot(c.tone))} />
                        <span className={cn('relative h-1.5 w-1.5 rounded-full', toneDot(c.tone))} />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 leading-tight">
                    <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/70 font-mono truncate">
                      {c.label}
                    </div>
                    <div className={cn('text-[10.5px] font-semibold tracking-wide font-mono tabular-nums truncate', text)}>
                      {c.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.35),transparent)]"
      />
    </div>
  );
}

export default RoundsCommandBar;
