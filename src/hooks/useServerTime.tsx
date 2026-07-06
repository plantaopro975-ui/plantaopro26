import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Relógio global sincronizado com a rede (não confia no horário do sistema local).
 *
 * Fonte primária: RPC `get_server_now()` no backend (Lovable Cloud).
 * Fallback: HTTP `Date` header retornado pelo próprio endpoint Supabase (mesma origem).
 *
 * Todo o app compartilha o mesmo offset em memória (module-scope),
 * então múltiplos consumidores não disparam múltiplas sincronizações.
 */

// server_ms - local_ms
let serverOffsetMs = 0;
let lastSyncAt = 0;
let syncing: Promise<void> | null = null;

const SYNC_INTERVAL_MS = 5 * 60_000; // ressincroniza a cada 5 min

async function fetchServerNow(): Promise<number | null> {
  // 1) RPC oficial
  try {
    const t0 = Date.now();
    const { data, error } = await supabase.rpc('get_server_now');
    const t1 = Date.now();
    if (!error && data) {
      const server = new Date(data as unknown as string).getTime();
      if (Number.isFinite(server)) {
        // corrige metade do round-trip
        return server + Math.round((t1 - t0) / 2);
      }
    }
  } catch {
    /* ignore */
  }

  // 2) Fallback: header Date do próprio Supabase (HEAD request)
  try {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
    if (url) {
      const t0 = Date.now();
      const res = await fetch(`${url}/auth/v1/health`, { method: 'HEAD', cache: 'no-store' });
      const t1 = Date.now();
      const h = res.headers.get('date');
      if (h) {
        const server = new Date(h).getTime();
        if (Number.isFinite(server)) return server + Math.round((t1 - t0) / 2);
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}

export async function syncServerTime(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastSyncAt < SYNC_INTERVAL_MS) return;
  if (syncing) return syncing;
  syncing = (async () => {
    const serverMs = await fetchServerNow();
    if (serverMs != null) {
      serverOffsetMs = serverMs - Date.now();
      lastSyncAt = Date.now();
    }
  })();
  try {
    await syncing;
  } finally {
    syncing = null;
  }
}

/** Data corrente estimada do servidor (rede), sem depender do relógio local. */
export function getServerDate(): Date {
  return new Date(Date.now() + serverOffsetMs);
}

/** Offset atual (server - local) em ms. */
export function getServerOffsetMs(): number {
  return serverOffsetMs;
}

/**
 * Hook: retorna a Date "de rede" atualizada no intervalo escolhido (default 1s).
 * Faz uma sincronização inicial e ressincroniza periodicamente.
 */
export function useServerTime(tickMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => getServerDate());

  useEffect(() => {
    let alive = true;

    // sincroniza ao montar
    syncServerTime().then(() => { if (alive) setNow(getServerDate()); });

    const tick = window.setInterval(() => {
      if (alive) setNow(getServerDate());
    }, tickMs);

    // ressync periódica
    const resync = window.setInterval(() => { syncServerTime(true); }, SYNC_INTERVAL_MS);

    // ressync ao voltar do background / recuperar rede
    const onFocus = () => { syncServerTime(true); };
    const onOnline = () => { syncServerTime(true); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);

    return () => {
      alive = false;
      window.clearInterval(tick);
      window.clearInterval(resync);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [tickMs]);

  return now;
}
