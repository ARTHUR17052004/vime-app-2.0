"use client";

/* eslint-disable @next/next/no-img-element */

export default function LoginBackground() {
  return (
    <>
      {/* Imagem de fundo */}
      <img
        src="/images/background.jpg"
        alt="Background"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          select-none
        "
        draggable={false}
      />

      {/* Overlay escuro */}
      <div
        className="
          absolute
          inset-0
          bg-linear-to-br
          from-[#08120d]/80
          via-[#09110d]/70
          to-[#050607]/90
        "
      />

      {/* Blur */}
      <div
        className="
          absolute
          inset-0
          backdrop-blur-xs
        "
      />

      {/* Vinheta */}
      <div
        className="
          absolute
          inset-0
          bg-radial
          from-transparent
          via-transparent
          to-black/50
        "
      />
    </>
  );
}