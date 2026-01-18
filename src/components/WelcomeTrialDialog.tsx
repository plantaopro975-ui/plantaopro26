import { useEffect, useState } from 'react';
import { Shield, Gift, CheckCircle, Sparkles, Users, Calendar, MessageCircle, Bell, Smartphone, ArrowRightLeft, CalendarDays, Clock, Beaker, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeTrialDialogProps {
  agentName: string;
  onClose: () => void;
  trialDays?: number;
}

// Check if dialog should be shown today (only once per day)
export function shouldShowWelcomeToday(): boolean {
  const lastShown = localStorage.getItem('plantaopro_welcome_last_shown');
  if (!lastShown) return true;
  
  const lastDate = new Date(parseInt(lastShown));
  const today = new Date();
  
  // Compare dates (ignore time)
  return lastDate.toDateString() !== today.toDateString();
}

// Mark dialog as shown today
export function markWelcomeShownToday(): void {
  localStorage.setItem('plantaopro_welcome_last_shown', Date.now().toString());
}

// Get remaining trial days
export function getRemainingTrialDays(): number {
  const firstAccessData = localStorage.getItem('plantaopro_first_access');
  if (!firstAccessData) return 30;
  
  try {
    const data = JSON.parse(firstAccessData);
    const registrationDate = new Date(data.timestamp);
    const today = new Date();
    const diffTime = today.getTime() - registrationDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
  } catch {
    return 30;
  }
}

export function WelcomeTrialDialog({ agentName, onClose, trialDays }: WelcomeTrialDialogProps) {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const AUTO_CLOSE_SECONDS = 25;
  const remainingDays = trialDays ?? getRemainingTrialDays();

  const features = [
    { icon: Calendar, label: 'Escala Automática', desc: 'Plantões 24x72 gerados automaticamente' },
    { icon: Clock, label: 'Banco de Horas', desc: 'Controle por quinzena com limites' },
    { icon: Users, label: 'Equipe', desc: 'Visualize sua equipe em tempo real' },
    { icon: MessageCircle, label: 'Chat', desc: 'Comunicação integrada por equipe' },
    { icon: ArrowRightLeft, label: 'Permutas', desc: 'Solicite trocas formalizadas' },
    { icon: CalendarDays, label: 'Agenda', desc: 'Organize seus compromissos' },
    { icon: Bell, label: 'Alertas', desc: 'Notificações de plantões' },
    { icon: Smartphone, label: 'Mobile', desc: 'Instale como app no celular' },
  ];

  useEffect(() => {
    markWelcomeShownToday();
    const fadeInTimer = setTimeout(() => setIsVisible(true), 50);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (AUTO_CLOSE_SECONDS * 10));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2500);

    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, AUTO_CLOSE_SECONDS * 1000);

    return () => {
      clearTimeout(fadeInTimer);
      clearInterval(interval);
      clearInterval(featureInterval);
      clearTimeout(closeTimer);
    };
  }, [onClose, features.length]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const CurrentFeatureIcon = features[currentFeature].icon;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-3 transition-all duration-300 overflow-hidden",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop with modern blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/98 to-black/95 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-sm transform transition-all duration-500 max-h-[95dvh] flex flex-col",
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        {/* Animated glow */}
        <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-purple-500/30 rounded-3xl blur-2xl opacity-70 animate-pulse hidden sm:block" />
        
        <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 rounded-2xl border border-cyan-500/40 overflow-hidden shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[95dvh]">
          {/* Top gradient stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shrink-0" />
          
          {/* Progress bar */}
          <div className="relative h-0.5 bg-slate-700/50 shrink-0">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center border-2 border-slate-800">
                  <Sparkles className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 leading-tight">
                  Bem-vindo, {agentName.split(' ')[0]}!
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cadastro realizado com sucesso
                </p>
              </div>
            </div>

            {/* Beta Notice - Compact */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <Beaker className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-[10px] text-amber-300/90 leading-tight">
                <span className="font-bold">Versão Beta:</span> O sistema está em fase de testes. Melhorias e correções serão implementadas continuamente.
              </p>
            </div>

            {/* Trial + Price Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Trial Info */}
              <div className="bg-gradient-to-br from-emerald-500/15 to-green-500/5 rounded-xl p-2.5 border border-emerald-500/40">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-emerald-400 text-xs">
                    {remainingDays} dias GRÁTIS
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] leading-snug">
                  Acesso completo sem custo
                </p>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/30 rounded-xl p-2.5 border border-slate-600/50">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="text-[10px] text-slate-400">Colaboração</span>
                </div>
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 leading-none">
                  R$14,99<span className="text-[10px] text-slate-500 font-normal">/mês</span>
                </p>
              </div>
            </div>

            {/* Collaboration Message */}
            <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
              <div className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-pink-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-semibold text-cyan-300">Sua colaboração de R$14,99/mês</span> ajuda a manter o sistema funcionando, custear hospedagem e desenvolvimento de novas funcionalidades para todos os agentes.
                </p>
              </div>
            </div>

            {/* Feature Showcase */}
            <div className="bg-slate-800/30 rounded-xl p-2.5 border border-slate-700/30">
              <div className="flex items-center gap-3">
                <div 
                  key={currentFeature}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center border border-cyan-500/30 shrink-0"
                >
                  <CurrentFeatureIcon className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-xs truncate">{features[currentFeature].label}</p>
                  <p className="text-slate-400 text-[10px] truncate">{features[currentFeature].desc}</p>
                </div>
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-1 mt-2">
                {features.map((_, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      idx === currentFeature 
                        ? "w-3 bg-cyan-500" 
                        : "w-1 bg-slate-600"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 text-sm tracking-wide active:scale-[0.98] shrink-0"
            >
              🚀 Começar a Usar
            </button>

            {/* Footer */}
            <p className="text-center text-[9px] text-slate-500 shrink-0">
              Toque para fechar • Auto-fecha em {Math.ceil(progress / 100 * AUTO_CLOSE_SECONDS)}s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}