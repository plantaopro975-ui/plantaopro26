import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Conta visitantes únicos do site em tempo real via Supabase Realtime Presence.
 *
 * Diferente de `useOnlinePresence` (que rastreia agentes/tabs autenticados na
 * área operacional), este hook rastreia QUALQUER navegador que abrir o site,
 * logado ou não. É público — usa somente a anon key.
 *
 * Estratégia de identificação:
 *   - Um visitor_id estável é gerado uma vez por navegador e persistido em
 *     localStorage. Múltiplas abas do mesmo navegador contam como 1 visitante.
 *   - IP e MAC NÃO são acessíveis via JavaScript no navegador (privacidade e
 *     restrição do runtime). Presence é a fonte de verdade prática e não
 *     depende de rastreamento invasivo.
 */

const CHANNEL = 'site-visitors';
const STORAGE_KEY = 'plantaopro:visitor_id';

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

type Listener = (count: number) => void;

let sharedChannel: ReturnType<typeof supabase.channel> | null = null;
let refCount = 0;
let lastCount = 0;
const listeners = new Set<Listener>();

function ensureChannel() {
  if (sharedChannel) return sharedChannel;
  const visitorId = getVisitorId();
  const channel = supabase.channel(CHANNEL, {
    config: { presence: { key: visitorId } },
  });
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      lastCount = Object.keys(state).length;
      listeners.forEach((l) => l(lastCount));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          joined_at: new Date().toISOString(),
          path: typeof window !== 'undefined' ? window.location.pathname : '/',
        });
      }
    });
  sharedChannel = channel;
  return channel;
}

export function useVisitorPresence(): number {
  const [count, setCount] = useState(lastCount);

  useEffect(() => {
    ensureChannel();
    refCount += 1;
    listeners.add(setCount);
    setCount(lastCount);

    return () => {
      listeners.delete(setCount);
      refCount -= 1;
      if (refCount <= 0 && sharedChannel) {
        supabase.removeChannel(sharedChannel);
        sharedChannel = null;
        refCount = 0;
      }
    };
  }, []);

  return count;
}
