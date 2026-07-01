// Team image assets
import alfaPoster from '@/assets/teams/alfa-poster.jpg';
import bravoPoster from '@/assets/teams/bravo-poster.png';
import charliePoster from '@/assets/teams/charlie-poster.jpg';
import deltaPoster from '@/assets/teams/delta-poster.jpg';
import alfaEmblem from '@/assets/teams/alfa-emblem.png';
import bravoEmblem from '@/assets/teams/bravo-emblem.png';
import charlieEmblem from '@/assets/teams/charlie-emblem.png';
import deltaEmblem from '@/assets/teams/delta-emblem.png';
import panelsBg from '@/assets/teams/panels-bg.png';
import homeBackground from '@/assets/home-background.png';
import loginBackground from '@/assets/login-background.jpg';

export const teamPosters: Record<string, string> = {
  ALFA: alfaPoster,
  BRAVO: bravoPoster,
  CHARLIE: charliePoster,
  DELTA: deltaPoster,
};

export const teamEmblems: Record<string, string> = {
  ALFA: alfaEmblem,
  BRAVO: bravoEmblem,
  CHARLIE: charlieEmblem,
  DELTA: deltaEmblem,
};

export const getTeamEmblem = (team: string | null): string | null => {
  if (!team) return null;
  return teamEmblems[team.toUpperCase()] || null;
};

export const teamColors: Record<string, {
  primary: string;      // Acento principal (títulos, brasão glow, borda foco)
  secondary: string;    // Tom profundo (gradientes, hover pressionado)
  glow: string;         // Sombra difusa
  onPrimary: string;    // Texto sobre cor primária (contraste AA)
  ring: string;         // Cor do anel de foco
  hover: string;        // Fundo de hover mais claro
}> = {
  ALFA: {
    // Verde esmeralda de alta luminância — contraste AA sobre fundo escuro
    primary: '#34d399',
    secondary: '#065f46',
    glow: 'rgba(52, 211, 153, 0.45)',
    onPrimary: '#052e1a',
    ring: '#6ee7b7',
    hover: '#10b981',
  },
  BRAVO: {
    // Âmbar profundo — melhor contraste que laranja puro
    primary: '#fb923c',
    secondary: '#7c2d12',
    glow: 'rgba(251, 146, 60, 0.45)',
    onPrimary: '#2a0f00',
    ring: '#fdba74',
    hover: '#f97316',
  },
  CHARLIE: {
    // Azul céu vibrante — melhor legibilidade sobre navy
    primary: '#60a5fa',
    secondary: '#1e40af',
    glow: 'rgba(96, 165, 250, 0.45)',
    onPrimary: '#08122e',
    ring: '#93c5fd',
    hover: '#3b82f6',
  },
  DELTA: {
    // Dourado quente — reforçado para contraste
    primary: '#fcd34d',
    secondary: '#78350f',
    glow: 'rgba(252, 211, 77, 0.5)',
    onPrimary: '#2a1a00',
    ring: '#fde68a',
    hover: '#eab308',
  },
};

export const getTeamPoster = (team: string | null): string | null => {
  if (!team) return null;
  return teamPosters[team.toUpperCase()] || null;
};

export const getTeamColors = (team: string | null) => {
  if (!team) return teamColors.ALFA;
  return teamColors[team.toUpperCase()] || teamColors.ALFA;
};

export { panelsBg, homeBackground, loginBackground };
