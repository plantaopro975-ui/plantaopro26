import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { X, MessageCircle, Bell, Image, Clock } from 'lucide-react';
import { useChatSettings, ChatBackgroundTheme, ShiftReminderHours } from '@/hooks/useChatSettings';
import { toast } from 'sonner';

// Import background thumbnails
import chatBgTactical from '@/assets/chat-background-tactical.png';
import chatBgMilitary from '@/assets/chat-bg-military.png';
import chatBgAlert from '@/assets/chat-bg-alert.png';
import chatBgCyber from '@/assets/chat-bg-cyber.png';

interface ChatAndAlertSettingsProps {
  agentId: string;
  onClose?: () => void;
}

const backgroundOptions: { value: ChatBackgroundTheme; label: string; color: string; preview: string | null }[] = [
  { value: 'tactical', label: 'Tático', color: 'from-cyan-500 to-blue-600', preview: chatBgTactical },
  { value: 'military', label: 'Militar', color: 'from-green-600 to-emerald-800', preview: chatBgMilitary },
  { value: 'alert', label: 'Alerta', color: 'from-red-600 to-rose-800', preview: chatBgAlert },
  { value: 'cyber', label: 'Cyber', color: 'from-purple-600 to-violet-800', preview: chatBgCyber },
  { value: 'none', label: 'Sem Imagem', color: 'from-slate-700 to-slate-800', preview: null },
];

const reminderOptions: { value: ShiftReminderHours; label: string; description: string }[] = [
  { value: 12, label: '12 horas', description: 'Lembrete meio dia antes' },
  { value: 24, label: '24 horas', description: 'Lembrete um dia antes' },
  { value: 48, label: '48 horas', description: 'Lembrete dois dias antes' },
];

export function ChatAndAlertSettings({ agentId, onClose }: ChatAndAlertSettingsProps) {
  const { 
    backgroundTheme, 
    shiftReminderHours, 
    setBackgroundTheme, 
    setShiftReminderHours,
    isLoaded 
  } = useChatSettings(agentId);

  const handleBackgroundChange = (value: ChatBackgroundTheme) => {
    setBackgroundTheme(value);
    toast.success('Tema do chat atualizado!');
  };

  const handleReminderChange = (value: string) => {
    setShiftReminderHours(Number(value) as ShiftReminderHours);
    toast.success('Configuração de lembrete salva!');
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 border-2 border-slate-600/50 shadow-xl shadow-black/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-cyan-500/40">
              <MessageCircle className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="bg-gradient-to-r from-cyan-200 to-blue-300 bg-clip-text text-transparent font-bold">
              Chat e Alertas
            </span>
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className="text-slate-400 text-sm">
          Personalize a aparência do chat e lembretes de plantão
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chat Background Theme */}
        <div className="space-y-3">
          <Label className="text-slate-200 flex items-center gap-2 text-sm font-medium">
            <Image className="h-4 w-4 text-cyan-400" />
            Tema do Background do Chat
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {backgroundOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleBackgroundChange(option.value)}
                className={`relative p-1 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                  backgroundTheme === option.value 
                    ? 'border-cyan-400 ring-2 ring-cyan-400/30 scale-105' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div 
                  className={`h-16 rounded-md bg-gradient-to-br ${option.color} relative overflow-hidden`}
                  style={option.preview ? {
                    backgroundImage: `url(${option.preview})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  } : {}}
                >
                  {/* Dark overlay for preview */}
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Selection indicator */}
                  {backgroundTheme === option.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <p className={`text-xs text-center mt-1.5 font-medium ${
                  backgroundTheme === option.value ? 'text-cyan-300' : 'text-slate-400'
                }`}>
                  {option.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Shift Reminder Time */}
        <div className="space-y-3 pt-2 border-t border-slate-700/50">
          <Label className="text-slate-200 flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4 text-amber-400" />
            Antecedência do Lembrete de Plantão
          </Label>
          <RadioGroup 
            value={String(shiftReminderHours)} 
            onValueChange={handleReminderChange}
            className="space-y-2"
          >
            {reminderOptions.map((option) => (
              <div 
                key={option.value}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                  shiftReminderHours === option.value 
                    ? 'bg-amber-500/10 border-amber-500/50' 
                    : 'bg-slate-800/30 border-slate-600/50 hover:border-slate-500'
                }`}
              >
                <RadioGroupItem 
                  value={String(option.value)} 
                  id={`reminder-${option.value}`}
                  className="border-amber-500 text-amber-500"
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={`reminder-${option.value}`}
                    className={`text-sm font-medium cursor-pointer ${
                      shiftReminderHours === option.value ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {option.label}
                    </div>
                  </Label>
                  <p className="text-[10px] text-slate-500 mt-0.5">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Info Text */}
        <p className="text-[10px] text-slate-500 text-center pt-2">
          As alterações são salvas automaticamente no seu dispositivo
        </p>
      </CardContent>
    </Card>
  );
}
