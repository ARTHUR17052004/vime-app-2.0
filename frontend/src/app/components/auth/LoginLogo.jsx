"use client";

/* eslint-disable @next/next/no-img-element */

export default function LoginLogo() {
  return (
    <div className="flex flex-col items-center">

      {/* LOGO */}

      <img
        src="/images/logo-vime.jpeg"
        alt="VIME"
        className="
          w-82
          h-20
          object-contain
          select-none
        "
        draggable={false}
      />

      {/* SUBTÍTULO */}

      <p
        className="
          mt-4

          text-[20px]

          font-medium

          text-emerald-400
        "
      >
        Gestão Inteligente
      </p>

      {/* LINHA */}

      <div
        className="
          mt-8

          w-24
          h-[2px]

          rounded-full

          bg-gradient-to-r
          from-transparent
          via-emerald-500
          to-transparent
        "
      />

    </div>
  );
}