"use client";

import LoginLogo from "./LoginLogo";
import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div
      className="
        w-full
        max-w-[470px]

        rounded-[34px]

        border
        border-white/10

        bg-gradient-to-br
        from-[#0c2216]/92
        via-[#0a1b13]/94
        to-[#08130e]/96

        backdrop-blur-2xl

        shadow-[0_30px_90px_rgba(0,0,0,.45)]

        px-10
        py-12
      "
    >
      {/* LOGO */}

      <LoginLogo />

      {/* TÍTULO */}

      <div className="mt-12 text-center">

        <h2
          className="
            text-4xl
            font-black
            text-white
          "
        >
          Bem-vindo(a)!
        </h2>

        <p
          className="
            mt-3

            text-[17px]

            leading-relaxed

            text-gray-300
          "
        >
          Entre na sua conta para acessar o sistema
        </p>

      </div>

      {/* FORM */}

      <div className="mt-10">

        <LoginForm />

      </div>

      {/* FOOTER */}

      <div
        className="
          mt-12

          border-t
          border-white/10

          pt-6

          text-center

          text-sm

          text-gray-400
        "
      >
        © 2026 VIME 2.0 • Todos os direitos reservados
      </div>

    </div>
  );
}