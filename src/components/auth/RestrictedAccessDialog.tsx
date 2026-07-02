import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound } from 'lucide-react';

interface RestrictedAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLabel?: string;
}

export function RestrictedAccessDialog({ open, onOpenChange, targetLabel }: RestrictedAccessDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-primary/30 bg-background/95 backdrop-blur">
        <DialogHeader className="items-center text-center">
          {/* SVG institucional */}
          <div className="relative mb-3">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="rag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
                </linearGradient>
              </defs>
              <path d="M48 6 L84 20 V44 C84 68 66 84 48 90 C30 84 12 68 12 44 V20 Z"
                fill="url(#rag)" stroke="hsl(var(--primary))" strokeWidth="2" />
              <path d="M48 12 L78 24 V44 C78 64 63 78 48 84 C33 78 18 64 18 44 V24 Z"
                fill="hsl(var(--background))" fillOpacity="0.35" />
              <g transform="translate(48 50)" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" fill="none">
                <rect x="-12" y="-4" width="24" height="20" rx="3" fill="hsl(var(--primary))" />
                <path d="M-7 -4 V-12 a7 7 0 0 1 14 0 V-4" />
                <circle cx="0" cy="6" r="2.5" fill="hsl(var(--primary-foreground))" />
              </g>
            </svg>
          </div>
          <DialogTitle className="font-serif text-2xl tracking-wide">
            Área Restrita
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            O acesso a <span className="text-foreground font-semibold">{targetLabel ?? 'esta seção'}</span> é
            exclusivo para agentes credenciados. Entre com as
            <span className="text-foreground font-semibold"> credenciais da sua equipe </span>
            (unidade/área — ALFA · BRAVO · CHARLIE · DELTA) para prosseguir com segurança.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-primary font-semibold mb-1">
              <ShieldAlert className="h-4 w-4" />
              Perímetro operacional protegido
            </div>
            Nenhuma informação sensível é exibida sem autenticação. Todos os acessos são registrados.
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate('/');
              }}
            >
              <KeyRound className="h-4 w-4" />
              Entrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
