import { useEffect, useState, useCallback } from 'react';

const KEY = 'agent_low_motion';
const EVT = 'low-motion-change';

function detectSlowDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    // Hardware signals
    const cores = (navigator as any).hardwareConcurrency ?? 8;
    const mem = (navigator as any).deviceMemory ?? 8;
    if (cores <= 4 || mem <= 2) return true;

    // Network signals (Save-Data or slow effective type)
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      if (conn.saveData) return true;
      if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return true;
    }

    // Mobile UA fallback with low DPR
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile && (window.devicePixelRatio ?? 1) < 2 && cores <= 6) return true;
  } catch {
    // ignore
  }
  return false;
}

function read(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(KEY);
  if (stored === '1') return true;
  if (stored === '0') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
  return detectSlowDevice();
}

export function useLowMotion() {
  const [lowMotion, setLowMotion] = useState<boolean>(() => read());

  useEffect(() => {
    const onChange = () => setLowMotion(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !read();
    localStorage.setItem(KEY, next ? '1' : '0');
    window.dispatchEvent(new Event(EVT));
    setLowMotion(next);
  }, []);

  const set = useCallback((v: boolean) => {
    localStorage.setItem(KEY, v ? '1' : '0');
    window.dispatchEvent(new Event(EVT));
    setLowMotion(v);
  }, []);

  return { lowMotion, toggle, set };
}
