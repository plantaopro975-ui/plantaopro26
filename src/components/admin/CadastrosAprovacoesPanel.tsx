import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PendingApprovalsManager } from '@/components/admin/PendingApprovalsManager';
import { RecentRegistrationsAudit } from '@/components/admin/RecentRegistrationsAudit';
import { UserCheck, ShieldAlert } from 'lucide-react';

interface Props {
  onChange?: () => void;
}

/**
 * Painel unificado "Cadastros & Aprovações".
 * Substitui a divisão anterior entre a aba "Aprovações" e o bloco
 * "Auditoria de Novos Cadastros" que ficava dentro de "Auditoria",
 * eliminando a sobreposição de fluxos (pendente vs. auto-aprovado recente).
 *
 * Filtros:
 *  - Pendentes: cadastros com approval_status = 'pending'
 *  - Recentes:  todos os cadastros dos últimos 30 dias (auditoria retroativa)
 */
export function CadastrosAprovacoesPanel({ onChange }: Props) {
  const [tab, setTab] = useState<'pending' | 'recent'>('pending');

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'pending' | 'recent')} className="space-y-3">
      <TabsList className="h-9 p-0.5 bg-slate-900/60 border border-slate-800/80">
        <TabsTrigger value="pending" className="gap-2 h-8 text-xs uppercase tracking-wider">
          <UserCheck className="h-3.5 w-3.5" />
          Pendentes
        </TabsTrigger>
        <TabsTrigger value="recent" className="gap-2 h-8 text-xs uppercase tracking-wider">
          <ShieldAlert className="h-3.5 w-3.5" />
          Recentes (30d)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-0">
        <PendingApprovalsManager onApprovalChange={onChange} />
      </TabsContent>

      <TabsContent value="recent" className="mt-0">
        <RecentRegistrationsAudit daysWindow={30} onChange={onChange} />
      </TabsContent>
    </Tabs>
  );
}
