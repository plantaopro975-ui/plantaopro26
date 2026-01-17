import { 
  Shield, Cpu, Sun, Monitor, Flame, Snowflake,
  Crown, Swords, Crosshair, Target, Binary, Orbit, Hexagon, Atom,
  Skull, Zap, AlertTriangle, Diamond, Sparkles, Waves,
  BadgeCheck, Gem, Award, Radio, Siren, Lock,
  Cloud, Compass, Navigation
} from 'lucide-react';
import type { ThemeType } from '@/contexts/ThemeContext';
import type { LucideIcon } from 'lucide-react';

export interface BackgroundEffect {
  type: 'particles' | 'grid' | 'radar' | 'matrix' | 'hexagons' | 'scanlines' | 'frost' | 'flames' | 'dots' | 'waves' | 'orbs';
  intensity: 'low' | 'medium' | 'high';
  primaryColor: string;
  secondaryColor?: string;
  animated: boolean;
  particleCount?: number;
  speed?: 'slow' | 'medium' | 'fast';
}

export interface ThemeAssets {
  mainIcon: LucideIcon;
  decorativeIcons: LucideIcon[];
  teamIcons: {
    ALFA: LucideIcon;
    BRAVO: LucideIcon;
    CHARLIE: LucideIcon;
    DELTA: LucideIcon;
  };
  teamColors: {
    ALFA: { color: string; bgGradient: string; borderColor: string; glowColor: string };
    BRAVO: { color: string; bgGradient: string; borderColor: string; glowColor: string };
    CHARLIE: { color: string; bgGradient: string; borderColor: string; glowColor: string };
    DELTA: { color: string; bgGradient: string; borderColor: string; glowColor: string };
  };
  teamDescriptions: {
    ALFA: { description: string; slogan: string };
    BRAVO: { description: string; slogan: string };
    CHARLIE: { description: string; slogan: string };
    DELTA: { description: string; slogan: string };
  };
  logoStyle: {
    gradient: string;
    textShadow: string;
  };
  subtitle: string;
  backgroundEffects: BackgroundEffect[];
  ambientGlow: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };
  cornerAccents: {
    style: 'tactical' | 'tech' | 'military' | 'minimal' | 'frost' | 'flame' | 'none';
    color: string;
  };
}

