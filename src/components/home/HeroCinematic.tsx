import { Radio, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { toast } from 'sonner';
import heroImage from '@/assets/hero-command.jpg';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadio from '@/assets/icons-3d/noir-radio.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconHandcuffs from '@/assets/icons-3d/noir-handcuffs.png';
import agentFigure from '@/assets/tactical-agent-figure.png';
import policeVehicle from '@/assets/police-vehicle-3d.png';
import comandoCover from '@/assets/comando-operacional-cover.jpg';
import { getTeamPoster, getTeamColors } from '@/lib/teamAssets';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';


type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

type Transform = { xPct: number; yPct: number; scale: number };

type DragH = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  wasMoved: () => boolean;
};

type PointerPoint = { x: number; y: number };

type GestureSession =
  | { mode: 'drag'; startPoint: PointerPoint; startTransform: Transform }
  | { mode: 'pinch'; startCentroid: PointerPoint; startDistance: number; startTransform: Transform };

const SCALE_LIMITS = { min: 0.35, max: 2.8 };

const clampTransform = (t: Transform): Transform => ({
  xPct: Math.min(100, Math.max(0, t.xPct)),
  yPct: Math.min(100, Math.max(0, t.yPct)),
  scale: Math.min(SCALE_LIMITS.max, Math.max(SCALE_LIMITS.min, t.scale)),
});

const getViewportSize = () => ({
  width: Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1),
  height: Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1),
});

const getDistance = (a: PointerPoint, b: PointerPoint) => Math.hypot(a.x - b.x, a.y - b.y);

const getCentroid = (a: PointerPoint, b: PointerPoint): PointerPoint => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

function useViewportAssetControls(
  transform: Transform,
  setTransform: React.Dispatch<React.SetStateAction<Transform>>,
  resetTransform: Transform,
): DragH {
  const transformRef = useRef(transform);
  const pointersRef = useRef<Map<number, PointerPoint>>(new Map());
  const sessionRef = useRef<GestureSession | null>(null);
  const movedRef = useRef(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const applyTransform = useCallback((next: Transform) => {
    const clamped = clampTransform(next);
    transformRef.current = clamped;
    setTransform(clamped);
  }, [setTransform]);

  const startPinchSession = useCallback(() => {
    const points = Array.from(pointersRef.current.values()).slice(0, 2);
    if (points.length < 2) return;
    sessionRef.current = {
      mode: 'pinch',
      startCentroid: getCentroid(points[0], points[1]),
      startDistance: Math.max(1, getDistance(points[0], points[1])),
      startTransform: transformRef.current,
    };
  }, []);

  const startDragSession = useCallback((point: PointerPoint) => {
    sessionRef.current = {
      mode: 'drag',
      startPoint: point,
      startTransform: transformRef.current,
    };
  }, []);

  return {
    onPointerDown: (e) => {
      e.preventDefault();
      e.stopPropagation();
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ignore unsupported capture */ }

      const point = { x: e.clientX, y: e.clientY };
      pointersRef.current.set(e.pointerId, point);
      movedRef.current = false;

      if (pointersRef.current.size >= 2) {
        movedRef.current = true;
        startPinchSession();
        return;
      }

      startDragSession(point);
    },
    onPointerMove: (e) => {
      if (!pointersRef.current.has(e.pointerId)) return;

      e.preventDefault();
      e.stopPropagation();
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const activePoints = Array.from(pointersRef.current.values());
      const { width, height } = getViewportSize();

      if (activePoints.length >= 2) {
        if (!sessionRef.current || sessionRef.current.mode !== 'pinch') startPinchSession();
        const session = sessionRef.current;
        if (!session || session.mode !== 'pinch') return;

        const [first, second] = activePoints;
        const centroid = getCentroid(first, second);
        const distance = Math.max(1, getDistance(first, second));

        movedRef.current = true;
        applyTransform({
          xPct: session.startTransform.xPct + ((centroid.x - session.startCentroid.x) / width) * 100,
          yPct: session.startTransform.yPct + ((centroid.y - session.startCentroid.y) / height) * 100,
          scale: session.startTransform.scale * (distance / session.startDistance),
        });
        return;
      }

      const session = sessionRef.current;
      if (!session || session.mode !== 'drag') return;

      const point = activePoints[0];
      const dx = point.x - session.startPoint.x;
      const dy = point.y - session.startPoint.y;

      if (Math.hypot(dx, dy) > 3) movedRef.current = true;
      if (!movedRef.current) return;

      applyTransform({
        xPct: session.startTransform.xPct + (dx / width) * 100,
        yPct: session.startTransform.yPct + (dy / height) * 100,
        scale: session.startTransform.scale,
      });
    },
    onPointerUp: (e) => {
      e.preventDefault();
      e.stopPropagation();
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore unsupported capture */ }

      pointersRef.current.delete(e.pointerId);

      if (pointersRef.current.size === 1) {
        startDragSession(Array.from(pointersRef.current.values())[0]);
        return;
      }

      if (pointersRef.current.size === 0) {
        if (!movedRef.current) {
          const now = Date.now();
          if (now - lastTapRef.current < 350) {
            applyTransform(resetTransform);
            lastTapRef.current = 0;
          } else {
            lastTapRef.current = now;
          }
        }
        sessionRef.current = null;
      }
    },
    onPointerCancel: (e) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size === 0) sessionRef.current = null;
    },
    onWheel: (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyTransform({
        ...transformRef.current,
        scale: transformRef.current.scale * (e.deltaY < 0 ? 1.08 : 0.92),
      });
    },
    wasMoved: () => movedRef.current,
  };
}

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  onTeamClick?: (team: TeamName) => void;
  agentCount?: number;
  unitsCount?: number;
}

