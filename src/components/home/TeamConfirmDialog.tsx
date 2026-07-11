import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';

interface TeamConfirmDialogProps {
  open: boolean;
  color: string;
  teamLabel: string;
  agentCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmação profissional (SVG puro) para travar a equipe da ronda.
 * Uma vez confirmada, a equipe não pode mais ser trocada enquanto houver
 * ronda em andamento ou programação agendada.
 */
export function TeamConfirmDialog({
  open,
  color,
  teamLabel,
  agentCount,
  onCancel,
  onConfirm,
}: TeamConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent
        className="max-w-sm p-0 overflow-hidden border-2 bg-slate-950"
        style={{ borderColor: `${color}80`, boxShadow: `0 0 60px -20px ${color}` }}
      >
        {/* Faixa superior */}
        <div
          className="relative h-10 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${color}22, ${color}55, ${color}22)` }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 10px, transparent 10px 22px)`,
            }}
          />
          <div className="relative font-mono text-[10.5px] font-bold tracking-[0.34em] uppercase" style={{ color }}>
            Confirmação de Equipe
          </div>
        </div>

        {/* Emblema — escudo tático SVG */}
        <div className="flex justify-center pt-5 pb-1">
          <svg viewBox="0 0 120 120" className="h-20 w-20" aria-hidden>
            <defs>
              <radialGradient id="tcd-dome" cx="35%" cy="28%" r="80%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="25%" stopColor={color} stopOpacity="0.9" />
                <stop offset="75%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <linearGradient id="tcd-metal" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <filter id="tcd-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Escudo */}
            <path
              d="M60 10 L100 24 V60 C100 84 82 102 60 110 C38 102 20 84 20 60 V24 Z"
              fill="url(#tcd-dome)"
              stroke={color}
              strokeWidth="1.4"
              filter="url(#tcd-glow)"
            />
            {/* Contorno interno metálico */}
            <path
              d="M60 20 L92 30 V60 C92 78 78 94 60 100 C42 94 28 78 28 60 V30 Z"
              fill="none"
              stroke="url(#tcd-metal)"
              strokeOpacity="0.6"
              strokeWidth="0.8"
            />
            {/* Check central */}
            <path
              d="M44 60 L56 72 L78 48"
              fill="none"
              stroke="#f8fafc"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ticks laterais */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1={30 + i * 20} y1="112" x2={34 + i * 20} y2="112"
                stroke={color} strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        <div className="px-6 pb-6 text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-slate-500 mb-1">
            Protocolo de Composição
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-100 leading-tight">
            Confirmar equipe <span style={{ color }}>{teamLabel}</span>?
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
            Após a confirmação, a equipe fica <b className="text-slate-200">travada</b>.
            Não será possível trocá-la enquanto a ronda estiver em andamento ou
            houver programação agendada.
          </p>

          {/* Fatos */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Fact label="Equipe" value={teamLabel} color={color} />
            <Fact label="Agentes" value={String(agentCount)} color={color} />
          </div>

          {/* Ações */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-md border border-slate-700/70 bg-slate-900/60 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 hover:text-slate-100 hover:border-slate-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-10 rounded-md border font-mono text-[11px] uppercase tracking-[0.18em] transition-all"
              style={{
                borderColor: color,
                background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                color: '#0b0f17',
                boxShadow: `0 0 20px -6px ${color}`,
              }}
            >
              Confirmar
            </button>
          </div>

          <p className="mt-4 font-mono text-[10px] tracking-[0.28em] uppercase text-slate-600">
            Uma equipe, uma missão
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Fact({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-md border bg-slate-900/60 py-2 px-1" style={{ borderColor: `${color}40` }}>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-slate-100 truncate" title={value}>{value}</div>
    </div>
  );
}

export default TeamConfirmDialog;
