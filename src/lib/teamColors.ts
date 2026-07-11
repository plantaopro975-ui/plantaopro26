/**
 * Rodízio profissional de cores das equipes.
 *
 * A paleta base é fixa (verde, laranja, azul, amarelo tático). A cada nova
 * ronda iniciada, o offset é incrementado — assim ALFA num dia pode aparecer
 * verde, no seguinte laranja, e assim por diante, sem repetir a mesma cor
 * duas rondas seguidas para a mesma equipe.
 */

export type TeamPaletteKey = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

/** Paleta profissional tática (mesmas cores originais, mas agora rotacionáveis). */
export const TEAM_PALETTE: Readonly<Record<TeamPaletteKey, string>> = {
  ALFA: '#34d399',
  BRAVO: '#fb923c',
  CHARLIE: '#60a5fa',
  DELTA: '#fcd34d',
} as const;

const ORDER: TeamPaletteKey[] = ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA'];
const COLORS = ORDER.map((k) => TEAM_PALETTE[k]);

const ROTATION_KEY = 'plantaopro_team_color_rotation';

/** Lê o offset atual (0..3). Seguro em SSR. */
export function readColorRotation(): number {
  try {
    const raw = localStorage.getItem(ROTATION_KEY);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? ((n % COLORS.length) + COLORS.length) % COLORS.length : 0;
  } catch {
    return 0;
  }
}

/** Incrementa o offset (chamar ao iniciar cada ronda). Retorna o novo valor. */
export function bumpColorRotation(): number {
  const next = (readColorRotation() + 1) % COLORS.length;
  try { localStorage.setItem(ROTATION_KEY, String(next)); } catch { /* ignore */ }
  return next;
}

/** Retorna a cor rotacionada para a equipe. */
export function getRotatedTeamColor(team: string, offset: number = readColorRotation()): string {
  const baseIdx = ORDER.indexOf(team as TeamPaletteKey);
  if (baseIdx < 0) return COLORS[0];
  return COLORS[(baseIdx + offset) % COLORS.length];
}
