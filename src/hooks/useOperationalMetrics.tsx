import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UplinkStatus = 'online' | 'degraded' | 'offline';

interface OperationalMetrics {
  units: number;
  agentsActive: number;
  divisions: number;
  uplink: UplinkStatus;
  loading: boolean;
}

/**
 * Central operational KPIs surfaced in the hero Briefing panel.
 * - Real counts from `units` and `agents`
 * - Uplink status: online when Realtime channel subscribes, degraded on retry,
 *   offline when navigator reports no connection.
 */
export function useOperationalMetrics(): OperationalMetrics {
  const [units, setUnits] = useState(0);
  const [agentsActive, setAgentsActive] = useState(0);
  const [uplink, setUplink] = useState<UplinkStatus>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'degraded'
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [u, a] = await Promise.all([
          supabase.from('units').select('id', { count: 'exact', head: true }),
          supabase
            .from('agents')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
        ]);
        if (cancelled) return;
        setUnits(u.count ?? 0);
        setAgentsActive(a.count ?? 0);
      } catch {
        // silent — hero has fallbacks
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Uplink probe via Realtime channel
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setUplink('offline');
      return;
    }
    const channel = supabase.channel('hero-uplink-probe');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') setUplink('online');
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setUplink('degraded');
      else if (status === 'CLOSED') setUplink('offline');
    });

    const onOnline = () => setUplink('degraded');
    const onOffline = () => setUplink('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return {
    units,
    agentsActive,
    divisions: 4,
    uplink,
    loading,
  };
}
