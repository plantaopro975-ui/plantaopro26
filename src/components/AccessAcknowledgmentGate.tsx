import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ACK_KEY = "plantaopro_access_acknowledged_v1";

/**
 * Portal profissional de aceite institucional — bloqueia o acesso ao
 * PlantãoPro para quem não é agente socioeducativo do Estado do Acre.
 * Aparece uma única vez por dispositivo. Sem opção de logar sem aceitar.
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
        JSON.stringify({ accepted_at: new Date().toISOString(), v: 1 })
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const handleReject = () => {
    setRejected(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ack-title"
      aria-describedby="ack-desc"
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_center,hsl(32_28%_9%)_0%,hsl(222_60%_3%)_75%)] px-4 py-6"
    >
      {/* Grid HUD sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.35) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Vinheta */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <div className="relative w-full max-w-xl">
        {/* Cantos táticos */}
        <CornerBracket className="top-0 left-0" />
        <CornerBracket className="top-0 right-0" rotate={90} />
        <CornerBracket className="bottom-0 left-0" rotate={270} />
        <CornerBracket className="bottom-0 right-0" rotate={180} />

        <div className="relative rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#0a0d1a]/95 to-[#050810]/95 p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(245,158,11,0.35)] backdrop-blur">
          {/* Faixa superior */}
          <div
            className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-amber-300/70 mb-5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Autorização · Restrita</span>
            </div>
            <span>ISE · Acre</span>
          </div>

          {/* Emblema SVG central */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <span className="absolute inset-0 rounded-full blur-2xl bg-amber-500/30 animate-pulse" />
              <svg
                width="120"
                height="140"
                viewBox="0 0 120 140"
                fill="none"
                aria-hidden
                className="relative drop-shadow-[0_0_25px_rgba(245,158,11,0.55)]"
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
                <path
                  d="M30 96 L60 82 L90 96"
                  stroke="url(#ackShield)"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M30 110 L60 96 L90 110"
                  stroke="url(#ackShield)"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <h1
            id="ack-title"
            className="text-center text-xl sm:text-2xl font-bold tracking-[0.18em] text-amber-100"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            ACESSO INSTITUCIONAL
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-500/60" />
            <span
              className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Termo de Uso · Restrito
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-500/60" />
          </div>

          {/* Corpo */}
          <div
            id="ack-desc"
            className="mt-6 space-y-3 text-[13px] leading-relaxed text-amber-50/90"
          >
            <p>
              O <strong className="text-amber-300">PlantãoPro</strong> é uma
              ferramenta operacional de uso <strong>exclusivo</strong> dos{" "}
              <strong className="text-amber-300">
                Agentes Socioeducativos do Estado do Acre
              </strong>{" "}
              — servidores da segurança pública lotados no{" "}
              <strong>ISE · Instituto Sócio-Educativo</strong>.
            </p>
            <p>
              Ao prosseguir, você declara, sob sua responsabilidade funcional,
              que integra o quadro efetivo da segurança pública e que utilizará
              o sistema estritamente para <strong>fins profissionais</strong>{" "}
              (gestão de plantões, folgas, rondas e comunicação interna).
            </p>
            <p className="text-[12px] text-amber-200/70 italic">
              O uso indevido, o compartilhamento de credenciais ou o acesso por
              pessoas não autorizadas são passíveis de responsabilização
              administrativa, civil e criminal, nos termos da legislação
              vigente.
            </p>
          </div>

          {rejected ? (
            <div className="mt-6 rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-center space-y-2">
              <div className="text-rose-300 text-sm font-semibold tracking-wide uppercase">
                Acesso não autorizado
              </div>
              <p className="text-[12px] text-rose-100/85 leading-relaxed">
                Este sistema é reservado aos Agentes Socioeducativos do Estado
                do Acre. Se você chegou aqui por engano, feche esta janela e
                encerre a sessão.
              </p>
            </div>
          ) : (
            <>
              {/* Checkbox de aceite */}
              <label className="mt-6 flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(!!v)}
                  className="mt-0.5 border-amber-500/60 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-black"
                  aria-describedby="ack-desc"
                />
                <span className="text-[12.5px] text-amber-50/90 select-none">
                  Declaro que sou{" "}
                  <strong className="text-amber-300">
                    Agente Socioeducativo do Estado do Acre
                  </strong>{" "}
                  e aceito o termo de uso institucional.
                </span>
              </label>

              {/* Botões */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReject}
                  className="flex-1 border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Não sou agente
                </Button>
                <Button
                  type="button"
                  disabled={!accepted}
                  onClick={handleAccept}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30"
                >
                  Confirmar e continuar
                </Button>
              </div>
            </>
          )}

          {/* Rodapé */}
          <div
            className="mt-6 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-amber-300/50"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <span>Feito por Agente · para Agente</span>
            <span>v · CMD.24</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerBracket({
  className = "",
  rotate = 0,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      className={`absolute text-amber-400/80 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M2 10 V2 H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AccessAcknowledgmentGate;
