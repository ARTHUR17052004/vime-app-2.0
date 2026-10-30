"use client";

import { useRouter } from "next/navigation";
import { MessageCircleQuestion, ArrowLeft } from "lucide-react";

import LoginBackground from "../components/auth/LoginBackground";
import LoginLogo from "../components/auth/LoginLogo";
import Button from "../components/ui/Button";

export default function EsqueciSenhaPage() {

  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoginBackground />

      <div className="relative z-10 h-screen overflow-y-auto">
      <section
        className="
          flex
          items-center
          justify-center

          min-h-full

          px-6
          py-12
        "
      >
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
          <LoginLogo />

          <div className="mt-12 text-center">

            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MessageCircleQuestion className="text-emerald-400" size={26} />
            </div>

            <h2 className="text-4xl font-black text-white">
              Esqueceu a senha?
            </h2>

            <p className="mt-3 text-[17px] leading-relaxed text-gray-300">
              A redefinição automática por e-mail não está disponível no momento. Entre em contato com o administrador do sistema ou com o desenvolvedor da plataforma pra redefinir sua senha.
            </p>

            <p className="mt-4 text-sm text-gray-400">
              arthursintaxe@gmail.com ou +55 62984661680
            </p>

          </div>

          <div className="mt-10">

            <Button
              fullWidth
              variant="secondary"
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </Button>

          </div>

        </div>
      </section>
      </div>
    </main>
  );
}
