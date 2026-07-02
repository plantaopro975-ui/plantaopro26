import { useEffect, useState } from 'react';
import { Radio, Shield } from 'lucide-react';
import { SignalUplink } from './SignalUplink';


import { cn } from '@/lib/utils';
import bannerBg from '@/assets/institutional-banner-bg.jpg';
import logoPlantaoPro from '@/assets/logo-plantao-pro.png';

/**
 * CommandStrip — faixa institucional Noir & Gold.
 * Tipografia/cores alinhadas ao Header e Footer.
 * Triple-click no brasão abre o login master (com feedback visual).
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
      {/* Overlay quente (âmbar/caqui) para contraste com foto golden hour */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,hsl(28_35%_6%/0.94)_0%,hsl(32_28%_10%/0.72)_55%,hsl(28_35%_6%/0.94)_100%)]"
      />

      {/* Warm gold accents */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,hsl(42_85%_55%)_30%,hsl(42_85%_55%)_70%,transparent_100%)] opacity-90"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      />

      <div className="relative flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-0 sm:h-14 min-h-12">
        {/* Brasão */}
        <div className="relative flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShieldClick}
            aria-label="Instituto Socioeducativo do Acre"
            title="ISE / Acre"
            className="group relative shrink-0 rounded-md p-0.5 ring-1 ring-border/60 hover:ring-primary/40 transition-all"
          >
            <div className="relative h-10 w-10 sm:h-9 sm:w-9 rounded-md bg-gradient-to-br from-card to-background flex items-center justify-center overflow-hidden">
              <img
                src={logoPlantaoPro}
                alt="PlantãoPro"
                className="h-full w-full object-contain p-0.5 drop-shadow-[0_0_6px_hsl(42_85%_55%/0.5)]"
              />
            </div>
          </button>

          {/* Identidade */}
          <div className="shrink-0 border-l border-amber-500/30 pl-3 leading-tight">
            <span className="block text-[15px] sm:text-[15px] font-bold text-amber-50 font-serif whitespace-nowrap tracking-wide">
              Comando <span className="text-amber-400 drop-shadow-[0_0_8px_hsl(42_85%_55%/0.35)]">Operacional</span>
            </span>
            <span className="hidden md:block text-[10px] text-muted-foreground/80 tracking-[0.18em] uppercase font-mono whitespace-nowrap">
              Gestão inteligente de plantões
            </span>
          </div>
        </div>

        {/* Relógio + radar + status */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto shrink-0">
          <div className="text-right leading-tight tabular-nums shrink-0">
            <div className="font-mono text-[15px] sm:text-[16px] font-semibold text-amber-50 tracking-tight whitespace-nowrap">
              {time}
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-mono whitespace-nowrap">
              {date}
            </div>
          </div>

          <SignalUplink />

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

