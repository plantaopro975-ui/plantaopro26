import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NIGHT_TZ } from '@/lib/nightShift';
import { getRotatedTeamColor } from '@/lib/teamColors';

export type TeamRoundLogEntry = { team: string; dateISO: string; savedName?: string };

interface RoundHistoryDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entries: TeamRoundLogEntry[];
  onClear: () => void;
}


/**
 * Modal detalhado do histórico compacto de rondas.
 * Mostra as últimas entradas gravadas em cache (equipe + data BR).
 */
export function RoundHistoryDialog({ open, onOpenChange, entries, onClear }: RoundHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-950 border border-slate-800 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-sans text-sm font-bold uppercase tracking-wide">Histórico de rondas</span>
            <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
              {entries.length} registro{entries.length === 1 ? '' : 's'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3">
          {(() => {
            const lastNamed = entries.find((e) => e.savedName && e.savedName.trim().length > 0);
            if (!lastNamed) return null;
            const color = getRotatedTeamColor(lastNamed.team, 0);
            return (
              <div
                className="mb-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-primary/80">
                  Última equipe registrada
                </div>
                <div className="mt-0.5 flex items-center gap-2 min-w-0">
                  <span aria-hidden className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="font-sans font-bold text-sm uppercase tracking-wide text-slate-100 truncate">
                    {lastNamed.team}
                  </span>
                  <span className="ml-auto font-sans text-[12px] font-semibold text-slate-100 truncate max-w-[55%]" title={lastNamed.savedName}>
                    {lastNamed.savedName}
                  </span>
                </div>
              </div>
            );
          })()}

          {entries.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center">
              <div className="mx-auto mb-2 h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-500">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M3 3v18h18" />
                  <path d="M7 14l4-4 4 4 5-5" />
                </svg>
              </div>
              <div className="font-sans text-sm text-slate-300">Nenhuma ronda registrada</div>
              <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-slate-500">
                O histórico será preenchido ao iniciar rondas
              </div>
            </div>
          ) : (
            <>
              <div className="mb-1.5 grid grid-cols-[1.5rem_1fr_1.4fr_auto] gap-2 px-3 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
                <span className="text-right">#</span>
                <span>Equipe</span>
                <span>Nome da equipe</span>
                <span className="text-right">Data</span>
              </div>
              <ul className="tactical-scrollbar grid gap-1 max-h-[60vh] overflow-y-auto pr-1">
                {entries.map((e, i) => {
                  const color = getRotatedTeamColor(e.team, 0);
                  const dt = new Date(e.dateISO);
                  const date = new Intl.DateTimeFormat('pt-BR', {
                    timeZone: NIGHT_TZ, day: '2-digit', month: '2-digit', year: 'numeric',
                  }).format(dt);
                  const time = new Intl.DateTimeFormat('pt-BR', {
                    timeZone: NIGHT_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
                  }).format(dt);
                  const named = e.savedName && e.savedName.trim().length > 0;
                  return (
                    <li
                      key={i}
                      className="grid grid-cols-[1.5rem_1fr_1.4fr_auto] items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2"
                      style={{ borderLeft: `3px solid ${color}` }}
                    >
                      <span className="font-mono text-[11px] tabular-nums text-slate-500 text-right">
                        {String(entries.length - i).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex items-center gap-2">
                        <span aria-hidden className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="font-sans font-bold text-[12.5px] uppercase tracking-wide text-slate-100 truncate">
                          {e.team}
                        </span>
                      </div>
                      <div
                        className={
                          'min-w-0 font-sans text-[12px] truncate ' +
                          (named ? 'text-slate-100 font-semibold' : 'text-slate-500 italic')
                        }
                        title={named ? e.savedName : 'Sem nome registrado'}
                      >
                        {named ? e.savedName : '—'}
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11.5px] font-semibold tabular-nums text-slate-100">{time}</div>
                        <div className="font-mono text-[9.5px] tabular-nums text-slate-500">{date}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>


        <div className="flex items-center justify-between gap-2 border-t border-slate-800 px-4 py-2.5 bg-slate-900/40">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Armazenamento local · até 15 entradas
          </span>
          <button
            type="button"
            disabled={entries.length === 0}
            onClick={onClear}
            className="rounded border border-slate-700 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-slate-300 hover:text-destructive hover:border-destructive/60 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Limpar histórico
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RoundHistoryDialog;
