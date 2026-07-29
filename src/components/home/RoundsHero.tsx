import { memo } from 'react';
import { cn } from '@/lib/utils';
import { useLowMotion } from '@/hooks/useLowMotion';

/**
 * Hero SVG sofisticado do Gestor de Rondas.
 *
 * - Anel circular duplo: externo = progresso do agente atual (slot),
 *   interno = progresso total da operação.
 * - Radar sweep sutil (respeita `prefers-reduced-motion` / Safe Mode).
 * - Marcadores por agente ao redor do anel (posicionamento proporcional).
 * - Indicação inequívoca de "Em Ronda" / "Próximo" com nomes.
 * - Estados: idle (sem cronograma), scheduled (aguardando início), running.
 *
 * Sem dependências externas; puro SVG + CSS já existente.
 */

export type RoundsHeroPhase = 'idle' | 'scheduled' | 'running' | 'done' | 'paused';

export interface RoundsHeroProps {
  phase: RoundsHeroPhase;
  teamColor: string;
  currentAgent?: string;
  nextAgent?: string;
  slotSec?: number;         // duração do slot do agente atual
  slotRemaining?: number;   // segundos restantes do slot
  totalSec?: number;        // duração total da operação
  totalRemaining?: number;  // segundos restantes totais
  rowsCount?: number;
  currentIndex?: number;
  secondsUntilStart?: number | null; // quando phase === 'scheduled'
  className?: string;
}

function fmtHMS(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
}

