import { forwardRef, useMemo, useState, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedCpfInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  value: string;
  rightIcon?: ReactNode;
  allowReveal?: boolean;
}

/**
 * MaskedCpfInput — professional CPF field with SVG shield glyph.
 * Digits are replaced by dots (•) as the user types; separators stay visible
 * to preserve the 000.000.000-00 shape. Optional eye toggle to reveal.
 */
export const MaskedCpfInput = forwardRef<HTMLInputElement, MaskedCpfInputProps>(
  ({ value, rightIcon, allowReveal = true, className, ...props }, ref) => {
    const [reveal, setReveal] = useState(false);

    const masked = useMemo(() => {
      if (reveal) return value;
      return value.replace(/\d/g, '•');
    }, [value, reveal]);

    return (
      <div className="relative group">
        {/* Left: professional SVG shield / CPF glyph */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10"
        >
          <svg
            viewBox="0 0 32 32"
            className="h-7 w-7 text-primary/85 drop-shadow-[0_0_6px_hsl(var(--primary)/0.45)]"
          >
            <defs>
              <linearGradient id="cpf-shield" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            {/* Shield */}
            <path
              d="M16 3 L27 7 V15 C27 22 22 27 16 29 C10 27 5 22 5 15 V7 Z"
              fill="url(#cpf-shield)"
              stroke="hsl(var(--primary))"
              strokeWidth="0.8"
              opacity="0.9"
            />
            {/* Inner id card */}
            <rect
              x="9"
              y="11"
              width="14"
              height="10"
              rx="1.5"
              fill="hsl(220 30% 6% / 0.85)"
              stroke="hsl(var(--primary))"
              strokeWidth="0.6"
            />
            {/* Portrait dot */}
            <circle cx="12.5" cy="14.5" r="1.5" fill="hsl(var(--primary))" opacity="0.9" />
            {/* Lines */}
            <rect x="15.5" y="13.5" width="6" height="0.9" rx="0.4" fill="hsl(var(--primary))" opacity="0.75" />
            <rect x="15.5" y="15.4" width="4.5" height="0.7" rx="0.35" fill="hsl(var(--primary))" opacity="0.55" />
            <rect x="10.5" y="18" width="11" height="0.8" rx="0.4" fill="hsl(var(--primary))" opacity="0.5" />
          </svg>
        </div>

        {/* Masked display overlay */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center',
            'font-mono tracking-[0.25em] text-xl text-white',
            'pl-12 pr-12',
          )}
        >
          {masked ? (
            <span className="[text-shadow:0_0_10px_hsl(var(--primary)/0.35)]">{masked}</span>
          ) : (
            <span className="text-slate-500 tracking-widest">•••.•••.•••-••</span>
          )}
        </div>

        {/* Real input (transparent text, visible caret) */}
        <input
          ref={ref}
          {...props}
          value={value}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className={cn(
            'relative w-full rounded-xl h-14 pl-12 pr-12',
            'bg-slate-800/80 border-2 border-slate-700/80',
            'focus:border-primary/70 focus:ring-0 focus:outline-none transition-colors duration-150',
            'text-transparent selection:bg-transparent caret-primary',
            'text-center font-mono tracking-[0.25em] text-xl',
            className,
          )}
        />

        {/* Right: reveal toggle or custom icon */}
        {rightIcon ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">{rightIcon}</div>
        ) : allowReveal ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setReveal((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label={reveal ? 'Ocultar CPF' : 'Mostrar CPF'}
          >
            {reveal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        ) : null}
      </div>
    );
  },
);

MaskedCpfInput.displayName = 'MaskedCpfInput';