export const themeAssets: Record<ThemeType, ThemeAssets> = {
  tactical: {
    mainIcon: Shield,
    decorativeIcons: [Radio, Siren, Lock],
    teamIcons: {
      ALFA: Crown,
      BRAVO: Swords,
      CHARLIE: Crosshair,
      DELTA: Target,
    },
    teamColors: {
      ALFA: { color: 'text-amber-400', bgGradient: 'from-amber-950/95 via-orange-900/80 to-slate-950', borderColor: 'border-amber-500/60', glowColor: 'shadow-amber-500/40' },
      BRAVO: { color: 'text-orange-400', bgGradient: 'from-orange-950/95 via-red-900/80 to-slate-950', borderColor: 'border-orange-500/60', glowColor: 'shadow-orange-500/40' },
      CHARLIE: { color: 'text-yellow-400', bgGradient: 'from-yellow-950/95 via-amber-900/80 to-slate-950', borderColor: 'border-yellow-500/60', glowColor: 'shadow-yellow-500/40' },
      DELTA: { color: 'text-amber-300', bgGradient: 'from-amber-900/95 via-yellow-900/80 to-slate-950', borderColor: 'border-amber-400/60', glowColor: 'shadow-amber-400/40' },
    },
    teamDescriptions: {
      ALFA: { description: 'Primeira Linha de Defesa', slogan: 'Alerta Máximo' },
      BRAVO: { description: 'Força de Resposta Rápida', slogan: 'Ação Imediata' },
      CHARLIE: { description: 'Operações Especializadas', slogan: 'Precisão Total' },
      DELTA: { description: 'Suporte e Coordenação', slogan: 'Visão Estratégica' },
    },
    logoStyle: {
      gradient: 'from-amber-400 via-orange-500 to-amber-400',
      textShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
    },
    subtitle: 'Sistema Tático de Escalas',
    backgroundEffects: [
      { type: 'grid', intensity: 'high', primaryColor: 'rgba(251, 191, 36, 0.2)', animated: true, speed: 'slow' },
      { type: 'scanlines', intensity: 'medium', primaryColor: 'rgba(251, 191, 36, 0.5)', animated: true, speed: 'medium' },
      { type: 'particles', intensity: 'high', primaryColor: 'rgba(251, 191, 36, 0.7)', animated: true, particleCount: 50, speed: 'slow' },
    ],
    ambientGlow: { primary: 'rgba(251, 191, 36, 0.2)', secondary: 'rgba(249, 115, 22, 0.15)', tertiary: 'rgba(234, 179, 8, 0.1)' },
    cornerAccents: { style: 'tactical', color: 'border-amber-500/40' },
  },
  cyber: {
    mainIcon: Cpu,
    decorativeIcons: [Zap, Binary, Orbit],
    teamIcons: {
      ALFA: Binary,
      BRAVO: Orbit,
      CHARLIE: Hexagon,
      DELTA: Atom,
    },
    teamColors: {
      ALFA: { color: 'text-cyan-400', bgGradient: 'from-cyan-950/95 via-blue-900/80 to-slate-950', borderColor: 'border-cyan-500/60', glowColor: 'shadow-cyan-500/40' },
      BRAVO: { color: 'text-purple-400', bgGradient: 'from-purple-950/95 via-violet-900/80 to-slate-950', borderColor: 'border-purple-500/60', glowColor: 'shadow-purple-500/40' },
      CHARLIE: { color: 'text-pink-400', bgGradient: 'from-pink-950/95 via-fuchsia-900/80 to-slate-950', borderColor: 'border-pink-500/60', glowColor: 'shadow-pink-500/40' },
      DELTA: { color: 'text-blue-400', bgGradient: 'from-blue-950/95 via-indigo-900/80 to-slate-950', borderColor: 'border-blue-500/60', glowColor: 'shadow-blue-500/40' },
    },
    teamDescriptions: {
      ALFA: { description: 'Unidade de Sistemas', slogan: 'Código Ativo' },
      BRAVO: { description: 'Inteligência Artificial', slogan: 'Neural Link' },
      CHARLIE: { description: 'Criptografia Avançada', slogan: 'Zero Breach' },
      DELTA: { description: 'Infraestrutura Core', slogan: 'Uptime 100%' },
    },
    logoStyle: {
      gradient: 'from-cyan-400 via-purple-500 to-pink-400',
      textShadow: '0 0 40px rgba(6, 182, 212, 0.6)',
    },
    subtitle: 'Sistema Cyber de Operações',
    backgroundEffects: [
      { type: 'matrix', intensity: 'high', primaryColor: 'rgba(6, 182, 212, 0.6)', animated: true, speed: 'fast' },
      { type: 'hexagons', intensity: 'medium', primaryColor: 'rgba(168, 85, 247, 0.3)', animated: true, speed: 'medium' },
      { type: 'particles', intensity: 'high', primaryColor: 'rgba(236, 72, 153, 0.6)', secondaryColor: 'rgba(6, 182, 212, 0.6)', animated: true, particleCount: 60, speed: 'fast' },
    ],
    ambientGlow: { primary: 'rgba(6, 182, 212, 0.2)', secondary: 'rgba(168, 85, 247, 0.15)', tertiary: 'rgba(236, 72, 153, 0.12)' },
    cornerAccents: { style: 'tech', color: 'border-cyan-500/50' },
  },
  crimson: {
    mainIcon: Flame,
    decorativeIcons: [AlertTriangle, Skull, Zap],
    teamIcons: {
      ALFA: Skull,
      BRAVO: Flame,
      CHARLIE: Zap,
      DELTA: AlertTriangle,
    },
    teamColors: {
      ALFA: { color: 'text-red-400', bgGradient: 'from-red-950/95 via-rose-900/80 to-slate-950', borderColor: 'border-red-500/60', glowColor: 'shadow-red-500/40' },
      BRAVO: { color: 'text-orange-500', bgGradient: 'from-orange-950/95 via-red-900/80 to-slate-950', borderColor: 'border-orange-500/60', glowColor: 'shadow-orange-500/40' },
      CHARLIE: { color: 'text-yellow-500', bgGradient: 'from-yellow-950/95 via-orange-900/80 to-slate-950', borderColor: 'border-yellow-500/60', glowColor: 'shadow-yellow-500/40' },
      DELTA: { color: 'text-rose-400', bgGradient: 'from-rose-950/95 via-pink-900/80 to-slate-950', borderColor: 'border-rose-500/60', glowColor: 'shadow-rose-500/40' },
    },
    teamDescriptions: {
      ALFA: { description: 'Força de Choque', slogan: 'Fogo e Fúria' },
      BRAVO: { description: 'Esquadrão Explosivo', slogan: 'Impacto Máximo' },
      CHARLIE: { description: 'Resposta de Crise', slogan: 'Alerta Vermelho' },
      DELTA: { description: 'Contenção Especial', slogan: 'Zona de Risco' },
    },
    logoStyle: {
      gradient: 'from-red-400 via-orange-500 to-yellow-400',
      textShadow: '0 0 40px rgba(239, 68, 68, 0.6)',
    },
    subtitle: 'Sistema de Força Especial',
    backgroundEffects: [
      { type: 'flames', intensity: 'high', primaryColor: 'rgba(239, 68, 68, 0.5)', secondaryColor: 'rgba(249, 115, 22, 0.4)', animated: true, speed: 'fast' },
      { type: 'particles', intensity: 'high', primaryColor: 'rgba(239, 68, 68, 0.7)', animated: true, particleCount: 50, speed: 'fast' },
      { type: 'scanlines', intensity: 'high', primaryColor: 'rgba(239, 68, 68, 0.6)', animated: true, speed: 'fast' },
    ],
    ambientGlow: { primary: 'rgba(239, 68, 68, 0.25)', secondary: 'rgba(249, 115, 22, 0.2)', tertiary: 'rgba(234, 179, 8, 0.12)' },
    cornerAccents: { style: 'flame', color: 'border-red-500/50' },
  },
  arctic: {
    mainIcon: Snowflake,
    decorativeIcons: [Cloud, Compass, Navigation],
    teamIcons: {
      ALFA: Diamond,
      BRAVO: Sparkles,
      CHARLIE: Waves,
      DELTA: Snowflake,
    },
    teamColors: {
      ALFA: { color: 'text-sky-400', bgGradient: 'from-sky-950/95 via-blue-900/80 to-slate-950', borderColor: 'border-sky-500/60', glowColor: 'shadow-sky-500/40' },
      BRAVO: { color: 'text-cyan-400', bgGradient: 'from-cyan-950/95 via-teal-900/80 to-slate-950', borderColor: 'border-cyan-500/60', glowColor: 'shadow-cyan-500/40' },
      CHARLIE: { color: 'text-teal-400', bgGradient: 'from-teal-950/95 via-cyan-900/80 to-slate-950', borderColor: 'border-teal-500/60', glowColor: 'shadow-teal-500/40' },
      DELTA: { color: 'text-blue-300', bgGradient: 'from-blue-950/95 via-sky-900/80 to-slate-950', borderColor: 'border-blue-400/60', glowColor: 'shadow-blue-400/40' },
    },
    teamDescriptions: {
      ALFA: { description: 'Operações Árticas', slogan: 'Gelo e Precisão' },
      BRAVO: { description: 'Navegação Polar', slogan: 'Norte Verdadeiro' },
      CHARLIE: { description: 'Orientação Extrema', slogan: 'Rumo Glacial' },
      DELTA: { description: 'Cobertura Aérea', slogan: 'Tempestade Branca' },
    },
    logoStyle: {
      gradient: 'from-sky-400 via-cyan-500 to-blue-400',
      textShadow: '0 0 40px rgba(56, 189, 248, 0.6)',
    },
    subtitle: 'Sistema Ártico de Operações',
    backgroundEffects: [
      { type: 'frost', intensity: 'high', primaryColor: 'rgba(56, 189, 248, 0.4)', secondaryColor: 'rgba(6, 182, 212, 0.3)', animated: true, speed: 'slow' },
      { type: 'particles', intensity: 'high', primaryColor: 'rgba(255, 255, 255, 0.9)', animated: true, particleCount: 80, speed: 'slow' },
      { type: 'orbs', intensity: 'medium', primaryColor: 'rgba(56, 189, 248, 0.2)', animated: true, speed: 'slow' },
    ],
    ambientGlow: { primary: 'rgba(56, 189, 248, 0.2)', secondary: 'rgba(6, 182, 212, 0.15)', tertiary: 'rgba(255, 255, 255, 0.1)' },
    cornerAccents: { style: 'frost', color: 'border-sky-400/40' },
  },
  light: {
    mainIcon: Sun,
    decorativeIcons: [BadgeCheck, Gem, Award],
    teamIcons: {
      ALFA: BadgeCheck,
      BRAVO: Gem,
      CHARLIE: Award,
      DELTA: Crown,
    },
    teamColors: {
      ALFA: { color: 'text-blue-600', bgGradient: 'from-blue-100 via-slate-100 to-white', borderColor: 'border-blue-300', glowColor: 'shadow-blue-500/20' },
      BRAVO: { color: 'text-indigo-600', bgGradient: 'from-indigo-100 via-slate-100 to-white', borderColor: 'border-indigo-300', glowColor: 'shadow-indigo-500/20' },
      CHARLIE: { color: 'text-sky-600', bgGradient: 'from-sky-100 via-slate-100 to-white', borderColor: 'border-sky-300', glowColor: 'shadow-sky-500/20' },
      DELTA: { color: 'text-violet-600', bgGradient: 'from-violet-100 via-slate-100 to-white', borderColor: 'border-violet-300', glowColor: 'shadow-violet-500/20' },
    },
    teamDescriptions: {
      ALFA: { description: 'Proteção Institucional', slogan: 'Tradição e Honra' },
      BRAVO: { description: 'Excelência Operacional', slogan: 'Padrão Ouro' },
      CHARLIE: { description: 'Reconhecimento de Elite', slogan: 'Mérito Máximo' },
      DELTA: { description: 'Acesso Controlado', slogan: 'Segurança Total' },
    },
    logoStyle: {
      gradient: 'from-blue-600 via-indigo-600 to-blue-600',
      textShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
    },
    subtitle: 'Sistema Institucional de Escalas',
    backgroundEffects: [
      { type: 'dots', intensity: 'low', primaryColor: 'rgba(59, 130, 246, 0.15)', animated: false },
      { type: 'waves', intensity: 'low', primaryColor: 'rgba(99, 102, 241, 0.1)', animated: true, speed: 'slow' },
    ],
    ambientGlow: { primary: 'rgba(59, 130, 246, 0.1)', secondary: 'rgba(99, 102, 241, 0.08)' },
    cornerAccents: { style: 'minimal', color: 'border-blue-200' },
  },
  system: {
    mainIcon: Monitor,
    decorativeIcons: [Radio, Siren, Lock],
    teamIcons: {
      ALFA: Crown,
      BRAVO: Swords,
      CHARLIE: Crosshair,
      DELTA: Target,
    },
    teamColors: {
      ALFA: { color: 'text-amber-400', bgGradient: 'from-amber-950/95 via-orange-900/80 to-slate-950', borderColor: 'border-amber-500/60', glowColor: 'shadow-amber-500/40' },
      BRAVO: { color: 'text-orange-400', bgGradient: 'from-orange-950/95 via-red-900/80 to-slate-950', borderColor: 'border-orange-500/60', glowColor: 'shadow-orange-500/40' },
      CHARLIE: { color: 'text-yellow-400', bgGradient: 'from-yellow-950/95 via-amber-900/80 to-slate-950', borderColor: 'border-yellow-500/60', glowColor: 'shadow-yellow-500/40' },
      DELTA: { color: 'text-amber-300', bgGradient: 'from-amber-900/95 via-yellow-900/80 to-slate-950', borderColor: 'border-amber-400/60', glowColor: 'shadow-amber-400/40' },
    },
    teamDescriptions: {
      ALFA: { description: 'Primeira Linha de Defesa', slogan: 'Alerta Máximo' },
      BRAVO: { description: 'Força de Resposta Rápida', slogan: 'Ação Imediata' },
      CHARLIE: { description: 'Operações Especializadas', slogan: 'Precisão Total' },
      DELTA: { description: 'Suporte e Coordenação', slogan: 'Visão Estratégica' },
    },
    logoStyle: {
      gradient: 'from-amber-400 via-orange-500 to-amber-400',
      textShadow: '0 0 40px rgba(251, 191, 36, 0.6)',
    },
    subtitle: 'Sistema de Escalas',
    backgroundEffects: [
      { type: 'grid', intensity: 'medium', primaryColor: 'rgba(251, 191, 36, 0.15)', animated: true, speed: 'slow' },
      { type: 'particles', intensity: 'medium', primaryColor: 'rgba(251, 191, 36, 0.6)', animated: true, particleCount: 40, speed: 'slow' },
    ],
    ambientGlow: { primary: 'rgba(251, 191, 36, 0.15)', secondary: 'rgba(249, 115, 22, 0.1)' },
    cornerAccents: { style: 'tactical', color: 'border-amber-500/30' },
  },
};

export function getThemeAssets(theme: ThemeType, resolvedTheme: Exclude<ThemeType, 'system'>): ThemeAssets {
  if (theme === 'system') {
    return themeAssets[resolvedTheme];
  }
  return themeAssets[theme];
}
