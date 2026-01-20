import { AlertTriangle, ShieldAlert, Lock, ShieldX } from 'lucide-react';
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
      headerBg: '',
    },
    warning: {
      icon: ShieldX,
      iconBg: 'bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-red-500/20',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
      headerBg: 'bg-gradient-to-r from-amber-950/50 via-orange-950/30 to-transparent',
    },
    auth: {
      icon: Lock,
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      btnBg: 'bg-rose-600 hover:bg-rose-500',
      headerBg: '',
    },
  };

  const { icon: Icon, iconBg, iconColor, borderColor, btnBg, headerBg } = config[type];
  const isWarning = type === 'warning';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent 
        className={cn(
          "sm:max-w-md p-0 gap-0 border-2 bg-slate-900/98 backdrop-blur-md overflow-hidden",
          borderColor,
          isWarning && "shadow-[0_0_30px_rgba(245,158,11,0.15)]"
        )}
      >
        {/* Tactical Header for Warning */}
        {isWarning && (
          <div className="bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-600/90 px-4 py-2 flex items-center gap-2 border-b border-amber-500/50">
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">
              Protocolo de Segurança
            </span>
            <div className="flex-1" />
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse delay-100" />
            </div>
          </div>
        )}
        
        <div className={cn("p-5", headerBg)}>
          <DialogHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl shrink-0 border",
                iconBg,
                isWarning ? "border-amber-500/30 shadow-lg shadow-amber-500/10" : "border-transparent"
              )}>
                <Icon className={cn(
                  "w-7 h-7",
                  iconColor,
                  isWarning && "drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                )} strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-1">
                <DialogTitle className={cn(
                  "text-lg font-bold text-left tracking-wide",
                  isWarning ? "text-amber-400" : "text-foreground"
                )}>
                  {title}
                </DialogTitle>
                {isWarning && (
                  <div className="flex items-center gap-2 text-xs text-amber-500/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="uppercase tracking-wider font-medium">Acesso Negado</span>
                  </div>
                )}
              </div>
            </div>
            
            <DialogDescription className={cn(
              "text-sm leading-relaxed whitespace-pre-line",
              isWarning ? "text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50" : "text-muted-foreground pl-14"
            )}>
              {message}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={onClose}
              size={isWarning ? "default" : "sm"}
              className={cn(
                "text-white font-bold uppercase tracking-wider",
                btnBg,
                isWarning && "px-6 shadow-lg"
              )}
            >
              {isWarning ? "Entendido" : "OK"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
