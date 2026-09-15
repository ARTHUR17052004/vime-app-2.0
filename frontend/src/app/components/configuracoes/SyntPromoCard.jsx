/* eslint-disable @next/next/no-img-element */
"use client";

// "Propaganda" da desenvolvedora do sistema -- aparece só aqui em
// Configurações (não em todas as telas). synt-logo-transparent.png é
// a logo original (fundo branco sólido) com o fundo removido, senão
// aparecia um quadrado branco por cima do glass escuro do card.
export default function SyntPromoCard() {
  return (
    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-gradient-to-r
        from-[#0d1f4d]
        to-[#173f7c]
        p-6
        shadow-xl

        flex
        flex-col
        sm:flex-row
        items-center
        gap-5
        text-center
        sm:text-left
      "
    >

      <img
        src="/images/synt-logo-transparent.png"
        alt="Synt.axenterprise"
        className="w-16 h-16 object-contain shrink-0"
      />

      <div className="flex-1">

        <p className="text-lg font-bold text-white">
          App desenvolvido pela Synt.axenterprise
        </p>

        <p className="mt-1 text-sm italic text-blue-200">
          Você imagina, nós fazemos.
        </p>

        <p className="mt-2 text-sm text-blue-100/80">
          Soluções sob medida em tecnologia para o seu negócio.
        </p>

      </div>

    </div>
  );
}
