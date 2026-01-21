import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAgentCompletely } from '@/lib/deleteAgent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserMinus, ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface TeamUnlinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  currentTeam: string | null;
  currentUnitName: string | null;
  onSuccess: () => void;
  onRequestTransfer: () => void;
}

export function TeamUnlinkDialog({
  open,
  onOpenChange,
  agentId,
  agentName,
  currentTeam,
  currentUnitName,
  onSuccess,
  onRequestTransfer,
}: TeamUnlinkDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const { userRole, masterSession } = useAuth();

  const isAdmin = userRole === 'admin' || userRole === 'master' || !!masterSession;

  const handleUnlink = async () => {
    if (isAdmin) {
      toast({
        title: 'Ação não permitida',
        description: 'Administradores não podem excluir sua própria conta.',
        variant: 'destructive',
      });
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteAgentCompletely(agentId);
      await supabase.auth.signOut();

      toast({
        title: 'Conta Excluída',
        description: `Dados de ${agentName} removidos.`,
      });

      setShowConfirmation(false);
      onOpenChange(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Erro', description: 'Falha ao remover conta.', variant: 'destructive' });
      await supabase.auth.signOut();
      window.location.href = '/';
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">⚠️ Exclusão Permanente</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">Excluir todos os seus dados permanentemente?</p>
              <p className="text-destructive font-semibold">Esta ação NÃO pode ser desfeita!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Gerenciar Equipe</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block mb-2">
              Equipe <strong>{currentTeam}</strong>{currentUnitName && ` - ${currentUnitName}`}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-2 py-2">
          <Button variant="outline" className="justify-start gap-2 h-auto py-3" onClick={() => { onOpenChange(false); onRequestTransfer(); }}>
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="text-sm">Solicitar Transferência</span>
          </Button>
          
          {isAdmin ? (
            <Button variant="outline" disabled className="justify-start gap-2 h-auto py-3 opacity-50">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Auto-exclusão bloqueada</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="justify-start gap-2 h-auto py-3 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => setShowConfirmation(true)}
            >
              <UserMinus className="h-4 w-4" />
              <span className="text-sm">Excluir Minha Conta</span>
            </Button>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
