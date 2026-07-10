import { memo } from "react";

// Servida diretamente de public/ para funcionar tanto em dev quanto em produção
// (a URL /__l5e/... do CDN só resolve no ambiente publicado).
const HERO_AVIF = "/plantaopro-hero.avif"; // ~39KB
const HERO_WEBP = "/plantaopro-hero.webp"; // ~62KB
const HERO_JPG  = "/plantaopro-hero.jpg";  // ~111KB (fallback)

/**
 * HomeImageBackground — substituiu a antiga SVG CommandRoomBackground.
 * Usa a arte oficial (agente + viatura + wordmark) como plano de fundo
 * fixo da home, com overlays cuidadosamente calibrados para preservar
 * a legibilidade dos cards operacionais em qualquer resolução.
 *
 * <picture> negocia o melhor formato: AVIF → WebP → JPG.
 * Preload em index.html usa imagesrcset para o browser também escolher.
 */
export const HomeImageBackground = memo(function HomeImageBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden
    >
      {/* 1 · Imagem oficial — carregamento prioritário para não travar o boot */}
      <picture>
        <source srcSet={HERO_AVIF} type="image/avif" />
        <source srcSet={HERO_WEBP} type="image/webp" />
        <img
          src={HERO_JPG}
          alt=""
          draggable={false}
          decoding="sync"
          loading="eager"
          // @ts-expect-error fetchpriority é atributo HTML válido
          fetchpriority="high"
          className="absolute inset-0 w-full h-full select-none"
          style={{
            objectFit: "cover",
            objectPosition: "center right",
          }}
        />
      </picture>

      {/* 2 · Wash escuro concentrado à esquerda — libera o lado direito
             (agente/viatura/wordmark) para o usuário ver mais da arte. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(3,5,10,0.92) 0%, rgba(3,5,10,0.82) 22%, rgba(3,5,10,0.55) 42%, rgba(3,5,10,0.20) 62%, rgba(3,5,10,0.06) 80%, rgba(3,5,10,0.00) 100%)",
        }}
      />

      {/* 3 · Wash topo (para não competir com o header) */}
      <div
        className="absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(3,5,10,0.85) 0%, transparent 100%)",
        }}
      />

      {/* 3b · Wash base (para o rodapé) */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(0deg, rgba(3,5,10,0.85) 0%, transparent 100%)",
        }}
      />

      {/* 4 · Grid HUD removido a pedido — deixava o fundo "quadriculado" */}

      {/* 5 · Vignette radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* 6 · Hairline âmbar topo */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,201,116,0.35), transparent)",
        }}
      />

      {/* 6b · Hairline âmbar base */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,201,116,0.25), transparent)",
        }}
      />
    </div>
  );
});
