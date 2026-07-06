import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface StartLockConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  color: string;
  teamName: string;
  agentCount: number;
  totalDurationLabel: string;
  silent?: boolean;
}

/**
 * Professional pre-start confirmation.
 * Warns the agent that once confirmed, the countdown CANNOT be paused
 * or reset until it fully completes. Pure SVG artwork — no icon fonts.
 */
export function StartLockConfirmDialog({
  open,
  onCancel,
  onConfirm,
  color,
  teamName,
  agentCount,
  totalDurationLabel,
  silent = false,
}: StartLockConfirmDialogProps) {
  const [countdown, setCountdown] = useState(3);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) { setCountdown(3); setArmed(false); return; }
    setCountdown(3); setArmed(false);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { window.clearInterval(id); setArmed(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent
        className="max-w-md p-0 overflow-hidden border-2 bg-slate-950"
        style={{ borderColor: `${color}80`, boxShadow: `0 0 80px -20px ${color}` }}
      >
        {/* Top hazard stripe */}
        <div
          className="relative h-11 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${color}22, ${color}66, ${color}22)` }}
        >
          {!silent && (
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, ${color} 0 10px, transparent 10px 22px)`,
                animation: 'startStripe 1.4s linear infinite',
              }}
            />
          )}
          <div
            className="relative font-mono text-[11px] font-bold tracking-[0.36em] uppercase"
            style={{ color }}
          >
            Confirmação de Início
          </div>
        </div>

        {/* Emblem */}
        <div className="flex justify-center pt-6 pb-2">
          <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden>
            <defs>
              <radialGradient id="slcd-dome" cx="35%" cy="28%" r="80%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="20%" stopColor={color} stopOpacity="0.95" />
                <stop offset="65%" stopColor={color} stopOpacity="0.45" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <radialGradient id="slcd-gloss" cx="35%" cy="22%" r="42%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="slcd-gold" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="55%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <filter id="slcd-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Outer rotating ticks */}
            <g
              style={{
                transformOrigin: '60px 60px',
                animation: silent ? undefined : 'slcdSpin 12s linear infinite',
              }}
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i * 360) / 24;
                const long = i % 6 === 0;
                return (
                  <line
                    key={i}
                    x1="60" y1="6" x2="60" y2={long ? 14 : 11}
                    stroke={color}
                    strokeOpacity={long ? 0.9 : 0.35}
                    strokeWidth={long ? 1.4 : 0.8}
                    strokeLinecap="round"
                    transform={`rotate(${a} 60 60)`}
                  />
                );
              })}
            </g>

            {/* Shield */}
            <path
              d="M60 18 L94 30 V60 C94 80 80 92 60 100 C40 92 26 80 26 60 V30 Z"
              fill="url(#slcd-dome)"
              stroke={color}
              strokeWidth="1.4"
              strokeOpacity="0.9"
              filter="url(#slcd-glow)"
            />
            <path
              d="M60 18 L94 30 V44 C94 47 80 50 60 50 C40 50 26 47 26 44 V30 Z"
              fill="url(#slcd-gloss)"
            />

            {/* Padlock body */}
            <rect x="48" y="60" width="24" height="20" rx="3"
              fill="url(#slcd-gold)" stroke="#78350f" strokeWidth="0.8" />
            {/* Padlock shackle */}
            <path
              d="M52 60 V54 a8 8 0 0 1 16 0 V60"
              fill="none" stroke="url(#slcd-gold)" strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M52 60 V54 a8 8 0 0 1 16 0 V60"
              fill="none" stroke="#fef3c7" strokeOpacity="0.6" strokeWidth="0.9"
              strokeLinecap="round"
            />
            {/* keyhole */}
            <circle cx="60" cy="68" r="2.2" fill="#0b0f17" />
            <rect x="59" y="69" width="2" height="6" fill="#0b0f17" />
          </svg>
        </div>

        <div className="px-6 pb-6 text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-slate-500 mb-1">
            Protocolo Operacional 07
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-100 leading-tight">
            Ao confirmar, a contagem <span style={{ color }}>não poderá ser interrompida</span>
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
            Iniciar a ronda sela a ordem dos agentes e a cadência de tempo.
            Pausar ou reiniciar comprometeria a dinâmica operacional, por isso
            o sistema bloqueará quaisquer tentativas até o término.
          </p>

          {/* Mission facts */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Fact label="Equipe" value={teamName} color={color} />
            <Fact label="Agentes" value={String(agentCount)} color={color} />
            <Fact label="Duração" value={totalDurationLabel} color={color} />
          </div>

          {/* Rules */}
          <ul className="mt-4 space-y-1.5 text-left text-[12px] text-slate-300/90">
            <Rule color={color}>Pause e Reset ficam bloqueados durante toda a ronda.</Rule>
            <Rule color={color}>O modo silêncio permanece disponível a qualquer momento.</Rule>
            <Rule color={color}>Ao final, um resumo profissional libera os controles.</Rule>
          </ul>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-md border border-slate-700/70 bg-slate-900/60 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 hover:text-slate-100 hover:border-slate-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!armed}
              onClick={onConfirm}
              className={cn(
                'relative h-11 rounded-md border font-mono text-[11px] uppercase tracking-[0.18em] transition-all overflow-hidden',
                !armed && 'opacity-70 cursor-not-allowed',
              )}
              style={{
                borderColor: `${color}`,
                background: armed
                  ? `linear-gradient(180deg, ${color}, ${color}cc)`
                  : `${color}22`,
                color: armed ? '#0b0f17' : color,
                boxShadow: armed ? `0 0 24px -6px ${color}` : undefined,
              }}
            >
              {armed ? 'Confirmar e Iniciar' : `Aguarde ${countdown}s`}
              {!armed && !silent && (
                <span
                  className="absolute left-0 bottom-0 h-[2px]"
                  style={{
                    backgroundColor: color,
                    width: `${((3 - countdown) / 3) * 100}%`,
                    transition: 'width 1s linear',
                  }}
                />
              )}
            </button>
          </div>

          <p className="mt-4 font-mono text-[10px] tracking-[0.28em] uppercase text-slate-600">
            Disciplina é segurança
          </p>
        </div>

        <style>{`
          @keyframes startStripe { from { background-position: 0 0 } to { background-position: 44px 0 } }
          @keyframes slcdSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        `}</style>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Fact({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-md border bg-slate-900/60 py-2 px-1"
      style={{ borderColor: `${color}40` }}
    >
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-slate-100 truncate" title={value}>{value}</div>
    </div>
  );
}

function Rule({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden>
        <circle cx="8" cy="8" r="7" fill="none" stroke={color} strokeOpacity="0.6" strokeWidth="1" />
        <path d="M4.5 8.2 L7 10.5 L11.5 5.8" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default StartLockConfirmDialog;
