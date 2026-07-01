import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Conta usuários online via Supabase Realtime Presence.
 * Todos os visitantes da home se registram no canal 'online-users'.
 */
export function useOnlinePresence(channelName = 'online-users') {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const clientId = crypto.randomUUID();
    const channel = supabase.channel(channelName, {
      config: { presence: { key: clientId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length || 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  return count;
}
