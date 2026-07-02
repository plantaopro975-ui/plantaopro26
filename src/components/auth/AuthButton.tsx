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

const variantStyles: Record<AuthButtonVariant, string> = {
  primary:   'bg-accent text-accent-foreground hover:bg-accent/90 border-accent/40',
  master:    'bg-amber-500 text-slate-900 hover:bg-amber-400 border-amber-400/40',
  admin:     'bg-indigo-500 text-white hover:bg-indigo-400 border-indigo-400/40',
  register:  'bg-emerald-500 text-white hover:bg-emerald-400 border-emerald-400/40',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600 border-slate-600/40',
};

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', loading, loadingText, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'relative w-full h-11 rounded-md font-medium text-sm tracking-wide border',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent/60',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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
