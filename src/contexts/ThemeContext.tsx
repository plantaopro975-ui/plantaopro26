import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Shield, Cpu, Sun, Monitor, Flame, Snowflake } from 'lucide-react';

// Reduced to 4 unique themes + system + light
export type ThemeType = 'tactical' | 'cyber' | 'crimson' | 'arctic' | 'light' | 'system';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  icon: typeof Shield;
  emoji: string;
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

const getSystemTheme = (): 'light' | 'tactical' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'tactical';
  }
  return 'tactical';
};

export const themes: Record<ThemeType, ThemeConfig> = {
  tactical: {
    id: 'tactical',
    name: 'Tático',
    description: 'Operações táticas com cores âmbar intenso',
    icon: Shield,
    emoji: '🎯',
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
  light: {
    id: 'light',
    name: 'Diurno',
    description: 'Tema claro profissional',
    icon: Sun,
    emoji: '☀️',
    colors: {
      primary: '217 91% 45%',
      primaryForeground: '0 0% 100%',
      accent: '217 91% 50%',
      background: '210 40% 98%',
      card: '0 0% 100%',
      border: '214 32% 85%',
      gradientFrom: '217 91% 45%',
      gradientTo: '200 85% 50%',
      foreground: '222 47% 11%',
      muted: '210 40% 94%',
      mutedForeground: '215 25% 35%',
      isLight: true,
    },
    effects: {
      glowIntensity: 'low',
      particleColor: 'rgba(59, 130, 246, 0.3)',
      scanlineOpacity: 0,
    },
    cardStyle: {
      gradient: 'from-blue-50 via-slate-50 to-white',
      border: 'border-blue-200',
      shadow: 'shadow-blue-500/10',
      hoverShadow: 'hover:shadow-blue-500/20',
    },
  },
  system: {
    id: 'system',
    name: 'Automático',
    description: 'Segue preferência do sistema',
    icon: Monitor,
    emoji: '🖥️',
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
    const saved = localStorage.getItem('plantaopro-theme') as ThemeType;
    // If saved theme no longer exists, fallback to tactical
    if (saved && themes[saved]) {
      return saved;
    }
    return 'tactical';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'tactical'>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'light' : 'tactical');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
    
    root.classList.remove('light-theme', 'nightops-theme', 'tactical-theme', 'cyber-theme', 'crimson-theme', 'arctic-theme');
    
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