const TEAMS: { name: TeamName; icon: string; kicker: string; motion: string }[] = [
  { name: 'ALFA',    icon: iconShield,    kicker: '01', motion: 'animate-team-shield' },
  { name: 'BRAVO',   icon: iconHelmet,    kicker: '02', motion: 'animate-team-helmet' },
  { name: 'CHARLIE', icon: iconRadio,     kicker: '03', motion: 'animate-team-radio' },
  { name: 'DELTA',   icon: iconHandcuffs, kicker: '04', motion: 'animate-team-handcuffs' },
];

/**
 * INSTITUCIONAL AMAZÔNICO — Sistema Socioeducativo do Acre.
 * Hero full-viewport com brasão SVG, topografia amazônica e cards oficiais.
 */
export function HeroCinematic({ onTeamClick }: HeroCinematicProps) {
  const onlineCount = useOnlinePresence();

  const loadTransform = (key: string, def: Transform): Transform => {
    try {
      const v = localStorage.getItem(key);
      if (!v) return def;
      const parsed = JSON.parse(v);
      if (typeof parsed?.xPct === 'number') return parsed as Transform;
      return def;
    } catch { return def; }
  };
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
  // Sincronização opcional entre mobile e desktop: quando ativa, usa as mesmas chaves.
  const [syncDevices, setSyncDevices] = useState<boolean>(() => {
    try { return localStorage.getItem('hero_sync_devices') === '1'; } catch { return false; }
  });
  const agentKey = syncDevices ? 'hero_agent_t' : (isMobile ? 'hero_agent_t_mobile' : 'hero_agent_t_desktop');
  const vehicleKey = syncDevices ? 'hero_vehicle_t' : (isMobile ? 'hero_vehicle_t_mobile' : 'hero_vehicle_t_desktop');
  const [agentT, setAgentT] = useState<Transform>(() => {
    // Reset único: reposiciona o boneco junto à viatura.
    try {
      if (!localStorage.getItem('hero_agent_reset_v6')) {
        localStorage.removeItem('hero_agent_t_mobile');
        localStorage.removeItem('hero_agent_t_desktop');
        localStorage.setItem('hero_agent_reset_v6', '1');
      }
    } catch { /* ignore */ }
    return clampTransform(loadTransform(agentKey, { xPct: isMobile ? 72 : 30, yPct: isMobile ? 84 : 55, scale: isMobile ? 0.5 : 1 }));
  });
  const [vehicleT, setVehicleT] = useState<Transform>(() => {
    try {
      if (!localStorage.getItem('hero_vehicle_reset_v5')) {
        localStorage.removeItem('hero_vehicle_t_mobile');
        localStorage.removeItem('hero_vehicle_t_desktop');
        localStorage.setItem('hero_vehicle_reset_v5', '1');
      }
    } catch { /* ignore */ }
    return clampTransform(loadTransform(vehicleKey, { xPct: isMobile ? 28 : 18, yPct: isMobile ? 84 : 55, scale: isMobile ? 0.55 : 1 }));
  });

  useEffect(() => {
    try { localStorage.setItem(agentKey, JSON.stringify(agentT)); } catch { /* ignore */ }
  }, [agentT, agentKey]);
  useEffect(() => {
    try { localStorage.setItem(vehicleKey, JSON.stringify(vehicleT)); } catch { /* ignore */ }
  }, [vehicleT, vehicleKey]);

  // Recarrega transforms quando a chave muda (ao alternar sincronização).
  useEffect(() => {
    setAgentT(clampTransform(loadTransform(agentKey, { xPct: isMobile ? 72 : 30, yPct: isMobile ? 84 : 55, scale: isMobile ? 0.5 : 1 })));
    setVehicleT(clampTransform(loadTransform(vehicleKey, { xPct: isMobile ? 28 : 18, yPct: isMobile ? 84 : 55, scale: isMobile ? 0.55 : 1 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncDevices]);

  const toggleSync = () => {
    setSyncDevices((prev) => {
      const next = !prev;
      try { localStorage.setItem('hero_sync_devices', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };


  const sectionRef = useRef<HTMLElement | null>(null);
  const vehicleRef = useRef<HTMLDivElement | null>(null);

  // ResizeObserver: mantém --beacon-unit proporcional à largura real da viatura,
  // garantindo alinhamento perfeito do giroflex ao teto em qualquer zoom/resize.
  useEffect(() => {
    const el = vehicleRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const apply = (w: number) => {
      const unit = Math.max(4, Math.min(18, w * 0.022));
      el.style.setProperty('--beacon-unit', `${unit}px`);
    };
    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const vehicleReset = { xPct: isMobile ? 28 : 18, yPct: isMobile ? 84 : 55, scale: isMobile ? 0.55 : 1 };
  const agentReset = { xPct: isMobile ? 72 : 30, yPct: isMobile ? 84 : 55, scale: isMobile ? 0.5 : 1 };
  const vDragHRaw = useViewportAssetControls(vehicleT, setVehicleT, vehicleReset);
  const aDragHRaw = useViewportAssetControls(agentT, setAgentT, agentReset);
  // Travado nas posições atuais salvas em localStorage (por dispositivo).
  const noop = () => {};
  const lockedH: DragH = {
    onPointerDown: noop, onPointerMove: noop, onPointerUp: noop,
    onPointerCancel: noop, onWheel: noop, wasMoved: () => false,
  };
  const vDragH = lockedH;
  const aDragH = lockedH;
  const locked = true;

  return (
    <section
      ref={sectionRef as any}
      className="relative h-full min-h-0 w-full flex-1 overflow-hidden rounded-lg border border-primary/30 hero-cinematic"
      aria-label="Sistema Socioeducativo do Acre — Comando Operacional"
      style={{ maxHeight: '100%' }}
    >
      {/* Background */}
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/78 to-background/25" aria-hidden />

      {/* Topografia amazônica — SVG orgânico (curvas de nível) */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] mix-blend-screen"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="topo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
          </linearGradient>
        </defs>
        {Array.from({ length: 9 }).map((_, i) => (
          <path
            key={i}
            d={`M0 ${120 + i * 55} Q 200 ${80 + i * 55} 400 ${140 + i * 55} T 800 ${110 + i * 55}`}
            fill="none"
            stroke="url(#topo)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Toggle: sincronizar posição/tamanho entre mobile e desktop */}
      <button
        type="button"
        onClick={toggleSync}
        className="absolute top-2 right-2 z-20 rounded border border-primary/40 bg-background/70 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-primary/90 backdrop-blur hover:bg-primary/10 transition"
        aria-pressed={syncDevices}
        title="Usa as mesmas coordenadas em mobile e desktop"
      >
        Sync {syncDevices ? 'ON' : 'OFF'}
      </button>



      {/* Viatura + Agente — arrastáveis em qualquer parte da tela (portal viewport-fixed) */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div
            ref={vehicleRef}
            className={`viewport-draggable-asset cursor-grab active:cursor-grabbing police-vehicle block h-[30vh] sm:h-[34vh] lg:h-[42vh] max-h-[52vh] w-auto max-w-[80vw] sm:max-w-[55vw] lg:max-w-[46vw] select-none`}

            style={{
              position: 'fixed',
              left: `${vehicleT.xPct}vw`,
              top: `${vehicleT.yPct}vh`,
              transform: `translate(-50%, -50%) scale(${vehicleT.scale})`,
              transformOrigin: 'center',
              touchAction: 'none',
              pointerEvents: 'auto',
              zIndex: 2147483000,
            }}
            role="img"
            aria-label={isMobile ? 'Viatura — arraste para mover; pinça para redimensionar' : 'Viatura policial'}
            onPointerDown={vDragH.onPointerDown}
            onPointerMove={vDragH.onPointerMove}
            onPointerUp={vDragH.onPointerUp}
            onPointerCancel={vDragH.onPointerCancel}
            onWheel={vDragH.onWheel}
          >
            <img
              src={policeVehicle}
              alt="Viatura policial"
              loading="lazy"
              draggable={false}
              className="h-full w-auto object-contain pointer-events-none"
            />
            <span className="vehicle-fx vehicle-fx--beacon vehicle-fx--beacon-red" aria-hidden />
            <span className="vehicle-fx vehicle-fx--beacon vehicle-fx--beacon-blue" aria-hidden />
          </div>

          <AgentFigure agentT={agentT} dragHandlers={aDragH} locked={locked} />
        </>,
        document.body
      )}








      {/* Foreground content */}
      <div className="pointer-events-none relative z-20 h-full min-h-0 flex flex-col justify-start sm:justify-between gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 py-3 sm:py-5 [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
        {/* Top eyebrow */}
        <div
          className="relative rounded-lg overflow-hidden border border-accent/40 p-2 sm:p-4"
        >
          {/* Capa realista — sala de comando */}
          <img
            src={comandoCover}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          {/* Overlays para legibilidade */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--card)/0.94) 0%, hsl(var(--card)/0.82) 35%, hsl(var(--primary)/0.45) 70%, hsl(var(--accent)/0.25) 100%)',
            }}
          />
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full pointer-events-none opacity-60"
            viewBox="0 0 800 300"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern id="top-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M24 0 H0 V24" fill="none" stroke="hsl(var(--accent))" strokeOpacity="0.18" strokeWidth="0.6" />
              </pattern>
              <linearGradient id="top-stripe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="800" height="300" fill="url(#top-grid)" />
            <rect x="0" y="2" width="800" height="1" fill="url(#top-stripe)" />
            <rect x="0" y="297" width="800" height="1" fill="url(#top-stripe)" />
          </svg>


          <div className="relative flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
              <div className="inline-flex items-center gap-2 text-[8px] sm:text-[10px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-accent/90 font-mono">
                <span className="h-px w-4 sm:w-6 bg-accent/60" />
                Segurança Pública · Socioeducativo
              </div>
              <h1 className="font-mono uppercase text-[14px] sm:text-[26px] lg:text-[34px] leading-[1.05] font-extrabold text-foreground tracking-[0.04em] max-w-[18ch]">
                Comando <span className="text-accent">Operacional</span>
                <br />
                <span className="text-primary-glow">para quem está na linha de frente</span>
              </h1>
              <p className="hidden sm:block max-w-[46ch] text-[11px] sm:text-[13px] leading-snug text-muted-foreground font-mono">
                Coordenação tática em tempo real, escalas inteligentes e comunicação segura entre equipes — feito por agentes, para agentes.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground font-mono">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent" />
                Feijó · AC · Amazônia Ocidental
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-primary/40 bg-background/70 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-success font-mono tabular-nums">
                {onlineCount} online
              </span>
              <span className="h-3 w-px bg-success/30" aria-hidden />
              <Radio className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px] font-bold tracking-[0.28em] uppercase text-success font-mono">
                Rede 24/7
              </span>
            </div>

          </div>
        </div>

        {/* Cards — 2x2 mobile, 4x1 desktop */}
        <div className="mt-2 sm:mt-auto min-h-0">
          <div
            className="relative rounded-lg overflow-hidden border border-accent/40 p-2 sm:p-3"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--card)/0.95) 0%, hsl(var(--primary)/0.35) 55%, hsl(var(--accent)/0.25) 100%)',
            }}
          >
            {/* SVG tático institucional */}
            <svg
              aria-hidden
              className="absolute inset-0 h-full w-full pointer-events-none opacity-70"
              viewBox="0 0 800 300"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern id="hub-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M24 0 H0 V24" fill="none" stroke="hsl(var(--accent))" strokeOpacity="0.18" strokeWidth="0.6" />
                </pattern>
                <radialGradient id="hub-glow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="hub-stripe" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect width="800" height="300" fill="url(#hub-grid)" />
              <rect width="800" height="300" fill="url(#hub-glow)" />
              {/* Escudo institucional central */}
              <g opacity="0.09" transform="translate(400 150)">
                <path
                  d="M0 -90 L75 -55 L75 30 Q75 75 0 105 Q-75 75 -75 30 L-75 -55 Z"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="1.5"
                />
                <path
                  d="M0 -65 L55 -38 L55 25 Q55 60 0 82 Q-55 60 -55 25 L-55 -38 Z"
                  fill="none"
                  stroke="hsl(var(--primary-glow))"
                  strokeWidth="1"
                />
              </g>
              {/* Faixas superiores/inferiores */}
              <rect x="0" y="2" width="800" height="1" fill="url(#hub-stripe)" />
              <rect x="0" y="297" width="800" height="1" fill="url(#hub-stripe)" />
            </svg>


          <div className="relative mb-1.5 sm:mb-2 flex items-center gap-2 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.32em] text-muted-foreground/80 font-mono">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/60" />
            Selecione sua equipe operacional
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/60" />
          </div>

          <ul
            className="relative hero-team-grid grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full max-w-6xl mx-auto"
            role="list"
            aria-label="Equipes operacionais"
          >
            {TEAMS.map((t) => {
              const tc = getTeamColors(t.name);
              return (
              <li key={t.name} className="flex">
                <button
                  type="button"
                  data-team-card
                  onClick={() => onTeamClick?.(t.name)}
                  className="team-card-3d group relative w-full flex flex-col items-center justify-center text-center gap-1.5 p-2 sm:p-3 lg:p-4 min-h-[130px] sm:min-h-[144px] lg:min-h-[172px] rounded-md border border-accent/40 hover:border-accent/70 overflow-hidden focus:outline-none focus-visible:ring-2 transition-all duration-300"
                  style={{
                    // @ts-ignore CSS var
                    ['--team-ring' as any]: tc.ring,
                    // @ts-ignore CSS var
                    ['--team-glow' as any]: tc.glow,
                    boxShadow: `0 0 0 1px hsl(var(--accent) / 0.15), 0 10px 24px -12px ${tc.glow}`,
                  }}
                  aria-label={`Acessar equipe ${t.name}`}
                >
                  {/* Capa hero realista — poster oficial da equipe (background) */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-md overflow-hidden"
                  >
                    <img
                      src={getTeamPoster(t.name)}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                      style={{ filter: 'saturate(0.9) contrast(1.08) brightness(0.92)' }}
                    />
                    {/* Grade navy uniforme — mesma base cromática dos posters */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, hsl(var(--background)/0.35) 0%, hsl(var(--background)/0.15) 45%, hsl(var(--background)/0.9) 100%)',
                      }}
                    />
                    {/* Key light dourado no canto superior direito — replica iluminação dos posters */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 82% 12%, hsl(var(--accent)/0.28) 0%, transparent 45%)',
                      }}
                    />
                    {/* Vinheta noir */}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)',
                      }}
                    />
                    {/* Borda interna dourada */}
                    <span aria-hidden className="absolute inset-0 ring-1 ring-inset ring-accent/15 rounded-md" />
                  </span>
                  {/* Canto oficial (cobre) */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-accent/70 rounded-tl-md"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-accent/50 rounded-br-md"
                  />
                  {/* Kicker número */}
                  <span className="absolute top-1.5 right-2 text-[9px] font-mono tracking-[0.2em] text-accent/80">
                    /{t.kicker}
                  </span>

                  <span
                    className="relative inline-flex items-center justify-center"
                    title={`Equipe ${t.name} — clique para acessar`}
                  >
                    <img
                      src={t.icon}
                      alt=""
                      loading="lazy"
                      className={`team-icon-3d ${t.motion} relative h-14 w-14 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] group-hover:scale-110 group-active:scale-95`}
                    />
                  </span>
                  <div className="relative mt-0.5">
                    <div className="font-mono uppercase text-base sm:text-lg lg:text-xl font-extrabold text-foreground leading-none tracking-[0.18em]">
                      {t.name}
                    </div>
                    <div className="mt-1 h-px w-8 mx-auto bg-gradient-to-r from-transparent via-accent to-transparent" />
                    <div className="mt-1 text-[9px] sm:text-[9px] uppercase tracking-[0.24em] sm:tracking-[0.32em] text-muted-foreground font-mono">
                      Equipe
                    </div>
                  </div>
                </button>
              </li>
            );})}
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Boneco arrastável + triple-tap para admin (só conta se não houve arraste). */
function AgentFigure({ agentT, dragHandlers, locked = false }: { agentT: Transform; dragHandlers: DragH; locked?: boolean }) {
  const clicksRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const tapStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const registerTap = () => {
    clicksRef.current += 1;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => { clicksRef.current = 0; }, 700);
    if (clicksRef.current >= 3) {
      clicksRef.current = 0;
      toast('Acesso do administrador', {
        description: 'Confirme para abrir o login restrito.',
        duration: 6000,
        action: { label: 'Confirmar', onClick: () => window.dispatchEvent(new CustomEvent('open-master-login')) },
        cancel: { label: 'Cancelar', onClick: () => {} },
      });
    }
  };

  return (
    <div
      role="img"
      aria-label="Agente tático — arraste para reposicionar; toque 3 vezes para acesso admin"
      title="Arraste para mover · 3 cliques rápidos = admin"
      onPointerDown={(e) => {
        tapStartRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
        dragHandlers.onPointerDown(e);
      }}
      onPointerMove={dragHandlers.onPointerMove}
      onPointerUp={(e) => {
        const s = tapStartRef.current;
        tapStartRef.current = null;
        dragHandlers.onPointerUp(e);
        if (!s) return;
        const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y);
        const dur = Date.now() - s.t;
        // Só conta como triple-tap se o dedo/mouse praticamente não moveu.
        if (moved < 8 && dur < 420) registerTap();
      }}
      onPointerCancel={(e) => {
        tapStartRef.current = null;
        dragHandlers.onPointerCancel(e);
      }}
      onWheel={dragHandlers.onWheel}
      style={{
        position: 'fixed',
        left: `${agentT.xPct}vw`,
        top: `${agentT.yPct}vh`,
        transform: `translate(-50%, -50%) scale(${agentT.scale})`,
        transformOrigin: 'center',
        touchAction: locked ? 'manipulation' : 'none',
        pointerEvents: 'auto',
        zIndex: 2147483001,
      }}
      className={`${locked ? '' : 'viewport-draggable-asset '}agent-figure block h-[30vh] sm:h-[30vh] lg:h-[38vh] max-h-[46vh] w-auto max-w-[46vw] sm:max-w-[28vw] lg:max-w-[22vw] select-none opacity-95 ${locked ? '' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <img
        src={agentFigure}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className="h-full w-auto object-contain object-bottom pointer-events-none"
      />
    </div>
  );
}


