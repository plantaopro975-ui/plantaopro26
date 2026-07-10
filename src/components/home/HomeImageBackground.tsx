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

      {/* Overlays removidos a pedido — a imagem aparece pura, sem washes
             ou vinheta. Legibilidade dos cards vem do backdrop-blur próprio
             deles (definido em .home-typo em src/index.css). */}

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
