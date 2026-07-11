import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import heroImage from "@/assets/access-gate-hero.jpg";

const ACK_KEY = "plantaopro_access_acknowledged_v1";
const GATE_EXEMPT_ROUTES = new Set(["/about", "/install"]);

/**
 * Portal compacto de aceite — ferramenta operacional para agentes
 * socioeducativos. Aparece uma única vez por dispositivo.
 *
 * Baseado em Radix Dialog: foco gerenciado, trap de teclado, Escape para
 * fechar e ARIA (`role="dialog"`, `aria-modal`, `aria-labelledby`,
 * `aria-describedby`) aplicados pela primitiva.
 */
export function AccessAcknowledgmentGate() {
  const { pathname } = useLocation();
  const isExemptRoute = GATE_EXEMPT_ROUTES.has(pathname);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (isExemptRoute) {
      setOpen(false);
      return;
    }

    try {
      const done = localStorage.getItem(ACK_KEY);
      if (!done) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [isExemptRoute]);

  const handleAccept = () => {
    if (!accepted) return;
    try {
      localStorage.setItem(
        ACK_KEY,
        JSON.stringify({ accepted_at: new Date().toISOString(), v: 3 })
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (isExemptRoute) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[9999] bg-[radial-gradient(ellipse_at_center,hsl(32_20%_8%)_0%,hsl(222_50%_3%)_80%)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        />
        <DialogPrimitive.Content
          aria-labelledby="ack-title"
          aria-describedby="ack-desc"
          className="fixed left-1/2 top-1/2 z-[10000] max-h-[calc(100dvh-1rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain focus:outline-none [scrollbar-width:thin] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
        >
          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#0b0d14]/95 to-[#05070d]/95 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)] backdrop-blur">
            {/* Imagem hero cinematográfica — proporção 4:3 mostrada por inteiro */}
            <div
              className="relative w-full overflow-hidden bg-[#05070d]"
              style={{ aspectRatio: "4 / 3" }}
            >
              <img
                src={heroImage}
                alt=""
                aria-hidden="true"
                width={1024}
                height={768}
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#05070d]/85 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070d] to-transparent pointer-events-none" />

              {/* Faixa superior sobre a imagem */}
              <div
                className="absolute top-3 left-4 right-4 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.22em] text-amber-300/90"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 animate-pulse" />
                  <span className="truncate">Acesso Restrito</span>
                </div>
                <span className="shrink-0 whitespace-nowrap tracking-[0.18em]">Plantão&nbsp;Pro</span>
              </div>

              {/* Título sobreposto */}
              <div className="absolute bottom-3 left-4 right-4">
                <DialogPrimitive.Title
                  id="ack-title"
                  className="text-lg font-bold tracking-[0.12em] text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: "'Libre Baskerville', serif" }}
                >
                  CONTROLE DE PLANTÃO
                </DialogPrimitive.Title>
                <p
                  className="mt-0.5 text-[9px] uppercase tracking-[0.3em] text-amber-300/80"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Sistema profissional · Escala · Banco de horas
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-4">
              {/* Corpo */}
              <DialogPrimitive.Description
                id="ack-desc"
                asChild
              >
                <div className="space-y-2 text-[12px] leading-relaxed text-amber-50/85">
                  <p>
                    Plataforma operacional destinada a{" "}
                    <strong className="text-amber-300">
                      agentes socioeducativos
                    </strong>{" "}
                    para gestão de plantões, folgas, trocas de escala e banco
                    de horas com precisão profissional.
                  </p>
                  <p className="text-[11px] text-amber-200/60">
                    O acesso é restrito ao público-alvo. Confirme seu perfil
                    para prosseguir.
                  </p>
                </div>
              </DialogPrimitive.Description>

              {rejected ? (
                <div
                  role="alert"
                  className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-center space-y-1"
                >
                  <div className="text-rose-300 text-xs font-semibold tracking-wide uppercase">
                    Acesso não autorizado
                  </div>
                  <p className="text-[11px] text-rose-100/80 leading-relaxed">
                    Esta plataforma é dedicada exclusivamente a agentes
                    socioeducativos em exercício.
                  </p>
                </div>
              ) : (
                <>
                  <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={accepted}
                      onCheckedChange={(v) => setAccepted(!!v)}
                      aria-label="Confirmo que sou agente socioeducativo"
                      className="mt-0.5 border-amber-500/60 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-black"
                    />
                    <span className="text-[11.5px] text-amber-50/90 select-none">
                      Confirmo que sou{" "}
                      <strong className="text-amber-300">
                        agente socioeducativo
                      </strong>{" "}
                      e utilizarei a plataforma para fins profissionais.
                    </span>
                  </label>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRejected(true)}
                      className="flex-1 h-9 border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs"
                    >
                      Não sou
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!accepted}
                      onClick={handleAccept}
                      className="flex-[1.4] h-9 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 shadow-md shadow-amber-500/30 text-xs"
                    >
                      Acessar plataforma
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default AccessAcknowledgmentGate;
