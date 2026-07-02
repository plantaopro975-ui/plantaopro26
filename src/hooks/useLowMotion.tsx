import { useEffect, useState, useCallback } from 'react';

const KEY = 'agent_low_motion';
const EVT = 'low-motion-change';

function read(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(KEY) === '1') return true;
  if (localStorage.getItem(KEY) === '0') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
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
