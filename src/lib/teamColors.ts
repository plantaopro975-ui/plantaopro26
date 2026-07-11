/**
 * Centralized team color tokens.
 * Single source of truth for team accents across cards, dialogs, buttons and chips.
 * Any component that renders team branding must import from here.
 */

export type TeamKey = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

export interface TeamColorToken {
  /** Hex accent (used for inline styles / SVG fills) */
  hex: string;
  /** Same color expressed as HSL triple ("H S% L%") — feeds --primary and Tailwind CSS variables. */
  hsl: string;
  /** Foreground color that guarantees ≥ 4.5:1 contrast when placed on top of the accent. */
  onAccent: string;
  /** Human label */
  label: string;
}

export const TEAM_COLORS: Record<TeamKey, TeamColorToken> = {
  ALFA:    { hex: '#34d399', hsl: '158 64% 52%', onAccent: '#03110b', label: 'ALFA' },
  BRAVO:   { hex: '#fb923c', hsl: '25 95% 61%',  onAccent: '#1a0a02', label: 'BRAVO' },
  CHARLIE: { hex: '#60a5fa', hsl: '213 94% 68%', onAccent: '#04122b', label: 'CHARLIE' },
  DELTA:   { hex: '#fcd34d', hsl: '45 97% 65%',  onAccent: '#1a1204', label: 'DELTA' },
};

export const TEAM_KEYS: readonly TeamKey[] = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'] as const;

export function getTeamColor(team: TeamKey): string {
  return TEAM_COLORS[team].hex;
}

export function getTeamOnAccent(team: TeamKey): string {
  return TEAM_COLORS[team].onAccent;
}

export function getTeamHsl(team: TeamKey): string {
  return TEAM_COLORS[team].hsl;
}
