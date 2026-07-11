import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Lembrete discreto (apenas web desktop) instruindo o usuário a executar um
 * "hard refresh" (Ctrl+Shift+R / ⌘+Shift+R) para forçar atualização da
 * página caso o cache do navegador esteja retendo uma versão antiga.
 *
 * Oculto em:
 *  - PWAs instalados (display-mode: standalone)
 *  - Ambiente nativo (Capacitor)
 *  - Telas muito pequenas (mobile) — o gesto de teclado não se aplica
 */
export function HardRefreshHint() {
  const [visible, setVisible] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari
      // @ts-expect-error - non-standard
      window.navigator.standalone === true;
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    const hasFinePointer = window.matchMedia?.('(pointer: fine)').matches ?? true;

    setIsMac(/Mac|iPhone|iPad|iPod/i.test(window.navigator.platform || window.navigator.userAgent));
    setVisible(!isStandalone && !isNative && hasFinePointer);
  }, []);

  if (!visible) return null;

  const keyCombo = isMac ? '⌘ + Shift + R' : 'Ctrl + Shift + R';

  return (
    <>
      <span className="text-muted-foreground/40">·</span>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="note"
              aria-label={`Dica: pressione ${keyCombo} para atualizar a página`}
              className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-foreground/70 cursor-help select-none"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={2.2} />
              <span className="hidden md:inline">Atualizar</span>
              <kbd className="inline-flex items-center rounded-[3px] border border-border/60 bg-muted/40 px-1 py-[1px] font-mono text-[9px] tracking-normal text-foreground/80">
                {keyCombo}
              </kbd>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px] text-[11px] leading-snug">
            <p className="font-semibold mb-0.5">Atualização forçada</p>
            <p className="text-muted-foreground">
              Se o painel estiver desatualizado, pressione{' '}
              <span className="font-mono font-semibold text-foreground">{keyCombo}</span> para
              recarregar ignorando o cache do navegador.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
