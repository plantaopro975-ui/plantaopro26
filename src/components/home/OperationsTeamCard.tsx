import { Shield, Sword, Crosshair, Zap, ArrowRight, Lock } from 'lucide-react';
import { teamColors } from '@/lib/teamAssets';

interface OperationsTeamCardProps {
  team: 'ALFA' | 'BRAVO' | 'CHARLIE' | 'DELTA';
  onClick: () => void;
}

const TEAM_META: Record<string, {
  callsign: string;
  motto: string;
  icon: typeof Shield;
  code: string;
  hex: string;
}> = {
  ALFA:    { callsign: 'ALFA',    motto: 'Escudo · Proteção',   icon: Shield,    code: 'EQ-01', hex: teamColors.ALFA.primary },
  BRAVO:   { callsign: 'BRAVO',   motto: 'Espada · Ação',       icon: Sword,     code: 'EQ-02', hex: teamColors.BRAVO.primary },
  CHARLIE: { callsign: 'CHARLIE', motto: 'Mira · Precisão',     icon: Crosshair, code: 'EQ-03', hex: teamColors.CHARLIE.primary },
  DELTA:   { callsign: 'DELTA',   motto: 'Raio · Resposta',     icon: Zap,       code: 'EQ-04', hex: teamColors.DELTA.primary },
};

/**
 * Professional armed-forces operations card.
 * Clean, structured, minimal — no rotating posters, no 3D circus.
 * Inspired by military unit briefing cards: chevron rank insignia, dog-tag header, callsign stencil, access bar.
 */
export function OperationsTeamCard({ team, onClick }: OperationsTeamCardProps) {
  const meta = TEAM_META[team];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Acessar equipe ${meta.callsign}`}
      className="group relative w-full text-left overflow-hidden transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
      }}
    >
      {/* Outer frame — sober gunmetal */}
      <div
        className="relative h-full border border-border/70 bg-gradient-to-b from-card via-card/95 to-background/95 backdrop-blur-md transition-colors duration-300 group-hover:border-primary/60"
        style={{ aspectRatio: '3 / 4', minHeight: 240 }}
      >
        {/* Top dog-tag header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-background/40">
          <span className="font-mono-mil text-[9px] tracking-[0.2em] text-muted-foreground">
            {meta.code}
          </span>
          <span className="flex items-center gap-1.5 font-mono-mil text-[9px] text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Team color accent bar */}
        <div className="h-[3px] w-full" style={{ backgroundColor: meta.hex, boxShadow: `0 0 12px ${meta.hex}` }} />

        {/* Body — insignia + callsign */}
        <div className="px-4 sm:px-5 py-4 flex flex-col items-center text-center">

          {/* Military chevron + icon insignia */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
              {/* Outer shield */}
              <path
                d="M50 6 L88 22 V52 C88 72 70 88 50 94 C30 88 12 72 12 52 V22 Z"
                fill="none"
                stroke={meta.hex}
                strokeWidth="1.5"
                opacity="0.4"
              />
              {/* Inner shield (filled) */}
              <path
                d="M50 14 L80 26 V52 C80 68 66 80 50 86 C34 80 20 68 20 52 V26 Z"
                fill={meta.hex}
                fillOpacity="0.10"
                stroke={meta.hex}
                strokeWidth="1"
              />
              {/* Chevrons (rank-style) */}
              <path d="M30 62 L50 52 L70 62" fill="none" stroke={meta.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M30 72 L50 62 L70 72" fill="none" stroke={meta.hex} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            </svg>
            {/* Icon centered above chevrons */}
            <div className="absolute inset-0 flex items-start justify-center pt-3">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: meta.hex }} strokeWidth={2.2} />
            </div>
          </div>

          {/* Callsign — heavy stencil */}
          <h3
            className="font-stencil font-bold text-2xl sm:text-3xl lg:text-4xl leading-none text-foreground uppercase tracking-wider"
            style={{ textShadow: `0 0 24px ${meta.hex}55` }}
          >
            {meta.callsign}
          </h3>




          {/* Divider */}
          <div className="w-12 h-px my-3" style={{ backgroundColor: `${meta.hex}80` }} />

          {/* Status grid */}
          <div className="w-full grid grid-cols-2 gap-2 mt-1 font-mono-mil text-[9px] text-muted-foreground/80">
            <div className="border border-border/50 rounded-sm px-2 py-1">
              <div className="text-[8px] uppercase opacity-70">Setor</div>
              <div className="text-foreground/90 mt-0.5">ACRE-N</div>
            </div>
            <div className="border border-border/50 rounded-sm px-2 py-1">
              <div className="text-[8px] uppercase opacity-70">Status</div>
              <div className="mt-0.5" style={{ color: meta.hex }}>ATIVA</div>
            </div>
          </div>
        </div>

        {/* Bottom access bar */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2.5 border-t transition-all duration-300 bg-background/60 group-hover:bg-[color:var(--bar)]"
          style={{
            borderColor: `${meta.hex}55`,
            ['--bar' as never]: `${meta.hex}20`,
          }}
        >
          <span className="flex items-center gap-1.5 font-mono-mil text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
            <Lock className="w-3 h-3" />
            ACESSAR
          </span>
          <ArrowRight
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: meta.hex }}
          />
        </div>

        {/* Corner brackets */}
        <span className="absolute top-1 left-1 w-3 h-3 border-l border-t pointer-events-none" style={{ borderColor: meta.hex }} aria-hidden />
        <span className="absolute top-1 right-1 w-3 h-3 border-r border-t pointer-events-none" style={{ borderColor: meta.hex }} aria-hidden />
        <span className="absolute bottom-1 left-1 w-3 h-3 border-l border-b pointer-events-none" style={{ borderColor: meta.hex }} aria-hidden />
        <span className="absolute bottom-1 right-1 w-3 h-3 border-r border-b pointer-events-none" style={{ borderColor: meta.hex }} aria-hidden />
      </div>
    </button>
  );
}
