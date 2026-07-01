import { useEffect, useState } from 'react';
import iseAcreBadge from '@/assets/ise-acre-badge.png';

/**
 * Professional compact command strip — replaces the old InstitutionalBanner.
 * Noir & Gold editorial style, single row, low visual noise.
 * Triple-click on the shield still triggers the master login modal.
 */
export function CommandStrip() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleShieldClick = () => {
    const w = window as unknown as { __logoClicks?: number; __logoTimer?: number };
    w.__logoClicks = (w.__logoClicks || 0) + 1;
    if (w.__logoTimer) window.clearTimeout(w.__logoTimer);
    w.__logoTimer = window.setTimeout(() => {
      w.__logoClicks = 0;
    }, 800);
    if ((w.__logoClicks ?? 0) >= 3) {
      w.__logoClicks = 0;
      window.dispatchEvent(new CustomEvent('open-master-login'));
    }
  };

  const date = now.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <section
      aria-label="Faixa institucional"
      className="relative mx-3 sm:mx-6 mt-3 overflow-hidden rounded-lg border border-border/50 bg-[linear-gradient(180deg,hsl(var(--card)/0.85),hsl(var(--background)/0.75))] backdrop-blur-md"
    >
      {/* thin gold accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.7),transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.35),transparent)]"
      />

      <div className="relative flex items-center gap-4 px-4 sm:px-6 py-3">
        {/* Shield (triple-click preserved) */}
        <button
          type="button"
          onClick={handleShieldClick}
          className="group shrink-0 rounded-md p-0.5 ring-1 ring-border/60 hover:ring-primary/40 transition"
          title="ISE / Acre"
          aria-label="Instituto Socioeducativo do Acre"
        >
          <img
            src={iseAcreBadge}
            alt="Instituto Socioeducativo do Acre"
            draggable={false}
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]"
          />
        </button>

        {/* Identity */}
        <div className="min-w-0 flex-1 border-l border-border/50 pl-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-foreground">
              Plantão<span className="text-primary">Pro</span>
            </span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              · Comando Operacional
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground/80 truncate">
            Instituto Socioeducativo do Acre · Gestão inteligente de plantões
          </p>
        </div>

        {/* Clock + status */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <div className="text-right leading-tight">
            <div className="font-mono text-sm tabular-nums text-foreground">{time}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{date}</div>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400"
            aria-label="Sistema online"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Online
          </span>
        </div>
      </div>
    </section>
  );
}
