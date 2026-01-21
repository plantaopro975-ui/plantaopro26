import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Shield, Cpu, Monitor, Flame, Snowflake, Target, Zap, Radio, Crosshair, Crown, Network } from 'lucide-react';

// Premium themes: tactical, cyber, crimson, arctic, sovereign, nexus, system
export type ThemeType = 'tactical' | 'cyber' | 'crimson' | 'arctic' | 'sovereign' | 'nexus' | 'system';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  icon: typeof Shield;
  emoji: string;
  fontFamily: string;
  teamIcons: {
    ALFA: typeof Shield;
    BRAVO: typeof Shield;
    CHARLIE: typeof Shield;
    DELTA: typeof Shield;
  };
  colors: {
    primary: string;
    primaryForeground: string;
    accent: string;
    background: string;
    card: string;
    border: string;
    gradientFrom: string;
    gradientTo: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    isLight: boolean;
  };
  effects: {
    glowIntensity: 'low' | 'medium' | 'high';
    particleColor: string;
    scanlineOpacity: number;
  };
  cardStyle: {
    gradient: string;
    border: string;
    shadow: string;
    hoverShadow: string;
  };
}

const getSystemTheme = (): 'tactical' => {
  return 'tactical';
};

export const themes: Record<ThemeType, ThemeConfig> = {
  tactical: {
    id: 'tactical',
    name: 'Tático',
    description: 'Operações táticas com cores âmbar intenso',
    icon: Shield,
    emoji: '🎯',
    fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
    teamIcons: {
      ALFA: Shield,
      BRAVO: Target,
      CHARLIE: Crosshair,
      DELTA: Radio,
    },
    colors: {
      primary: '38 92% 50%',
      primaryForeground: '222 47% 6%',
      accent: '25 95% 53%',
      background: '222 47% 4%',
      card: '222 47% 6%',
      border: '38 50% 20%',
      gradientFrom: '38 92% 50%',
      gradientTo: '25 95% 53%',
      foreground: '210 40% 98%',
      muted: '222 30% 10%',
      mutedForeground: '38 30% 60%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'high',
      particleColor: 'rgba(251, 191, 36, 0.8)',
      scanlineOpacity: 0.05,
    },
    cardStyle: {
      gradient: 'from-amber-950/90 via-orange-950/80 to-slate-950/95',
      border: 'border-amber-500/40',
      shadow: 'shadow-amber-500/20',
      hoverShadow: 'hover:shadow-amber-400/40',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber',
    description: 'Futurista com neon ciano e rosa',
    icon: Cpu,
    emoji: '💻',
    fontFamily: "'Share Tech Mono', 'JetBrains Mono', monospace",
    teamIcons: {
      ALFA: Cpu,
      BRAVO: Zap,
      CHARLIE: Radio,
      DELTA: Target,
    },
    colors: {
      primary: '187 85% 53%',
      primaryForeground: '222 47% 6%',
      accent: '290 85% 60%',
      background: '240 25% 3%',
      card: '240 25% 5%',
      border: '187 50% 20%',
      gradientFrom: '187 85% 53%',
      gradientTo: '290 85% 60%',
      foreground: '210 40% 98%',
      muted: '240 20% 10%',
      mutedForeground: '187 40% 60%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'high',
      particleColor: 'rgba(6, 182, 212, 0.8)',
      scanlineOpacity: 0.1,
    },
    cardStyle: {
      gradient: 'from-cyan-950/90 via-purple-950/80 to-slate-950/95',
      border: 'border-cyan-500/40',
      shadow: 'shadow-cyan-500/20',
      hoverShadow: 'hover:shadow-cyan-400/40',
    },
  },
  crimson: {
    id: 'crimson',
    name: 'Força Especial',
    description: 'Vermelho operacional de elite',
    icon: Flame,
    emoji: '🔥',
    fontFamily: "'Teko', 'Bebas Neue', sans-serif",
    teamIcons: {
      ALFA: Flame,
      BRAVO: Shield,
      CHARLIE: Target,
      DELTA: Crosshair,
    },
    colors: {
      primary: '0 84% 55%',
      primaryForeground: '210 40% 98%',
      accent: '15 90% 55%',
      background: '0 30% 4%',
      card: '0 30% 6%',
      border: '0 50% 20%',
      gradientFrom: '0 84% 55%',
      gradientTo: '20 90% 50%',
      foreground: '210 40% 98%',
      muted: '0 25% 10%',
      mutedForeground: '0 40% 60%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'high',
      particleColor: 'rgba(239, 68, 68, 0.8)',
      scanlineOpacity: 0.06,
    },
    cardStyle: {
      gradient: 'from-red-950/90 via-orange-950/80 to-slate-950/95',
      border: 'border-red-500/40',
      shadow: 'shadow-red-500/20',
      hoverShadow: 'hover:shadow-red-400/40',
    },
  },
  arctic: {
    id: 'arctic',
    name: 'Ártico',
    description: 'Gelo e precisão operacional',
    icon: Snowflake,
    emoji: '❄️',
    fontFamily: "'Exo 2', 'Roboto Condensed', sans-serif",
    teamIcons: {
      ALFA: Snowflake,
      BRAVO: Radio,
      CHARLIE: Shield,
      DELTA: Zap,
    },
    colors: {
      primary: '200 95% 48%',
      primaryForeground: '222 47% 6%',
      accent: '180 85% 50%',
      background: '210 35% 4%',
      card: '210 35% 6%',
      border: '200 50% 20%',
      gradientFrom: '200 95% 48%',
      gradientTo: '180 85% 45%',
      foreground: '210 40% 98%',
      muted: '210 25% 10%',
      mutedForeground: '200 40% 60%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'medium',
      particleColor: 'rgba(56, 189, 248, 0.7)',
      scanlineOpacity: 0.03,
    },
    cardStyle: {
      gradient: 'from-sky-950/90 via-cyan-950/80 to-slate-950/95',
      border: 'border-sky-500/40',
      shadow: 'shadow-sky-500/20',
      hoverShadow: 'hover:shadow-sky-400/40',
    },
  },
  // NEW THEME: Sovereign - Premium Gold/Bronze institutional government theme
  sovereign: {
    id: 'sovereign',
    name: 'Sovereign',
    description: 'Premium institucional dourado',
    icon: Crown,
    emoji: '👑',
    fontFamily: "'Cinzel', 'Playfair Display', serif",
    teamIcons: {
      ALFA: Crown,
      BRAVO: Shield,
      CHARLIE: Target,
      DELTA: Radio,
    },
    colors: {
      primary: '45 93% 47%', // Royal gold
      primaryForeground: '30 25% 8%',
      accent: '28 85% 45%', // Bronze
      background: '30 20% 5%',
      card: '30 18% 8%',
      border: '45 60% 25%',
      gradientFrom: '45 93% 47%',
      gradientTo: '28 85% 45%',
      foreground: '40 40% 96%',
      muted: '30 15% 12%',
      mutedForeground: '45 35% 55%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'medium',
      particleColor: 'rgba(234, 179, 8, 0.6)',
      scanlineOpacity: 0.02,
    },
    cardStyle: {
      gradient: 'from-yellow-950/90 via-amber-950/85 to-stone-950/95',
      border: 'border-yellow-600/50',
      shadow: 'shadow-yellow-500/25',
      hoverShadow: 'hover:shadow-yellow-400/50',
    },
  },
  // NEW THEME: Nexus - Matrix green futuristic network theme
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    description: 'Rede futurista matrix verde',
    icon: Network,
    emoji: '🌐',
    fontFamily: "'Fira Code', 'Source Code Pro', monospace",
    teamIcons: {
      ALFA: Network,
      BRAVO: Cpu,
      CHARLIE: Zap,
      DELTA: Radio,
    },
    colors: {
      primary: '142 76% 45%', // Matrix green
      primaryForeground: '160 30% 6%',
      accent: '165 80% 40%', // Teal accent
      background: '160 40% 3%',
      card: '160 35% 5%',
      border: '142 50% 18%',
      gradientFrom: '142 76% 45%',
      gradientTo: '165 80% 40%',
      foreground: '145 40% 95%',
      muted: '160 25% 8%',
      mutedForeground: '142 40% 55%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'high',
      particleColor: 'rgba(34, 197, 94, 0.8)',
      scanlineOpacity: 0.08,
    },
    cardStyle: {
      gradient: 'from-emerald-950/90 via-green-950/85 to-slate-950/95',
      border: 'border-emerald-500/40',
      shadow: 'shadow-emerald-500/20',
      hoverShadow: 'hover:shadow-emerald-400/45',
    },
  },
  system: {
    id: 'system',
    name: 'Automático',
    description: 'Segue preferência do sistema',
    icon: Monitor,
    emoji: '🖥️',
    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
    teamIcons: {
      ALFA: Shield,
      BRAVO: Target,
      CHARLIE: Crosshair,
      DELTA: Radio,
    },
    colors: {
      primary: '38 92% 50%',
      primaryForeground: '222 47% 6%',
      accent: '38 92% 50%',
      background: '222 47% 4%',
      card: '222 47% 6%',
      border: '38 50% 20%',
      gradientFrom: '38 92% 50%',
      gradientTo: '25 95% 53%',
      foreground: '210 40% 98%',
      muted: '222 30% 10%',
      mutedForeground: '38 30% 60%',
      isLight: false,
    },
    effects: {
      glowIntensity: 'medium',
      particleColor: 'rgba(251, 191, 36, 0.6)',
      scanlineOpacity: 0.03,
    },
    cardStyle: {
      gradient: 'from-amber-950/90 via-orange-950/80 to-slate-950/95',
      border: 'border-amber-500/40',
      shadow: 'shadow-amber-500/20',
      hoverShadow: 'hover:shadow-amber-400/40',
    },
  },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeConfig: ThemeConfig;
  resolvedTheme: Exclude<ThemeType, 'system'>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('plantaopro-theme');
    // If saved theme no longer exists (e.g. light was removed), fallback to tactical
    if (saved && themes[saved as ThemeType]) {
      return saved as ThemeType;
    }
    // Migrate old 'light' users to sovereign
    if (saved === 'light') {
      localStorage.setItem('plantaopro-theme', 'sovereign');
      return 'sovereign';
    }
    return 'tactical';
  });

  const [systemTheme] = useState<'tactical'>(getSystemTheme);

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('plantaopro-theme', newTheme);
  }, []);

  const resolvedTheme: Exclude<ThemeType, 'system'> = theme === 'system' ? systemTheme : theme;
  const activeConfig = themes[resolvedTheme];

  useEffect(() => {
    const config = activeConfig;
    const root = document.documentElement;
    
    root.style.setProperty('--primary', config.colors.primary);
    root.style.setProperty('--primary-foreground', config.colors.primaryForeground);
    root.style.setProperty('--accent', config.colors.accent);
    root.style.setProperty('--accent-foreground', config.colors.primaryForeground);
    root.style.setProperty('--background', config.colors.background);
    root.style.setProperty('--foreground', config.colors.foreground);
    root.style.setProperty('--card', config.colors.card);
    root.style.setProperty('--card-foreground', config.colors.foreground);
    root.style.setProperty('--popover', config.colors.card);
    root.style.setProperty('--popover-foreground', config.colors.foreground);
    root.style.setProperty('--muted', config.colors.muted);
    root.style.setProperty('--muted-foreground', config.colors.mutedForeground);
    root.style.setProperty('--border', config.colors.border);
    root.style.setProperty('--input', config.colors.muted);
    root.style.setProperty('--ring', config.colors.primary);
    root.style.setProperty('--secondary', config.colors.muted);
    root.style.setProperty('--secondary-foreground', config.colors.foreground);
    root.style.setProperty('--sidebar-background', config.colors.isLight ? config.colors.card : config.colors.background);
    root.style.setProperty('--sidebar-foreground', config.colors.isLight ? config.colors.mutedForeground : config.colors.foreground);
    root.style.setProperty('--sidebar-primary', config.colors.primary);
    root.style.setProperty('--sidebar-primary-foreground', config.colors.primaryForeground);
    root.style.setProperty('--sidebar-accent', config.colors.muted);
    root.style.setProperty('--sidebar-accent-foreground', config.colors.foreground);
    root.style.setProperty('--sidebar-border', config.colors.border);
    root.style.setProperty('--sidebar-ring', config.colors.primary);
    
    // Aplicar fonte específica do tema
    root.style.setProperty('--font-theme', config.fontFamily);
    document.body.style.fontFamily = config.fontFamily;
    
    root.style.setProperty('--gradient-primary', 
      `linear-gradient(135deg, hsl(${config.colors.gradientFrom}) 0%, hsl(${config.colors.gradientTo}) 100%)`
    );
    
    if (config.colors.isLight) {
      root.style.setProperty('--gradient-dark', 
        `linear-gradient(180deg, hsl(${config.colors.background}) 0%, hsl(210 40% 96%) 100%)`
      );
    } else {
      root.style.setProperty('--gradient-dark', 
        `linear-gradient(180deg, hsl(${config.colors.card}) 0%, hsl(${config.colors.background}) 100%)`
      );
    }
    
    // Remove todas as classes de tema anteriores
    root.classList.remove('light-theme', 'nightops-theme', 'tactical-theme', 'cyber-theme', 'crimson-theme', 'arctic-theme', 'sovereign-theme', 'nexus-theme');
    
    // Aplica nova classe de tema
    root.setAttribute('data-theme', resolvedTheme);
    
    if (config.colors.isLight) {
      root.classList.add('light-theme');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark', `${resolvedTheme}-theme`);
    }
  }, [activeConfig, resolvedTheme]);

  const displayConfig = theme === 'system' ? themes.system : themes[theme];

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      themeConfig: displayConfig,
      resolvedTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
