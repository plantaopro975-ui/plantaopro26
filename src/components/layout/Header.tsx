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
import { Bell, LogOut, Menu, Settings, User, Volume2, VolumeX, MoreVertical } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebar } from './MobileSidebar';
import { RadarSweep } from '@/components/home/RadarSweep';
import { useOnlinePresence } from '@/hooks/useOnlinePresence';

import { cn } from '@/lib/utils';
import iseAcreBadge from '@/assets/ise-acre-badge.png';

import headerBg from '@/assets/header-bg.jpg';

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

  const [bgLoaded, setBgLoaded] = useState(false);

  return (
    <header
      ref={ref}
      {...props}
      className={cn(
        "header-bar relative min-h-11 sm:min-h-10 flex items-center gap-2 sm:gap-3 px-2 pb-4 pt-1 sm:px-3 sm:py-0 lg:px-4 overflow-hidden isolate",
        "border-b border-primary/25 shadow-[0_6px_18px_-12px_hsl(217_62%_2%/0.9)]",
        // Fallback sólido + placeholder gradient em caso de falha da imagem
        "bg-slate-950 bg-[radial-gradient(ellipse_at_top,hsl(217_60%_10%)_0%,hsl(217_62%_5%)_60%,hsl(217_62%_3%)_100%)]",
        props.className,
      )}
      style={{ textShadow: '0 1px 2px hsl(217 62% 2% / 0.85)' }}
    >
      {/* Background image layer — <img> real para carregamento confiável */}
      <img
        src={headerBg}
        alt=""
        aria-hidden
        draggable={false}
        loading="eager"
        decoding="async"
        // @ts-expect-error — atributo válido no HTML, tipagem React ainda parcial
        fetchpriority="high"
        onLoad={() => setBgLoaded(true)}
        onError={() => setBgLoaded(false)}
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover select-none transition-opacity duration-500",
          // Object-position responsivo: mantém o assunto central em qualquer largura
          "object-[center_40%] sm:object-[center_38%] lg:object-[center_32%]",
          bgLoaded ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Overlay adaptativo: gradiente escuro + vignette lateral para garantir contraste em qualquer luminosidade da foto */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(217_62%_3%/0.55)_0%,hsl(217_62%_3%/0.35)_45%,hsl(217_62%_3%/0.70)_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,hsl(217_62%_2%/0.55)_100%)]"
      />

      {/* Institutional amber accent strip */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary))_30%,hsl(var(--primary))_70%,transparent_100%)] opacity-90" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />





      {/* Brand — leftmost */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative shrink-0">
          <span className="absolute inset-0 rounded-md bg-primary/25 blur-md animate-pulse" aria-hidden />
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/40 flex items-center justify-center shadow-glow">
            <Shield className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" strokeWidth={2.2} />
          </div>
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

        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 ml-0.5 border-l border-border/50">
          <RadarSweep size={20} />
          <div className="flex flex-col leading-tight">
            <span className="text-[9px] sm:text-[9.5px] font-bold tracking-[0.22em] text-primary uppercase font-mono drop-shadow-[0_1px_2px_hsl(217_62%_2%/0.9)]">
              Radar Ativo
            </span>
            <span className="text-[10px] sm:text-[10.5px] font-semibold text-foreground/90 font-mono tabular-nums">
              <span className="text-primary">{onlineCount}</span>
              <span className="text-muted-foreground"> online · </span>
              <span className="tracking-[0.18em] uppercase text-[8.5px]">24/7</span>
            </span>
          </div>
        </div>
      </div>





      {/* Tagline institucional — QSL Feijó (clique → /about) */}
      <div className="flex-1 min-w-0" aria-hidden />

      {/* Right Side */}

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Sound Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 shrink-0 hover:bg-primary/10 hover:border-primary/30 transition-all"
          onClick={() => {
            toggleSound();
            playSound('tactical-click');
          }}
          title={isSoundEnabled ? 'Desativar sons' : 'Ativar sons'}
        >
          {isSoundEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-primary" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>

        {/* Notifications - Tactical Style */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-7 w-7 shrink-0 hover:bg-primary/10 transition-all overflow-visible"
          onClick={handleNotificationClick}
        >
          <Bell className="h-3.5 w-3.5" />
          <span className="notification-badge absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] ring-2 ring-background" />
        </Button>

        {/* User Menu - Tactical Style */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-1.5 pl-1.5 pr-2 h-7 hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all"
              onClick={() => playSound('tactical-hover')}
            >
              <Avatar className="h-5 w-5 ring-1 ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[9px] font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-[11px] font-semibold truncate max-w-[80px] md:max-w-[110px] text-foreground">{getDisplayName()}</p>
                <p className="text-[9px] text-primary/80 font-medium">{getRoleBadge()}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-slate-900/95 backdrop-blur-md border-primary/30 shadow-xl shadow-primary/10">
            {user ? (
              <>
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
              </>
            ) : (
              <div className="p-4 flex flex-col items-center text-center gap-3">
                <svg
                  viewBox="0 0 64 64"
                  className="h-14 w-14 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M32 4 L54 14 V32 C54 46 44 56 32 60 C20 56 10 46 10 32 V14 Z" fill="hsl(var(--primary) / 0.08)" />
                  <rect x="22" y="30" width="20" height="16" rx="2" />
                  <path d="M26 30 V24 a6 6 0 0 1 12 0 V30" />
                  <circle cx="32" cy="38" r="1.8" fill="currentColor" />
                </svg>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary tracking-wide uppercase">Área Restrita</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Autenticação necessária. Faça login para acessar seu perfil e configurações.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => handleNavigate('/auth')}
                >
                  Entrar no sistema
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tagline institucional — faixa inferior centralizada, sem sobreposição */}
      <button
        type="button"
        onClick={() => handleNavigate('/about')}
        className={cn(
          "group absolute left-0 right-0 bottom-0 z-10 mx-auto flex w-full max-w-[95%] items-center justify-center gap-1 px-2 py-0.5",
          "select-none hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors cursor-pointer",
        )}
        aria-label="Sobre o app — QSL, Feijó! Feito por agente para Agente; Franc.D'nis"
        title="Sobre o app"
      >
        <span className="hidden md:block h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/50" aria-hidden />
        <p className="text-center leading-tight text-[9px] sm:text-[9.5px] md:text-[10px] font-mono font-semibold tracking-[0.08em] uppercase text-foreground/90 group-hover:text-foreground whitespace-normal sm:whitespace-nowrap">
          <span className="text-primary font-bold">QSL</span>
          <span className="text-muted-foreground">, </span>
          <span className="text-foreground">Feijó!</span>
          <span className="mx-1 text-muted-foreground/60">·</span>
          <span className="text-muted-foreground normal-case tracking-normal font-sans italic">
            Feito por agente para Agente
          </span>
          <span className="mx-1 text-primary/50">·</span>
          <span className="text-primary/90 font-semibold normal-case tracking-normal">
            Franc.D'nis
          </span>
        </p>
        <span className="hidden md:block h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-primary/50" aria-hidden />
      </button>
    </header>
  );
});

Header.displayName = 'Header';
