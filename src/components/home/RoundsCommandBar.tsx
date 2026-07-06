import { useMemo } from 'react';
import { ShieldCheck, MapPin, Users2, Clock3, Radar, CalendarCheck, type LucideIcon } from 'lucide-react';
import { useServerTime } from '@/hooks/useServerTime';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useRoundsStats } from '@/hooks/useRoundsStats';
import { RoundsManager } from './RoundsManager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Barra tática unificada:
 *   [ Gestor de Rondas ] │ HUD compacto de status operacional
 *
 * — Redundâncias removidas: o contador de agentes online já vive no header;
 *   Status/Rede/Enlace foram unificados em ENLACE.
 * — "Setor" reage à unidade do agente logado (auto-updates via useAgentProfile).
 * — Contadores de RONDA são reais (Supabase + Realtime).
 * — Relógio sincronizado com o servidor, tick de 20 s (mostra HH:mm, sem re-render por segundo).
 * — Colapso progressivo com tooltip para os itens que somem em telas estreitas.
 */
type Tone = 'ok' | 'primary' | 'neutral' | 'warn';

interface Cell {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  tip?: string;
  tone?: Tone;
  live?: boolean;
  /** Tailwind visibility (breakpoints em que o texto aparece). */
  show: string;
  /** Sempre renderiza o ícone (mesmo colapsado), só oculta o texto. */
  keepIcon?: boolean;
}

export function RoundsCommandBar() {
  const { agent } = useAgentProfile();

  // Tick de 20s — o mostrador é HH:mm, então re-render de segundo é desperdício.
  const now = useServerTime(20_000);
  const hh = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dd = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

  const rounds = useRoundsStats();

  const unitLabel = useMemo(() => {
    if (agent?.unit?.name) {
      const municipality = agent.unit.municipality ? ` · ${agent.unit.municipality}` : '';
      return `${agent.unit.name}${municipality}`;
    }
    return 'Feijó · AC';
  }, [agent?.unit?.name, agent?.unit?.municipality]);

  const shortUnitLabel = useMemo(() => {
    if (agent?.unit?.municipality) return agent.unit.municipality;
    if (agent?.unit?.name) return agent.unit.name.split(/\s+/).slice(0, 2).join(' ');
    return 'Feijó · AC';
  }, [agent?.unit?.name, agent?.unit?.municipality]);

  const cells: Cell[] = useMemo(() => {
    const list: Cell[] = [
      {
        key: 'ronda',
        icon: Radar,
        label: 'Ronda',
        value: rounds.active > 0 ? `${rounds.active} em curso` : 'Livre',
        tip: rounds.active > 0
          ? `Você tem ${rounds.active} ronda(s) em execução`
          : 'Nenhuma ronda em curso',
        tone: rounds.active > 0 ? 'ok' : 'neutral',
        live: rounds.active > 0,
        show: 'flex',
        keepIcon: true,
      },
      {
        key: 'hoje',
        icon: CalendarCheck,
        label: 'Hoje',
        value: `${rounds.today}`,
        tip: `${rounds.today} ronda(s) iniciadas hoje`,
        tone: 'primary',
        show: 'hidden sm:flex',
        keepIcon: true,
      },
      {
        key: 'enlace',
        icon: ShieldCheck,
        label: 'Enlace',
        value: 'Seguro',
        tip: 'Canal operacional seguro · 24/7',
        tone: 'ok',
        live: true,
        show: 'hidden md:flex',
        keepIcon: true,
      },
    ];

    if (agent?.team) {
      list.push({
        key: 'equipe',
        icon: Users2,
        label: 'Equipe',
        value: agent.team,
        tip: `Equipe ${agent.team}`,
        tone: 'primary',
        show: 'hidden md:flex',
        keepIcon: true,
      });
    }

    list.push(
      {
        key: 'setor',
        icon: MapPin,
        label: 'Unidade',
        value: shortUnitLabel,
        tip: unitLabel,
        tone: 'neutral',
        show: 'hidden lg:flex',
        keepIcon: true,
      },
      {
        key: 'hora',
        icon: Clock3,
        label: 'Hora',
        value: `${hh} · ${dd}`,
        tip: `Horário de rede · ${hh} · ${dd}`,
        tone: 'neutral',
        show: 'flex',
        keepIcon: true,
      },
    );

    return list;
  }, [rounds.active, rounds.today, agent?.team, shortUnitLabel, unitLabel, hh, dd]);

  const toneText = (t?: Tone) =>
    t === 'ok' ? 'text-success'
    : t === 'primary' ? 'text-primary'
    : t === 'warn' ? 'text-warning'
    : 'text-foreground/90';

  const toneDot = (t?: Tone) =>
    t === 'ok' ? 'bg-success shadow-[0_0_6px_hsl(var(--success)/0.65)]'
    : t === 'primary' ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.65)]'
    : t === 'warn' ? 'bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.65)]'
    : 'bg-muted-foreground/60';

  return (
    <TooltipProvider delayDuration={150}>
      <div
        role="group"
        aria-label="Barra tática — Gestor de Rondas e status operacional"
        className={cn(
          'relative w-full rounded-2xl overflow-hidden',
          'border border-border/60',
          'bg-[linear-gradient(180deg,hsl(215_55%_7%/0.85)_0%,hsl(217_62%_4%/0.95)_100%)]',
          'backdrop-blur-xl',
          // Sombra baixa e discreta — sem gradientes animados.
          'shadow-[0_2px_10px_-6px_hsl(217_62%_2%/0.7)]',
        )}
      >
        {/* Fio superior institucional — estável, sem pulso. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/40"
        />

        <div className="relative flex items-stretch gap-2 sm:gap-3 px-2 sm:px-3 py-1.5">
          {/* Gestor de Rondas */}
          <div className="shrink-0 flex items-center">
            <RoundsManager />
          </div>

          {/* Divisória vertical */}
          <span aria-hidden className="hidden sm:block w-px my-1 bg-border/70" />

          {/* HUD */}
          <div className="flex-1 min-w-0 flex items-center justify-end">
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
              {cells.map((c) => {
                const Icon = c.icon;
                const text = toneText(c.tone);
                const chip = (
                  <span
                    className={cn(
                      'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                      'bg-gradient-to-br from-primary/10 to-primary/0 ring-1 ring-primary/20',
                    )}
                  >
                    <Icon className={cn('h-3 w-3', text)} strokeWidth={2.4} />
                    {c.live && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                        <span className={cn('absolute inset-0 rounded-full opacity-60 animate-ping', toneDot(c.tone))} />
                        <span className={cn('relative h-1.5 w-1.5 rounded-full', toneDot(c.tone))} />
                      </span>
                    )}
                  </span>
                );

                return (
                  <Tooltip key={c.key}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          // Sempre mostra o ícone; o bloco texto some por breakpoint.
                          'flex items-center gap-1.5 min-w-0 cursor-default',
                          c.keepIcon ? 'flex' : c.show,
                        )}
                        aria-label={`${c.label}: ${c.value}`}
                      >
                        {chip}
                        <div className={cn('min-w-0 leading-tight', c.show)}>
                          <div className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground/70 font-mono truncate">
                            {c.label}
                          </div>
                          <div className={cn('text-[10.5px] font-semibold tracking-wide font-mono tabular-nums truncate', text)}>
                            {c.value}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <span className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">{c.label}</span>
                      <span className="mx-1 text-muted-foreground/50">·</span>
                      <span className="font-semibold">{c.value}</span>
                      {c.tip && c.tip !== c.value && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{c.tip}</div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default RoundsCommandBar;
