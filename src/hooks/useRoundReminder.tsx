import { useEffect, useRef, useState } from 'react';

/**
 * Hook global de lembrete de rondas.
 *
 * A cada `intervalMin` (default 30) minutos após o último dismiss/abertura,
 * dispara `open = true`. O timestamp do último aviso é persistido em
 * localStorage para sobreviver a refresh e trocas de aba.
 *
 * Pode ser pausado (ex.: quando o gestor de rondas está aberto ou uma
 * ronda está ativa) via `paused`.
 */
export function useRoundReminder(options?: { intervalMin?: number; paused?: boolean }) {
  const intervalMin = options?.intervalMin ?? 30;
  const paused = !!options?.paused;
  const STORAGE_KEY = 'plantaopro_last_round_reminder_at';
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;

  const getLastAt = (): number => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const n = raw ? parseInt(raw, 10) : NaN;
      return Number.isFinite(n) ? n : 0;
    } catch { return 0; }
  };

  const setLastAt = (ms: number) => {
    try { localStorage.setItem(STORAGE_KEY, String(ms)); } catch { /* ignore */ }
  };

  // Se nunca gravado, seta agora — evita disparar assim que carrega.
  useEffect(() => {
    if (getLastAt() === 0) setLastAt(Date.now());
  }, []);

  useEffect(() => {
    if (paused) return;
    const check = () => {
      if (openRef.current) return;
      const last = getLastAt();
      const elapsed = Date.now() - last;
      if (elapsed >= intervalMin * 60_000) {
        setOpen(true);
      }
    };
    check();
    const iv = window.setInterval(check, 15_000); // 15s de granularidade
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMin, paused]);

  const dismiss = () => {
    setLastAt(Date.now());
    setOpen(false);
  };

  /** Marca como resolvido — igual a dismiss mas semanticamente indica ação. */
  const acknowledge = () => dismiss();

  return { open, dismiss, acknowledge };
}
