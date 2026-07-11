/**
 * Preferências do lembrete automático de rondas.
 *
 * Persistência em duas camadas:
 *   1) localStorage (cache imediato, por usuário — chave namespaced).
 *   2) profiles.reminder_settings (Supabase) — sincroniza entre dispositivos.
 *
 * Observável via evento `reminder-settings:change` para o hook global reagir
 * em tempo real sem refresh.
 */

import { supabase } from '@/integrations/supabase/client';

export type ReminderInterval = 15 | 30 | 60;

export interface ReminderSettings {
  enabled: boolean;
  intervalMin: ReminderInterval;
}

const BASE_KEY = 'plantaopro_reminder_settings_v1';
const EVENT = 'reminder-settings:change';

const DEFAULTS: ReminderSettings = { enabled: true, intervalMin: 30 };

// ID do usuário ativo — definido em runtime por `bindReminderUser`. Enquanto
// não houver usuário, usamos a chave legada para não perder preferências
// definidas antes do login.
let currentUserId: string | null = null;

function storageKey(userId?: string | null): string {
  const id = userId ?? currentUserId;
  return id ? `${BASE_KEY}:${id}` : BASE_KEY;
}

function normalize(raw: unknown): ReminderSettings {
  if (!raw || typeof raw !== 'object') return { ...DEFAULTS };
  const r = raw as Partial<ReminderSettings>;
  const interval: ReminderInterval =
    r.intervalMin === 15 || r.intervalMin === 30 || r.intervalMin === 60
      ? r.intervalMin
      : DEFAULTS.intervalMin;
  return {
    enabled: typeof r.enabled === 'boolean' ? r.enabled : DEFAULTS.enabled,
    intervalMin: interval,
  };
}

function readLocal(userId?: string | null): ReminderSettings {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { ...DEFAULTS };
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULTS };
  }
}

function writeLocal(next: ReminderSettings, userId?: string | null) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  } catch { /* ignore */ }
}

export function getReminderSettings(): ReminderSettings {
  return readLocal();
}

export function setReminderSettings(patch: Partial<ReminderSettings>): ReminderSettings {
  const next = normalize({ ...readLocal(), ...patch });
  writeLocal(next);
  try {
    window.dispatchEvent(new CustomEvent<ReminderSettings>(EVENT, { detail: next }));
  } catch { /* ignore */ }
  // Fire-and-forget: sincroniza com o backend para o usuário atual.
  if (currentUserId) void persistToProfile(currentUserId, next);
  return next;
}

export function subscribeReminderSettings(
  handler: (s: ReminderSettings) => void,
): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<ReminderSettings>).detail;
    handler(detail ?? readLocal());
  };
  window.addEventListener(EVENT, listener);
  const storageListener = (e: StorageEvent) => {
    if (e.key === storageKey()) handler(readLocal());
  };
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', storageListener);
  };
}

// ─── Sincronização com Supabase ────────────────────────────────────────────

async function persistToProfile(userId: string, settings: ReminderSettings): Promise<void> {
  try {
    // upsert por user_id — garante criação do perfil se ainda não existir.
    await supabase
      .from('profiles')
      .update({ reminder_settings: settings as unknown as Record<string, unknown> })
      .eq('user_id', userId);
  } catch { /* ignore — cache local já foi atualizado */ }
}

async function loadFromProfile(userId: string): Promise<ReminderSettings | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('reminder_settings')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    return normalize((data as { reminder_settings?: unknown }).reminder_settings);
  } catch {
    return null;
  }
}

/**
 * Vincula as preferências ao usuário autenticado: reidrata do backend
 * (sobrescreve o cache local) e passa a persistir toda mudança futura no
 * perfil correspondente. Chame no bootstrap após obter o `user.id`.
 */
export async function bindReminderUser(userId: string | null): Promise<ReminderSettings> {
  currentUserId = userId;
  if (!userId) return readLocal();

  // Se ainda não há cache para esse usuário, migra a preferência legada.
  const legacyRaw = localStorage.getItem(BASE_KEY);
  if (legacyRaw && !localStorage.getItem(storageKey(userId))) {
    try { localStorage.setItem(storageKey(userId), legacyRaw); } catch { /* ignore */ }
  }

  const remote = await loadFromProfile(userId);
  if (remote) {
    writeLocal(remote, userId);
    try {
      window.dispatchEvent(new CustomEvent<ReminderSettings>(EVENT, { detail: remote }));
    } catch { /* ignore */ }
    return remote;
  }

  // Sem registro remoto ainda — envia o cache local para materializar.
  const local = readLocal(userId);
  void persistToProfile(userId, local);
  return local;
}
