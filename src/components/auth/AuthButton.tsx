import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type AuthButtonVariant = 'primary' | 'master' | 'admin' | 'register' | 'secondary';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AuthButtonVariant;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles = {
  primary: {
    bg: 'from-blue-600 via-blue-500 to-cyan-500',
    hover: 'hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400',
    shadow: 'shadow-blue-500/30 hover:shadow-blue-400/40',
    text: 'text-white',
  },
  master: {
    bg: 'from-amber-500 via-orange-500 to-yellow-500',
    hover: 'hover:from-amber-400 hover:via-orange-400 hover:to-yellow-400',
    shadow: 'shadow-amber-500/30 hover:shadow-amber-400/40',
    text: 'text-slate-900',
  },
  admin: {
    bg: 'from-indigo-500 via-purple-500 to-violet-500',
    hover: 'hover:from-indigo-400 hover:via-purple-400 hover:to-violet-400',
    shadow: 'shadow-indigo-500/30 hover:shadow-indigo-400/40',
    text: 'text-white',
  },
  register: {
    bg: 'from-cyan-600 via-teal-500 to-emerald-500',
    hover: 'hover:from-cyan-500 hover:via-teal-400 hover:to-emerald-400',
    shadow: 'shadow-cyan-500/30 hover:shadow-cyan-400/40',
    text: 'text-white',
  },
  secondary: {
    bg: 'from-slate-700 to-slate-600',
    hover: 'hover:from-slate-600 hover:to-slate-500',
    shadow: 'shadow-slate-500/20',
    text: 'text-white',
  },
};

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', loading, loadingText, icon, children, disabled, ...props }, ref) => {
    const styles = variantStyles[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          "relative w-full h-14 rounded-xl font-bold text-lg",
          "transition-all duration-300 ease-out",
          // Gradient background
          "bg-gradient-to-r",
          styles.bg,
          styles.hover,
          // Shadow
          "shadow-lg",
          styles.shadow,
          // Text
          styles.text,
          // Active/disabled states
          "active:scale-[0.98]",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          // Hover transform
          "hover:translate-y-[-1px]",
          "disabled:hover:translate-y-0",
          className
        )}
        {...props}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        </div>
        
        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {loadingText || children}
            </>
          ) : (
            <>
              {icon}
              {children}
            </>
          )}
        </span>
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';
