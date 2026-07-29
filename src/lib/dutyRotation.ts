/**
 * Duty rotation logic — quem está de plantão hoje.
 *
 * Regras:
 *  - Ciclo configurável (ex.: ['delta','alfa','bravo','charlie']) com data-âncora.
 *  - Handover diário às 07:00 America/Rio_Branco (não à meia-noite).
 *    Portanto, entre 00:00 e 06:59 do dia X, ainda vale a equipe do dia X-1.
 *  - Config vem de system_settings.key='duty_schedule'.
 */

export type TeamKey = 'alfa' | 'bravo' | 'charlie' | 'delta';

export interface TeamScheduleEntry {
  start: string; // "07:00"
  end: string;   // "07:00"
  notes?: string;
}

export interface DutyScheduleConfig {
  order: TeamKey[];
  anchor_ymd: string;   // YYYY-MM-DD
  anchor_team: TeamKey;
  handover_hour: number; // 0..23 (default 7)
  teams: Record<TeamKey, TeamScheduleEntry>;
}

export const DEFAULT_DUTY_CONFIG: DutyScheduleConfig = {
  order: ['delta', 'alfa', 'bravo', 'charlie'],
  anchor_ymd: '2026-07-29',
  anchor_team: 'delta',
  handover_hour: 7,
  teams: {
    alfa:    { start: '07:00', end: '07:00', notes: 'Plantão 24h — contenção e apoio.' },
    bravo:   { start: '07:00', end: '07:00', notes: 'Plantão 24h — intervenção rápida.' },
    charlie: { start: '07:00', end: '07:00', notes: 'Plantão 24h — vigilância perimetral.' },
    delta:   { start: '07:00', end: '07:00', notes: 'Plantão 24h — comando e operações.' },
  },
};

export const ACRE_TZ = 'America/Rio_Branco';

function partsInAcre(d: Date): { ymd: string; hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: ACRE_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = fmt.formatToParts(d).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== 'literal') acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    ymd: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour === '24' ? '00' : parts.hour),
    minute: Number(parts.minute),
  };
}

function addDaysYmd(ymd: string, days: number): string {
  const t = new Date(ymd + 'T12:00:00Z').getTime() + days * 86400000;
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function diffDaysYmd(a: string, b: string): number {
  const ta = new Date(a + 'T12:00:00Z').getTime();
  const tb = new Date(b + 'T12:00:00Z').getTime();
  return Math.round((ta - tb) / 86400000);
}

/** Retorna o YMD (Acre) do "dia operacional" — antes das 07:00 conta como dia anterior. */
export function getOperationalYmd(
  now: Date = new Date(),
  handoverHour: number = 7,
): string {
  const { ymd, hour } = partsInAcre(now);
  if (hour < handoverHour) return addDaysYmd(ymd, -1);
  return ymd;
}

export function getDutyTeamForYmd(cfg: DutyScheduleConfig, ymd: string): TeamKey {
  const order = cfg.order.length ? cfg.order : DEFAULT_DUTY_CONFIG.order;
  const anchorIdx = Math.max(0, order.indexOf(cfg.anchor_team));
  const diff = diffDaysYmd(ymd, cfg.anchor_ymd);
  const idx = ((anchorIdx + diff) % order.length + order.length) % order.length;
  return order[idx];
}

export function getOnDutyTeam(
  cfg: DutyScheduleConfig,
  now: Date = new Date(),
): { team: TeamKey; ymd: string } {
  const ymd = getOperationalYmd(now, cfg.handover_hour);
  return { team: getDutyTeamForYmd(cfg, ymd), ymd };
}

/** Próxima troca em ms — sempre no próximo handover_hour Acre. */
export function msUntilNextHandover(
  cfg: DutyScheduleConfig,
  now: Date = new Date(),
): number {
  const { ymd, hour, minute } = partsInAcre(now);
  const secondsNow = new Intl.DateTimeFormat('en-GB', {
    timeZone: ACRE_TZ, hour12: false, second: '2-digit',
  }).format(now);
  const sec = Number(secondsNow) || 0;
  const nowSecInDay = hour * 3600 + minute * 60 + sec;
  const handoverSec = cfg.handover_hour * 3600;
  const targetYmd = nowSecInDay < handoverSec ? ymd : addDaysYmd(ymd, 1);
  // Compute UTC ms for targetYmd at handover_hour Acre (UTC-5)
  const targetUtc = new Date(`${targetYmd}T${String(cfg.handover_hour).padStart(2, '0')}:00:00-05:00`).getTime();
  return Math.max(0, targetUtc - now.getTime());
}

export function getUpcomingSchedule(
  cfg: DutyScheduleConfig,
  fromYmd: string,
  days: number,
): Array<{ ymd: string; team: TeamKey }> {
  const out: Array<{ ymd: string; team: TeamKey }> = [];
  for (let i = 0; i < days; i++) {
    const y = addDaysYmd(fromYmd, i);
    out.push({ ymd: y, team: getDutyTeamForYmd(cfg, y) });
  }
  return out;
}
