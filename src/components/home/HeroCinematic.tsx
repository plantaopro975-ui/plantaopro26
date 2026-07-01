import { ShieldCheck, Radio } from 'lucide-react';
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

const TEAMS: { name: TeamName; icon: string; accent: string }[] = [
  { name: 'ALFA',    icon: iconShield, accent: 'from-emerald-400/30 to-transparent' },
  { name: 'BRAVO',   icon: iconHelmet, accent: 'from-amber-400/30 to-transparent' },
  { name: 'CHARLIE', icon: iconRadio,  accent: 'from-sky-400/30 to-transparent' },
  { name: 'DELTA',   icon: iconBeacon, accent: 'from-primary/40 to-transparent' },
];

/**
 * CRIMSON STEEL — Hero full-viewport com cards de equipes.
 * Preenche a tela em mobile e desktop, mantém agente + viatura.
 */
export function HeroCinematic({ onTeamClick }: HeroCinematicProps) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-xl border border-primary/25 hero-cinematic"
      aria-label="Comando Operacional — Sistema Socioeducativo do Acre"
      style={{ minHeight: 'clamp(520px, 78vh, 820px)' }}
    >
      {/* Background image */}
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
        width={1920}
        height={1024}
      />
      {/* Overlays */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" aria-hidden />
      {/* Crimson vignette */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(60% 40% at 50% 100%, hsl(var(--primary) / 0.28) 0%, transparent 70%), radial-gradient(40% 30% at 10% 0%, hsl(var(--accent) / 0.14) 0%, transparent 70%)',
        }}
      />
      {/* Scanline grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Viatura — canto inferior esquerdo */}
      <img
        src={policeVehicle}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        style={{ width: 'clamp(120px, 22vw, 320px)' }}
        className="absolute z-10 bottom-3 left-2 sm:left-4 lg:left-8 object-contain pointer-events-none select-none opacity-90 [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.7))]"
      />

      {/* Agente tático — centralizado atrás dos cards */}
      <img
        src={agentFigure}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        className="absolute z-20 bottom-0 left-1/2 -translate-x-1/2 h-[60%] sm:h-[68%] lg:h-[78%] w-auto object-contain object-bottom pointer-events-none select-none [filter:drop-shadow(0_18px_40px_rgba(0,0,0,0.75))]"
      />

      {/* Foreground content */}
      <div className="relative z-30 h-full flex flex-col justify-between gap-6 px-4 sm:px-6 lg:px-10 py-5 sm:py-7"
           style={{ minHeight: 'inherit' }}>
        {/* Top eyebrow */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-primary/40 bg-background/60 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.28em] uppercase text-primary font-sans">
              ISE · Acre · Comando
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-accent/40 bg-background/60 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <Radio className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.28em] uppercase text-accent font-sans">
              24/7
            </span>
          </div>
        </div>

        {/* Team cards — dispostos abaixo, preenchendo a tela */}
        <div className="mt-auto">
          <ul
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-6xl mx-auto"
            role="list"
            aria-label="Equipes operacionais"
          >
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
                      const rx = ((py - 50) / 50) * -4;
                      const ry = ((px - 50) / 50) * 5;
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
                  className="team-card-3d group relative w-full flex flex-col items-center justify-center text-center gap-2 p-4 sm:p-5 min-h-[130px] sm:min-h-[150px] lg:min-h-[170px] rounded-lg border border-primary/25 bg-background/70 backdrop-blur-xl hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 transition-colors"
                  aria-label={`Acessar equipe ${t.name}`}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-70 transition-opacity bg-gradient-to-br ${t.accent}`}
                  />
                  {/* Top crimson bar */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                  />
                  <img
                    src={t.icon}
                    alt=""
                    loading="lazy"
                    className="relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain shrink-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="relative text-sm sm:text-base lg:text-lg uppercase tracking-[0.24em] text-foreground font-black font-sans leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
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
