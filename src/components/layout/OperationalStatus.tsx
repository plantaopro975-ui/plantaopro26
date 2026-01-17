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

  const statusConfig = {
    online: {
      label: 'OPERACIONAL',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/40',
      pulseColor: 'bg-emerald-400',
      icon: Shield,
    },
    standby: {
      label: 'STANDBY',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/40',
      pulseColor: 'bg-amber-400',
      icon: Radio,
    },
    offline: {
      label: 'OFFLINE',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      pulseColor: 'bg-red-400',
      icon: WifiOff,
    },
    alert: {
      label: 'ALERTA',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/40',
      pulseColor: 'bg-orange-400',
      icon: Activity,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div 
      className={cn(
        "status-indicator flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-all duration-300 shadow-lg",
        config.bgColor,
        config.borderColor,
        className
      )}
      style={{
        boxShadow: status === 'online' ? '0 0 15px rgba(16, 185, 129, 0.2)' : 
                   status === 'alert' ? '0 0 15px rgba(249, 115, 22, 0.2)' :
                   status === 'offline' ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
      }}
    >
      {/* Radar-style Animated Status Indicator */}
      <div className="radar-container relative w-6 h-6 flex items-center justify-center">
        {/* Radar Background */}
        <div className={cn(
          "absolute inset-0 rounded-full border bg-slate-900/80",
          config.borderColor
        )} />
        {/* Radar Rings */}
        <div className="absolute inset-[2px] rounded-full border border-current/20" style={{ borderColor: config.pulseColor.replace('bg-', '') }} />
        <div className="absolute inset-[4px] rounded-full border border-current/10" style={{ borderColor: config.pulseColor.replace('bg-', '') }} />
        {/* Radar Sweep */}
        <div 
          className="radar-sweep absolute inset-0 rounded-full"
          style={{ 
            background: status === 'online' ? 'conic-gradient(from 0deg, transparent, rgba(16, 185, 129, 0.5) 30deg, transparent 60deg)' :
                        status === 'alert' ? 'conic-gradient(from 0deg, transparent, rgba(249, 115, 22, 0.5) 30deg, transparent 60deg)' :
                        status === 'standby' ? 'conic-gradient(from 0deg, transparent, rgba(245, 158, 11, 0.5) 30deg, transparent 60deg)' :
                        'conic-gradient(from 0deg, transparent, rgba(239, 68, 68, 0.5) 30deg, transparent 60deg)',
            animation: 'spin 2s linear infinite'
          }}
        />
        {/* Center Blip */}
        <div 
          className={cn("status-dot absolute w-2 h-2 rounded-full z-10", config.pulseColor)}
          style={{ boxShadow: status === 'online' ? '0 0 8px rgba(16, 185, 129, 0.8)' : 
                               status === 'alert' ? '0 0 8px rgba(249, 115, 22, 0.8)' :
                               '0 0 8px rgba(239, 68, 68, 0.6)' }}
        />
      </div>

      {/* Status Icon & Text */}
      <div className="flex items-center gap-1.5">
        <StatusIcon className={cn("h-3.5 w-3.5", config.color)} />
        <span className={cn("text-[10px] font-bold tracking-wider", config.color)}>
          {config.label}
        </span>
      </div>

      {/* Signal Bars (desktop only) */}
      <div className="hidden md:flex items-end gap-0.5 ml-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={cn(
              "w-1 rounded-sm transition-all duration-300",
              status === 'online' && bar <= 4 ? config.pulseColor : 
              status === 'standby' && bar <= 2 ? config.pulseColor :
              status === 'offline' ? 'bg-muted-foreground/30' :
              bar <= 3 ? config.pulseColor : 'bg-muted-foreground/30'
            )}
            style={{ height: `${bar * 3 + 2}px` }}
          />
        ))}
      </div>

      {/* Live Indicator with tactical styling */}
      {status === 'online' && (
        <div className="hidden md:flex items-center gap-1 ml-1 pl-2 border-l border-border/50">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span className="text-[9px] text-emerald-300 font-mono font-semibold">
            {activeAgents} ATIVOS
          </span>
        </div>
      )}
    </div>
  );
}