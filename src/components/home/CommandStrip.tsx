import { useEffect, useState } from 'react';
import { ShieldCheck, Radio, Shield } from 'lucide-react';

import { cn } from '@/lib/utils';
import bannerBg from '@/assets/institutional-banner-bg.jpg';

/**
 * CommandStrip — faixa institucional Noir & Gold.
 * Tipografia/cores alinhadas ao Header e Footer.
 * Triple-click no brasão abre o login master (com feedback visual).
 */
export function CommandStrip() {
  const [now, setNow] = useState<Date>(new Date());
  const [pulse, setPulse] = useState(0); // 0..3 progresso do triple-click
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleShieldClick = () => {
    const w = window as unknown as { __logoClicks?: number; __logoTimer?: number };
    w.__logoClicks = (w.__logoClicks || 0) + 1;
    setPulse(Math.min(w.__logoClicks, 3));
    if (w.__logoTimer) window.clearTimeout(w.__logoTimer);
    w.__logoTimer = window.setTimeout(() => {
      w.__logoClicks = 0;
      setPulse(0);
    }, 800);
    if ((w.__logoClicks ?? 0) >= 3) {
      w.__logoClicks = 0;
      setPulse(0);
      setConfirmed(true);
      window.dispatchEvent(new CustomEvent('open-master-login'));
      window.setTimeout(() => setConfirmed(false), 1600);
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
      className={cn(
        'relative mx-2 sm:mx-6 mt-0 overflow-hidden rounded-b-lg rounded-t-none',
        'border border-border/60 backdrop-blur-xl',
        'shadow-[0_8px_28px_-12px_hsl(222_60%_2%/0.85)]',
      )}
    >
      {/* Foto realista de fundo */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerBg})` }}
      />
      {/* Overlay Noir para legibilidade */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,hsl(222_38%_6%/0.95)_0%,hsl(220_32%_8%/0.78)_55%,hsl(222_38%_6%/0.95)_100%)]"
      />

      {/* Gold accents (mesmos do Header/Footer) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary))_30%,hsl(var(--primary))_70%,transparent_100%)] opacity-85"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2 px-3 sm:px-5 py-2.5 sm:py-3">
        {/* Brasão + triple-click */}
        <div className="relative flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleShieldClick}
            aria-label="Instituto Socioeducativo do Acre — toque 3× para acesso master"
            title="ISE / Acre"
            className={cn(
              'group relative shrink-0 rounded-md p-0.5 ring-1 transition-all',
              confirmed
                ? 'ring-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.35)]'
                : 'ring-border/60 hover:ring-primary/40',
            )}
          >
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-md bg-gradient-to-br from-card to-background flex items-center justify-center p-1">
              <Shield className="h-5 w-5 text-primary" strokeWidth={2.2} />
            </div>

            {/* Progresso do triple-click */}
            {pulse > 0 && !confirmed && (
              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-0.5 w-2 rounded-full transition-colors',
                      i < pulse ? 'bg-primary' : 'bg-border/60',
                    )}
                  />
                ))}
              </span>
            )}
          </button>

          {/* Confirmação */}
          {confirmed && (
            <span
              role="status"
              className="absolute -top-2 left-12 z-10 inline-flex items-center gap-1 rounded-md border border-primary/40 bg-background/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary shadow-md animate-in fade-in slide-in-from-top-1"
            >
              <ShieldCheck className="h-3 w-3" />
              Acesso Master
            </span>
          )}

          {/* Identidade (sem redundância com o Header) */}
          <div className="min-w-0 border-l border-border/50 pl-3 leading-tight">
            <span className="block text-[13px] sm:text-sm font-bold text-foreground font-serif truncate">
              Comando <span className="text-primary">Operacional</span>
            </span>
            <span className="hidden sm:block text-[10px] text-muted-foreground/80 tracking-wider uppercase font-mono">
              Gestão inteligente de plantões
            </span>
          </div>
        </div>

        {/* Espaçador flexível */}
        <div className="flex-1" />

        {/* Relógio + status (mesmo padrão do Footer) */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          <div className="text-right leading-tight">
            <div className="font-mono text-sm sm:text-base tabular-nums text-foreground">{time}</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
              {date}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-md bg-card/60 px-2.5 py-1 ring-1 ring-border/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-success/95">
              Ativo
            </span>
            <Radio className="h-3 w-3 text-success/70" />
          </div>
        </div>
      </div>
    </section>
  );
}
