/**
 * Preferências do lembrete automático de rondas.
 * Persistidas em localStorage e observáveis via evento customizado
 * `reminder-settings:change`, para que consumidores (hook global) reajam
 * imediatamente sem precisar de refresh.
 */

export type ReminderInterval = 15 | 30 | 60;

export interface ReminderSettings {
  enabled: boolean;
  intervalMin: ReminderInterval;
}

const KEY = 'plantaopro_reminder_settings_v1';
const EVENT = 'reminder-settings:change';

const DEFAULTS: ReminderSettings = { enabled: true, intervalMin: 30 };

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

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return normalize(JSON.parse(raw));
  } catch {
    return { ...DEFAULTS };
  }
}

export function setReminderSettings(patch: Partial<ReminderSettings>): ReminderSettings {
  const next = normalize({ ...getReminderSettings(), ...patch });
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent<ReminderSettings>(EVENT, { detail: next }));
  } catch {
    /* ignore */
  }
  return next;
}

export function subscribeReminderSettings(
  handler: (s: ReminderSettings) => void,
): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<ReminderSettings>).detail;
    handler(detail ?? getReminderSettings());
  };
  window.addEventListener(EVENT, listener);
  // Também escuta mudanças vindas de outras abas
  const storageListener = (e: StorageEvent) => {
    if (e.key === KEY) handler(getReminderSettings());
  };
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', storageListener);
  };
}
