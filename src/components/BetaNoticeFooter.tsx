import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, AlertTriangle, Heart, Lock, Server, Users, X } from 'lucide-react';

const SEEN_KEY = 'beta-notice-seen-v1';
const HIDDEN_KEY = 'beta-notice-hidden-v1';

/**
 * BetaNoticeFooter
 * Mobile-only. Abre modal automaticamente na 1ª visita e depois
 * fica como micro-selo discreto no canto inferior direito. Suporta
 * ocultação permanente e navegação completa por teclado.
 */
export function BetaNoticeFooter() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HIDDEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        const t = window.setTimeout(() => setOpen(true), 600);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      try {
        localStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* ignore */
      }
    }
  };

  const hidePermanently = () => {
    try {
      localStorage.setItem(HIDDEN_KEY, '1');
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  return (
    <>
      {!hidden && (
        <DraggableBetaPill
          onOpen={() => setOpen(true)}
          onHide={hidePermanently}
        />
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md p-0 overflow-hidden border-primary/30"
          aria-labelledby="beta-notice-title"
          aria-describedby="beta-notice-desc"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            closeBtnRef.current?.focus();
          }}
        >
          <div className="relative border-b border-primary/20 bg-gradient-to-br from-primary/15 via-background to-background px-5 pt-5 pb-4">
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/40">
                  <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                    Termos · Responsabilidades
                  </span>
                  <DialogTitle id="beta-notice-title" className="font-serif text-lg leading-tight">
                    Sobre o PlantãoPro
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription id="beta-notice-desc" className="sr-only">
                Informações sobre o aplicativo, termos de uso e responsabilidades. Pressione Escape para fechar.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[65vh]">
            <div
              ref={(node) => {
                // Radix já expõe close via DialogPrimitive.Close; guardamos referência
                // ao primeiro botão de fechar renderizado pelo DialogContent.
                if (node) {
                  const btn = node.closest('[role="dialog"]')?.querySelector<HTMLButtonElement>('[aria-label="Fechar"]');
                  if (btn) closeBtnRef.current = btn;
                }
              }}
              className="space-y-4 px-5 py-4 text-[13px] leading-relaxed text-foreground/90"
            >
              <section className="flex gap-3">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h4 className="font-bold text-foreground">Iniciativa independente</h4>
                  <p className="text-muted-foreground">
                    Este aplicativo é uma iniciativa de um <strong className="text-foreground/90">agente socioeducativo</strong>, criado como
                    ferramenta pessoal de organização de rotinas e plantões.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                  <h4 className="font-bold text-foreground">Não é oficial</h4>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground/90">Não se trata de aplicativo oficial da corporação ISE</strong> nem representa
                    qualquer entidade governamental ou institucional.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h4 className="font-bold text-foreground">Uso gratuito</h4>
                  <p className="text-muted-foreground">
                    O acesso é <strong className="text-foreground/90">gratuito</strong> para os agentes que desejem utilizar como apoio
                    à sua rotina profissional.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h4 className="font-bold text-foreground">Segurança</h4>
                  <p className="text-muted-foreground">
                    Seguimos os <strong className="text-foreground/90">protocolos de segurança</strong> recomendados para
                    aplicações web (TLS 1.3, criptografia em repouso, RLS e LGPD).
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <div>
                  <h4 className="font-bold text-foreground">Responsabilidade</h4>
                  <p className="text-muted-foreground">
                    O desenvolvedor <strong className="text-foreground/90">não se responsabiliza por uso indevido</strong> das
                    informações inseridas ou compartilhadas dentro da plataforma.
                  </p>
                </div>
              </section>

              <section className="flex gap-3">
                <Server className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
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
