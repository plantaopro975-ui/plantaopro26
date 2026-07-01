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
import logoPlantaoPro from '@/assets/logo-plantao-pro.png';
import aboutHero from '@/assets/about-hero.jpg';

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
    <div
      className="h-screen overflow-hidden relative bg-[#050810] flex flex-col"
      style={{
        fontFamily: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
      }}
    >
      {/* Fixed realistic background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${aboutHero})` }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#050810]/85 via-[#0a1428]/92 to-[#050810]/98"
        aria-hidden
      />

      {/* Header */}
      <header className="w-full border-b border-amber-500/20 bg-[#050810]/80 backdrop-blur-xl flex-shrink-0">
        <div className="container flex h-10 max-w-6xl items-center justify-between px-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-7 gap-1.5 px-2 text-xs text-slate-200 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Button>
          <span
            className="text-[10px] uppercase tracking-[0.28em] text-amber-400/80"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            Sobre · PlantãoPro
          </span>
        </div>
      </header>

      <main className="container relative max-w-6xl px-3 py-2 space-y-2 flex-1 overflow-hidden flex flex-col min-h-0">

        {/* HERO com capa realista */}
        <section className="relative overflow-hidden rounded-2xl border border-amber-500/25 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex-shrink-0">
          <div className="absolute inset-0">
            <img
              src={aboutHero}
              alt="Centro de comando operacional"
              className="h-full w-full object-cover"
              width={1920}
              height={1088}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050810]/90 via-[#0a1428]/75 to-[#0d1b3a]/85" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(217,168,63,0.18),transparent_60%)]" />
          </div>

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="about-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#d9a83f" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-grid)" />
          </svg>

          <div className="relative flex flex-row items-center gap-4 px-5 py-3 md:gap-6 md:px-8 md:py-4 text-left">
            <img
              src={logoPlantaoPro}
              alt="PlantãoPro"
              className="h-14 w-14 md:h-16 md:w-16 flex-shrink-0 object-contain drop-shadow-[0_0_20px_rgba(217,168,63,0.5)]"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p
                className="inline-block rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.3em] text-amber-200 ring-1 ring-amber-400/40"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                Segurança Pública · Acre
              </p>
              <h1
                className="text-2xl font-normal tracking-tight text-slate-50 md:text-3xl leading-none"
                style={{ fontFamily: '"Libre Baskerville", Georgia, serif' }}
              >
                Plantão<span className="text-amber-400">Pro</span>
              </h1>
              <p className="text-xs leading-snug text-slate-300 md:text-sm">
                Ferramenta operacional para agentes da segurança pública organizarem plantões,
                escalas e rotina com precisão tática.
              </p>
            </div>
          </div>
        </section>


        {/* Grid principal: features + origem lado a lado */}
        <div className="grid gap-2 flex-1 min-h-0 lg:grid-cols-3">
          {/* Funcionalidades: 6 mini-cards */}
          <section className="lg:col-span-2 flex flex-col min-h-0">
            <div className="mb-1.5 flex items-center justify-between">
              <h2
                className="text-sm font-normal tracking-wide text-slate-100"
                style={{ fontFamily: '"Libre Baskerville", Georgia, serif' }}
              >
                Funcionalidades
              </h2>
              <span
                className="text-[9px] uppercase tracking-[0.25em] text-amber-400/70"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                06 módulos
              </span>
            </div>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 flex-1 min-h-0">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group border-amber-500/15 bg-[#0a1428]/70 backdrop-blur-md transition-all hover:border-amber-400/50 hover:bg-[#0f1e3a]/80"
                >
                  <CardContent className="flex items-center gap-2 p-2.5 h-full">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-400/30">
                      <f.icon className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-xs font-semibold leading-tight text-slate-100"
                        style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                      >
                        {f.title}
                      </h3>
                      <p className="text-[10px] leading-snug text-slate-400 truncate">
                        {f.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Origem + Contato */}
          <section className="flex flex-col gap-2 min-h-0">
            <Card className="border-amber-500/15 bg-gradient-to-br from-[#0a1428]/80 via-[#0f1e3a]/70 to-[#0a1428]/80 backdrop-blur-md flex-1">
              <CardContent className="p-3 space-y-1.5 h-full flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-400/30">
                    <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <h2
                    className="text-sm font-normal tracking-wide text-slate-100"
                    style={{ fontFamily: '"Libre Baskerville", Georgia, serif' }}
                  >
                    Origem do Projeto
                  </h2>
                </div>
                <p className="text-xs leading-snug text-slate-300 flex-1">
                  Idealizado por um <strong className="text-amber-300">Agente Socioeducativo</strong> de{' '}
                  <strong className="text-amber-300">Feijó/AC</strong>, para trazer praticidade a
                  quem atua na linha de frente.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Award className="h-2.5 w-2.5" />
                    Por quem entende
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Real
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/15 bg-[#0a1428]/70 backdrop-blur-md">
              <CardContent className="flex items-center justify-between gap-2 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-400/30">
                    <Mail className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <a
                    href="mailto:plantaopro@proton.me"
                    className="text-[11px] font-medium text-slate-100 hover:text-amber-300 transition-colors truncate"
                    style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                  >
                    plantaopro@proton.me
                  </a>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="h-7 gap-1 bg-amber-500 text-[#050810] text-[10px] px-2 font-semibold hover:bg-amber-400"
                >
                  <a href="mailto:plantaopro@proton.me">Enviar</a>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-amber-500/15 pt-1.5 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-2">
            <span
              className="uppercase tracking-[0.25em] text-amber-400/60"
              style={{ fontFamily: '"IBM Plex Mono", monospace' }}
            >
              dev
            </span>
            <span
              className="font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-wide"
              style={{ fontFamily: '"Libre Baskerville", Georgia, serif' }}
            >
              FRANC D'NIS
            </span>
            <span className="text-amber-500/40">·</span>
            <span className="text-slate-400">Feijó / AC</span>
            <span className="text-amber-500/40">·</span>
            <span className="text-slate-500">© {new Date().getFullYear()} · QSL, Feijó!</span>
          </p>
        </footer>

      </main>
    </div>
  );
}
