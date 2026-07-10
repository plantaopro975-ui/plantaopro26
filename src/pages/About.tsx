import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
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
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import logoPlantaoPro from '@/assets/logo-plantao-pro.png';
import aboutHero from '@/assets/about-hero.jpg';
import { toast } from 'sonner';

async function downloadLogo(url: string, filename: string) {
  try {
    const res = await fetch(url, { credentials: 'omit', cache: 'force-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    toast.success('Download iniciado', { description: filename });
  } catch (err) {
    console.error('[downloadLogo] falhou:', err);
    toast.error('Não foi possível baixar a logo', {
      description: 'Tente novamente ou use o botão direito › Salvar imagem como…',
    });
  }
}

const features = [
  { icon: Calendar, title: 'Plantões', description: 'Visualização e alertas.' },
  { icon: BarChart3, title: 'Escalas', description: 'Acompanhamento da equipe.' },
  { icon: Clock, title: 'Banco de Horas', description: 'Créditos e débitos.' },
  { icon: RefreshCw, title: 'Permutas', description: 'Trocas rastreáveis.' },
  { icon: Users, title: 'Equipes', description: 'Chat e membros ativos.' },
  { icon: Target, title: 'Rotina', description: 'Folgas e compromissos.' },
];

const specs = [
  { label: 'Unidades', value: '09' },
  { label: 'Uso', value: 'Institucional' },
];

const pillars = [
  { icon: ShieldCheck, text: 'Seguro' },
  { icon: Zap, text: 'Rápido' },
  { icon: Lock, text: 'Privado' },
];

const SERIF = '"Libre Baskerville", Georgia, serif';
const MONO = '"IBM Plex Mono", monospace';
const SANS = '"IBM Plex Sans", "Inter", system-ui, sans-serif';

export default function About() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen sm:h-screen sm:overflow-hidden relative bg-[#050810] flex flex-col"
      style={{ fontFamily: SANS }}
    >
      {/* Fixed realistic background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${aboutHero})` }}
        aria-hidden
      />
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#050810]/90 via-[#0a1428]/94 to-[#050810]/98"
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
            style={{ fontFamily: MONO }}
          >
            Sobre · PlantãoPro
          </span>
        </div>
      </header>

      <main className="container relative max-w-6xl px-3 py-2 space-y-2 flex-1 sm:overflow-hidden flex flex-col min-h-0">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl border border-amber-500/25 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex-shrink-0">
          <div className="absolute inset-0">
            <img
              src={aboutHero}
              alt="Centro de comando operacional"
              className="h-full w-full object-cover"
              width={1920}
              height={1088}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#03060d]/95 via-[#050a18]/85 to-[#050a18]/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(217,168,63,0.18),transparent_55%)]" />
          </div>

          <div className="relative flex items-center gap-4 px-5 py-3 md:gap-6 md:px-8 md:py-4">
            <img
              src={logoPlantaoPro}
              alt="PlantãoPro"
              className="h-14 w-14 md:h-16 md:w-16 flex-shrink-0 object-contain drop-shadow-[0_0_20px_rgba(217,168,63,0.5)]"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <p
                className="inline-block rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.3em] text-amber-200 ring-1 ring-amber-400/40"
                style={{ fontFamily: MONO }}
              >
                Segurança Pública · Acre
              </p>
              <h1
                className="text-2xl font-normal tracking-tight text-slate-50 md:text-3xl leading-none"
                style={{ fontFamily: SERIF }}
              >
                Plantão<span className="text-amber-400">Pro</span>
              </h1>
              <p className="text-xs leading-snug text-slate-300 md:text-[13px] max-w-2xl">
                Ferramenta operacional para agentes da segurança pública organizarem plantões,
                escalas e rotina com precisão tática.
              </p>
            </div>

            {/* Pillars inline */}
            <div className="hidden md:flex flex-col gap-1.5 flex-shrink-0 pl-4 border-l border-amber-500/20">
              {pillars.map((p) => (
                <div key={p.text} className="flex items-center gap-1.5 text-[11px] text-slate-200">
                  <p.icon className="h-3 w-3 text-amber-400" />
                  <span style={{ fontFamily: MONO }} className="uppercase tracking-wider text-[10px]">
                    {p.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid gap-2 flex-1 min-h-0 lg:grid-cols-3">
          {/* Features */}
          <section className="lg:col-span-2 flex flex-col min-h-0">
            <div className="mb-1.5 flex items-center justify-between">
              <h2
                className="text-sm font-normal tracking-wide text-slate-100"
                style={{ fontFamily: SERIF }}
              >
                Funcionalidades
              </h2>
              <span
                className="text-[9px] uppercase tracking-[0.25em] text-amber-400/70"
                style={{ fontFamily: MONO }}
              >
                06 módulos
              </span>
            </div>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 auto-rows-fr flex-1 min-h-0">
              {features.map((f) => (
                <Card
                  key={f.title}
                  className="group border-amber-500/15 bg-[#0a1428]/70 backdrop-blur-md transition-all hover:border-amber-400/50 hover:bg-[#0f1e3a]/80"
                >
                  <CardContent className="flex items-center gap-2.5 p-2.5 h-full">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-400/30">
                      <f.icon className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-[13px] font-semibold leading-tight text-slate-100"
                        style={{ fontFamily: SANS }}
                      >
                        {f.title}
                      </h3>
                      <p className="text-[10.5px] leading-snug text-slate-400 truncate">
                        {f.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Sidebar — Origem + Specs + Contato */}
          <section className="flex flex-col gap-2 min-h-0">
            {/* Origem */}
            <Card className="border-amber-500/15 bg-gradient-to-br from-[#0a1428]/85 via-[#0f1e3a]/75 to-[#0a1428]/85 backdrop-blur-md">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-400/30">
                    <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <h2
                    className="text-sm font-normal tracking-wide text-slate-100"
                    style={{ fontFamily: SERIF }}
                  >
                    Origem do Projeto
                  </h2>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent ring-1 ring-amber-400/25 p-1 flex items-center justify-center">
                      <img
                        src={logoPlantaoPro}
                        alt="Logo PlantãoPro"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadLogo(logoPlantaoPro, 'logo-plantao-pro.png')}
                      className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
                    >
                      <Download className="h-2.5 w-2.5" />
                      Baixar
                    </button>
                  </div>
                  <p className="text-[11.5px] leading-snug text-slate-300 flex-1">
                    Idealizado por um <strong className="text-amber-300">Agente Socioeducativo</strong> de{' '}
                    <strong className="text-amber-300">Feijó/AC</strong>, para trazer praticidade a
                    quem atua na linha de frente.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Award className="h-2.5 w-2.5" />
                    Por quem entende
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                    Operacional
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Specs — fills remaining space */}
            <Card className="border-amber-500/15 bg-[#0a1428]/70 backdrop-blur-md flex-1 min-h-0">
              <CardContent className="p-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-[11px] uppercase tracking-[0.22em] text-amber-400/80"
                    style={{ fontFamily: MONO }}
                  >
                    Especificações
                  </h3>
                  <span
                    className="text-[9px] text-slate-500"
                    style={{ fontFamily: MONO }}
                  >
                    build.ac
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 flex-1 content-start">
                  {specs.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-md border border-amber-500/10 bg-[#050810]/60 px-2 py-1.5 min-w-0"
                    >
                      <div
                        className="text-[9px] uppercase tracking-wider text-slate-500 truncate"
                        style={{ fontFamily: MONO }}
                      >
                        {s.label}
                      </div>
                      <div
                        className="text-[12px] sm:text-[13px] font-semibold text-slate-100 leading-tight truncate"
                        style={{ fontFamily: SERIF }}
                        title={s.value}
                      >
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="border-amber-500/15 bg-[#0a1428]/70 backdrop-blur-md">
              <CardContent className="flex items-center justify-between gap-2 p-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-amber-400/30">
                    <Mail className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <a
                    href="mailto:plantaopro@proton.me"
                    className="text-[11px] font-medium text-slate-100 hover:text-amber-300 transition-colors truncate"
                    style={{ fontFamily: MONO }}
                  >
                    plantaopro@proton.me
                  </a>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="h-7 gap-1 bg-amber-500 text-[#050810] text-[10px] px-2.5 font-semibold hover:bg-amber-400"
                >
                  <a href="mailto:plantaopro@proton.me">Enviar</a>
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-amber-500/15 pt-2 text-center flex-shrink-0 space-y-1.5">
          <p className="text-[10.5px] leading-relaxed text-slate-400/90 max-w-3xl mx-auto px-3">
            <strong className="text-amber-400/90 font-semibold">PlantãoPro</strong> é uma plataforma corporativa e independente
            de gestão operacional voltada a profissionais do sistema socioeducativo. O aplicativo é mantido de forma autônoma
            e <em className="text-slate-300 not-italic">não possui vínculo, afiliação, endosso ou patrocínio de qualquer
            entidade governamental, órgão público ou instituição oficial</em>. Todo o conteúdo aqui gerenciado é de
            responsabilidade exclusiva dos próprios usuários e destinado apenas a fins organizacionais internos.
          </p>
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <span
              className="uppercase tracking-[0.25em] text-amber-400/60"
              style={{ fontFamily: MONO }}
            >
              dev
            </span>
            <span
              className="font-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-wide"
              style={{ fontFamily: SERIF }}
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
