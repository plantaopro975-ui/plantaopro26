import { cn } from "@/lib/utils";
import loadingBg from "@/assets/loading-backdrop.jpg";

/**
 * Backdrop leve e responsivo para telas de "Carregando...".
 * - Imagem tática realista (sala de comando) + overlays GPU-friendly
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
      {/* Base tática realista */}
      <div
        className="absolute inset-0 bg-zinc-950 bg-cover bg-center"
        style={{ backgroundImage: `url(${loadingBg})` }}
      />
      {/* Escurecimento para legibilidade */}
      <div className="absolute inset-0 bg-zinc-950/70" />


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
