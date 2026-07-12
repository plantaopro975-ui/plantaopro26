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
        className="max-w-[420px] p-0 overflow-hidden border rounded-xl"
        style={
          {
            borderColor: `${color}55`,
            background:
              `radial-gradient(120% 80% at 50% -10%, ${color}22, transparent 60%),` +
              'linear-gradient(180deg, #0b1220 0%, #050912 100%)',
            boxShadow: `0 30px 80px -30px ${color}, 0 0 0 1px ${color}22, inset 0 1px 0 rgba(255,255,255,0.04)`,
            ['--tcd-accent' as string]: color,
            ['--tcd-ink' as string]: onAccent,
          } as React.CSSProperties
        }
      >
        {/* ============ HERO ============ */}
        <TeamHero teamKey={key} color={color} />

        {/* ============ CORPO ============ */}
        <div className="px-6 pt-4 pb-6 text-center relative">
          {/* Divisor com marca da equipe */}
          <div className="flex items-center justify-center gap-2 mb-3" aria-hidden>
            <span className="h-px flex-1 max-w-[70px]" style={{ background: `linear-gradient(90deg, transparent, ${color}80)` }} />
            <span className="font-mono text-[9.5px] uppercase tracking-[0.32em]" style={{ color: `${color}` }}>
              Protocolo · {teamLabel}
            </span>
            <span className="h-px flex-1 max-w-[70px]" style={{ background: `linear-gradient(90deg, ${color}80, transparent)` }} />
          </div>

          <h2 className="text-[17px] font-bold tracking-tight text-slate-50 leading-snug">
            Confirmar composição da equipe{' '}
            <span style={{ color }}>{teamLabel}</span>?
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">
            Após a confirmação, a equipe fica <b className="text-slate-100">travada</b>{' '}
            até o encerramento da ronda ou remoção da programação.
          </p>

          {/* Grid de fatos */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Fact icon="team" label="Equipe" value={teamLabel} color={color} />
            <Fact icon="agents" label="Agentes" value={String(agentCount)} color={color} />
          </div>

          {/* Ações */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-11 rounded-lg border border-slate-700/70 bg-slate-900/60 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 hover:text-slate-50 hover:border-slate-500 hover:bg-slate-900 active:translate-y-[1px] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: color }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-11 rounded-lg font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0 active:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: `linear-gradient(180deg, ${color}, ${color}d0)`,
                color: onAccent,
                boxShadow: `0 10px 24px -8px ${color}, inset 0 1px 0 rgba(255,255,255,0.25)`,
                outlineColor: color,
              }}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 10.5 L8 14.5 L16 6" />
                </svg>
                Confirmar
              </span>
            </button>
          </div>

          <p className="mt-4 font-mono text-[9.5px] tracking-[0.3em] uppercase text-slate-600">
            Uma equipe · Uma missão
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ==================================================================
 * Hero por equipe — SVG puro, sem imagens externas.
 * Cada equipe recebe uma cena distinta com metáfora tática:
 *   ALFA    — escudo esmeralda (defesa)
 *   BRAVO   — espada âmbar (ação)
 *   CHARLIE — alvo/radar azul (precisão)
 *   DELTA   — raio dourado (velocidade)
 * ================================================================== */
function TeamHero({ teamKey, color }: { teamKey: TeamKey; color: string }) {
  return (
    <div
      className="relative h-[140px] overflow-hidden"
      style={{
        background:
          `radial-gradient(70% 100% at 50% 100%, ${color}30 0%, transparent 70%),` +
          'linear-gradient(180deg, #060b16, #0b1220)',
      }}
    >
      {/* HUD grid */}
      <svg
        viewBox="0 0 400 140"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id="tcd-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke={color} strokeOpacity="0.08" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="tcd-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect width="400" height="140" fill="url(#tcd-grid)" />
        {/* horizonte */}
        <line x1="0" y1="105" x2="400" y2="105" stroke={color} strokeOpacity="0.35" strokeWidth="0.6" />
        <line x1="0" y1="112" x2="400" y2="112" stroke={color} strokeOpacity="0.15" strokeWidth="0.4" />
        {/* ticks laterais */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={i}
            x1={i * 20 + 10} y1="105" x2={i * 20 + 10} y2={i % 2 === 0 ? 100 : 102}
            stroke={color} strokeOpacity="0.35" strokeWidth="0.6"
          />
        ))}
        <rect width="400" height="140" fill="url(#tcd-fade)" />
      </svg>

      {/* Selo / crest central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <TeamCrest teamKey={teamKey} color={color} />
      </div>

      {/* Codinome + faixa superior */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em]" style={{ color: `${color}dd` }}>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: color }} />
          Equipe
        </span>
        <span className="text-slate-500">{teamCodename(teamKey)}</span>
      </div>

      {/* corner brackets */}
      {[
        'top-1 left-1 border-t-2 border-l-2',
        'top-1 right-1 border-t-2 border-r-2',
        'bottom-1 left-1 border-b-2 border-l-2',
        'bottom-1 right-1 border-b-2 border-r-2',
      ].map((c) => (
        <span key={c} aria-hidden className={`pointer-events-none absolute ${c} h-2.5 w-2.5`} style={{ borderColor: `${color}aa` }} />
      ))}
    </div>
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
