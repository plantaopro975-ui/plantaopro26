import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Heart, Lock, Server, Users } from 'lucide-react';

/**
 * BetaNoticeFooter
 * Rodapé exclusivo para versão mobile: informa que se trata de app não-oficial em beta,
 * abre modal detalhado ao clique. Puro SVG + tokens semânticos.
 */
export function BetaNoticeFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden w-full px-3 pt-3 pb-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative w-full overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-card/90 via-background/80 to-card/90 px-3 py-3 text-left shadow-[0_4px_18px_hsl(220_45%_2%/0.55)] backdrop-blur-md transition-all active:scale-[0.98]"
          aria-label="Sobre esta versão beta do aplicativo"
        >
          {/* SVG decorativo — faixa hexagonal tática */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.10]"
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="beta-hex" width="20" height="18" patternUnits="userSpaceOnUse">
                <polygon
                  points="10,1 19,6 19,14 10,19 1,14 1,6"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.6"
                />
              </pattern>
              <linearGradient id="beta-glow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="400" height="100" fill="url(#beta-hex)" />
            <rect x="0" y="0" width="400" height="1" fill="url(#beta-glow)" />
            <rect x="0" y="99" width="400" height="1" fill="url(#beta-glow)" />
          </svg>

          <div className="relative flex items-start gap-3">
            {/* Ícone SVG "BETA" custom */}
            <div className="relative shrink-0">
              <svg width="42" height="42" viewBox="0 0 42 42" className="drop-shadow-[0_2px_4px_hsl(var(--primary)/0.35)]">
                <defs>
                  <linearGradient id="beta-shield" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary) / 0.55)" />
                  </linearGradient>
                </defs>
                <path
                  d="M21 3 L37 9 V22 C37 30 30 37 21 39 C12 37 5 30 5 22 V9 Z"
                  fill="url(#beta-shield)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x="21"
                  y="24"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="900"
                  fill="hsl(var(--primary-foreground))"
                  fontFamily="'IBM Plex Sans', ui-sans-serif"
                  letterSpacing="1"
                >
                  BETA
                </text>
                <circle cx="34" cy="8" r="3.5" fill="hsl(var(--destructive))">
                  <animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  Aviso · Versão Beta
                </span>
              </div>
              <p className="text-[12px] leading-snug text-foreground/90 font-medium">
                App <span className="text-primary font-bold">não oficial</span> · Iniciativa de agente para agentes
              </p>
              <p className="text-[10px] leading-tight text-muted-foreground/85">
                Toque para ver os termos completos e responsabilidades
              </p>
            </div>

            <svg width="14" height="14" viewBox="0 0 24 24" className="mt-1 shrink-0 text-primary/70">
              <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
          {/* Header cinematográfico */}
          <div className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-background to-background px-5 pt-5 pb-4">
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
            >
              <pattern id="beta-modal-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M12 0 L0 0 0 12" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" />
              </pattern>
              <rect width="200" height="60" fill="url(#beta-modal-grid)" />
            </svg>
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    Termos · Responsabilidades
                  </span>
                  <DialogTitle className="font-serif text-lg leading-tight">
                    Sobre o PlantãoPro
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="sr-only">
                Informações sobre o aplicativo, termos de uso e responsabilidades.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-4 px-5 py-4 text-[13px] leading-relaxed text-foreground/90">
              <section className="flex gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Iniciativa independente</h4>
                  <p className="text-muted-foreground">
                    Este aplicativo é uma iniciativa de um <strong className="text-foreground/90">agente socioeducativo</strong>, criado como
                    ferramenta pessoal de organização de rotinas e plantões.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <h4 className="font-bold text-foreground">Não é oficial</h4>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground/90">Não se trata de aplicativo oficial da corporação ISE</strong> nem representa
                    qualquer entidade governamental ou institucional.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Uso gratuito</h4>
                  <p className="text-muted-foreground">
                    O acesso é <strong className="text-foreground/90">gratuito</strong> para os agentes que desejem utilizar como apoio
                    à sua rotina profissional.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Segurança</h4>
                  <p className="text-muted-foreground">
                    Seguimos os <strong className="text-foreground/90">protocolos de segurança</strong> recomendados para
                    aplicações web (TLS 1.3, criptografia em repouso, RLS e LGPD).
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <h4 className="font-bold text-foreground">Responsabilidade</h4>
                  <p className="text-muted-foreground">
                    O desenvolvedor <strong className="text-foreground/90">não se responsabiliza por uso indevido</strong> das
                    informações inseridas ou compartilhadas dentro da plataforma.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Disponibilidade</h4>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground/90">Não há garantia de disponibilidade contínua</strong> — a operação depende
                    da demanda e exige apoio financeiro para manter servidor, hospedagem e evolução.
                  </p>
                </div>
              </section>

              <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Feito por agente · Para agentes
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  QSL, Feijó! · &lt;dev&gt; Franc D'nis
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
