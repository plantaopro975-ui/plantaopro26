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

      {/* ============ FAIXA HERÁLDICA INSTITUCIONAL ============ */}
      <div className="mt-1.5 px-1" aria-label="Lema institucional: Servir, Proteger e Ressocializar">
        <svg
          viewBox="0 0 800 34"
          preserveAspectRatio="none"
          className="block w-full h-7 sm:h-8"
          role="img"
        >
          <defs>
            <linearGradient id="heraldGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="hsl(48 96% 78%)" />
              <stop offset="45%"  stopColor="hsl(43 92% 58%)" />
              <stop offset="100%" stopColor="hsl(36 78% 38%)" />
            </linearGradient>
            <linearGradient id="heraldLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="hsl(43 92% 58% / 0)" />
              <stop offset="20%"  stopColor="hsl(43 92% 58% / 0.85)" />
              <stop offset="50%"  stopColor="hsl(48 96% 78% / 1)" />
              <stop offset="80%"  stopColor="hsl(43 92% 58% / 0.85)" />
              <stop offset="100%" stopColor="hsl(43 92% 58% / 0)" />
            </linearGradient>
            <filter id="heraldGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="0.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Linha ornamental esquerda */}
          <g transform="translate(0,17)">
            <line x1="10" y1="0" x2="330" y2="0" stroke="url(#heraldLine)" strokeWidth="0.8" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="hsl(43 92% 58% / 0.6)" strokeWidth="0.6" />
            <line x1="120" y1="-4" x2="120" y2="4" stroke="hsl(43 92% 58% / 0.7)" strokeWidth="0.6" />
            <line x1="180" y1="-3" x2="180" y2="3" stroke="hsl(43 92% 58% / 0.6)" strokeWidth="0.6" />
            {/* Ponta diamante esquerda ao lado do brasão */}
            <path d="M310,0 L322,-4 L334,0 L322,4 Z" fill="url(#heraldGold)" opacity="0.9" />
            <circle cx="290" cy="0" r="1.2" fill="hsl(48 96% 78%)" />
            <circle cx="270" cy="0" r="0.9" fill="hsl(43 92% 58% / 0.7)" />
          </g>

          {/* Brasão central minimalista */}
          <g transform="translate(400,17)" filter="url(#heraldGlow)">
            {/* Laurel esquerdo */}
            <path
              d="M-30,0 C-26,-6 -20,-9 -14,-9 M-30,0 C-26,6 -20,9 -14,9 M-25,-4 L-22,-7 M-25,4 L-22,7 M-20,-7 L-17,-9 M-20,7 L-17,9"
              stroke="url(#heraldGold)" strokeWidth="0.9" fill="none" strokeLinecap="round"
            />
            {/* Laurel direito */}
            <path
              d="M30,0 C26,-6 20,-9 14,-9 M30,0 C26,6 20,9 14,9 M25,-4 L22,-7 M25,4 L22,7 M20,-7 L17,-9 M20,7 L17,9"
              stroke="url(#heraldGold)" strokeWidth="0.9" fill="none" strokeLinecap="round"
            />
            {/* Escudo central */}
            <path
              d="M0,-11 L9,-8 V2 C9,7 5,11 0,13 C-5,11 -9,7 -9,2 V-8 Z"
              fill="hsl(222 55% 8% / 0.9)"
              stroke="url(#heraldGold)"
              strokeWidth="1"
            />
            {/* Estrela dentro do escudo */}
            <path
              d="M0,-6 L1.6,-1.8 L6,-1.8 L2.4,0.9 L3.8,5 L0,2.5 L-3.8,5 L-2.4,0.9 L-6,-1.8 L-1.6,-1.8 Z"
              fill="url(#heraldGold)"
            />
          </g>

          {/* Linha ornamental direita */}
          <g transform="translate(0,17)">
            <line x1="470" y1="0" x2="790" y2="0" stroke="url(#heraldLine)" strokeWidth="0.8" />
            <path d="M490,0 L478,-4 L466,0 L478,4 Z" fill="url(#heraldGold)" opacity="0.9" />
            <circle cx="510" cy="0" r="1.2" fill="hsl(48 96% 78%)" />
            <circle cx="530" cy="0" r="0.9" fill="hsl(43 92% 58% / 0.7)" />
            <line x1="620" y1="-3" x2="620" y2="3" stroke="hsl(43 92% 58% / 0.6)" strokeWidth="0.6" />
            <line x1="680" y1="-4" x2="680" y2="4" stroke="hsl(43 92% 58% / 0.7)" strokeWidth="0.6" />
            <line x1="740" y1="-3" x2="740" y2="3" stroke="hsl(43 92% 58% / 0.6)" strokeWidth="0.6" />
          </g>

          {/* Textos institucionais laterais */}
          <text
            x="30" y="21"
            fontFamily="'IBM Plex Mono', ui-monospace, monospace"
            fontSize="8" fontWeight="700" letterSpacing="3"
            fill="hsl(48 96% 82%)"
          >
            EST · 2015
          </text>
          <text
            x="770" y="21" textAnchor="end"
            fontFamily="'IBM Plex Mono', ui-monospace, monospace"
            fontSize="8" fontWeight="700" letterSpacing="3"
            fill="hsl(48 96% 82%)"
          >
            ISE-AC · SEJUSP
          </text>
        </svg>

        <p className="mt-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-200">
          Servir · Proteger · Ressocializar
        </p>
      </div>
    </div>
  );
}
