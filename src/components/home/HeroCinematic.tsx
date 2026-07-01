import { useEffect, useRef } from 'react';
import { ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import heroImage from '@/assets/hero-noir-gold.jpg';
import iconShield from '@/assets/icons-3d/noir-shield.png';
import iconRadio from '@/assets/icons-3d/noir-radio.png';
import iconHelmet from '@/assets/icons-3d/noir-helmet.png';
import iconBeacon from '@/assets/icons-3d/noir-beacon.png';
import agentFigure from '@/assets/tactical-agent-figure.png';
import policeVehicle from '@/assets/police-vehicle-3d.png';



type TeamName = 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  onTeamClick?: (team: TeamName) => void;
  agentCount?: number;
  unitsCount?: number;
}

const TEAMS: { name: TeamName; icon: string; motto: string; accent: string; anim: string }[] = [
  { name: 'ALFA',    icon: iconShield,  motto: 'Escudo · Proteção',   accent: 'from-emerald-400/25 to-transparent', anim: 'animate-team-shield' },
  { name: 'BRAVO',   icon: iconHelmet,  motto: 'Espada · Ação',       accent: 'from-orange-400/25 to-transparent', anim: 'animate-team-helmet' },
  { name: 'CHARLIE', icon: iconRadio,   motto: 'Rádio · Comunicação', accent: 'from-sky-400/25 to-transparent',    anim: 'animate-team-radio'  },
  { name: 'DELTA',   icon: iconBeacon,  motto: 'Sirene · Resposta',   accent: 'from-red-500/25 to-transparent',    anim: 'animate-team-beacon' },
];


/**
 * Noir & Gold — Hero + Bento (equipes 3D).
 */
