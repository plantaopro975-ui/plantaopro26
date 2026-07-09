import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useOfflineCache';

/**
 * Tela profissional exibida quando o dispositivo perde conexão.
 * SVG tático escalável + painel de ferramentas offline para agentes
 * socioeducativos e de segurança pública (dados sincronizados previamente).
 */
export function OfflineFullScreen() {
  const { isOnline } = useNetworkStatus();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(!isOnline);
  const [retrying, setRetrying] = useState(false);
  const [now, setNow] = useState<string>(() => new Date().toLocaleTimeString('pt-BR'));

  useEffect(() => {
    if (!isOnline) setVisible(true);
    else if (visible) {
      const t = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(t);
    }
  }, [isOnline, visible]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setNow(new Date().toLocaleTimeString('pt-BR')), 1000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => window.location.reload(), 400);
  };

  const go = (path: string) => {
    setVisible(false);
    setTimeout(() => navigate(path), 50);
  };

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-label="Sem conexão com a internet — Modo offline"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/98 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      {/* Background SVG — full-bleed */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="off-bg2" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="55%" stopColor="#0b1220" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <linearGradient id="off-amber2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <pattern id="off-grid2" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
          </pattern>
          <filter id="off-glow2" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1200" height="900" fill="url(#off-bg2)" />
        <rect width="1200" height="900" fill="url(#off-grid2)" opacity="0.6" />

        {/* Signal arcs (broken) around emblem */}
        <g transform="translate(600 320)" stroke="url(#off-amber2)" fill="none" strokeLinecap="round" opacity="0.8">
          <path d="M -220 70 A 220 220 0 0 1 -70 -140" strokeWidth="6" />
          <path d="M 70 -140 A 220 220 0 0 1 220 70" strokeWidth="6" />
          <path d="M -150 50 A 150 150 0 0 1 -50 -90" strokeWidth="5" opacity="0.7" />
          <path d="M 50 -90 A 150 150 0 0 1 150 50" strokeWidth="5" opacity="0.7" />
          <path d="M -80 25 A 80 80 0 0 1 -25 -40" strokeWidth="4" opacity="0.55" />
          <path d="M 25 -40 A 80 80 0 0 1 80 25" strokeWidth="4" opacity="0.55" />
        </g>

        {/* Emblem — shield with chevron (agent identity) */}
        <g transform="translate(600 320)" filter="url(#off-glow2)">
          <path
            d="M0 -60 L46 -44 V-8 C46 22 26 46 0 56 C-26 46 -46 22 -46 -8 V-44 Z"
            fill="rgba(245,158,11,0.08)"
            stroke="url(#off-amber2)"
            strokeWidth="2.5"
          />
          <path d="M-24 18 L0 6 L24 18" stroke="url(#off-amber2)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-24 32 L0 20 L24 32" stroke="url(#off-amber2)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <circle r="6" cy="-22" fill="url(#off-amber2)" />
        </g>

        {/* Red diagonal slash across signal */}
        <line
          x1="440"
          y1="180"
          x2="760"
          y2="460"
          stroke="#ef4444"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.9"
          filter="url(#off-glow2)"
        />

        {/* Corner tactical brackets */}
        <g stroke="#f59e0b" strokeWidth="4" fill="none" opacity="0.6">
          <path d="M40 40 H110 M40 40 V110" />
          <path d="M1160 40 H1090 M1160 40 V110" />
          <path d="M40 860 H110 M40 860 V790" />
          <path d="M1160 860 H1090 M1160 860 V790" />
        </g>
      </svg>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl px-5 py-8 sm:px-8 sm:py-10 text-center">
        {/* Status pill */}
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.25em] text-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
          Modo Offline · Sinal Perdido
        </div>

        <h1 className="mt-5 text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Sem conexão com a rede
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto">
          Operação continua em modo tático offline. Recursos essenciais para
          agentes socioeducativos e de segurança pública seguem disponíveis com
          os dados sincronizados anteriormente.
        </p>

        {/* Offline tools grid */}
        <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
          <OfflineTool
            label="Escala"
            hint="Turnos salvos"
            onClick={() => go('/agent-panel')}
            icon={
              <path d="M4 5h16M4 9h16M4 13h10M4 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            }
          />
          <OfflineTool
            label="Equipe"
            hint="Contatos cache"
            onClick={() => go('/agent-panel')}
            icon={
              <>
                <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
                <circle cx="17" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" fill="none" />
                <path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-3.5 4-3.5s3 1 3 3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </>
            }
          />
          <OfflineTool
            label="Protocolos"
            hint="Consulta local"
            onClick={() => go('/agent-panel')}
            icon={
              <>
                <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" fill="none" />
                <path d="M14 3v4h4M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            }
          />
          <OfflineTool
            label="Diagnóstico"
            hint="Rede & cache"
            onClick={() => go('/install')}
            icon={
              <>
                <path d="M3 12h4l2-5 4 10 2-5h6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </>
            }
          />
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-70 disabled:cursor-wait text-slate-950 font-semibold px-6 py-3 transition-colors shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            {retrying ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Reconectando…
              </>
            ) : (
              'Tentar novamente'
            )}
          </button>
          <button
            type="button"
            onClick={() => go('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-amber-200 font-semibold px-6 py-3 transition-colors"
          >
            Ir para o painel
          </button>
        </div>

        {/* Bottom telemetry bar */}
        <div className="mt-6 flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">
          <span>Cache · Sincronizado</span>
          <span className="text-amber-300/70">{now}</span>
          <span>{isOnline ? 'Sinal · OK' : 'Sinal · N/A'}</span>
        </div>
      </div>
    </div>
  );
}

function OfflineTool({
  label,
  hint,
  icon,
  onClick,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-slate-900/70 hover:border-amber-500/50 hover:bg-slate-900 px-3 py-2.5 text-left transition-colors active:scale-[0.98]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 group-hover:text-amber-200">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          {icon}
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-slate-100">{label}</span>
        <span className="block truncate text-[10px] font-mono uppercase tracking-wider text-slate-500">{hint}</span>
      </span>
    </button>
  );
}
