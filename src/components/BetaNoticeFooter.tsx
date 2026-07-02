import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Heart, Lock, Server, Users, Info } from 'lucide-react';

/**
 * BetaNoticeFooter
 * Micro-pill discreto (somente mobile). Abre modal com termos completos.
 */
export function BetaNoticeFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden w-full flex justify-center px-3 pt-1 pb-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Sobre esta versão beta"
          className="group inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card/70 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground/90 backdrop-blur-sm transition-all active:scale-95 hover:border-primary/50"
        >
          {/* Micro-selo BETA em SVG */}
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden className="text-primary">
            <path
              d="M12 2 L21 6 V13 C21 17.5 17 21 12 22 C7 21 3 17.5 3 13 V6 Z"
              fill="currentColor"
              opacity="0.15"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="18.5" cy="5.5" r="1.6" fill="hsl(var(--destructive))">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </svg>
          <span className="text-primary font-bold">BETA</span>
          <span className="text-muted-foreground/70">·</span>
          <span>App não oficial</span>
          <Info className="h-2.5 w-2.5 text-primary/70" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
          <div className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-background to-background px-5 pt-5 pb-4">
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