function RoundsHeroImpl(props: RoundsHeroProps) {
  const {
    phase, teamColor,
    currentAgent, nextAgent,
    slotSec = 0, slotRemaining = 0,
    totalSec = 0, totalRemaining = 0,
    rowsCount = 0, currentIndex = -1,
    secondsUntilStart = null,
    className,
  } = props;
  const { lowMotion } = useLowMotion();
  const animate = !lowMotion;

  const R_OUT = 78;
  const R_IN  = 60;
  const C_OUT = 2 * Math.PI * R_OUT;
  const C_IN  = 2 * Math.PI * R_IN;

  const slotProgress  = slotSec  > 0 ? Math.min(1, (slotSec  - slotRemaining)  / slotSec ) : 0;
  const totalProgress = totalSec > 0 ? Math.min(1, (totalSec - totalRemaining) / totalSec) : 0;

  // marcadores por agente no anel externo
  const markers = rowsCount > 0
    ? Array.from({ length: rowsCount }, (_, i) => (i / rowsCount) * 360)
    : [];

  const bigLabel =
    phase === 'idle'      ? '—'
  : phase === 'scheduled' ? fmtHMS(secondsUntilStart ?? 0)
  : phase === 'done'      ? '00:00'
  : fmtHMS(slotRemaining);

  const bigCaption =
    phase === 'idle'      ? 'Sem cronograma'
  : phase === 'scheduled' ? 'Inicia em'
  : phase === 'paused'    ? 'Pausado — restam do posto'
  : phase === 'done'      ? 'Operação concluída'
  : 'Restam do posto';

  return (
    <div
      className={cn(
        'rh-wrap relative overflow-hidden rounded-lg border',
        'bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80',
        className,
      )}
      style={{ borderColor: `${teamColor}55` }}
    >
      {/* Grade técnica sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            `linear-gradient(${teamColor}88 1px, transparent 1px),
             linear-gradient(90deg, ${teamColor}88 1px, transparent 1px)`,
          backgroundSize: '22px 22px, 22px 22px',
          maskImage: 'radial-gradient(closest-side at 30% 50%, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(closest-side at 30% 50%, black 60%, transparent 100%)',
        }}
      />

      <div className="relative flex items-stretch gap-3 p-3">
        {/* --- CANVAS SVG --- */}
        <div className="relative shrink-0" style={{ width: 176, height: 176 }}>
          <svg viewBox="-100 -100 200 200" width="176" height="176" aria-hidden>
            <defs>
              <radialGradient id="rh-glow" cx="0" cy="0" r="1">
                <stop offset="0%"  stopColor={teamColor} stopOpacity="0.35" />
                <stop offset="70%" stopColor={teamColor} stopOpacity="0" />
              </radialGradient>
              <linearGradient id="rh-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"  stopColor={teamColor} stopOpacity="1" />
                <stop offset="100%" stopColor="#fbbf24"   stopOpacity="1" />
              </linearGradient>
              <filter id="rh-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
            </defs>

            {/* Glow de fundo */}
            <circle r="94" fill="url(#rh-glow)" />

            {/* Marcadores de agentes */}
            {markers.map((deg, i) => {
              const rad = (deg - 90) * Math.PI / 180;
              const x1 = Math.cos(rad) * (R_OUT + 6);
              const y1 = Math.sin(rad) * (R_OUT + 6);
              const x2 = Math.cos(rad) * (R_OUT + 12);
              const y2 = Math.sin(rad) * (R_OUT + 12);
              const active = i === currentIndex;
              const done = currentIndex >= 0 && i < currentIndex;
              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={active ? '#fbbf24' : done ? teamColor : '#64748b'}
                  strokeOpacity={active ? 1 : done ? 0.85 : 0.5}
                  strokeWidth={active ? 3 : 1.6}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Trilho externo (slot do agente atual) */}
            <circle
              r={R_OUT} fill="none"
              stroke="#1e293b" strokeOpacity="0.9" strokeWidth="6"
            />
            <circle
              r={R_OUT} fill="none"
              stroke="url(#rh-ring)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={C_OUT}
              strokeDashoffset={C_OUT * (1 - slotProgress)}
              transform="rotate(-90)"
              filter={animate ? 'url(#rh-blur)' : undefined}
              style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.22,1,.36,1)' }}
            />
            <circle
              r={R_OUT} fill="none"
              stroke="url(#rh-ring)" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={C_OUT}
              strokeDashoffset={C_OUT * (1 - slotProgress)}
              transform="rotate(-90)"
              style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.22,1,.36,1)' }}
            />

            {/* Trilho interno (progresso total) */}
            <circle r={R_IN} fill="none" stroke="#0f172a" strokeOpacity="0.9" strokeWidth="3" />
            <circle
              r={R_IN} fill="none"
              stroke={teamColor} strokeOpacity="0.75"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={C_IN}
              strokeDashoffset={C_IN * (1 - totalProgress)}
              transform="rotate(-90)"
              style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
            />

            {/* Radar sweep (só quando rodando) */}
            {phase === 'running' && animate && (
              <g className="rh-sweep">
                <defs>
                  <linearGradient id="rh-sweep-g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"  stopColor={teamColor} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={teamColor} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 0 0 L ${R_IN - 4} 0 A ${R_IN - 4} ${R_IN - 4} 0 0 1 ${Math.cos(-0.9) * (R_IN - 4)} ${Math.sin(-0.9) * (R_IN - 4)} Z`}
                  fill="url(#rh-sweep-g)"
                />
              </g>
            )}

            {/* Cruz central discreta */}
            <line x1="-6" y1="0" x2="6" y2="0" stroke={teamColor} strokeOpacity="0.5" strokeWidth="1" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke={teamColor} strokeOpacity="0.5" strokeWidth="1" />
          </svg>

          {/* Texto central (overlay HTML para tipografia real) */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-slate-400">
              {bigCaption}
            </span>
            <span
              className="font-mono font-bold tabular-nums leading-none mt-1"
              style={{
                fontSize: 30,
                color: phase === 'running' ? '#fbbf24' : teamColor,
                textShadow: `0 0 14px ${teamColor}66`,
              }}
            >
              {bigLabel}
            </span>
            {phase === 'running' && slotSec > 0 && (
              <span className="mt-0.5 font-mono text-[10px] tabular-nums text-slate-400">
                / {fmtHMS(slotSec)}
              </span>
            )}
          </div>
        </div>

        {/* --- INFO --- */}
        <div className="min-w-0 flex-1 flex flex-col justify-center gap-2">
          {/* Em ronda */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={cn('h-2 w-2 rounded-full', phase === 'running' && 'animate-pulse')}
                style={{
                  background: phase === 'running' ? '#22c55e' : '#64748b',
                  boxShadow: phase === 'running' ? '0 0 8px #22c55e' : undefined,
                }}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Em Ronda
              </span>
            </div>
            <div className="mt-0.5 font-display text-base sm:text-lg font-bold uppercase tracking-wide text-white truncate">
              {phase === 'running' && currentAgent ? currentAgent
                : phase === 'scheduled' ? 'Aguardando início'
                : phase === 'done' ? 'Concluída'
                : phase === 'paused' && currentAgent ? currentAgent
                : '—'}
            </div>
          </div>

          {/* Próximo */}
          <div className="min-w-0 border-t pt-2" style={{ borderColor: `${teamColor}33` }}>
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300/90">
                Próximo
              </span>
            </div>
            <div className="mt-0.5 font-display text-sm font-semibold uppercase tracking-wide text-slate-100 truncate">
              {nextAgent ?? (phase === 'running' ? 'Última ronda' : '—')}
            </div>
          </div>

          {/* Barra de operação total */}
          {totalSec > 0 && (
            <div>
              <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-400">
                <span>Operação</span>
                <span className="tabular-nums text-slate-300">{fmtHMS(totalRemaining)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${Math.round(totalProgress * 100)}%`,
                    background: `linear-gradient(90deg, ${teamColor}, #fbbf24)`,
                    boxShadow: `0 0 10px ${teamColor}88`,
                  }}
                />
              </div>
              {rowsCount > 0 && (
                <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-slate-500">
                  Posto {Math.max(0, currentIndex + 1)} / {rowsCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .rh-sweep { transform-origin: 0 0; animation: rh-spin 3.6s linear infinite; }
        @keyframes rh-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @media (prefers-reduced-motion: reduce) { .rh-sweep { animation: none; } }
      `}</style>
    </div>
  );
}

export const RoundsHero = memo(RoundsHeroImpl);
