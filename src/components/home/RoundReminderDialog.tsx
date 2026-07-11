import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';

interface RoundReminderDialogProps {
  open: boolean;
  onDismiss: () => void;
  onOpenRounds: () => void;
  intervalMin?: number;
}

/**
 * Lembrete profissional (SVG puro) exibido a cada 30 minutos para
 * relembrar o operador de fazer a próxima ronda. Alto contraste,
 * ícone de sino tático e ações claras (Adiar / Fazer ronda agora).
 */
export function RoundReminderDialog({
  open,
  onDismiss,
  onOpenRounds,
  intervalMin = 30,
}: RoundReminderDialogProps) {
  const accent = '#f59e0b'; // âmbar tático

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onDismiss()}>
      <AlertDialogContent
        className="max-w-md p-0 overflow-hidden border-2 bg-slate-950"
        style={{ borderColor: `${accent}90`, boxShadow: `0 0 80px -18px ${accent}` }}
      >
        {/* Faixa superior pulsante */}
        <div
          className="relative h-11 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(90deg, ${accent}22, ${accent}77, ${accent}22)` }}
        >
          <div
            className="absolute inset-0 opacity-25 animate-pulse"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0 10px, transparent 10px 22px)`,
            }}
          />
          <div className="relative font-mono text-[11px] font-black tracking-[0.38em] uppercase" style={{ color: accent }}>
            Alerta Operacional
          </div>
        </div>

        {/* Emblema SVG — sino tático */}
        <div className="flex justify-center pt-6 pb-2">
          <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden>
            <defs>
              <radialGradient id="rrd-dome" cx="35%" cy="28%" r="80%">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
                <stop offset="30%" stopColor={accent} stopOpacity="0.95" />
                <stop offset="80%" stopColor={accent} stopOpacity="0.35" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <linearGradient id="rrd-metal" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <filter id="rrd-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Anel externo pulsante */}
            <circle cx="60" cy="60" r="54" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="1">
              <animate attributeName="r" values="52;56;52" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.5;0.15;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* Disco de fundo */}
            <circle cx="60" cy="60" r="46" fill="url(#rrd-dome)" filter="url(#rrd-glow)" />

            {/* Sino */}
            <g transform="translate(60 58)">
              <path
                d="M0 -22 C-14 -22 -20 -12 -20 0 V8 L-24 14 H24 L20 8 V0 C20 -12 14 -22 0 -22 Z"
                fill="url(#rrd-metal)"
                stroke="#78350f"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              {/* Badalo */}
              <circle cx="0" cy="18" r="4" fill="#78350f" />
              {/* Alça */}
              <path d="M-4 -22 Q0 -28 4 -22" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
              {/* Brilho */}
              <ellipse cx="-6" cy="-8" rx="4" ry="8" fill="#fef3c7" opacity="0.55" />
            </g>

            {/* Ondas sonoras */}
            <g opacity="0.75">
              <path d="M22 60 Q14 60 14 52" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round">
                <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
              </path>
              <path d="M98 60 Q106 60 106 52" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round">
                <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" begin="0.4s" />
              </path>
            </g>
          </svg>
        </div>

        <div className="px-6 pb-6 text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-slate-500 mb-1">
            Protocolo de Rondas · Ciclo {intervalMin}min
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-100 leading-tight">
            Hora da <span style={{ color: accent }}>próxima ronda</span>
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
            Já se passaram <b className="text-slate-100">{intervalMin} minutos</b> desde o
            último lembrete. Mantenha o ciclo operacional — abra o Gestor de
            Rondas e execute a próxima verificação.
          </p>

          {/* Ações */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onDismiss}
              className="h-11 rounded-md border border-slate-700/70 bg-slate-900/60 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300 hover:text-slate-100 hover:border-slate-500 transition-colors"
            >
              Adiar {intervalMin}min
            </button>
            <button
              type="button"
              onClick={onOpenRounds}
              className="h-11 rounded-md border font-mono text-[11px] uppercase tracking-[0.18em] transition-all"
              style={{
                borderColor: accent,
                background: `linear-gradient(180deg, ${accent}, ${accent}cc)`,
                color: '#0b0f17',
                boxShadow: `0 0 24px -6px ${accent}`,
              }}
            >
              Fazer ronda
            </button>
          </div>

          <p className="mt-4 font-mono text-[10px] tracking-[0.28em] uppercase text-slate-600">
            Disciplina é segurança
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default RoundReminderDialog;
