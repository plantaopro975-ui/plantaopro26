import { cn } from '@/lib/utils';

interface CopyrightFooterProps {
  className?: string;
  compact?: boolean;
}

/**
 * Footer compacto com copyright e nome do desenvolvedor
 * Visível em todas as telas, otimizado para mobile
 */
export function CopyrightFooter({ className, compact = false }: CopyrightFooterProps) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <div className={cn("text-center py-1", className)}>
        <p className="text-[8px] text-muted-foreground/50 flex items-center justify-center gap-1">
          <span className="font-bold bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent">
            FRANC D'NIS
          </span>
          <span>© {year}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={cn("text-center py-2 space-y-0.5", className)}>
      <p className="text-[9px] text-muted-foreground/70 flex items-center justify-center gap-1.5">
        <span 
          className="font-black tracking-wider bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent"
          style={{
            textShadow: '0 0 10px hsl(var(--primary) / 0.3)',
          }}
        >
          FRANC D'NIS
        </span>
        <span className="text-muted-foreground/30">•</span>
        <span className="text-[8px]">Feijó/AC</span>
      </p>
      <p className="text-[8px] text-muted-foreground/40">
        © {year} PlantãoPro
      </p>
    </div>
  );
}
