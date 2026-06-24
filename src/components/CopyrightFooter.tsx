import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, MapPin } from 'lucide-react';
import iseAcreBadge from '@/assets/ise-acre-badge.png';

interface CopyrightFooterProps {
  className?: string;
  compact?: boolean;
}

/**
 * Rodapé institucional do PlantãoPro — ISE/Acre
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
            'border-t border-primary/15 bg-slate-950/40 backdrop-blur-sm',
            className,
          )}
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#15803d,#facc15,hsl(var(--primary)),transparent)] opacity-70" />
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
          'relative w-full',
          'border-t border-primary/20',
          'bg-[linear-gradient(180deg,hsl(220_25%_8%/0.85),hsl(222_22%_5%/0.95))]',
          'backdrop-blur-md',
          className,
        )}
      >
        {/* Institutional accent stripe */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#15803d_0%,#facc15_50%,hsl(var(--primary))_100%)] opacity-80"
        />

        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Institutional block */}
          <div className="flex items-center gap-3">
            <img
              src={iseAcreBadge}
              alt="ISE Acre"
              className="h-8 w-8 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            />
            <div className="flex flex-col leading-tight text-left">
              <span className="text-[10px] font-black tracking-[0.22em] text-primary uppercase">
                Instituto Socioeducativo · Acre
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                Governo do Estado do Acre · Sistema de Plantões
              </span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

          {/* Developer credit */}
          <div className="flex flex-col items-center sm:items-end leading-tight">
            <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5 font-medium tracking-wide">
              <span className="uppercase text-[9px] tracking-[0.18em]">Desenvolvido por</span>
              <span
                className="font-black tracking-wider bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent"
                style={{ textShadow: '0 0 12px hsl(var(--primary) / 0.3)' }}
              >
                FRANC D'NIS
              </span>
            </p>
            <p className="text-[9px] text-muted-foreground/50 tracking-wide">
              Feijó · AC · © {year} PlantãoPro — Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    );
  },
);

CopyrightFooter.displayName = 'CopyrightFooter';
