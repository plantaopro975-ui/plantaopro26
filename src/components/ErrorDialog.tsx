import { AlertTriangle, X, ShieldAlert, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'auth';
}

export function ErrorDialog({ open, onClose, title, message, type = 'error' }: ErrorDialogProps) {
  const config = {
    error: {
      icon: AlertTriangle,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/50',
      glowColor: 'shadow-red-500/20',
      gradientFrom: 'from-red-950/90',
      gradientTo: 'to-slate-950',
    },
    warning: {
      icon: ShieldAlert,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      glowColor: 'shadow-amber-500/20',
      gradientFrom: 'from-amber-950/90',
      gradientTo: 'to-slate-950',
    },
    auth: {
      icon: Lock,
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      glowColor: 'shadow-rose-500/20',
      gradientFrom: 'from-rose-950/90',
      gradientTo: 'to-slate-950',
    },
  };

  const { icon: Icon, iconBg, iconColor, borderColor, glowColor, gradientFrom, gradientTo } = config[type];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        className={cn(
          "sm:max-w-md border-2 shadow-2xl",
          borderColor,
          glowColor,
          `bg-gradient-to-br ${gradientFrom} via-slate-900 ${gradientTo}`
        )}
      >
        <DialogHeader className="space-y-4">
          {/* Animated Icon Container */}
          <div className="mx-auto relative">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center",
              iconBg,
              "animate-[pulse_2s_ease-in-out_infinite]"
            )}>
              <Icon className={cn("w-10 h-10", iconColor)} />
            </div>
            {/* Pulse rings */}
            <div className={cn(
              "absolute inset-0 rounded-2xl border-2 animate-ping opacity-30",
              borderColor
            )} />
          </div>
          
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            {title}
          </DialogTitle>
          
          <DialogDescription className="text-center text-base text-muted-foreground leading-relaxed px-4">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={onClose}
            className={cn(
              "w-full py-5 text-base font-bold transition-all duration-200",
              type === 'error' && "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white",
              type === 'warning' && "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white",
              type === 'auth' && "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white"
            )}
          >
            Entendido
          </Button>
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
