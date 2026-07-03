import { useEffect, useState } from 'react';
import { Activity, Radio, ShieldCheck, Signal, Users, Clock3 } from 'lucide-react';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

/**
 * Command Center full-width status bar — sober operational HUD
 * Sits above the hero to elevate the homepage to a real command center feel.
 */
export function CommandCenterBar() {
  const online = useOnlinePresence();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hh = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dd = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const cells: Array<{ icon: React.ElementType; label: string; value: string; tone?: 'ok' | 'warn' | 'primary' }> = [
    { icon: ShieldCheck, label: 'Status', value: 'OPERACIONAL', tone: 'ok' },
    { icon: Radio, label: 'Rede', value: 'ONLINE', tone: 'primary' },
    { icon: Signal, label: 'Enlace', value: '24/7 · SEGURO' },
    { icon: Users, label: 'Agentes', value: `${online} conectados` },
    { icon: Activity, label: 'Setor', value: 'FEIJÓ · AC' },
    { icon: Clock3, label: 'UTC-5', value: `${hh} · ${dd}` },
  ];

  return (
    <div className="relative w-full border-y border-border/60 bg-[linear-gradient(180deg,hsl(215_55%_6%/0.92)_0%,hsl(217_62%_4%/0.98)_100%)] backdrop-blur-md">
      {/* Gold hairline top */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.6),transparent)]" />
      {/* Micro-grid */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-2 sm:px-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 divide-x divide-border/40">
          {cells.map((c, i) => {
            const Icon = c.icon;
            const toneClass =
              c.tone === 'ok'
                ? 'text-success'
                : c.tone === 'warn'
                ? 'text-warning'
                : c.tone === 'primary'
                ? 'text-primary'
                : 'text-foreground/85';
            return (
              <div
                key={i}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 min-w-0"
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${toneClass}`} strokeWidth={2.2} />
                <div className="min-w-0 leading-tight">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.24em] text-muted-foreground/70 font-mono truncate">
                    {c.label}
                  </div>
                  <div className={`text-[10.5px] sm:text-[11px] font-semibold tracking-wider font-mono truncate ${toneClass}`}>
                    {c.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gold hairline bottom */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.35),transparent)]" />
    </div>
  );
}

export default CommandCenterBar;
