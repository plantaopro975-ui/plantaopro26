import { AlertTriangle, ShieldAlert, Lock } from 'lucide-react';
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
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/40',
      btnBg: 'bg-red-600 hover:bg-red-500',
    },
    warning: {
      icon: ShieldAlert,
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      btnBg: 'bg-amber-600 hover:bg-amber-500',
    },
    auth: {
      icon: Lock,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      btnBg: 'bg-rose-600 hover:bg-rose-500',
    },
  };

  const { icon: Icon, iconBg, iconColor, borderColor, btnBg } = config[type];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        className={cn(
          "sm:max-w-xs p-4 gap-3 border bg-slate-900/95 backdrop-blur-sm",
          borderColor
        )}
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
            <DialogTitle className="text-base font-semibold text-foreground text-left">
              {title}
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pl-11">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end pt-1">
          <Button
            onClick={onClose}
            size="sm"
            className={cn("text-white font-medium", btnBg)}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
