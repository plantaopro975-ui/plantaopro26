import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Shield,
  Calendar,
  Clock,
  Users,
  RefreshCw,
  BarChart3,
  Target,
  Mail,
  Building2,
  Award,
  CheckCircle2,
  Download,
} from 'lucide-react';
import iseAcreBadge from '@/assets/ise-acre-badge.png';

const features = [
  { icon: Calendar, title: 'Plantões', description: 'Visualização e alertas automáticos.' },
  { icon: BarChart3, title: 'Escalas', description: 'Acompanhamento da equipe com clareza.' },
  { icon: Clock, title: 'Banco de Horas', description: 'Créditos, débitos e evolução mensal.' },
  { icon: RefreshCw, title: 'Permutas', description: 'Trocas documentadas e rastreáveis.' },
  { icon: Users, title: 'Equipes', description: 'Chat integrado e membros ativos.' },
  { icon: Target, title: 'Rotina', description: 'Planeje folgas e compromissos.' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header compacto */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur">
        <div className="container flex h-11 max-w-5xl items-center justify-between px-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 gap-1.5 px-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Button>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sobre · PlantãoPro
          </span>
        </div>
      </header>

      <main className="container max-w-5xl px-3 py-6 md:py-8 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-5 md:p-7">
          {/* SVG grid overlay */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="about-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-grid)" />
          </svg>

          <div className="relative flex flex-col items-center gap-3 text-center md:flex-row md:items-center md:gap-5 md:text-left">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/10 ring-1 ring-primary/30">
              <Shield className="h-8 w-8 text-primary drop-shadow" />
              <span className="absolute -inset-1 rounded-2xl border border-primary/20 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">
                Segurança Pública · Acre
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                PlantãoPro
              </h1>
              <p className="text-sm text-muted-foreground md:max-w-xl">
                Ferramenta operacional para agentes da segurança pública organizarem plantões,
                escalas e rotina com precisão.
              </p>
            </div>
          </div>
        </section>

        {/* Funcionalidades — bento compacto */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Funcionalidades
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              06 módulos
            </span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group border-border/50 bg-card/60 backdrop-blur transition-all hover:border-primary/40 hover:bg-card"
              >
                <CardContent className="flex items-start gap-3 p-3.5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-semibold leading-tight text-foreground">{f.title}</h3>
                    <p className="text-xs leading-snug text-muted-foreground">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Identidade + Origem lado a lado */}
        <section className="grid gap-4 lg:grid-cols-5">
          {/* Identidade Visual */}
          <Card className="border-border/50 bg-card/60 lg:col-span-2">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Identidade
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ISE · AC
                </span>
              </div>
              <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 ring-1 ring-border/40">
                <img src={iseAcreBadge} alt="Brasão ISE Acre" className="h-28 w-28 object-contain drop-shadow-2xl" />
              </div>
              <Button asChild variant="outline" size="sm" className="w-full gap-2 text-xs">
                <a href={iseAcreBadge} download="ise-acre-brasao.png">
                  <Download className="h-3.5 w-3.5" />
                  Baixar Brasão (PNG)
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Origem */}
          <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5 lg:col-span-3">
            <CardContent className="p-4 md:p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Origem do Projeto
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Idealizado por um <strong className="text-foreground">Agente Socioeducativo</strong> de{' '}
                <strong className="text-foreground">Feijó/AC</strong>, nasceu da necessidade real de
                trazer praticidade à rotina de quem atua na linha de frente.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/20">
                  <Award className="h-3 w-3" />
                  Feito por quem entende
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success ring-1 ring-success/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Problemas reais
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contato */}
        <section>
          <Card className="border-border/50 bg-card/60">
            <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Suporte / Sugestões</p>
                  <a
                    href="mailto:plantaopro@proton.me"
                    className="font-mono text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    plantaopro@proton.me
                  </a>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                <a href="mailto:plantaopro@proton.me">
                  <Mail className="h-3.5 w-3.5" />
                  Enviar mensagem
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 pt-4 text-center space-y-1">
          <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-2">
            <span className="font-mono uppercase tracking-[0.2em] text-muted-foreground/60">dev</span>
            <span className="font-black bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent tracking-wide">
              FRANC D'NIS
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground/70">Feijó / AC</span>
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()} PlantãoPro · QSL, Feijó!
          </p>
        </footer>
      </main>
    </div>
  );
}
