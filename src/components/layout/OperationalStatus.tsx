import { useState, useEffect } from 'react';
import { Shield, Radio, Wifi, WifiOff, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

type StatusLevel = 'online' | 'standby' | 'offline' | 'alert';

interface OperationalStatusProps {
  className?: string;
}

export function OperationalStatus({ className }: OperationalStatusProps) {
  const [status, setStatus] = useState<StatusLevel>('standby');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeAgents, setActiveAgents] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check active agents count
  useEffect(() => {
    const checkActiveAgents = async () => {
      const { count } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      setActiveAgents(count || 0);
    };

    checkActiveAgents();
    const interval = setInterval(checkActiveAgents, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Determine status based on conditions
  useEffect(() => {
    if (!isOnline) {
      setStatus('offline');
    } else if (activeAgents > 0) {
      setStatus('online');
    } else {
      setStatus('standby');
    }
  }, [isOnline, activeAgents]);

  // Periodic pulse animation trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey(prev => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Use theme colors for operational states
  const statusConfig = {
    online: {
      label: 'OPERACIONAL',
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      borderColor: 'border-primary/40',
      pulseColor: 'bg-primary',
      icon: Shield,
    },
    standby: {
      label: 'STANDBY',
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      borderColor: 'border-accent/40',
      pulseColor: 'bg-accent',
      icon: Radio,
    },
    offline: {
      label: 'OFFLINE',
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
      borderColor: 'border-destructive/40',
      pulseColor: 'bg-destructive',
      icon: WifiOff,
    },
    alert: {
      label: 'ALERTA',
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      borderColor: 'border-accent/40',
      pulseColor: 'bg-accent',
      icon: Activity,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div 
      className={cn(
        "status-indicator flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 backdrop-blur-sm transition-all duration-300",
        config.bgColor,
        config.borderColor,
        "shadow-lg",
        className
      )}
    >
      {/* Radar-style Animated Status Indicator - Themed */}
      <div className="radar-container relative w-6 h-6 flex items-center justify-center">
        {/* Radar Background */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 bg-background/80",
          config.borderColor
        )} />
        {/* Radar Rings */}
        <div className="absolute inset-[2px] rounded-full border border-primary/20" />
        <div className="absolute inset-[4px] rounded-full border border-primary/10" />
        {/* Radar Sweep - Uses theme primary color */}
        <div 
          className="radar-sweep absolute inset-0 rounded-full"
          style={{ 
            background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.5) 30deg, transparent 60deg)',
            animation: 'spin 2s linear infinite'
          }}
        />
        {/* Center Blip */}
        <div 
          className={cn("status-dot absolute w-2 h-2 rounded-full z-10", config.pulseColor)}
          style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.8)' }}
        />
      </div>

      {/* Status Icon & Text */}
      <div className="flex items-center gap-1.5">
        <StatusIcon className={cn("h-3.5 w-3.5", config.color)} />
        <span className={cn("text-[10px] font-bold tracking-wider", config.color)}>
          {config.label}
        </span>
      </div>

      {/* Signal Bars (desktop only) - Themed */}
      <div className="hidden md:flex items-end gap-0.5 ml-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 rounded-sm transition-all duration-300",
              status === 'online' && bar <= 4 ? 'bg-primary' : 
              status === 'standby' && bar <= 2 ? 'bg-accent' :
              status === 'offline' ? 'bg-muted-foreground/30' :
              bar <= 3 ? 'bg-accent' : 'bg-muted-foreground/30'
            )}
            style={{ height: `${bar * 3 + 2}px` }}
          />
        ))}
      </div>

      {/* Live Indicator - Themed */}
      {status === 'online' && (
        <div className="hidden md:flex items-center gap-1 ml-1 pl-2 border-l border-border/50">
          <Wifi className="h-3 w-3 text-primary" />
          <span className="text-[9px] text-primary font-mono font-semibold">
            {activeAgents} ATIVOS
          </span>
        </div>
      )}
    </div>
  );
}