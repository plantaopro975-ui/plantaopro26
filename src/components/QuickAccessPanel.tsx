import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { User, Clock, ShieldCheck, Zap, Trash2, KeyRound, Loader2, ChevronRight } from 'lucide-react';
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

interface QuickAccessPanelProps {
  onQuickLogin: (cpf: string, password: string) => void;
  onSelectCredential: (cpf: string) => void;
  isLoading?: boolean;
  loadingCpf?: string;
}

const QUICK_LOGIN_EXPIRY_HOURS = 72;

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
  if (hoursRemaining >= 24) {
    return `${Math.round(hoursRemaining / 24)}d`;
  }
  if (hoursRemaining < 1) {
    return `${Math.round(hoursRemaining * 60)}min`;
  }
  return `${Math.round(hoursRemaining)}h`;
}

export function QuickAccessPanel({ onQuickLogin, onSelectCredential, isLoading, loadingCpf }: QuickAccessPanelProps) {
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
      onQuickLogin(cred.cpf, deobfuscate(cred.password));
    } else {
      onSelectCredential(cred.cpf);
    }
  };

  if (credentials.length === 0) return null;

  return (
    <div className="w-full max-w-xs mx-auto animate-fade-in">
      {/* Compact Transparent Panel */}
      <div className="relative rounded-xl overflow-hidden bg-black/30 backdrop-blur-md border border-primary/20 shadow-lg">
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        
        {/* Compact Header */}
        <div className="relative px-3 py-1.5 border-b border-primary/10 bg-primary/5">
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-bold text-primary/90 uppercase tracking-widest">
              Acesso Rápido
            </span>
          </div>
        </div>
        
        {/* Compact Credentials List */}
        <div className="relative p-2 space-y-1.5">
          {credentials.slice(0, 2).map((cred) => {
            const canQuick = canQuickLogin(cred);
            const timeLeft = getTimeRemaining(cred);
            const isThisLoading = isLoading && loadingCpf === cred.cpf;
            
            return (
              <div
                key={cred.cpf}
                onClick={() => handleCardClick(cred)}
                className={cn(
                  "relative group cursor-pointer rounded-lg transition-all duration-200",
                  "border overflow-hidden",
                  canQuick
                    ? "bg-emerald-950/40 border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-900/30"
                    : "bg-slate-800/40 border-slate-600/30 hover:border-slate-500/50",
                  isThisLoading && "pointer-events-none opacity-60"
                )}
              >
                <div className="relative px-2.5 py-2 flex items-center gap-2">
                  {/* Compact Avatar */}
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    canQuick
                      ? "bg-gradient-to-br from-emerald-500/80 to-green-600/80 text-white shadow shadow-emerald-500/20"
                      : "bg-slate-700/60 text-slate-400"
                  )}>
                    {isThisLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : canQuick ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-mono text-xs font-bold tracking-wide block",
                      canQuick ? "text-emerald-200" : "text-slate-300"
                    )}>
                      {formatCPF(cred.cpf)}
                    </span>
                    {cred.name && (
                      <p className={cn(
                        "text-[10px] truncate",
                        canQuick ? "text-emerald-400/70" : "text-slate-500"
                      )}>
                        {cred.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Status & Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {canQuick && timeLeft && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[8px] font-bold">
                        <Clock className="h-2 w-2" />
                        {timeLeft}
                      </span>
                    )}
                    
                    {canQuick ? (
                      <ChevronRight className="h-4 w-4 text-emerald-400/70 group-hover:translate-x-0.5 transition-transform" />
                    ) : cred.password ? (
                      <KeyRound className="h-3 w-3 text-amber-400/60" />
                    ) : null}
                    
                    <button
                      onClick={(e) => handleRemove(cred.cpf, e)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Remover"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
