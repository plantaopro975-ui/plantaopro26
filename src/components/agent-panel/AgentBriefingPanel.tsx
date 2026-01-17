import { ProfessionalShiftTimer } from '@/components/agent-panel/ProfessionalShiftTimer';
import { AgentUpcomingCard } from '@/components/agent-panel/AgentUpcomingCard';
import { Shield, Target } from 'lucide-react';

interface AgentBriefingPanelProps {
  agentId: string;
}

export function AgentBriefingPanel({ agentId }: AgentBriefingPanelProps) {
  return (
    <section className="bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 rounded-xl border-2 border-amber-500/25 shadow-2xl backdrop-blur-md p-3 md:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <Shield className="h-4 w-4 text-black" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-amber-100 tracking-wide">BRIEFING OPERACIONAL</h2>
            <p className="text-[10px] text-amber-400/70 uppercase tracking-widest">Situação atual</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">PRIORIDADE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* 1) Se em plantão: cronômetro. Se não: próximo plantão bem destacado (componente já faz isso) */}
        <ProfessionalShiftTimer agentId={agentId} compact={true} />

        {/* 2) Alertas próximos: BH / folga / férias / agenda */}
        <AgentUpcomingCard agentId={agentId} />
      </div>
    </section>
  );
}
