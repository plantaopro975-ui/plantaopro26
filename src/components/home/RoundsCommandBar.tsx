import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useRoundsStats } from '@/hooks/useRoundsStats';
import { useServerTime } from '@/hooks/useServerTime';
import { RoundsManager } from './RoundsManager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * COMANDO UNIFICADO — barra tática única (Mission ID)
 * Substitui as três faixas antigas (TopHudBar, TACTICAL TITLE STRIP e a antiga
 * RoundsCommandBar) por um único HUD horizontal alinhado ao tema de segurança
 * pública socioeducativa.
 *
 * Zonas:
 *   [ MISSION ID · OP // 01 ] · [ GESTOR DE RONDAS ] · [ Telemetria ] · [ Atalho ] · [ Relógio ]
 *
 * Contadores reais (RLS), unidade/equipe do agente logado, relógio sincronizado
 * com o servidor. SVG artesanal — sem imagens raster.
 */
export function RoundsCommandBar() {
  const { user } = useAuth();
  const { agent } = useAgentProfile();
  const rounds = useRoundsStats();
  const navigate = useNavigate();

  // Relógio de rede — HH:mm:ss (tick 1s).
  const now = useServerTime(1000);
  const clock = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '')
    .toUpperCase();

  const unitLabel = useMemo(() => {
    if (agent?.unit?.name) {
      const municipality = agent.unit.municipality ? ` · ${agent.unit.municipality}` : '';
      return `${agent.unit.name}${municipality}`.toUpperCase();
    }
    return 'FEIJÓ · AC';
  }, [agent?.unit?.name, agent?.unit?.municipality]);

  const shortUnit = useMemo(() => {
    if (agent?.unit?.municipality) return agent.unit.municipality.toUpperCase();
    if (agent?.unit?.name) return agent.unit.name.split(/\s+/).slice(0, 2).join(' ').toUpperCase();
    return 'FEIJÓ · AC';
  }, [agent?.unit?.name, agent?.unit?.municipality]);

  const goEscalas = () => {
    if (user) navigate('/agent-panel');
    else navigate('/auth');
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        role="group"
        aria-label="Comando Unificado — Gestor de Rondas, telemetria e horário de rede"
        className={cn(
          'relative w-full',
          'bg-slate-950 border-y border-primary/25',
          'shadow-[0_6px_18px_-12px_hsl(217_62%_2%/0.9)]',
        )}
        style={{ fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace' }}
      >
        {/* Blueprint grid discreto */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 95%)',
          }}
        />
        {/* Cantoneiras SVG (tick corners) — assinatura tática discreta */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full text-primary/50" preserveAspectRatio="none" viewBox="0 0 100 100">
          <g fill="none" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke">
            <path d="M0.5 3 L0.5 0.5 L3 0.5" />
            <path d="M99.5 3 L99.5 0.5 L97 0.5" />
            <path d="M0.5 97 L0.5 99.5 L3 99.5" />
            <path d="M99.5 97 L99.5 99.5 L97 99.5" />
          </g>
        </svg>
        {/* Linhas de brilho institucional (top/bottom) — estáveis, sem pulso */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary))_30%,hsl(var(--primary))_70%,transparent_100%)] opacity-80" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.5),transparent)]" />

        <div className="relative mx-auto max-w-[1600px] flex items-stretch h-14 px-2 sm:px-3">
          {/* ───── ZONA 1 — MISSION ID ───── */}
          <div className="flex items-center gap-3 pr-3 sm:pr-5 border-r border-slate-800 shrink-0">
            <MissionSeal />
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] text-primary/70 tracking-[0.28em] uppercase">MISSION&nbsp;ID</span>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold text-[11px] sm:text-xs whitespace-nowrap tabular-nums">OP // 01</span>
                <span aria-hidden className="hidden md:inline-block h-3 w-px bg-slate-700" />
                <span className="hidden md:inline text-slate-300 text-[10px] tracking-tight whitespace-nowrap">SISTEMA SOCIOEDUCATIVO</span>
              </div>
            </div>
          </div>

          {/* ───── ZONA 2 — GESTOR + TELEMETRIA ───── */}
          <div className="flex flex-1 items-center px-2 sm:px-4 gap-3 sm:gap-5 min-w-0">
            {/* Trigger customizado do RoundsManager (mantém o modal existente) */}
            <RoundsManager
              customTrigger={
                <button
                  type="button"
                  aria-label="Abrir Gestor de Rondas"
                  className={cn(
                    'group inline-flex items-center gap-2 shrink-0',
                    'bg-primary/10 hover:bg-primary/20 border border-primary/40',
                    'px-2.5 sm:px-3 py-1 rounded-sm',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  )}
                >
                  <RadarIcon />
                  <span className="text-primary font-bold text-[10px] sm:text-[11px] tracking-[0.2em] uppercase drop-shadow-[0_0_6px_hsl(var(--primary)/0.35)] group-hover:drop-shadow-[0_0_10px_hsl(var(--primary)/0.55)]">
                    Gestor de Rondas
                  </span>
                </button>
              }
            />

            {/* Telemetria */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Metric label="Rondas em curso" value={rounds.active > 0 ? String(rounds.active).padStart(2, '0') : '00'} live={rounds.active > 0} />
              <Divider className="hidden xs:block" />
              <Metric label="Total hoje" value={String(rounds.today).padStart(2, '0')} tone="neutral" className="hidden xs:flex" />
              {agent?.team && (
                <>
                  <Divider className="hidden md:block" />
                  <TeamChip team={agent.team} className="hidden md:flex" />
                </>
              )}
              {user && (
                <>
                  <Divider className="hidden lg:block" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="hidden lg:flex flex-col leading-tight cursor-default max-w-[160px]">
                        <span className="text-[8px] text-slate-500 tracking-[0.24em] uppercase">Unidade</span>
                        <span className="text-slate-200 text-[10px] font-semibold uppercase truncate">{shortUnit}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <span className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">Unidade</span>
                      <div className="font-semibold">{unitLabel}</div>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {/* ───── ZONA 3 — SHORTCUT + RELÓGIO ───── */}
          <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-slate-800 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={goEscalas}
                  className="hidden md:flex flex-col items-end leading-tight group focus-visible:outline-none"
                  aria-label="Ir para Comando — Escalas"
                >
                  <span className="text-[8px] text-slate-500 tracking-[0.24em] uppercase">Shortcut</span>
                  <span className="inline-flex items-center gap-1 text-slate-300 group-hover:text-primary transition-colors text-[10px] font-bold tracking-widest uppercase">
                    Comando — Escalas
                    <ArrowUpRight className="h-3 w-3" strokeWidth={2.4} />
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Abre o painel operacional com as escalas
              </TooltipContent>
            </Tooltip>

            {/* Relógio de rede */}
            <div className="bg-slate-900/60 border border-slate-800 px-2.5 sm:px-3 py-1 flex flex-col items-center min-w-[112px] rounded-sm shadow-inner">
              <span className="text-[11px] sm:text-[12px] text-primary font-bold leading-none tracking-[0.14em] tabular-nums drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]">
                {clock}
              </span>
              <span className="text-[8.5px] text-slate-500 tracking-[0.22em] mt-0.5">{dateStr}</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ================ atoms ================ */

function Divider({ className }: { className?: string }) {
  return <span aria-hidden className={cn('h-6 w-px bg-slate-800', className)} />;
}

function Metric({
  label,
  value,
  live,
  tone = 'primary',
  className,
}: {
  label: string;
  value: string;
  live?: boolean;
  tone?: 'primary' | 'neutral';
  className?: string;
}) {
  const valueColor = tone === 'primary' ? 'text-slate-100' : 'text-slate-200';
  return (
    <div className={cn('flex flex-col leading-tight min-w-0', className)}>
      <span className="text-[8px] text-slate-500 tracking-[0.24em] uppercase whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-1.5">
        {live && (
          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
          </span>
        )}
        <span className={cn('font-bold text-xs tabular-nums', valueColor)}>{value}</span>
      </div>
    </div>
  );
}

function TeamChip({ team, className }: { team: string; className?: string }) {
  return (
    <div className={cn('flex flex-col leading-tight', className)}>
      <span className="text-[8px] text-slate-500 tracking-[0.24em] uppercase">Equipe</span>
      <span className="bg-slate-900 text-primary text-[9px] px-1.5 py-[1px] font-bold border border-primary/30 tracking-[0.2em] uppercase self-start">
        {team}
      </span>
    </div>
  );
}

/* ================ SVG artesanal ================ */

/**
 * Selo de missão — brasão institucional em SVG (dourado sobre grafite).
 * Camadas: anel externo com traços de escala, escudo miolo com chevrons e estrela central.
 */
function MissionSeal() {
  return (
    <span className="relative shrink-0" aria-hidden>
      <svg viewBox="0 0 40 40" className="h-9 w-9 sm:h-10 sm:w-10 drop-shadow-[0_2px_6px_hsl(217_62%_2%/0.9)]">
        <defs>
          <radialGradient id="seal-fill" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="hsl(217 40% 22%)" />
            <stop offset="65%" stopColor="hsl(217 55% 8%)" />
            <stop offset="100%" stopColor="hsl(217 62% 3%)" />
          </radialGradient>
          <linearGradient id="seal-gold" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(45 95% 72%)" />
            <stop offset="55%" stopColor="hsl(43 90% 52%)" />
            <stop offset="100%" stopColor="hsl(35 80% 32%)" />
          </linearGradient>
        </defs>
        {/* base */}
        <circle cx="20" cy="20" r="19" fill="url(#seal-fill)" stroke="url(#seal-gold)" strokeWidth="1" />
        {/* tick marks (escala) */}
        <g stroke="url(#seal-gold)" strokeWidth="0.7" strokeLinecap="round" opacity="0.85">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const x1 = 20 + Math.cos(a) * 17;
            const y1 = 20 + Math.sin(a) * 17;
            const x2 = 20 + Math.cos(a) * (i % 3 === 0 ? 14.5 : 15.8);
            const y2 = 20 + Math.sin(a) * (i % 3 === 0 ? 14.5 : 15.8);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        {/* escudo */}
        <path
          d="M20 8 L29 12 V21 C29 26.5 25 30 20 32 C15 30 11 26.5 11 21 V12 Z"
          fill="hsl(217 55% 6%)"
          stroke="url(#seal-gold)"
          strokeWidth="0.9"
        />
        {/* chevrons */}
        <path d="M14 19 L20 15 L26 19" fill="none" stroke="url(#seal-gold)" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M14 23 L20 19 L26 23" fill="none" stroke="url(#seal-gold)" strokeWidth="1.1" strokeLinejoin="round" opacity="0.75" />
        {/* estrela central */}
        <path
          d="M20 24.5 L20.9 26.5 L23 26.7 L21.4 28.1 L21.9 30.2 L20 29.1 L18.1 30.2 L18.6 28.1 L17 26.7 L19.1 26.5 Z"
          fill="url(#seal-gold)"
        />
        {/* highlight */}
        <path d="M11.5 12 Q20 5 28.5 12" fill="none" stroke="hsl(45 95% 85%)" strokeWidth="0.4" strokeLinecap="round" opacity="0.5" />
      </svg>
    </span>
  );
}

/**
 * Ícone de radar animado — anéis discretos com varredura sutil.
 */
function RadarIcon() {
  return (
    <span className="relative inline-flex h-4 w-4" aria-hidden>
      <Radar className="h-4 w-4 text-primary" strokeWidth={2.2} />
      <span className="absolute inset-0 rounded-full bg-primary/20 blur-[3px] animate-pulse" />
    </span>
  );
}
