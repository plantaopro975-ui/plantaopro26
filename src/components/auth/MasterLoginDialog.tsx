import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ShieldCheck } from 'lucide-react';
import heroImage from '@/assets/master-login-hero.jpg';

interface MasterLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/**
 * Master Login Dialog — Editorial "Noir & Gold" edition.
 * Cinematic hero photo, serif typography, personal welcome to Franc D'nis.
 */
export function MasterLoginDialog({ open, onOpenChange, children }: MasterLoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[94vw] max-w-[480px] p-0 gap-0 overflow-hidden border-0 bg-[#0a0a0f] shadow-[0_40px_120px_-20px_rgba(201,168,76,0.35),0_0_0_1px_rgba(201,168,76,0.25)]"
      >
        <DialogTitle className="sr-only">Acesso Master</DialogTitle>
        <DialogDescription className="sr-only">
          Bem-vindo, Franc D'nis. Área restrita do sistema.
        </DialogDescription>

        {/* Top hairline gold */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

        {/* HERO cinematic */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 8' }}>
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'contrast(1.1) saturate(0.9) brightness(0.75)' }}
          />
          {/* Warm gold wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(120% 90% at 80% 20%, rgba(201,168,76,0.28) 0%, transparent 55%), linear-gradient(180deg, rgba(10,10,15,0.35) 0%, rgba(10,10,15,0.75) 60%, #0a0a0f 100%)',
            }}
          />
          {/* Classified strip */}
          <div className="absolute top-3 inset-x-4 flex items-center justify-between text-[10px] font-mono tracking-[0.32em] uppercase text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse shadow-[0_0_8px_#c9a84c]" />
              Secure Channel
            </span>
            <span className="text-white/40">Classified · Lv.10</span>
          </div>

          {/* Personal welcome */}
          <div className="absolute bottom-0 inset-x-0 px-6 pb-5">
            <div className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#c9a84c] mb-2">
              Bem-vindo de volta
            </div>
            <h2
              className="text-white leading-tight"
              style={{
                fontFamily: '"Libre Baskerville", "Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.5rem, 4vw, 1.9rem)',
                fontWeight: 700,
                textShadow: '0 2px 12px rgba(0,0,0,0.9)',
              }}
            >
              Franc <span className="italic text-[#f0d78c]">D'nis</span>
            </h2>
            <p className="mt-1.5 text-[13px] text-white/70 font-light tracking-wide">
              O Master do sistema está pronto para operar.
            </p>
          </div>

          {/* Bottom hairline */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/60 to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="relative px-7 pt-6 pb-7 bg-[#0a0a0f]">
          {/* Corner ornaments */}
          <span className="absolute top-3 left-3 h-3 w-3 border-t border-l border-[#c9a84c]/50" />
          <span className="absolute top-3 right-3 h-3 w-3 border-t border-r border-[#c9a84c]/50" />
          <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-[#c9a84c]/50" />
          <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-[#c9a84c]/50" />

          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="h-4 w-4 text-[#c9a84c]" />
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#c9a84c]/90">
              Autenticação Master
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/40 to-transparent" />
          </div>

          {/* Style overrides for AuthInput + AuthButton to match Noir & Gold */}
          <div
            className="space-y-4
              [&_label]:text-[10px] [&_label]:tracking-[0.28em] [&_label]:uppercase [&_label]:font-semibold [&_label]:text-[#c9a84c]/80 [&_label]:font-mono
              [&_input]:h-11 [&_input]:text-[14px] [&_input]:bg-black/40 [&_input]:border-[#c9a84c]/25
              [&_input]:focus-visible:border-[#c9a84c] [&_input]:focus-visible:ring-[#c9a84c]/30
              [&_input]:text-white [&_input]:placeholder:text-white/25
              [&_button[type=submit]]:!bg-gradient-to-r [&_button[type=submit]]:!from-[#c9a84c] [&_button[type=submit]]:!via-[#f0d78c] [&_button[type=submit]]:!to-[#c9a84c]
              [&_button[type=submit]]:!text-black [&_button[type=submit]]:!font-bold [&_button[type=submit]]:!tracking-[0.15em] [&_button[type=submit]]:!uppercase
              [&_button[type=submit]]:!shadow-[0_10px_30px_-8px_rgba(201,168,76,0.6)]"
          >
            {children}
          </div>

          <p className="mt-5 text-center text-[10px] font-mono tracking-[0.28em] uppercase text-white/30">
            Plantão Pro · Comando Master
          </p>
        </div>

        {/* Bottom gold */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
      </DialogContent>
    </Dialog>
  );
}
