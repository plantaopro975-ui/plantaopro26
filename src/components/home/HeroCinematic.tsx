import { ArrowRight, Radio, Lock } from 'lucide-react';
import heroImage from '@/assets/hero-tactical-formation.jpg';

interface HeroCinematicProps {
  onPrimaryAction?: () => void;
  agentCount?: number;
  unitsCount?: number;
}

/**
 * Armed-forces command briefing hero — SVG-rich, stencil typography,
 * realistic tactical photography, military operations console aesthetic.
 */
export function HeroCinematic({ onPrimaryAction, agentCount = 248, unitsCount = 9 }: HeroCinematicProps) {
  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border-2 border-primary/40 hero-cinematic"
      aria-label="Comando Operacional — Sistema Socioeducativo do Acre"
      style={{ minHeight: 'clamp(280px, 36vh, 400px)' }}
    >
      {/* Realistic tactical photo */}
      <img
        src={heroImage}
        alt="Formação tática de agentes socioeducativos"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Multi-layer cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/75 to-background/30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" aria-hidden />
      <div className="absolute inset-0 bg-scanlines opacity-60" aria-hidden />

      {/* === SVG TACTICAL OVERLAY: topographic + radar + crosshair === */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern id="hexGrid" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
            <polygon
              points="20,1 38,12 38,34 20,45 2,34 2,12"
              fill="none"
              stroke="hsl(38 92% 50% / 0.18)"
              strokeWidth="0.6"
            />
          </pattern>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity="0.35" />
            <stop offset="60%" stopColor="hsl(38 92% 50%)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="radarSweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity="0" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* hex grid backdrop right side */}
        <rect x="900" y="0" width="700" height="600" fill="url(#hexGrid)" />

        {/* topographic contour curves (left) */}
        <g stroke="hsl(38 92% 50% / 0.22)" strokeWidth="0.8" fill="none">
          <path d="M0,520 Q200,420 420,470 T900,440" />
          <path d="M0,470 Q200,370 420,420 T900,390" />
          <path d="M0,420 Q200,320 420,370 T900,340" />
          <path d="M0,360 Q200,280 420,310 T900,280" />
        </g>

        {/* corner brackets */}
        <g stroke="hsl(38 92% 50%)" strokeWidth="2" fill="none">
          <polyline points="20,40 20,20 40,20" />
          <polyline points="1580,40 1580,20 1560,20" />
          <polyline points="20,560 20,580 40,580" />
          <polyline points="1580,560 1580,580 1560,580" />
        </g>

        {/* coordinate ticks */}
        <g fill="hsl(38 92% 50% / 0.7)" fontSize="9" fontFamily="JetBrains Mono, monospace">
          <text x="60" y="32">LAT -09°54&apos;42&quot;S</text>
          <text x="60" y="572">LON -67°44&apos;18&quot;W</text>
          <text x="1370" y="32" textAnchor="start">SEC // CONFIDENTIAL</text>
          <text x="1370" y="572" textAnchor="start">CH 7.421 MHz</text>
        </g>

        {/* radar console (top-right) */}
        <g transform="translate(1380,140)">
          <circle r="90" fill="url(#radarGlow)" />
          <circle r="90" fill="none" stroke="hsl(38 92% 50% / 0.5)" strokeWidth="1" />
          <circle r="60" fill="none" stroke="hsl(38 92% 50% / 0.3)" strokeWidth="0.8" />
          <circle r="30" fill="none" stroke="hsl(38 92% 50% / 0.3)" strokeWidth="0.8" />
          <line x1="-90" y1="0" x2="90" y2="0" stroke="hsl(38 92% 50% / 0.3)" strokeWidth="0.6" />
          <line x1="0" y1="-90" x2="0" y2="90" stroke="hsl(38 92% 50% / 0.3)" strokeWidth="0.6" />
          {/* sweep */}
          <g className="radar-rotate">
            <path d="M0,0 L90,0 A90,90 0 0,1 63.6,63.6 Z" fill="url(#radarSweep)" />
          </g>
          {/* contacts */}
          <circle cx="40" cy="-20" r="2.5" fill="hsl(38 92% 50%)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="-25" cy="45" r="2" fill="hsl(38 92% 50%)">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="-55" cy="-30" r="1.8" fill="hsl(38 92% 50%)" />
        </g>
      </svg>

      {/* horizontal scan line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scan-line-y pointer-events-none" aria-hidden />

      {/* === CONTENT === */}
      <div className="relative z-10 h-full flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6">

        {/* TOP STATUS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dog-tag style ID */}
            <div className="flex items-center gap-2 px-3 py-1.5 border border-primary/50 bg-background/60 backdrop-blur-sm rounded-sm font-mono-mil text-[10px] sm:text-xs text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              SEC-ACRE / OP-2026
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-border bg-background/50 backdrop-blur-sm rounded-sm font-mono-mil text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              CLASSIFIED // INTERNAL
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono-mil text-[10px] sm:text-xs text-primary/90">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>CANAL 7.421 // ATIVO</span>
          </div>
        </div>

        {/* MAIN BRIEFING */}
        <div className="flex-1 flex items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2 font-mono-mil text-[10px] sm:text-xs text-primary/80">
              <span className="h-px w-6 bg-primary/60" />
              BRIEFING / 24.06.2026
              <span className="h-px flex-1 bg-primary/30" />
            </div>

            <h1 className="font-stencil font-bold leading-[0.9] text-foreground">
              <span className="block text-3xl sm:text-5xl lg:text-6xl text-glow-amber uppercase">
                Comando
              </span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl mt-0.5 bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent uppercase">
                Socioeducativo
              </span>
              <span className="block font-tactical text-sm sm:text-lg lg:text-xl mt-1.5 text-muted-foreground font-semibold">
                / Sistema Integrado · Estado do Acre /
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-[11px] sm:text-xs lg:text-sm text-muted-foreground/90 leading-relaxed font-mono-mil">
              &gt; Plataforma operacional dos agentes em serviço.
              Escalas, banco de horas, comunicação tática e controle institucional
              sob arquitetura segura, 24/7.
            </p>

            {onPrimaryAction && (
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onPrimaryAction}
                  className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-tactical font-extrabold text-sm sm:text-base transition-all hover:scale-[1.03] glow-ring-amber clip-tactical"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                  }}
                  aria-label="Iniciar protocolo de acesso"
                >
                  <span className="tracking-widest">INICIAR PROTOCOLO</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                {/* Tactical stats - dog-tag */}
                <div className="flex items-center gap-0 divide-x divide-primary/30 border border-primary/40 bg-background/60 backdrop-blur-sm">
                  <div className="px-3 sm:px-4 py-2 text-center">
                    <div className="font-stencil text-lg sm:text-xl text-primary leading-none">{agentCount}</div>
                    <div className="font-mono-mil text-[9px] text-muted-foreground mt-1 uppercase">Agentes</div>
                  </div>
                  <div className="px-3 sm:px-4 py-2 text-center">
                    <div className="font-stencil text-lg sm:text-xl text-primary leading-none">{unitsCount}</div>
                    <div className="font-mono-mil text-[9px] text-muted-foreground mt-1 uppercase">Unidades</div>
                  </div>
                  <div className="px-3 sm:px-4 py-2 text-center">
                    <div className="font-stencil text-lg sm:text-xl text-primary leading-none">24/7</div>
                    <div className="font-mono-mil text-[9px] text-muted-foreground mt-1 uppercase">Op</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM TICKER */}
        <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-primary/20 font-mono-mil text-[9px] sm:text-[10px] text-muted-foreground/80">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            STATUS: NOMINAL
          </span>
          <span className="hidden sm:inline">REL // ENC-AES256 // RLS-VERIFIED</span>
          <span>v2.6 · BUILD-OPUS</span>
        </div>
      </div>

      {/* corner accents — military bracket */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary pointer-events-none" aria-hidden />
      <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-primary pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-primary pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary pointer-events-none" aria-hidden />
    </section>
  );
}
