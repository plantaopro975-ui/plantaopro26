import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { TEAM_COLORS, type TeamKey } from '@/lib/teamColors';

interface TeamConfirmDialogProps {
  open: boolean;
  color: string;
  team?: TeamKey;
  teamLabel: string;
  agentCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirmação profissional (SVG puro) para travar a equipe da ronda.
 * O hero muda conforme a equipe selecionada (ALFA/BRAVO/CHARLIE/DELTA)
 * e todas as cores derivam do accent institucional da equipe.
 */
export function TeamConfirmDialog({
  open,
  color,
  team,
  teamLabel,
  agentCount,
  onCancel,
  onConfirm,
}: TeamConfirmDialogProps) {
  const key = (team ?? (teamLabel?.toUpperCase() as TeamKey)) as TeamKey;
  const onAccent = TEAM_COLORS[key]?.onAccent ?? '#0b0f17';

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent
        className="w-[min(92vw,340px)] max-w-[340px] p-0 overflow-hidden border rounded-lg gap-0"
        style={
          {
            borderColor: `${color}55`,
            background:
              `radial-gradient(120% 80% at 50% -20%, ${color}18, transparent 55%),` +
              'linear-gradient(180deg, #0b1220 0%, #050912 100%)',
            boxShadow: `0 20px 50px -25px ${color}, 0 0 0 1px ${color}22`,
            ['--tcd-accent' as string]: color,
            ['--tcd-ink' as string]: onAccent,
          } as React.CSSProperties
        }
      >
        {/* HEADER compacto */}
        <div
          className="relative flex items-center gap-2.5 px-3.5 py-2.5 border-b"
          style={{
            borderColor: `${color}22`,
            background: `linear-gradient(180deg, ${color}12, transparent)`,
          }}
        >
          <div
            className="grid place-items-center h-9 w-9 rounded-md shrink-0"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}55`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px -6px ${color}`,
            }}
          >
            <MiniCrest teamKey={key} color={color} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.28em] text-slate-500 leading-none">
              Protocolo · {teamCodename(key)}
            </div>
            <div className="mt-0.5 text-[13px] font-semibold tracking-tight text-slate-100 leading-tight truncate">
              Confirmar equipe <span style={{ color }}>{teamLabel}</span>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse shrink-0" style={{ background: color }} aria-hidden />
        </div>

        {/* CORPO */}
        <div className="px-3.5 pt-3 pb-3.5">
          <p className="text-[11.5px] leading-snug text-slate-400">
            Após confirmar, a equipe fica{' '}
            <b className="text-slate-200">travada</b> até o encerramento da ronda
            ou remoção da programação.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Fact icon="team" label="Equipe" value={teamLabel} color={color} />
            <Fact icon="agents" label="Agentes" value={String(agentCount)} color={color} />
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 rounded-md border border-slate-700/70 bg-slate-900/60 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 hover:text-slate-50 hover:border-slate-500 hover:bg-slate-900 active:translate-y-[1px] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: color }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-9 rounded-md font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-all hover:brightness-110 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: `linear-gradient(180deg, ${color}, ${color}d0)`,
                color: onAccent,
                boxShadow: `0 6px 16px -6px ${color}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                outlineColor: color,
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10.5 L8 14.5 L16 6" />
                </svg>
                Confirmar
              </span>
            </button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* Mini crest compacto para o header */
function MiniCrest({ teamKey, color }: { teamKey: TeamKey; color: string }) {
  const inner = (() => {
    switch (teamKey) {
      case 'ALFA':
        return <path d="M8 12 L11 15 L16 9" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
      case 'BRAVO':
        return (
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round">
            <line x1="8" y1="8" x2="16" y2="16" />
            <line x1="16" y1="8" x2="8" y2="16" />
          </g>
        );
      case 'CHARLIE':
        return (
          <g fill="none" stroke={color} strokeWidth="1.4">
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="12" cy="12" r="1.6" fill={color} />
          </g>
        );
      case 'DELTA':
        return <path d="M13 6 L8 13 H11 L10 18 L15 11 H12 L13 6 Z" fill={color} />;
      default:
        return null;
    }
  })();
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="none" stroke={color} strokeOpacity="0.7" strokeWidth="1.2" />
      {inner}
    </svg>
  );
}


function teamCodename(k: TeamKey): string {
  switch (k) {
    case 'ALFA': return 'Escudo · α';
    case 'BRAVO': return 'Espada · β';
    case 'CHARLIE': return 'Alvo · γ';
    case 'DELTA': return 'Raio · δ';
    default: return '—';
  }
}

/* Crest tático — SVG por equipe */
function TeamCrest({ teamKey, color }: { teamKey: TeamKey; color: string }) {
  const gid = `crest-${teamKey}`;
  const drop = `drop-shadow(0 10px 20px ${color}80) drop-shadow(0 2px 4px #00000088)`;

  const commonDefs = (
    <defs>
      <radialGradient id={`${gid}-dome`} cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="28%" stopColor={color} stopOpacity="0.95" />
        <stop offset="80%" stopColor={color} stopOpacity="0.4" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
      <linearGradient id={`${gid}-metal`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.2" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );

  // Base — escudo/moldura
  const shieldBase = (
    <>
      <path
        d="M60 8 L104 22 V60 C104 86 84 106 60 114 C36 106 16 86 16 60 V22 Z"
        fill={`url(#${gid}-dome)`}
        stroke={color}
        strokeWidth="1.4"
        filter={`url(#${gid}-glow)`}
      />
      <path
        d="M60 18 L96 30 V60 C96 80 80 96 60 102 C40 96 24 80 24 60 V30 Z"
        fill="none"
        stroke={`url(#${gid}-metal)`}
        strokeOpacity="0.55"
        strokeWidth="0.8"
      />
    </>
  );

  // Ícone central conforme equipe
  const icon = (() => {
    switch (teamKey) {
      case 'ALFA':
        // Escudo dentro do escudo + check (defesa)
        return (
          <>
            <path
              d="M60 34 L82 42 V60 C82 74 72 86 60 90 C48 86 38 74 38 60 V42 Z"
              fill={`${color}22`}
              stroke={color}
              strokeWidth="1.5"
            />
            <path d="M48 62 L57 71 L74 52" fill="none" stroke="#f8fafc" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      case 'BRAVO':
        // Espadas cruzadas (ação)
        return (
          <g>
            {[-1, 1].map((s) => (
              <g key={s} transform={`rotate(${s * 35} 60 62)`}>
                <line x1="60" y1="36" x2="60" y2="80" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
                <line x1="52" y1="72" x2="68" y2="72" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                <circle cx="60" cy="82" r="2.2" fill="#e2e8f0" />
                <circle cx="60" cy="36" r="1.8" fill={color} />
              </g>
            ))}
            <circle cx="60" cy="62" r="3" fill={color} stroke="#0b0f17" strokeWidth="1" />
          </g>
        );
      case 'CHARLIE':
        // Alvo/mira (precisão)
        return (
          <g>
            {[22, 16, 10].map((r, i) => (
              <circle key={r} cx="60" cy="62" r={r} fill="none" stroke={i === 2 ? '#f8fafc' : color} strokeOpacity={i === 0 ? 0.6 : 0.9} strokeWidth={i === 2 ? 1.6 : 1.2} />
            ))}
            <circle cx="60" cy="62" r="3" fill="#f8fafc" />
            <line x1="60" y1="34" x2="60" y2="42" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="60" y1="82" x2="60" y2="90" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="32" y1="62" x2="40" y2="62" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="80" y1="62" x2="88" y2="62" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      case 'DELTA':
        // Raio (velocidade)
        return (
          <path
            d="M64 34 L46 66 H58 L54 90 L76 56 H64 L70 34 Z"
            fill="#f8fafc"
            stroke={color}
            strokeWidth="1.4"
            strokeLinejoin="round"
            filter={`url(#${gid}-glow)`}
          />
        );
    }
  })();

  // Ticks inferiores
  const ticks = (
    <>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={32 + i * 20} y1="116" x2={36 + i * 20} y2="116"
          stroke={color} strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
    </>
  );

  return (
    <svg viewBox="0 0 120 124" className="h-[112px] w-[112px]" style={{ filter: drop }} aria-hidden>
      {commonDefs}
      {shieldBase}
      {icon}
      {ticks}
    </svg>
  );
}

function Fact({ label, value, color, icon }: { label: string; value: string; color: string; icon?: 'team' | 'agents' }) {
  return (
    <div
      className="rounded-lg border bg-slate-900/60 py-2 px-2 flex items-center gap-2"
      style={{ borderColor: `${color}35` }}
    >
      <span
        className="grid place-items-center h-7 w-7 rounded-md shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}44`, color }}
        aria-hidden
      >
        {icon === 'team' ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4 L10 2 L16 4 V10 C16 14 13 16.5 10 18 C7 16.5 4 14 4 10 Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7.5" r="2.5" />
            <path d="M2.5 16.5 C3.5 13.5 5.5 12 7 12 C8.5 12 10.5 13.5 11.5 16.5" />
            <circle cx="14" cy="8" r="2" />
            <path d="M12 16.5 C12.5 14.5 14 13 15 13 C16 13 17.2 14 17.7 15.5" />
          </svg>
        )}
      </span>
      <div className="min-w-0 text-left">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500 leading-tight">{label}</div>
        <div className="text-sm font-bold text-slate-100 truncate leading-tight" title={value}>{value}</div>
      </div>
    </div>
  );
}

export default TeamConfirmDialog;
