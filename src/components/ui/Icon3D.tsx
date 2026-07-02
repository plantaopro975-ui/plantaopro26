import { ComponentType, useState } from 'react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Icon3DProps {
  /** URL do PNG 3D importado (ex: `import gift from '@/assets/icon-3d-gift.png'`). */
  src: string;
  /** Ícone Lucide de fallback caso o PNG falhe. Herda cor via currentColor. */
  fallback: ComponentType<LucideProps>;
  /** Rótulo acessível. Deixe vazio quando o ícone é decorativo. */
  alt?: string;
  /** Tamanho em px (largura = altura). Default: 24. */
  size?: number;
  className?: string;
  /** Cor do fallback Lucide (default `currentColor`). */
  fallbackColor?: string;
}

/**
 * Wrapper para ícones 3D isométricos.
 * - Skeleton com pulse dourado enquanto carrega
 * - Fallback automático para ícone Lucide se o asset falhar
 * - `loading="lazy"` + `decoding="async"` nativos
 */
export function Icon3D({
  src,
  fallback: Fallback,
  alt = '',
  size = 24,
  className,
  fallbackColor,
}: Icon3DProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const dim = { width: size, height: size };

  if (status === 'error') {
    return (
      <Fallback
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        width={size}
        height={size}
        color={fallbackColor}
        className={cn('shrink-0', className)}
      />
    );
  }

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={dim}
    >
      {status === 'loading' && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-md bg-amber-500/20 animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-opacity duration-300',
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        )}
        style={dim}
      />
    </span>
  );
}
