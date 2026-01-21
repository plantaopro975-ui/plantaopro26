import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Clock, ShieldCheck, Zap, Trash2, KeyRound, Loader2 } from 'lucide-react';
import { formatCPF } from '@/lib/validators';
import {
  getSavedCredentials,
  removeCredential,
  canQuickLogin,
} from '@/components/auth/SavedCredentials';

interface SavedCredential {
  cpf: string;
  name?: string;
  password?: string;
  savedAt: string;
  lastLoginAt?: string;
}

interface QuickLoginCardsProps {
  onQuickLogin: (cpf: string, password: string) => void;
  onSelectCredential: (cpf: string) => void;
  isLoading?: boolean;
  loadingCpf?: string;
}

const QUICK_LOGIN_EXPIRY_HOURS = 4;

function deobfuscate(str: string): string {
  try {
    return decodeURIComponent(atob(str));
  } catch {
    return '';
  }
}

function getTimeRemaining(cred: SavedCredential): string | null {
  if (!cred.lastLoginAt || !cred.password) return null;
  const lastLogin = new Date(cred.lastLoginAt);
  const now = new Date();
  const hoursRemaining = QUICK_LOGIN_EXPIRY_HOURS - (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
  if (hoursRemaining <= 0) return null;
  if (hoursRemaining < 1) {
    return `${Math.round(hoursRemaining * 60)}min`;
  }
  return `${Math.round(hoursRemaining)}h`;
}

export function QuickLoginCards({ onQuickLogin, onSelectCredential, isLoading, loadingCpf }: QuickLoginCardsProps) {
  const [credentials, setCredentials] = useState<SavedCredential[]>([]);

  useEffect(() => {
    setCredentials(getSavedCredentials());
  }, []);

  const handleRemove = (cpf: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCredential(cpf);
    setCredentials(getSavedCredentials());
  };

  const handleCardClick = (cred: SavedCredential) => {
    if (isLoading) return;
    
    const canQuick = canQuickLogin(cred);
    
    if (canQuick && cred.password) {
      // Login rápido com 1 clique
      onQuickLogin(cred.cpf, deobfuscate(cred.password));
    } else {
      // Precisa digitar senha
      onSelectCredential(cred.cpf);
    }
  };

  if (credentials.length === 0) return null;

  return (
    <div className="w-full animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Acesso Rápido
          </span>
        </div>
      </div>
      
      <div className="grid gap-2">
        {credentials.map((cred) => {
          const canQuick = canQuickLogin(cred);
          const timeLeft = getTimeRemaining(cred);
          const isThisLoading = isLoading && loadingCpf === cred.cpf;
          
          return (
            <div
              key={cred.cpf}
              onClick={() => handleCardClick(cred)}
              className={cn(
                "relative p-3 rounded-xl cursor-pointer transition-all duration-300 group border-2",
                canQuick
                  ? "bg-gradient-to-r from-emerald-950/80 to-emerald-900/50 border-emerald-500/40 hover:border-emerald-400/70 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  : "bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-slate-600/40 hover:border-slate-500/70 hover:shadow-lg",
                isThisLoading && "pointer-events-none opacity-70"
              )}
            >
              {/* Glow effect for quick login */}
              {canQuick && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              
              <div className="flex items-center gap-3 relative z-10">
                {/* Avatar/Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                  canQuick
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110"
                    : "bg-slate-700 text-slate-400 group-hover:bg-slate-600"
                )}>
                  {isThisLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : canQuick ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-mono text-sm font-bold tracking-wider truncate",
                      canQuick ? "text-emerald-300" : "text-slate-200"
                    )}>
                      {formatCPF(cred.cpf)}
                    </span>
                    {canQuick && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase">
                        1-Clique
                      </span>
                    )}
                  </div>
                  {cred.name && (
                    <p className={cn(
                      "text-xs truncate",
                      canQuick ? "text-emerald-400/80" : "text-slate-400"
                    )}>
                      {cred.name}
                    </p>
                  )}
                </div>
                
                {/* Status/Time */}
                <div className="flex items-center gap-2">
                  {canQuick && timeLeft && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <Clock className="h-3 w-3 text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-300">{timeLeft}</span>
                    </div>
                  )}
                  
                  {!canQuick && cred.password && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
                      <KeyRound className="h-3 w-3 text-amber-400" />
                      <span className="text-[10px] text-amber-300">Expirado</span>
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={(e) => handleRemove(cred.cpf, e)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Remover credencial"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Bottom hint */}
              <div className={cn(
                "mt-2 pt-2 border-t text-[10px] text-center transition-all",
                canQuick
                  ? "border-emerald-500/20 text-emerald-400/70"
                  : "border-slate-600/30 text-slate-500"
              )}>
                {canQuick
                  ? "Clique para entrar automaticamente"
                  : "Clique para preencher CPF (senha necessária)"
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
