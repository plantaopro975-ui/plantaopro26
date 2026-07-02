import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound } from 'lucide-react';
import restrictedScene from '@/assets/restricted-access-scene.jpg';


interface RestrictedAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetLabel?: string;
}

export function RestrictedAccessDialog({ open, onOpenChange, targetLabel }: RestrictedAccessDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30 bg-background/95 backdrop-blur">
        {/* Cinematic banner */}
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={restrictedScene}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center">
            <div className="relative -mb-8 w-20 h-20 rounded-full bg-background ring-2 ring-primary/40 shadow-glow flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]" strokeWidth={2.2} />
            </div>
          </div>

        </div>

        <DialogHeader className="items-center text-center px-6 pt-12">
          <DialogTitle className="font-serif text-2xl tracking-wide">
            Área Restrita
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Acesso a <span className="text-foreground font-semibold">{targetLabel ?? 'esta seção'}</span> exige
            <span className="text-foreground font-semibold"> credenciais da sua equipe </span>
            (ALFA · BRAVO · CHARLIE · DELTA).
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-3">
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
