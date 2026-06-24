import React, { useState, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAgentProfile } from '@/hooks/useAgentProfile';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, LogOut, Menu, Settings, User, Volume2, VolumeX } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import { OperationalStatus } from './OperationalStatus';
import { cn } from '@/lib/utils';
import iseAcreBadge from '@/assets/ise-acre-badge.png';

export const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const { user, signOut, userRole, masterSession } = useAuth();
  const { agent } = useAgentProfile();
  const { playSound, isSoundEnabled, toggleSound } = useSoundEffects();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    playSound('tactical-click');
    navigate(path);
  };

  const handleSignOut = async () => {
    playSound('radio-static');
    await signOut();
    navigate('/auth');
  };

  const handleNotificationClick = () => {
    playSound('tactical-click');
  };

  const getInitials = () => {
    if (agent?.name) {
      const names = agent.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return agent.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (masterSession) {
      return `Admin: ${masterSession}`;
    }
    if (agent?.name) {
      return agent.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  const getRoleBadge = () => {
    if (masterSession) {
      return 'Master Admin';
    }
    switch (userRole) {
      case 'master':
        return 'Master';
      case 'admin':
        return 'Admin';
      default:
        // Show agent's actual role
        const agentRole = agent?.role;
        if (agentRole === 'team_leader') {
          return 'Chefe de Equipe';
        } else if (agentRole === 'support') {
          return 'Apoio';
        }
        return agent?.team ? `Equipe ${agent.team}` : 'Agente';
    }
  };

  return (
    <header
      ref={ref}
      {...props}
      className={cn(
        "header-bar relative h-16 flex items-center justify-between px-4 lg:px-6",
        "border-b border-primary/20 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.6)]",
        "bg-[linear-gradient(135deg,hsl(220_25%_8%/0.98),hsl(222_22%_12%/0.95)_50%,hsl(220_25%_8%/0.98))]",
        "backdrop-blur-xl",
        props.className,
      )}
    >
      {/* Institutional accent stripe (BR-inspired green→yellow→primary) */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,#15803d_0%,#facc15_50%,hsl(var(--primary))_100%)] opacity-80" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="tactical-btn">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-slate-900 border-r border-primary/30">
          <MobileSidebar onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Institutional identity */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-md" aria-hidden />
          <div className="relative h-11 w-11 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-slate-700/60 to-slate-900/80 ring-1 ring-primary/40 shadow-inner flex items-center justify-center p-1">
            <img
              src={iseAcreBadge}
              alt="Instituto Socioeducativo do Acre"
              className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>
        <div className="hidden md:flex flex-col leading-tight border-l border-primary/20 pl-3">
          <span className="text-[10px] font-black tracking-[0.22em] text-primary uppercase">
            ISE · Acre
          </span>
          <span className="text-[11px] font-semibold text-foreground/90 -mt-0.5">
            Sistema de Plantões
          </span>
          <span className="text-[9px] text-muted-foreground tracking-wide uppercase">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Operational Status - Center */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        <OperationalStatus />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Sound Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:bg-primary/10 hover:border-primary/30 transition-all"
          onClick={() => {
            toggleSound();
            playSound('tactical-click');
          }}
          title={isSoundEnabled ? 'Desativar sons' : 'Ativar sons'}
        >
          {isSoundEnabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>

        {/* Notifications - Tactical Style */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-8 w-8 hover:bg-primary/10 transition-all"
          onClick={handleNotificationClick}
        >
          <Bell className="h-4 w-4" />
          <span className="notification-badge absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </Button>

        {/* User Menu - Tactical Style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 pl-2 pr-3 h-9 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all"
              onClick={() => playSound('tactical-hover')}
            >
              <Avatar className="h-7 w-7 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold truncate max-w-[120px] text-foreground">{getDisplayName()}</p>
                <p className="text-[10px] text-primary/80 font-medium">{getRoleBadge()}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900/95 backdrop-blur-md border-primary/30 shadow-xl shadow-primary/10">
            <DropdownMenuLabel className="text-primary font-semibold">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem onClick={() => handleNavigate('/settings')} className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
              <User className="mr-2 h-4 w-4 text-primary" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigate('/settings')} className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-primary" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
