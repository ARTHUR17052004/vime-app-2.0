/* eslint-disable @next/next/no-img-element */
"use client";

// Selo fixo no canto da tela identificando quem desenvolveu o sistema.
// Escondido no mobile porque colide com a barra de navegação inferior
// (MobileBottomNav ocupa a largura toda em bottom-0).
//
// synt-logo-transparent.png é a logo original (synt-logo.png, fundo
// branco sólido) com o fundo removido -- senão aparecia um quadrado
// branco por cima do glass escuro do selo.
export default function BrandBadge() {
  return (
    <div
      className="
        hidden md:flex
        fixed
        bottom-4
        right-4
        z-30

        items-center
        gap-2

        rounded-full
        border
        border-[var(--border-token)]
        bg-[var(--surface)]
        backdrop-blur-xl

        px-3
        py-2

        shadow-[0_4px_20px_rgba(0,0,0,.18)]

        select-none
        pointer-events-none
      "
    >

      <img
        src="/images/synt-logo-transparent.png"
        alt="Synt.axenterprise"
        className="w-5 h-5 object-contain"
      />

      <span className="text-[11px] leading-none text-[var(--text-faint)]">
        Desenvolvido por{" "}
        <span className="text-[var(--text-muted)] font-medium">
          Synt.axenterprise
        </span>
      </span>

    </div>
  );
}
