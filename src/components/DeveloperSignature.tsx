import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface DeveloperSignatureProps {
  className?: string;
  compact?: boolean;
}

/**
 * Assinatura tática do desenvolvedor — inline, sem aumentar altura do container.
 * Franc D'nis (manuscrito) · [Agente Socioeducativo] · Feijó/AC
 */
export function DeveloperSignature({ className, compact = false }: DeveloperSignatureProps) {
  return (
    <div
      className={cn(
        'group inline-flex items-center gap-2 leading-none select-none whitespace-nowrap',
        'text-muted-foreground/80 transition-colors duration-500',
        className,
      )}
      title="Desenvolvido por Franc D'nis · Agente Socioeducativo · Feijó/AC"
      aria-label="Desenvolvido por Franc D'nis, Agente Socioeducativo, Feijó, AC"
    >
      {/* DEV// tag */}
      <span
        className={cn(
          'font-mono uppercase tracking-[0.22em] text-muted-foreground/50',
          compact ? 'text-[8px]' : 'text-[9px]',
        )}
      >
        DEV//
      </span>

      {/* Handwritten name — SVG */}
      <svg
        viewBox="0 0 120 20"
        className={cn('shrink-0 overflow-visible', compact ? 'h-3.5 w-auto' : 'h-4 w-auto')}
        aria-hidden
      >
        <defs>
          <linearGradient id="sig-ink-hw" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            <stop offset="55%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Stylized script "Franc D'nis" */}
        <path
          d="M2 15 C 3 6, 8 3, 10 13 C 11 17, 12 11, 14 7 L 16 15 M 19 9 C 21 5, 25 7, 23 13 M 27 13 C 29 7, 33 7, 33 13 L 33 9 M 37 13 C 39 7, 43 9, 41 13 Q 39 15, 43 15 M 49 5 L 49 15 M 53 9 C 55 5, 59 7, 59 13 C 59 17, 53 17, 53 13 M 66 3 L 66 15 M 66 9 C 70 5, 74 7, 74 13 C 74 19, 66 19, 66 13 M 79 7 L 78 9 M 80 11 L 79 15 M 84 15 L 84 9 C 86 5, 90 7, 90 13 L 90 15 M 94 9 L 94 15 M 94 7 L 94 6 M 98 15 C 100 7, 106 9, 104 13 Q 102 15, 106 15"
          fill="none"
          stroke="url(#sig-ink-hw)"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[filter:drop-shadow(0_0_2px_hsl(var(--primary)/0.4))]"
        />
        {/* Flourish underline */}
        <path
          d="M 3 18 Q 55 20, 106 17 T 110 16"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="110" cy="16" r="0.9" fill="hsl(var(--primary))" />
      </svg>

      {/* Profession bracketed */}
      <span
        className={cn(
          'inline-flex items-center gap-1 font-mono uppercase tracking-[0.18em]',
          compact ? 'text-[8px]' : 'text-[9px]',
        )}
      >
        <span className="text-amber-500/80 font-bold">[</span>
        <span className="text-foreground/75">
          <span className="hidden sm:inline">Agente Socioeducativo</span>
          <span className="sm:hidden">Ag. Socioed.</span>
        </span>
        <span className="text-amber-500/80 font-bold">]</span>
      </span>

      {/* Location with pin */}
      <span
        className={cn(
          'inline-flex items-center gap-1 pl-2 border-l border-border/50 font-mono tracking-[0.18em] text-primary/85',
          compact ? 'text-[8px]' : 'text-[9px]',
        )}
      >
        <MapPin className="h-2.5 w-2.5" strokeWidth={2.5} />
        FEIJÓ/AC
      </span>
    </div>
  );
}
