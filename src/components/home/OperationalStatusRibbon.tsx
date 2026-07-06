import { useAgentProfile } from '@/hooks/useAgentProfile';

const TEAM_ACCENT: Record<string, { h: string; s: string; l: string; label: string }> = {
  ALFA:    { h: '43',  s: '96%', l: '56%', label: 'Defensiva' },
  BRAVO:   { h: '14',  s: '82%', l: '58%', label: 'Ofensiva' },
  CHARLIE: { h: '38',  s: '96%', l: '60%', label: 'Reconhecimento' },
  DELTA:   { h: '210', s: '90%', l: '62%', label: 'Resposta Rápida' },
};

/**
 * Operational status ribbon — professional SVG HUD footer.
 * When logged in, surfaces the agent's Unit + Team + role.
 * When public, shows institutional KPIs.
 */
export function OperationalStatusRibbon() {
  const { agent } = useAgentProfile();

  const teamKey = (agent?.team ?? '').toUpperCase();
  const isLogged = Boolean(agent?.id);
  const accent = TEAM_ACCENT[teamKey];
  const accentColor = accent ? `hsl(${accent.h} ${accent.s} ${accent.l})` : 'hsl(42 90% 55%)';
  const accentSoft = accent ? `hsl(${accent.h} ${accent.s} ${accent.l} / 0.18)` : 'hsl(42 90% 55% / 0.18)';

  const unitName = agent?.unit?.name ?? '';
  const municipality = agent?.unit?.municipality ?? '';
  const agentShort = (agent?.name ?? '').split(' ').slice(0, 2).join(' ').toUpperCase();
  const matricula = agent?.matricula ?? '——';

  return (
    <div className="relative mt-2 px-1">
      <svg
        viewBox="0 0 800 52"
        preserveAspectRatio="none"
        className="block w-full h-11 sm:h-14"
        role="img"
        aria-label={isLogged ? `Painel operacional — ${unitName}` : 'Status operacional em tempo real'}
      >
        <defs>
          <linearGradient id="ribbonBg2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="hsl(222 55% 5%)" stopOpacity="0.98" />
            <stop offset="50%"  stopColor="hsl(222 45% 10%)" stopOpacity="0.88" />
            <stop offset="100%" stopColor="hsl(222 55% 5%)" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="ribbonEdge2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor={`${accentColor.replace(')', ' / 0)')}`} />
            <stop offset="50%"  stopColor={`${accentColor.replace(')', ' / 0.9)')}`} />
            <stop offset="100%" stopColor={`${accentColor.replace(')', ' / 0)')}`} />
          </linearGradient>
          <pattern id="ribbonHatch2" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={`${accentColor.replace(')', ' / 0.10)')}`} strokeWidth="1" />
          </pattern>
          <filter id="ribbonGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* chapa metálica com chanfros */}
        <path
          d="M0,6 L16,6 L22,0 L778,0 L784,6 L800,6 L800,46 L784,46 L778,52 L22,52 L16,46 L0,46 Z"
          fill="url(#ribbonBg2)"
          stroke={`${accentColor.replace(')', ' / 0.45)')}`}
          strokeWidth="0.7"
        />
        <rect x="0" y="0" width="800" height="52" fill="url(#ribbonHatch2)" opacity="0.55" />
        <rect x="0" y="0"  width="800" height="1" fill="url(#ribbonEdge2)" />
        <rect x="0" y="51" width="800" height="1" fill="url(#ribbonEdge2)" />

        {/* varredura removida — barra estática */}


        {/* Selo esquerdo: brasão + status */}
        <g transform="translate(28,26)">
          <g filter="url(#ribbonGlow)">
            {/* mini shield */}
            <path
              d="M0,-12 L11,-8 V2 C11,9 6,14 0,16 C-6,14 -11,9 -11,2 V-8 Z"
              fill={accentSoft}
              stroke={accentColor}
              strokeWidth="1.2"
            />
            <path d="M-6,3 L0,-2 L6,3" stroke={accentColor} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M-6,8 L0,3 L6,8" stroke={accentColor} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
          </g>
          <circle cx="14" cy="-10" r="3" fill="hsl(142 72% 45%)">
            <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Divisores */}
        {[62, 340, 560, 700].map((x) => (
          <line key={x} x1={x} y1="12" x2={x} y2="40" stroke={`${accentColor.replace(')', ' / 0.25)')}`} strokeWidth="0.6" strokeDasharray="2 2" />
        ))}

        {isLogged ? (
          <>
            {/* IDENTIFICAÇÃO — Agente / Matrícula */}
            <g transform="translate(80,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
              <text y="-6" fontSize="8.5" fontWeight="700" letterSpacing="2.2" fill={accentColor}>AGENTE</text>
              <text y="6" fontSize="11" fontWeight="700" fill="hsl(48 100% 92%)">
                {agentShort || 'IDENTIFICADO'}
              </text>
              <text y="16" fontSize="8.5" letterSpacing="1.4" fill="hsl(45 92% 85%)" fontWeight="600">
                MAT · {matricula}
              </text>
            </g>

            {/* UNIDADE */}
            <g transform="translate(350,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
              <text y="-6" fontSize="8.5" fontWeight="700" letterSpacing="2.2" fill={accentColor}>UNIDADE</text>
              <text y="6" fontSize="11" fontWeight="700" fill="hsl(48 100% 92%)">
                {(unitName || 'ISE').slice(0, 26)}
              </text>
              <text y="16" fontSize="8.5" letterSpacing="1.4" fill="hsl(45 92% 85%)" fontWeight="600">
                {(municipality || 'ACRE').toUpperCase()} · BR
              </text>
            </g>

            {/* EQUIPE */}
            <g transform="translate(580,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
              <text y="-6" fontSize="8.5" fontWeight="700" letterSpacing="2.2" fill={accentColor}>EQUIPE</text>
              <text y="7" fontSize="13" fontWeight="700" letterSpacing="3" fill={accentColor} style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}>
                {teamKey || '——'}
              </text>
              <text y="17" fontSize="8.5" letterSpacing="1.4" fill="hsl(45 92% 85%)" fontWeight="600">
                {accent?.label ?? 'OPERACIONAL'}
              </text>
            </g>

            {/* STATUS + UPLINK */}
            <g transform="translate(720,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
              <text y="-6" fontSize="8.5" fontWeight="700" letterSpacing="2.2" fill={accentColor}>STATUS</text>
              <g transform="translate(0,2)">
                <circle cx="3" cy="0" r="2.5" fill="hsl(142 72% 55%)">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <text x="10" y="3" fontSize="10" fontWeight="700" fill="hsl(142 72% 78%)">ATIVO</text>
              </g>
              <g transform="translate(0,14)">
                {[0,1,2,3,4].map((i) => (
                  <rect key={i} x={i*5} y={-i} width="3" height={3 + i*1.5} fill="hsl(142 72% 55%)" rx="0.5">
                    <animate attributeName="opacity" values="1;0.55;1" dur={`${1.2 + i*0.15}s`} repeatCount="indefinite" />
                  </rect>
                ))}
              </g>
            </g>
          </>
        ) : (
          <>
            {/* Estado público — sem login: sem duplicar KPIs do Briefing */}
            <g transform="translate(80,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
              <text y="-6" fontSize="9" letterSpacing="2" fill="hsl(45 98% 80%)" fontWeight="700">PROTOCOLO</text>
              <text y="7" fontSize="11" fontWeight="700" fill="hsl(48 100% 90%)">ISE-AC / 2026</text>
              <text y="17" fontSize="8.5" letterSpacing="1.4" fill="hsl(45 92% 85%)" fontWeight="600">SISTEMA SOCIOEDUCATIVO</text>
            </g>

            <g transform="translate(350,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace" textAnchor="middle">
              <text y="-6" fontSize="9" letterSpacing="2" fill="hsl(45 98% 80%)" fontWeight="700">TURNO</text>
              <text y="8" fontSize="12" fontWeight="700" fill="hsl(48 100% 92%)">24 / 7</text>
              <text y="18" fontSize="8.5" letterSpacing="1.2" fill="hsl(45 92% 85%)" fontWeight="600">COBERTURA CONTÍNUA</text>
            </g>

            <g transform="translate(580,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace" textAnchor="middle">
              <text y="-6" fontSize="9" letterSpacing="2" fill="hsl(45 98% 80%)" fontWeight="700">JURISDIÇÃO</text>
              <text y="8" fontSize="12" fontWeight="700" fill="hsl(48 100% 92%)">ACRE · BR</text>
              <text y="18" fontSize="8.5" letterSpacing="1.2" fill="hsl(45 92% 85%)" fontWeight="600">GOV / SEJUSP</text>
            </g>

            <g transform="translate(720,26)" fontFamily="'IBM Plex Mono', ui-monospace, monospace">
              <text y="-6" fontSize="9" letterSpacing="2" fill="hsl(45 98% 80%)" fontWeight="700">CANAL</text>
              <text y="8" fontSize="9" fontWeight="700" letterSpacing="1.6" fill="hsl(48 100% 88%)">SEGURO</text>
              <text y="18" fontSize="8.5" fontWeight="700" letterSpacing="1.2" fill="hsl(142 78% 75%)">AES-256 · ONLINE</text>
            </g>
          </>
        )}
      </svg>

      {/* Wordmark institucional — PLANTÃO PRO */}
      <div className="mt-1.5 flex items-center justify-center gap-3 px-2" aria-label="Plantão Pro">
        <span aria-hidden className="h-px flex-1 max-w-[8rem] bg-gradient-to-r from-transparent to-amber-300/40" />
        <div className="flex items-baseline gap-1.5 select-none">
          <span
            className="font-serif text-[15px] sm:text-[17px] font-semibold tracking-[0.22em] uppercase text-amber-100"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 0 12px hsl(43 92% 58% / 0.25)' }}
          >
            Plantão
          </span>
          <span
            className="font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.42em] uppercase text-amber-400"
            style={{ textShadow: '0 0 6px hsl(43 92% 58% / 0.5)' }}
          >
            PRO
          </span>
        </div>
        <span aria-hidden className="h-px flex-1 max-w-[8rem] bg-gradient-to-l from-transparent to-amber-300/40" />
      </div>
    </div>
  );
}
