import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, MapPin, Cpu, Radio } from 'lucide-react';
import iseAcreBadge from '@/assets/ise-acre-badge.png';

interface CopyrightFooterProps {
  className?: string;
  compact?: boolean;
}

/**
 * Rodapé institucional do PlantãoPro — ISE/Acre
 * Design profissional com identidade institucional e selo do desenvolvedor.
 */
export const CopyrightFooter = forwardRef<HTMLDivElement, CopyrightFooterProps>(
  ({ className, compact = false }, ref) => {
    const year = new Date().getFullYear();

    if (compact) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full text-center py-1.5',
            'border-t border-primary/15 bg-slate-950/50 backdrop-blur-sm',
            className,
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#15803d,#facc15,hsl(var(--primary)),transparent)] opacity-70"
          />
          <p className="text-[9px] text-muted-foreground/70 flex items-center justify-center gap-1.5 font-medium tracking-wide">
            <ShieldCheck className="h-3 w-3 text-primary/80" />
            <span className="uppercase">ISE · Acre</span>
            <span className="text-muted-foreground/30">|</span>
            <span className="font-black bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
              FRANC D'NIS
            </span>
            <span className="text-muted-foreground/40">© {year}</span>
          </p>
        </div>
      );
    }

    return (
      <footer
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden',
          'border-t border-primary/20',
          'bg-[radial-gradient(120%_140%_at_50%_0%,hsl(220_30%_10%/0.95)_0%,hsl(222_28%_5%/0.98)_70%)]',
          'backdrop-blur-md',
          className,
        )}
      >
        {/* Top accent stripe */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#15803d_0%,#facc15_50%,hsl(var(--primary))_100%)] opacity-90"
        />
        {/* Subtle grid pattern */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow accent */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-[60%] rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Institutional Identity */}
            <div className="md:col-span-5 flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/25 blur-md" />
                <div className="relative h-12 w-12 rounded-full ring-1 ring-primary/40 bg-gradient-to-br from-slate-700/70 to-slate-900/80 flex items-center justify-center p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
                  <img
                    src={iseAcreBadge}
                    alt="Brasão ISE Acre"
                    className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-black tracking-[0.22em] text-primary uppercase">
                  Instituto Socioeducativo
                </span>
                <span className="text-[13px] font-bold text-foreground tracking-wide">
                  PlantãoPro · Sistema Oficial
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  Governo do Estado do Acre
                </span>
              </div>
            </div>

            {/* Center: status pills */}
            <div className="md:col-span-3 flex md:justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 ring-1 ring-slate-700/60">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-300/90">
                  Sistema Operacional
                </span>
                <Radio className="h-3 w-3 text-emerald-400/70" />
              </div>
            </div>

            {/* Developer credit */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end leading-tight gap-1">
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-amber-400/80" />
                <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/70 font-semibold">
                  Engenharia & Desenvolvimento
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-base font-black tracking-[0.18em] bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent"
                  style={{ textShadow: '0 0 16px hsl(var(--primary) / 0.35)' }}
                >
                  FRANC D'NIS
                </span>
                <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-black tracking-widest bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                  v2.6
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground/60 tracking-wide">
                Feijó · AC · © {year} PlantãoPro — Todos os direitos reservados
              </p>
            </div>
          </div>

          {/* Bottom hairline */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-muted-foreground/50">
            <span className="tracking-wider uppercase">
              Uso restrito a servidores autorizados · LGPD compliant
            </span>
            <span className="flex items-center gap-1.5 tracking-wider">
              <ShieldCheck className="h-3 w-3 text-primary/70" />
              Conexão criptografada · TLS 1.3
            </span>
          </div>
        </div>
      </footer>
    );
  },
);

CopyrightFooter.displayName = 'CopyrightFooter';
