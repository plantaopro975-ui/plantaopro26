import React, { useState, forwardRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Shield } from 'lucide-react';

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
import { RadarSweep } from '@/components/home/RadarSweep';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

import { cn } from '@/lib/utils';
import iseAcreBadge from '@/assets/ise-acre-badge.png';
import logoEmblem from '@/assets/logo-plantao-pro.png';

export const Header = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const { user, signOut, userRole, masterSession } = useAuth();
  const { agent } = useAgentProfile();
  const { playSound, isSoundEnabled, toggleSound } = useSoundEffects();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const onlineCount = useOnlinePresence();

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
        "border-b border-border/60 shadow-[0_8px_28px_-12px_hsl(222_60%_2%/0.85)]",
        "bg-[linear-gradient(180deg,hsl(222_38%_7%/0.96),hsl(220_32%_9%/0.92))]",
        "backdrop-blur-xl",
        props.className,
      )}
    >
      {/* Steel cyan accent strip */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary))_30%,hsl(var(--primary))_70%,transparent_100%)] opacity-80" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Logo — leftmost, maximized within bar height */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative shrink-0 [perspective:600px]">
          <span className="absolute inset-0 rounded-full bg-primary/25 blur-lg animate-pulse" aria-hidden />
          <img
            src={logoEmblem}
            alt="Plantão Pro"
            width={56}
            height={56}
            className="relative h-14 w-14 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] animate-logo-sway origin-center will-change-transform"
          />
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="tactical-btn">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-card border-r border-border/60">
            <MobileSidebar onNavigate={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center gap-3 pl-3 ml-1 border-l border-border/50">
          <RadarSweep size={32} />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-bold tracking-[0.28em] text-success uppercase font-mono">
              Radar Ativo
            </span>
            <span className="text-[11px] font-semibold text-foreground/90 font-mono tabular-nums">
              <span className="text-primary">{onlineCount}</span>
              <span className="text-muted-foreground"> online · </span>
              <span className="tracking-[0.2em] uppercase text-[9px]">Rede 24/7</span>
            </span>
          </div>
        </div>
      </div>




      {/* Primary Navigation */}
      <nav className="hidden lg:flex items-center gap-1 ml-6" aria-label="Navegação principal">
        {[
          { to: '/', label: 'Home', icon: Home, end: true },
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/master', label: 'Master', icon: Shield },
        ].map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => playSound('tactical-click')}
            className={({ isActive }) =>
              cn(
                'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold tracking-wide transition-all',
                'text-muted-foreground hover:text-foreground hover:bg-primary/10',
                isActive &&
                  'text-primary bg-primary/10 ring-1 ring-primary/30 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-3.5 w-3.5" />
                {label}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-2 right-2 h-[2px] rounded-full bg-primary" aria-hidden />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Tagline institucional — QSL Feijó */}
      <div
        className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 pointer-events-none select-none"
        aria-label="QSL Feijó — feito por agente para agente"
      >
        <span className="h-px w-6 bg-gradient-to-r from-transparent to-primary/60" aria-hidden />
        <p className="text-[11px] font-mono tracking-[0.22em] uppercase text-foreground/90">
          <span className="text-primary font-bold">QSL</span>
          <span className="text-muted-foreground">, </span>
          <span className="text-foreground">Feijó!</span>
          <span className="mx-2 text-muted-foreground/60">·</span>
          <span className="text-muted-foreground normal-case tracking-normal font-sans italic">
            Feito por agente para agente
          </span>
          <span className="mx-2 text-primary/50">·</span>
          <span className="text-primary/90 font-semibold normal-case tracking-normal">
            &lt;dev/&gt; Franc.D'nis
          </span>
        </p>
        <span className="h-px w-6 bg-gradient-to-l from-transparent to-primary/60" aria-hidden />
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
