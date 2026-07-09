import { useEffect, useState, useCallback, useMemo } from "react";
import { ShieldAlert, X } from "lucide-react";

type Reason =
  | "copy"
  | "context"
  | "drag"
  | "printscreen"
  | "devtools"
  | "save"
  | "print"
  | "source";

const REASON_COPY: Record<Reason, { title: string; body: string }> = {
  copy: {
    title: "Cópia bloqueada",
    body: "A cópia de conteúdo deste sistema não é permitida.",
  },
  context: {
    title: "Menu bloqueado",
    body: "O menu de contexto sobre mídias está desativado por segurança.",
  },
  drag: {
    title: "Arrasto bloqueado",
    body: "Não é permitido arrastar ou baixar imagens deste sistema.",
  },
  printscreen: {
    title: "Captura de tela detectada",
    body: "Capturas de tela são monitoradas. A distribuição do conteúdo é proibida.",
  },
  devtools: {
    title: "Atalho restrito",
    body: "Ferramentas de desenvolvedor e inspeção de código não são permitidas.",
  },
  save: {
    title: "Download bloqueado",
    body: "Salvar a página ou seus recursos não é permitido.",
  },
  print: {
    title: "Impressão bloqueada",
    body: "A impressão do conteúdo do sistema não é permitida.",
  },
  source: {
    title: "Visualização do código bloqueada",
    body: "Não é permitido visualizar o código-fonte do sistema.",
  },
};

/**
 * Global protection layer:
 * - Blocks right-click / drag / copy on images, svgs, videos
 * - Blocks keyboard shortcuts: PrintScreen, F12, Ctrl/⌘+S/P/U, Ctrl+Shift+I/J/C
 * - Briefly hides the screen after PrintScreen is released
 * - Shows a professional dialog with contextual message
 *
 * Deterrent-only; determined users can still capture via external tools.
 */
export function ImageProtection() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("context");
  const [scrambled, setScrambled] = useState(false);

  const show = useCallback((r: Reason) => {
    setReason(r);
    setOpen(true);
  }, []);

  // ---- Mouse / clipboard / drag on mídia ----
  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const isMedia = !!t?.closest?.("img,svg,picture,video,[data-protect-image]");
      if (!isMedia) return;
      e.preventDefault();
      e.stopPropagation();
      show("context");
    };
    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest?.("img,svg,picture,video")) return;
      e.preventDefault();
      show("drag");
    };
    const onCopy = (e: ClipboardEvent) => {
      const sel = window.getSelection?.()?.toString();
      if (sel) return; // let text copy work
      const active = document.activeElement as HTMLElement | null;
      if (active?.closest?.("img,svg,picture,video")) {
        e.preventDefault();
        show("copy");
      }
    };
    document.addEventListener("contextmenu", onContext, true);
    document.addEventListener("dragstart", onDragStart, true);
    document.addEventListener("copy", onCopy, true);
    return () => {
      document.removeEventListener("contextmenu", onContext, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("copy", onCopy, true);
    };
  }, [show]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const scramble = () => {
      setScrambled(true);
      setTimeout(() => setScrambled(false), 1500);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key;
      const kL = k.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      // PrintScreen (varies by OS; some browsers don't fire it)
      if (k === "PrintScreen" || kL === "printscreen") {
        scramble();
        show("printscreen");
        try {
          navigator.clipboard?.writeText?.(" ");
        } catch {}
        return;
      }

      // DevTools shortcuts: no longer blocked/warned (removed per request)

      // View source
      if (mod && kL === "u") {
        e.preventDefault();
        show("source");
        return;
      }

      // Save
      if (mod && kL === "s") {
        e.preventDefault();
        show("save");
        return;
      }

      // Print
      if (mod && kL === "p") {
        e.preventDefault();
        show("print");
        return;
      }
    };

    // Some OS/browsers only expose PrintScreen on keyup
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        scramble();
        show("printscreen");
        try {
          navigator.clipboard?.writeText?.(" ");
        } catch {}
      }
    };

    // DevTools open-detection removed per request (no more warning dialog)

    // Block print via matchMedia (Ctrl+P fallback on some browsers)
    const onBeforePrint = (e: Event) => {
      e.preventDefault?.();
      scramble();
      show("print");
    };
    window.addEventListener("beforeprint", onBeforePrint);

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.clearInterval(devInterval);
    };
  }, [show]);

  // Auto-dismiss dialog
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 5000);
    return () => clearTimeout(t);
  }, [open]);

  // ---- Watermark tiled pattern (SVG data-URI) ----
  const watermarkUrl = useMemo(() => {
    const stamp = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const label = `ISE • ACRE • SISTEMA SOCIOEDUCATIVO • ${stamp}`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='520' height='320' viewBox='0 0 520 320'>
      <g fill='none' fill-rule='evenodd' opacity='0.09'>
        <text x='0' y='160' transform='rotate(-24 260 160)' font-family='IBM Plex Mono, monospace' font-size='16' font-weight='600' fill='#fbbf24' letter-spacing='2'>
          ${label}
        </text>
        <text x='40' y='300' transform='rotate(-24 260 160)' font-family='IBM Plex Mono, monospace' font-size='11' fill='#f59e0b' letter-spacing='4'>
          PROTEGIDO • PLANTÃOPRO • USO INSTITUCIONAL
        </text>
      </g>
    </svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }, []);

  const msg = REASON_COPY[reason];

  return (
    <>
      {/* Global tiled watermark — sits above content, ignores clicks */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
          backgroundImage: watermarkUrl,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
        }}
      />

      {/* PrintScreen scramble curtain */}
      {scrambled && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fbbf24",
            fontFamily: "'Saira Condensed', 'IBM Plex Sans', sans-serif",
            fontSize: 22,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          ⛨ Captura Bloqueada
        </div>
      )}

      {open && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="img-protect-title"
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-xl border border-amber-500/40 bg-zinc-950 shadow-2xl shadow-amber-900/30 overflow-hidden animate-in zoom-in-95 duration-200"
          >
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
              <div className="mb-4">
                <svg width="88" height="88" viewBox="0 0 100 100" fill="none" aria-hidden="true">
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
                {msg.title}
              </h2>
              <div className="text-[10px] uppercase tracking-[0.25em] text-amber-500/70 mb-4">
                Sistema Socioeducativo
              </div>

              <p className="text-zinc-200 text-sm leading-relaxed mb-3">{msg.body}</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Este conteúdo pertence à{" "}
                <span className="text-zinc-200 font-medium">
                  Equipe de Segurança do Sistema Socioeducativo
                </span>
                . Acessos e tentativas de cópia são registrados.
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
      )}
    </>
  );
}
