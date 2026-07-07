import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ACK_KEY = "plantaopro_access_acknowledged_v1";

/**
 * Portal compacto de aceite — ferramenta operacional feita por e para
 * agentes socioeducativos. Sem tom institucional/oficial. Aparece uma
 * única vez por dispositivo.
 */
export function AccessAcknowledgmentGate() {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(ACK_KEY);
      if (!done) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    if (!accepted) return;
    try {
      localStorage.setItem(
        ACK_KEY,
        JSON.stringify({ accepted_at: new Date().toISOString(), v: 2 })
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ack-title"
      aria-describedby="ack-desc"
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_center,hsl(32_20%_8%)_0%,hsl(222_50%_3%)_80%)] px-4 py-6"
    >
      <div className="relative w-full max-w-sm">
        <div className="relative rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#0b0d14]/95 to-[#05070d]/95 p-5 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)] backdrop-blur">
          {/* Faixa superior */}
          <div
            className="flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-amber-300/70 mb-4"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Uso Restrito</span>
            </div>
            <span>PlantãoPro</span>
          </div>

          {/* Emblema compacto */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <span className="absolute inset-0 rounded-full blur-xl bg-amber-500/25" />
              <svg
                width="64"
                height="72"
                viewBox="0 0 120 140"
                fill="none"
                aria-hidden
                className="relative drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              >
                <defs>
                  <linearGradient id="ackShield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="55%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="ackStar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef3c7" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <path
                  d="M60 4 L112 24 V70 C112 100 88 126 60 136 C32 126 8 100 8 70 V24 Z"
                  stroke="url(#ackShield)"
                  strokeWidth="2.5"
                  fill="rgba(245,158,11,0.06)"
                />
                <path
                  d="M60 30 L66 48 L85 48 L70 60 L76 78 L60 68 L44 78 L50 60 L35 48 L54 48 Z"
                  fill="url(#ackStar)"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1
            id="ack-title"
            className="text-center text-base font-bold tracking-[0.14em] text-amber-100"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            FERRAMENTA DO AGENTE
          </h1>
          <p
            className="mt-1 text-center text-[9px] uppercase tracking-[0.3em] text-amber-300/70"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Feito por agente · para agente
          </p>

          {/* Corpo enxuto */}
          <div
            id="ack-desc"
            className="mt-4 space-y-2 text-[12px] leading-relaxed text-amber-50/85"
          >
            <p>
              O <strong className="text-amber-300">PlantãoPro</strong> é uma
              ferramenta prática para{" "}
              <strong>agentes socioeducativos</strong> organizarem plantões,
              folgas, banco de horas e trocas de escala no dia a dia.
            </p>
            <p className="text-[11px] text-amber-200/60">
              Não é sistema oficial. É um app do agente, para uso pessoal e
              operacional.
            </p>
          </div>

          {rejected ? (
            <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-center space-y-1">
              <div className="text-rose-300 text-xs font-semibold tracking-wide uppercase">
                App voltado para agentes
              </div>
              <p className="text-[11px] text-rose-100/80 leading-relaxed">
                As funcionalidades foram pensadas para a rotina de plantão.
                Sem esse perfil, o app perde o sentido.
              </p>
            </div>
          ) : (
            <>
              <label className="mt-4 flex items-start gap-2.5 cursor-pointer">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(!!v)}
                  className="mt-0.5 border-amber-500/60 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-black"
                />
                <span className="text-[11.5px] text-amber-50/90 select-none">
                  Sou <strong className="text-amber-300">agente socioeducativo</strong> e
                  vou usar como ferramenta pessoal de trabalho.
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
                  Entrar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccessAcknowledgmentGate;
