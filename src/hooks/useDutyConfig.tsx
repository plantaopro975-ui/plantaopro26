import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_DUTY_CONFIG, type DutyScheduleConfig, type TeamKey } from '@/lib/dutyRotation';

const KEY = 'duty_schedule';

function normalize(raw: unknown): DutyScheduleConfig {
  const r = (raw ?? {}) as Partial<DutyScheduleConfig>;
  const order = Array.isArray(r.order) && r.order.length === 4
    ? (r.order as TeamKey[])
    : DEFAULT_DUTY_CONFIG.order;
  return {
    order,
    anchor_ymd: r.anchor_ymd || DEFAULT_DUTY_CONFIG.anchor_ymd,
    anchor_team: (r.anchor_team as TeamKey) || DEFAULT_DUTY_CONFIG.anchor_team,
    handover_hour: typeof r.handover_hour === 'number' ? r.handover_hour : 7,
    teams: { ...DEFAULT_DUTY_CONFIG.teams, ...(r.teams || {}) } as DutyScheduleConfig['teams'],
    override: r.override ?? null,
    override_history: Array.isArray(r.override_history) ? r.override_history : [],
  };
}

export function useDutyConfig() {
  const [config, setConfig] = useState<DutyScheduleConfig>(DEFAULT_DUTY_CONFIG);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', KEY)
      .maybeSingle();
    setConfig(normalize(data?.value));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('duty_schedule_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings', filter: `key=eq.${KEY}` },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const save = useCallback(async (next: DutyScheduleConfig) => {
    const { data: userRes } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('system_settings')
      .upsert(
        { key: KEY, value: next as never, updated_by: userRes.user?.id ?? null, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      );
    if (!error) setConfig(next);
    return { error };
  }, []);

  return { config, loading, save };
}
