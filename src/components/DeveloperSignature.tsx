import { cn } from '@/lib/utils';

interface DeveloperSignatureProps {
  className?: string;
  compact?: boolean;
}

/**
 * Assinatura profissional do desenvolvedor.
 * SVG animado com traço "handwritten" — não altera dimensões do container pai.
 * Franc D'nis · Agente Socioeducativo · Feijó/AC
 */
export function DeveloperSignature({ className, compact = false }: DeveloperSignatureProps) {
  return (
    <div
      className={cn(
        'group relative inline-flex items-center gap-1.5 leading-none select-none',
        'text-muted-foreground/70 hover:text-primary transition-colors duration-500',
        className,
      )}
      title="Desenvolvido por Franc D'nis · Agente Socioeducativo · Feijó/AC"
      aria-label="Desenvolvido por Franc D'nis, Agente Socioeducativo, Feijó, AC"
    >
      {/* Monogram seal */}
      <svg
        viewBox="0 0 32 32"
        className={cn(
          'shrink-0 drop-shadow-[0_0_4px_hsl(var(--primary)/0.4)]',
          compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
        )}
        aria-hidden
      >
        <defs>
          <linearGradient id="sig-seal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Hex frame */}
        <path
          d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
          fill="none"
          stroke="url(#sig-seal)"
          strokeWidth="1.2"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        />
        {/* Inner rotating ring */}
        <circle
          cx="16"
          cy="16"
          r="6.5"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.6"
          strokeDasharray="2 3"
          className="opacity-50 origin-center [animation:sig-spin_18s_linear_infinite]"
        />
        {/* Monogram FD */}
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fill="hsl(var(--primary))"
          className="drop-shadow-[0_0_2px_hsl(var(--primary)/0.6)]"
        >
          FD
        </text>
      </svg>

      {/* Handwritten signature */}
      <svg
        viewBox="0 0 140 22"
        className={cn(
          'shrink-0 overflow-visible',
          compact ? 'h-3.5 w-auto' : 'h-4 w-auto',
        )}
        aria-hidden
      >
        <defs>
          <linearGradient id="sig-ink" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {/* Handwritten "Franc D'nis" — stylized script path */}
        <path
          d="M2 16 C 4 6, 10 4, 12 14 C 13 18, 14 12, 16 8 L 18 16 M 20 10 C 22 6, 26 8, 24 14 M 28 14 C 30 8, 34 8, 34 14 L 34 10 M 38 14 C 40 8, 44 10, 42 14 Q 40 16, 44 16 M 50 6 L 50 16 M 54 10 C 56 6, 60 8, 60 14 C 60 18, 54 18, 54 14 M 66 4 L 66 16 M 66 10 C 70 6, 74 8, 74 14 C 74 20, 66 20, 66 14 M 79 8 L 78 10 M 80 12 L 79 16 M 84 16 L 84 10 C 86 6, 90 8, 90 14 L 90 16 M 94 10 L 94 16 M 94 8 L 94 7 M 98 16 C 100 8, 106 10, 104 14 Q 102 16, 106 16"
          fill="none"
          stroke="url(#sig-ink)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="400"
          strokeDashoffset="0"
          className="[filter:drop-shadow(0_0_2px_hsl(var(--primary)/0.35))]"
        />
        {/* Underline flourish */}
        <path
          d="M 4 20 Q 55 22, 108 19 T 112 18"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Ending dot */}
        <circle cx="112" cy="18" r="0.9" fill="hsl(var(--primary))" />
      </svg>

      {/* Credential line */}
      <span
        className={cn(
          'font-sans tracking-[0.18em] uppercase whitespace-nowrap',
          compact ? 'text-[8px]' : 'text-[9px]',
        )}
      >
        <span className="text-foreground/80 font-semibold">Franc D'nis</span>
        <span className="text-muted-foreground/50 mx-1">·</span>
        <span className="hidden sm:inline">Ag. Socioeducativo</span>
        <span className="sm:hidden">Ag. Socioed.</span>
        <span className="text-muted-foreground/50 mx-1">·</span>
        <span className="text-primary/80">Feijó/AC</span>
      </span>

      <style>{`
        @keyframes sig-spin {
          from { transform: rotate(0deg); transform-origin: 16px 16px; }
          to { transform: rotate(360deg); transform-origin: 16px 16px; }
        }
      `}</style>
    </div>
  );
}
