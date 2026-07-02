import { cn } from "@/lib/utils";

/**
 * Backdrop leve e responsivo para telas de "Carregando...".
 * - GPU-friendly (apenas gradientes + 1 pulse muito lento)
 * - Sem imagens, sem blur pesado -> ok em mobile
 */
export function LoadingBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Glow âmbar suave — animação lenta */}
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-30 animate-loading-orb"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full opacity-25 animate-loading-orb"
        style={{
          animationDelay: "1.5s",
          background:
            "radial-gradient(circle, rgba(217,119,6,0.30), transparent 70%)",
        }}
      />

      {/* Grid tático discreto */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Vinheta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}
