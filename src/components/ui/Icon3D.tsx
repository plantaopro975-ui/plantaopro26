import { ComponentType, useState } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Pencil,
  MessageSquare,
  Lock,
  Unlock,
  Bell,
  LogOut,
  RefreshCw,
  Gift,
  User,
  Users,
  Shield,
  Calendar,
  Clock,
  Building2,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 3D asset imports (bundled + hashed by Vite, served with long cache)
import editAsset from '@/assets/icon-3d-edit.png';
import messageAsset from '@/assets/icon-3d-message.png';
import lockAsset from '@/assets/icon-3d-lock.png';
import bellAsset from '@/assets/icon-3d-bell.png';
import logoutAsset from '@/assets/icon-3d-logout.png';
import refreshAsset from '@/assets/icon-3d-refresh.png';
import giftAsset from '@/assets/icon-3d-gift.png';
import userAsset from '@/assets/icon-3d-user.png';
import typographyAsset from '@/assets/icon-3d-typography.png';
import teamAsset from '@/assets/icon3d-team.png';
import shieldAsset from '@/assets/icon3d-shield.png';
import calendarAsset from '@/assets/icon3d-calendar.png';
import clockAsset from '@/assets/icon3d-clock.png';
import buildingAsset from '@/assets/icon3d-building.png';

/** Semantic icon names → { asset, Lucide fallback } */
export const ICON_3D_MAP = {
  edit: { src: editAsset, fallback: Pencil },
  message: { src: messageAsset, fallback: MessageSquare },
  lock: { src: lockAsset, fallback: Lock },
  unlock: { src: lockAsset, fallback: Unlock },
  bell: { src: bellAsset, fallback: Bell },
  logout: { src: logoutAsset, fallback: LogOut },
  refresh: { src: refreshAsset, fallback: RefreshCw },
  gift: { src: giftAsset, fallback: Gift },
  user: { src: userAsset, fallback: User },
  typography: { src: typographyAsset, fallback: Type },
  team: { src: teamAsset, fallback: Users },
  shield: { src: shieldAsset, fallback: Shield },
  calendar: { src: calendarAsset, fallback: Calendar },
  clock: { src: clockAsset, fallback: Clock },
  building: { src: buildingAsset, fallback: Building2 },
} as const satisfies Record<string, { src: string; fallback: ComponentType<LucideProps> }>;

export type Icon3DName = keyof typeof ICON_3D_MAP;

interface Icon3DProps {
  /** Semantic name (preferred). Ex: `<Icon3D name="edit" />` */
  name?: Icon3DName;
  /** Legacy: direct PNG URL. Prefer `name`. */
  src?: string;
  /** Legacy: Lucide fallback when using `src`. Ignored with `name`. */
  fallback?: ComponentType<LucideProps>;
  /** Accessible label. Empty = decorative. */
  alt?: string;
  /** Size in px. Default 24. Use 16 in compact table buttons. */
  size?: number;
  className?: string;
  fallbackColor?: string;
}

/**
 * Icon3D — 3D isometric asset with semantic mapping.
 * - Native lazy loading (`loading="lazy"` + `decoding="async"`)
 * - Async decode + skeleton overlay
 * - Lucide fallback on error
 * - Perfectly centered for use inside compact buttons
 */
export function Icon3D({
  name,
  src: rawSrc,
  fallback: rawFallback,
  alt = '',
  size = 24,
  className,
  fallbackColor,
}: Icon3DProps) {
  const mapped = name ? ICON_3D_MAP[name] : undefined;
  const src = mapped?.src ?? rawSrc;
  const Fallback = mapped?.fallback ?? rawFallback;

  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  if (!src || status === 'error') {
    if (!Fallback) return null;
    return (
      <Fallback
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        width={size}
        height={size}
        color={fallbackColor}
        className={cn('inline-block shrink-0 align-middle', className)}
      />
    );
  }

  const dim = { width: size, height: size };

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center align-middle leading-none',
        className,
      )}
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
          'block object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-opacity duration-300',
          status === 'loaded' ? 'opacity-100' : 'opacity-0',
        )}
        style={dim}
      />
    </span>
  );
}
