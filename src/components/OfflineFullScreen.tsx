import { useEffect, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useOfflineCache';

/**
 * Full-screen professional SVG shown when the device loses internet connection.
 * Tactical dark theme, self-contained (no external assets), fully scalable.
 */
export function OfflineFullScreen() {
  const { isOnline } = useNetworkStatus();
  const [visible, setVisible] = useState(!isOnline);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!isOnline) setVisible(true);
    else if (visible) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [isOnline, visible]);

  if (!visible) return null;

  const handleRetry = () => {
    setRetrying(true);
    // Give a small UX beat before reloading
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-label="Sem conexão com a internet"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/98 backdrop-blur-sm animate-fade-in"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="off-bg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="55%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <linearGradient id="off-amber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <pattern id="off-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.4" />
          </pattern>
          <filter id="off-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="800" height="800" fill="url(#off-bg)" />
        <rect width="800" height="800" fill="url(#off-grid)" />

        {/* Concentric signal arcs (broken) */}
        <g transform="translate(400 340)" stroke="url(#off-amber)" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M -180 60 A 180 180 0 0 1 -60 -110" strokeWidth="6" />
          <path d="M 60 -110 A 180 180 0 0 1 180 60" strokeWidth="6" />
          <path d="M -120 40 A 120 120 0 0 1 -40 -70" strokeWidth="5" opacity="0.75" />
          <path d="M 40 -70 A 120 120 0 0 1 120 40" strokeWidth="5" opacity="0.75" />
          <path d="M -60 20 A 60 60 0 0 1 -20 -30" strokeWidth="4" opacity="0.6" />
          <path d="M 20 -30 A 60 60 0 0 1 60 20" strokeWidth="4" opacity="0.6" />
        </g>

        {/* Antenna / device */}
        <g transform="translate(400 380)" filter="url(#off-glow)">
          <circle r="18" fill="url(#off-amber)" />
          <circle r="10" fill="#0f172a" />
        </g>

        {/* Diagonal slash */}
        <line
          x1="240"
          y1="200"
          x2="560"
          y2="500"
          stroke="#ef4444"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#off-glow)"
        />

        {/* Corner brackets — tactical framing */}
        <g stroke="#f59e0b" strokeWidth="4" fill="none" opacity="0.7">
          <path d="M60 60 H120 M60 60 V120" />
          <path d="M740 60 H680 M740 60 V120" />
          <path d="M60 740 H120 M60 740 V680" />
          <path d="M740 740 H680 M740 740 V680" />
        </g>
      </svg>

      {/* Overlay content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-md">
        <div className="rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400">
          Status: Desconectado
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Sem conexão com a internet
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Verifique sua rede Wi-Fi ou dados móveis. Alguns recursos essenciais
          permanecem disponíveis em modo offline com os dados sincronizados
          anteriormente.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-70 disabled:cursor-wait text-slate-950 font-semibold px-6 py-3 transition-colors shadow-lg shadow-amber-500/20"
          >
            {retrying ? 'Reconectando...' : 'Tentar novamente'}
          </button>
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
            {isOnline ? 'Sinal restaurado' : 'Aguardando sinal'}
          </div>
        </div>
      </div>
    </div>
  );
}
