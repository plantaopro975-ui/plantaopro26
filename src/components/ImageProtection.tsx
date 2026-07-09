import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, X } from "lucide-react";

/**
 * Global image protection:
 * - Blocks right-click on images
 * - Blocks drag/save/copy of images
 * - Shows a professional dialog warning the user
 *
 * Note: this is a UX deterrent, not real DRM. Determined users can still
 * capture assets via screenshot or devtools.
 */
export function ImageProtection() {
  const [open, setOpen] = useState(false);

  const trigger = useCallback((e: Event) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const isImage =
      target.tagName === "IMG" ||
      target.tagName === "SVG" ||
      target.tagName === "PICTURE" ||
      !!target.closest?.("img,svg,picture,[data-protect-image]");
    if (!isImage) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }, []);

  useEffect(() => {
    const onContext = (e: MouseEvent) => trigger(e);
    const onDragStart = (e: DragEvent) => trigger(e);
    const onCopy = (e: ClipboardEvent) => {
      const sel = window.getSelection?.()?.toString();
      if (!sel) {
        // Nothing selected — user likely trying to copy an image
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === "IMG" || active.closest?.("img,svg,picture"))) {
          e.preventDefault();
          setOpen(true);
        }
      }
    };
    document.addEventListener("contextmenu", onContext, { capture: true });
    document.addEventListener("dragstart", onDragStart, { capture: true });
    document.addEventListener("copy", onCopy, { capture: true });
    return () => {
      document.removeEventListener("contextmenu", onContext, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("copy", onCopy, true);
    };
  }, [trigger]);

  // Auto-dismiss after 6s
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 6000);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="img-protect-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl border border-amber-500/40 bg-zinc-950 shadow-2xl shadow-amber-900/30 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-200 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 flex flex-col items-center text-center">
          {/* Professional SVG shield */}
          <div className="relative mb-4">
            <svg
              width="88"
              height="88"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="ipShield" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>
              <path
                d="M50 6 L86 20 V48 C86 70 70 86 50 94 C30 86 14 70 14 48 V20 Z"
                fill="url(#ipShield)"
                stroke="#fde68a"
                strokeWidth="2"
              />
              <path
                d="M50 28 L68 36 V52 C68 65 60 74 50 79 C40 74 32 65 32 52 V36 Z"
                fill="#0a0a0a"
                stroke="#fde68a"
                strokeWidth="1.5"
              />
              <ShieldAlert
                x="38"
                y="42"
                width="24"
                height="24"
                stroke="#fbbf24"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          <h2
            id="img-protect-title"
            className="font-['Saira_Condensed',_'IBM_Plex_Sans',_sans-serif] uppercase tracking-widest text-amber-400 text-xl font-bold mb-1"
          >
            Conteúdo Protegido
          </h2>
          <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500/70 mb-4">
            Sistema Socioeducativo
          </div>

          <p className="text-zinc-200 text-sm leading-relaxed mb-3">
            A cópia, download ou reprodução das imagens deste sistema{" "}
            <span className="text-amber-400 font-semibold">não é permitida</span>.
          </p>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Todo o material visual pertence à{" "}
            <span className="text-zinc-200 font-medium">
              Equipe de Segurança do Sistema Socioeducativo
            </span>{" "}
            e está protegido por direitos de uso institucional.
          </p>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-5 px-6 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            Entendi
          </button>
        </div>

        <div className="px-4 py-2 bg-zinc-900/80 border-t border-zinc-800 text-[10px] text-center text-zinc-500 uppercase tracking-widest">
          PlantãoPro • Acesso Monitorado
        </div>
      </div>
    </div>
  );
}
