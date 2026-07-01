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
      style={{ minHeight: 'clamp(360px, 46vh, 520px)' }}
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

      {/* Agente tático interativo — desktop only, arrastável */}
      <img
        src={agentFigure}
        alt=""
        aria-hidden
        width={768}
        height={1280}
        loading="lazy"
        draggable={false}
        onPointerDown={(e) => {
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          const parentRect = el.parentElement!.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          el.setPointerCapture(e.pointerId);
          el.style.cursor = 'grabbing';
          const move = (ev: PointerEvent) => {
            const x = ev.clientX - parentRect.left - offsetX;
            const y = ev.clientY - parentRect.top - offsetY;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.transform = 'none';
          };
          const up = () => {
            el.style.cursor = 'grab';
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerup', up);
          };
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerup', up);
        }}
        className="block sm:block select-none absolute z-30 bottom-0 left-1/2 -translate-x-1/2 h-[38%] xl:h-[44%] w-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] cursor-grab touch-none"
        style={{ animationDuration: '6s' }}
      />


      {/* Viatura policial 3D — desktop only, interage com hover das equipes E com o mouse */}
      <img
        src={policeVehicle}
        alt=""
        aria-hidden
        width={1536}
        height={768}
        loading="lazy"
        style={{ width: 'clamp(180px, 15vw, 280px)' }}
        className="police-vehicle police-vehicle--mouse hidden xl:block pointer-events-none select-none absolute z-10 bottom-4 left-6 2xl:left-10 object-contain origin-bottom-left opacity-90"
      />


      <div className="relative z-10 h-full flex flex-col gap-6 px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* eyebrow */}
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-primary/30 bg-background/50 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-primary/95 font-sans">
              ISE · Acre · Comando
            </span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] tracking-[0.24em] uppercase text-muted-foreground/70 font-medium font-sans">
            <Radio className="h-3 w-3 text-primary/70" />
            Op. 24/7
          </div>
        </div>

        {/* Headline + Team Bento */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr,1.15fr] gap-6 lg:gap-10 items-center flex-1">
          <div className="max-w-2xl xl:pb-[clamp(180px,15vw,280px)]">
            <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] leading-[1.05] tracking-tight text-foreground font-serif">
              Segurança Socioeducativa,{' '}
              <span className="italic text-primary">refinada</span>.
            </h1>
            <p className="mt-4 max-w-lg text-sm sm:text-[15px] text-muted-foreground/90 leading-relaxed font-sans">
              Selecione sua equipe para acessar o comando operacional —
              arquitetura blindada, estética editorial.
            </p>

            {onPrimaryAction && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-primary text-primary-foreground text-[13px] font-semibold tracking-[0.14em] uppercase font-sans transition-all hover:bg-primary/90 hover:translate-y-[-1px] shadow-[0_10px_28px_-10px_hsl(42_55%_54%/0.55)]"
                  aria-label="Acessar plataforma"
                >
                  Acessar plataforma
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>

                <div className="flex items-stretch gap-px rounded-sm overflow-hidden border border-border/60 bg-background/40 backdrop-blur-md">
                  <Stat value={agentCount} label="Agentes" />
                  <Stat value={unitsCount} label="Unidades" />
                  <Stat value="24/7" label="Ativo" />
                </div>
              </div>
            )}
          </div>

          {/* Teams — 3D noir & gold, clicáveis */}
          <ul className="hero-team-grid grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full" role="list" aria-label="Equipes operacionais">
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
                  className="team-card-3d group relative w-full flex flex-col items-center justify-center text-center gap-3 p-4 sm:p-5 lg:p-6 min-h-[160px] sm:min-h-[180px] lg:min-h-[200px] rounded-sm border border-border/50 bg-background/55 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
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
                    className={`${t.anim} team-icon-3d relative h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 object-contain shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]`}
                  />


                  <div className="relative flex flex-col items-center gap-1.5">
                    <div className="text-lg sm:text-xl lg:text-2xl uppercase tracking-[0.22em] text-foreground font-bold font-sans leading-[1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                      {t.name}
                    </div>
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
    <div className="px-4 py-2 bg-background/30 text-center">
      <div className="text-base font-bold text-primary leading-none font-serif">
        {value}
      </div>
      <div className="mt-1 text-[9px] tracking-[0.2em] uppercase text-muted-foreground/80 font-sans">
        {label}
      </div>
    </div>
  );
}
