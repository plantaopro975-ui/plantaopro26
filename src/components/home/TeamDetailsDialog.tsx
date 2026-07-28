import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type TeamKey = 'alfa' | 'bravo' | 'charlie' | 'delta';

export interface TeamDetail {
  key: TeamKey;
  label: string;
  role: string;
  hero: string;
  glowRgb: string;
  status: 'ativo' | 'stand-by';
  agents: number;
  shift: string;
  jurisdiction: string;
  nextRound: string;
}

interface Props {
  team: TeamDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (team: TeamKey) => void;
}

export function TeamDetailsDialog({ team, open, onOpenChange, onSelect }: Props) {
  if (!team) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden bg-[#0f0f18] border-[#1f1f2e]">
        {/* Hero header */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={team.hero}
            alt={`Equipamento equipe ${team.label}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            width={768}
            height={1024}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-[#0f0f18]/60 to-transparent" />
          <div
            className="absolute inset-0 opacity-50 mix-blend-screen"
            style={{ background: `radial-gradient(ellipse at 20% 60%, rgba(${team.glowRgb},0.45), transparent 65%)` }}
          />
          <div className="absolute bottom-3 left-4 right-4 z-10">
            <DialogHeader className="space-y-0 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300/80">Equipe</p>
              <DialogTitle
                className="text-2xl font-bold text-white leading-none"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {team.label}
              </DialogTitle>
              <DialogDescription
                className="mt-1 text-[11px] font-bold uppercase tracking-widest"
                style={{ color: `rgb(${team.glowRgb})` }}
              >
                {team.role}
              </DialogDescription>
            </DialogHeader>
          </div>
          <span className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-black/60 backdrop-blur-sm border border-white/10 px-2 py-1">
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              team.status === 'ativo' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400',
            )} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-200">
              {team.status === 'ativo' ? 'Operacional' : 'Stand-by'}
            </span>
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 font-['DM_Sans']">
          <div className="grid grid-cols-2 gap-2">
            <StatCell label="Efetivo" value={`${team.agents} agentes`} />
            <StatCell label="Turno" value={team.shift} />
            <StatCell label="Jurisdição" value={team.jurisdiction} />
            <StatCell label="Próxima Ronda" value={team.nextRound} highlight={team.glowRgb} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-md border border-[#1f1f2e] bg-[#141420] text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:bg-[#1a1a2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={() => { onSelect(team.key); onOpenChange(false); }}
              className="h-10 rounded-md bg-[hsl(var(--primary))] text-black text-[11px] font-bold uppercase tracking-widest hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
            >
              Assumir Turno
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCell({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="bg-[#0a0a0f] border border-[#1f1f2e] rounded-md p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p
        className="text-sm font-bold text-white"
        style={highlight ? { color: `rgb(${highlight})` } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

export default TeamDetailsDialog;
