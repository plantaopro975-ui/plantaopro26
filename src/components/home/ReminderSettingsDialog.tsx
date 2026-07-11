import { useEffect, useState } from 'react';
import { Bell, BellOff, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  getReminderSettings, setReminderSettings, subscribeReminderSettings,
  type ReminderInterval, type ReminderSettings,
} from '@/lib/reminderSettings';

const OPTIONS: { value: ReminderInterval; label: string; hint: string }[] = [
  { value: 15, label: '15 min', hint: 'Ritmo intenso' },
  { value: 30, label: '30 min', hint: 'Padrão recomendado' },
  { value: 60, label: '60 min', hint: 'Ritmo brando' },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/**
 * Preferências do lembrete automático de rondas.
 * SVG discreto no cabeçalho, chips para intervalos e switch de ativação.
 * As mudanças são propagadas em tempo real ao hook `useRoundReminder`.
 */
export function ReminderSettingsDialog({ open, onOpenChange }: Props) {
  const [settings, setSettings] = useState<ReminderSettings>(() => getReminderSettings());

  useEffect(() => subscribeReminderSettings(setSettings), []);

  const update = (patch: Partial<ReminderSettings>) => {
    const result = setReminderSettings(patch);
    if (result.ok) {
      setSettings(result.value);
    } else {
      const first = Object.values(result.errors)[0];
      toast.error(typeof first === 'string' ? first : 'Valor inválido');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="tactical-cards max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
                <defs>
                  <linearGradient id="rsgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
                <polygon
                  points="21,3 37,12 37,30 21,39 5,30 5,12"
                  fill="url(#rsgrad)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1.4"
                />
                <g stroke="hsl(var(--primary-foreground))" strokeWidth="1.6" strokeLinecap="round" fill="none">
                  <path d="M21 14v8l5 3" />
                </g>
              </svg>
            </div>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4 opacity-80" />
                Configurações do Lembrete
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ajuste o intervalo e ative/desative o aviso automático de rondas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Ativação */}
          <div className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              {settings.enabled
                ? <Bell className="h-4 w-4 text-primary" />
                : <BellOff className="h-4 w-4 text-muted-foreground" />}
              <div>
                <Label className="text-sm">Lembrete automático</Label>
                <p className="text-[11px] text-muted-foreground">
                  {settings.enabled ? 'Ativo — você será avisado periodicamente.' : 'Desativado — nenhum aviso será emitido.'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(v) => update({ enabled: !!v })}
              aria-label="Ativar lembrete"
            />
          </div>

          {/* Intervalo */}
          <div className={cn('space-y-2', !settings.enabled && 'opacity-50 pointer-events-none')}>
            <Label className="text-sm">Intervalo entre lembretes</Label>
            <div className="grid grid-cols-3 gap-2">
              {OPTIONS.map((o) => {
                const active = settings.intervalMin === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => update({ intervalMin: o.value })}
                    className={cn(
                      'rounded-md border px-3 py-2 text-left transition-all',
                      active
                        ? 'border-primary bg-primary/15 shadow-sm ring-1 ring-primary/40'
                        : 'border-border/60 bg-card/40 hover:border-primary/50',
                    )}
                    aria-pressed={active}
                  >
                    <div className="text-sm font-semibold">{o.label}</div>
                    <div className="text-[10px] text-muted-foreground">{o.hint}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              O aviso é pausado enquanto uma ronda está ativa ou o gestor está aberto.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