export function HeroCinematic({
  onPrimaryAction,
  onTeamClick,
  agentCount = 248,
  unitsCount = 9,
}: HeroCinematicProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Parallax otimizado: só ativa a partir de xl (onde a viatura aparece);
  // em md e abaixo, listeners não são registrados e o cálculo é evitado.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    // Coarse pointers (touch) e viewports pequenas: nada a fazer.
    if (window.matchMedia?.('(pointer: coarse)').matches) return;

    const mql = window.matchMedia('(min-width: 1280px)');
    let cleanupActive: (() => void) | null = null;

    const activate = () => {
      let rect = el.getBoundingClientRect();
      let clientX = 0, clientY = 0;
      let lastMx = 0, lastMy = 0;
      let ticking = false;
      let visible = true;

      const refreshRect = () => { rect = el.getBoundingClientRect(); };
      const flush = () => {
        ticking = false;
        const mx = ((clientX - rect.left) / rect.width) * 2 - 1;
        const my = ((clientY - rect.top) / rect.height) * 2 - 1;
        if (Math.abs(mx - lastMx) < 0.005 && Math.abs(my - lastMy) < 0.005) return;
        lastMx = mx; lastMy = my;
        el.style.setProperty('--mx', mx.toFixed(3));
        el.style.setProperty('--my', my.toFixed(3));
      };
      const onMove = (e: MouseEvent) => {
        clientX = e.clientX; clientY = e.clientY;
        if (ticking || !visible) return;
        ticking = true;
        requestAnimationFrame(flush);
      };
      const onLeave = () => {
        lastMx = 0; lastMy = 0;
        el.style.setProperty('--mx', '0');
        el.style.setProperty('--my', '0');
      };
      const onVisibility = () => { visible = !document.hidden; };

      el.addEventListener('mousemove', onMove, { passive: true });
      el.addEventListener('mouseleave', onLeave, { passive: true });
      window.addEventListener('scroll', refreshRect, { passive: true });
      window.addEventListener('resize', refreshRect, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
        window.removeEventListener('scroll', refreshRect);
        window.removeEventListener('resize', refreshRect);
        document.removeEventListener('visibilitychange', onVisibility);
        el.style.setProperty('--mx', '0');
        el.style.setProperty('--my', '0');
      };
    };

    const sync = () => {
      if (mql.matches && !cleanupActive) {
        cleanupActive = activate();
      } else if (!mql.matches && cleanupActive) {
        cleanupActive();
        cleanupActive = null;
      }
    };
    sync();
    mql.addEventListener('change', sync);

    return () => {
      mql.removeEventListener('change', sync);
      cleanupActive?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden rounded-xl border border-border/60 hero-cinematic"
      aria-label="Comando Operacional — Sistema Socioeducativo do Acre"
      style={{ minHeight: 'clamp(260px, 32vh, 340px)' }}
    >
      <img
        src={heroImage}
        alt="Sala de comando noir & gold"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" aria-hidden />

      {/* Agente tático — visível em todos os breakpoints */}
      <img
        src={agentFigure}
        alt=""
        aria-hidden
        width={768}
        height={1280}
        loading="lazy"
        draggable={false}
        className="agent-figure block select-none absolute z-30 bottom-0 left-1/2 -translate-x-1/2 h-[55%] sm:h-[65%] lg:h-[75%] xl:h-[80%] w-auto object-contain object-bottom pointer-events-none [filter:drop-shadow(0_12px_28px_rgba(0,0,0,0.6))]"
      />

      {/* Viatura policial 3D — visível em todos os breakpoints */}
      <img
        src={policeVehicle}
        alt=""
        aria-hidden
        width={1536}
        height={768}
        loading="lazy"
        style={{ width: 'clamp(90px, 14vw, 220px)' }}
        className="police-vehicle police-vehicle--mouse block pointer-events-none select-none absolute z-10 bottom-2 left-2 sm:left-4 xl:left-8 object-contain origin-bottom-left opacity-90"
      />


      <div className="relative z-10 h-full flex flex-col gap-2.5 px-3 sm:px-5 lg:px-8 py-3">
        {/* eyebrow */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-primary/30 bg-background/50 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] uppercase text-primary/95 font-sans">
              ISE · Acre · Comando
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70 font-medium font-sans">
            <Radio className="h-3 w-3 text-primary/70" />
            24/7
          </div>
        </div>

        {/* Team Bento */}
        <div className="flex-1 flex items-end">
          <ul className="hero-team-grid grid grid-cols-4 gap-2 sm:gap-3 w-full" role="list" aria-label="Equipes operacionais">

            {TEAMS.map((t) => (
              <li key={t.name} className="flex">
                <button
                  type="button"
                  data-team-card
                  onClick={() => onTeamClick?.(t.name)}
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    if ((el as any)._raf) return;
                    const cx = e.clientX, cy = e.clientY;
                    (el as any)._raf = requestAnimationFrame(() => {
                      (el as any)._raf = 0;
                      const r = el.getBoundingClientRect();
                      const px = ((cx - r.left) / r.width) * 100;
                      const py = ((cy - r.top) / r.height) * 100;
                      const rx = ((py - 50) / 50) * -3;
                      const ry = ((px - 50) / 50) * 4;
                      el.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`);
                      el.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`);
                      el.style.setProperty('--px', `${px}%`);
                      el.style.setProperty('--py', `${py}%`);
                    });
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.setProperty('--tilt-x', '0deg');
                    el.style.setProperty('--tilt-y', '0deg');
                  }}
                  className="team-card-3d group relative w-full flex flex-col items-center justify-center text-center gap-1 p-1.5 sm:p-2 min-h-[64px] sm:min-h-[78px] lg:min-h-[92px] rounded-sm border border-border/50 bg-background/55 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={`Acessar equipe ${t.name}`}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-sm opacity-0 group-hover:opacity-60 transition-opacity bg-gradient-to-br ${t.accent}`}
                  />
                  <img
                    src={t.icon}
                    alt=""
                    loading="lazy"
                    style={{ animationDelay: `${TEAMS.indexOf(t) * 0.6}s` }}
                    className={`${t.anim} team-icon-3d relative h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain shrink-0 drop-shadow-[0_3px_8px_rgba(0,0,0,0.4)]`}
                  />
                  <div className="relative text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-[0.18em] text-foreground font-bold font-sans leading-[1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {t.name}
                  </div>
                </button>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="px-2.5 py-1 bg-background/30 text-center">
      <div className="text-sm font-bold text-primary leading-none font-serif">
        {value}
      </div>
      <div className="mt-0.5 text-[8px] tracking-[0.2em] uppercase text-muted-foreground/80 font-sans">
        {label}
      </div>
    </div>
  );
}

