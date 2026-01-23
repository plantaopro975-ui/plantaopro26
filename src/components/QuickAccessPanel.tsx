import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { User, Clock, ShieldCheck, Zap, Trash2, KeyRound, Loader2, Fingerprint, ChevronRight } from 'lucide-react';
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
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      {/* Premium Panel Container */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border border-primary/30 shadow-2xl shadow-primary/10">
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-50" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }} />
        
        {/* Header */}
        <div className="relative px-4 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-primary/10">
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 blur-md bg-primary/40 rounded-full" />
              <div className="relative p-1.5 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40">
                <Zap className="h-4 w-4 text-primary" />
              </div>
            </div>
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              Acesso Rápido
            </span>
          </div>
        </div>
        
        {/* Credentials List */}
        <div className="relative p-3 space-y-2">
          {credentials.map((cred, index) => {
            const canQuick = canQuickLogin(cred);
            const timeLeft = getTimeRemaining(cred);
            const isThisLoading = isLoading && loadingCpf === cred.cpf;
            
            return (
              <div
                key={cred.cpf}
                onClick={() => handleCardClick(cred)}
                className={cn(
                  "relative group cursor-pointer rounded-xl transition-all duration-300",
                  "border-2 overflow-hidden",
                  canQuick
                    ? "bg-gradient-to-r from-emerald-950/80 to-emerald-900/50 border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
                    : "bg-gradient-to-r from-slate-800/80 to-slate-700/50 border-slate-600/40 hover:border-slate-500",
                  isThisLoading && "pointer-events-none opacity-70"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Hover glow effect */}
                {canQuick && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                <div className="relative p-3 flex items-center gap-3">
                  {/* Avatar Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 border-2",
                    canQuick
                      ? "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400/50 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105"
                      : "bg-slate-700 border-slate-600 text-slate-400"
                  )}>
                    {isThisLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : canQuick ? (
                      <Fingerprint className="h-6 w-6" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "font-mono text-sm font-bold tracking-wider",
                        canQuick ? "text-emerald-200" : "text-slate-200"
                      )}>
                        {formatCPF(cred.cpf)}
                      </span>
                    </div>
                    {cred.name && (
                      <p className={cn(
                        "text-xs truncate mt-0.5",
                        canQuick ? "text-emerald-400/80" : "text-slate-400"
                      )}>
                        {cred.name}
                      </p>
                    )}
                    
                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {canQuick ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold uppercase tracking-wider">
                          <ShieldCheck className="h-3 w-3" />
                          1-Clique
                        </span>
                      ) : cred.password ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[9px] font-medium">
                          <KeyRound className="h-3 w-3" />
                          Expirado
                        </span>
                      ) : null}
                      
                      {canQuick && timeLeft && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[9px] font-bold tabular-nums">
                          <Clock className="h-2.5 w-2.5" />
                          {timeLeft}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Arrow indicator */}
                    <ChevronRight className={cn(
                      "h-5 w-5 transition-all duration-200",
                      canQuick 
                        ? "text-emerald-400 group-hover:translate-x-0.5" 
                        : "text-slate-500 group-hover:text-slate-400"
                    )} />
                    
                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemove(cred.cpf, e)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 hover:bg-red-500/15 transition-all"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom accent */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </div>
  );
}
