import { useState, useEffect, useMemo, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, Users, Activity, Wifi, Building2, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import radarBg from '@/assets/radar-bg.jpg';


interface AgentBlip {
  id: string;
  name: string;
  team: string | null;
  isActive: boolean;
  position: { angle: number; distance: number };
  lastActivity?: string;
}

interface TacticalRadarProps {
  unitId?: string;
  unitName?: string;
  className?: string;
  compact?: boolean;
}

export const TacticalRadar = forwardRef<HTMLDivElement, TacticalRadarProps>(function TacticalRadar({ unitId, unitName, className, compact = false }, ref) {
  const [agents, setAgents] = useState<AgentBlip[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch agents ONLY from the same unit - each unit is independent
  useEffect(() => {
    const fetchAgents = async () => {
      if (!unitId) {
        setAgents([]);
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .select('id, name, team, is_active, updated_at')
        .eq('is_active', true)
        .eq('unit_id', unitId)
        .limit(20);

      if (!error && data) {
        const blips: AgentBlip[] = data.map((agent, index) => ({
          id: agent.id,
          name: agent.name,
          team: agent.team,
          isActive: agent.is_active ?? true,
          position: {
            angle: (360 / data.length) * index + Math.random() * 30,
            distance: 20 + Math.random() * 60,
          },
          lastActivity: agent.updated_at,
        }));
        setAgents(blips);
        setLastUpdate(new Date());
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);

    return () => clearInterval(interval);
  }, [unitId]);

  const teamColors: Record<string, { bg: string; glow: string }> = {
    ALFA: { bg: 'bg-sky-400', glow: 'shadow-sky-400/60' },
    BRAVO: { bg: 'bg-rose-400', glow: 'shadow-rose-400/60' },
    CHARLIE: { bg: 'bg-emerald-400', glow: 'shadow-emerald-400/60' },
    DELTA: { bg: 'bg-violet-400', glow: 'shadow-violet-400/60' },
    default: { bg: 'bg-amber-400', glow: 'shadow-amber-400/60' },
  };

  const rings = useMemo(() => [25, 50, 75], []);

  const radarSize = compact ? 120 : 160;
  const centerX = radarSize / 2;
  const centerY = radarSize / 2;

  // If no unitId, show a message
  if (!unitId) {
    return (
      <Card ref={ref} className={cn("bg-zinc-900/80 border border-zinc-700/50", className)}>
        <CardContent className="flex items-center justify-center py-6 text-center">
          <div className="text-zinc-500">
            <Building2 className="h-6 w-6 mx-auto mb-1.5 opacity-50" />
            <p className="text-xs">Selecione uma unidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={ref} className={cn(
      "relative bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-800/80 border border-zinc-700/60 backdrop-blur-sm overflow-hidden",
      className
    )}>
      {/* Professional radar backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] bg-center bg-cover mix-blend-screen"
        style={{ backgroundImage: `url(${radarBg})` }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/70" />

      <CardHeader className={cn("relative pb-1", compact ? "p-2.5" : "p-3")}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/15 border border-cyan-500/30">
              <Signal className={cn("text-cyan-400", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
            </div>
            <div className="flex flex-col">
              <span className={cn("font-semibold text-zinc-100", compact ? "text-xs" : "text-sm")}>Radar</span>
              {unitName && (
                <span className="text-[9px] text-zinc-500 font-normal truncate max-w-[100px]">
                  {unitName}
                </span>
              )}
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0 h-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn("relative flex flex-col items-center gap-2", compact ? "p-2.5 pt-0" : "p-3 pt-1")}>
        {/* Radar Display - with pro backdrop */}
        <div
          className="relative rounded-full bg-zinc-950/80 border border-zinc-700/50 overflow-hidden"
          style={{ width: radarSize, height: radarSize }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-center bg-cover opacity-40"
            style={{ backgroundImage: `url(${radarBg})` }}
          />
          <div aria-hidden className="absolute inset-0 bg-zinc-950/50" />

          {/* Grid rings */}
          {rings.map((ring) => (
            <div
              key={ring}
              className="absolute rounded-full border border-zinc-700/40"
              style={{
                width: `${ring}%`,
                height: `${ring}%`,
                top: `${(100 - ring) / 2}%`,
                left: `${(100 - ring) / 2}%`,
              }}
            />
          ))}

          {/* Cross lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-[1px] bg-zinc-700/30" />
            <div className="absolute h-full w-[1px] bg-zinc-700/30" />
          </div>

          {/* Sweep animation */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.15) 20deg, transparent 40deg)',
              animation: 'spin 3s linear infinite',
            }}
          />

          {/* Center point */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 z-10" />

          {/* Agent blips */}
          {agents.map((agent) => {
            const radians = (agent.position.angle * Math.PI) / 180;
            const x = centerX + Math.cos(radians) * (agent.position.distance * centerX / 100) - 3;
            const y = centerY + Math.sin(radians) * (agent.position.distance * centerY / 100) - 3;
            const colors = teamColors[agent.team || 'default'] || teamColors.default;

            return (
              <div
                key={agent.id}
                className={cn(
                  "absolute w-1.5 h-1.5 rounded-full z-20 cursor-pointer transition-transform duration-200 hover:scale-[2]",
                  colors.bg,
                  colors.glow,
                  "shadow-lg"
                )}
                style={{ left: x, top: y }}
                title={`${agent.name}${agent.team ? ` - ${agent.team}` : ''}`}
              />
            );
          })}
        </div>

        {/* Stats - Compact row */}
        <div className="flex items-center justify-between w-full text-[10px] text-zinc-500 px-1">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span className="font-mono text-cyan-400">{agents.length}</span>
            <span>ativos</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-500" />
            <span>{lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Team legend - Compact */}
        {!compact && (
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[9px] text-zinc-400">
            {Object.entries(teamColors).filter(([k]) => k !== 'default').map(([team, colors]) => (
              <div key={team} className="flex items-center gap-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", colors.bg)} />
                <span>{team}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
