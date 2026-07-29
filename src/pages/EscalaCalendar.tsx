import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDutyConfig } from '@/hooks/useDutyConfig';
import { getDutyTeamForYmd, getOnDutyTeam, type TeamKey } from '@/lib/dutyRotation';
import { getServerDate } from '@/hooks/useServerTime';

const TEAM_META: Record<TeamKey, { label: string; color: string; ring: string }> = {
  alfa:    { label: 'ALFA',    color: 'bg-emerald-500/25 text-emerald-200 border-emerald-500/50', ring: 'ring-emerald-400' },
  bravo:   { label: 'BRAVO',   color: 'bg-orange-500/25  text-orange-200  border-orange-500/50',  ring: 'ring-orange-400' },
  charlie: { label: 'CHARLIE', color: 'bg-sky-500/25     text-sky-200     border-sky-500/50',     ring: 'ring-sky-400' },
  delta:   { label: 'DELTA',   color: 'bg-amber-500/25   text-amber-200   border-amber-500/50',   ring: 'ring-amber-400' },
};

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTH_LABEL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function EscalaCalendar() {
  const { config, loading } = useDutyConfig();
  const now = getServerDate();
  const today = getOnDutyTeam(config, now);

  const [cursor, setCursor] = useState<{ y: number; m: number }>(() => ({
    y: now.getFullYear(), m: now.getMonth(),
  }));

  const grid = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const cells: Array<{ ymd: string | null; day: number | null }> = [];
    for (let i = 0; i < startOffset; i++) cells.push({ ymd: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ ymd: ymd(cursor.y, cursor.m, d), day: d });
    while (cells.length % 7 !== 0) cells.push({ ymd: null, day: null });
    return cells;
  }, [cursor]);

  const goto = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const todayYmd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Rio_Branco', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);

  return (
    <div className="min-h-[100dvh] bg-[#0d0d0d] text-white px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-400" />
            <h1 className="text-lg md:text-xl font-bold tracking-wide">Escala de Plantões</h1>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-gradient-to-b from-[#111119] to-[#0c0c13] p-4 md:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => goto(-1)} aria-label="Mês anterior">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Mês</div>
              <div className="text-lg md:text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {MONTH_LABEL[cursor.m]} <span className="text-amber-400">{cursor.y}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => goto(1)} aria-label="Próximo mês">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Carregando escala…</div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((w, i) => (
                  <div key={i} className="text-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground py-1">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {grid.map((c, i) => {
                  if (!c.ymd) return <div key={i} className="aspect-square" />;
                  const team = getDutyTeamForYmd(config, c.ymd);
                  const meta = TEAM_META[team];
                  const isToday = c.ymd === todayYmd;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'aspect-square rounded-md border flex flex-col items-center justify-center gap-0.5 p-1 transition',
                        meta.color,
                        isToday && `ring-2 ${meta.ring} shadow-[0_0_20px_-4px_currentColor]`,
                      )}
                    >
                      <span className={cn('text-sm md:text-base font-bold tabular-nums', isToday && 'text-white')}>
                        {c.day}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-mono tracking-widest opacity-90">
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="text-xs text-muted-foreground">
              Hoje: <span className="font-semibold text-white">{TEAM_META[today.team].label}</span> de plantão
              <span className="ml-1 opacity-60">(troca às {String(config.handover_hour).padStart(2, '0')}:00)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(TEAM_META) as TeamKey[]).map(k => (
                <span key={k} className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono', TEAM_META[k].color)}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {TEAM_META[k].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
