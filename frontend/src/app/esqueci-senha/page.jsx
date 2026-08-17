"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";

import LoginBackground from "../components/auth/LoginBackground";
import LoginLogo from "../components/auth/LoginLogo";
import LoginInput from "../components/auth/LoginInput";
import Button from "../components/ui/Button";

import { AuthService } from "../../services/auth.service";

export default function EsqueciSenhaPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e) {

    e.preventDefault();

    setErro("");
    setLoading(true);

    try {

      await AuthService.esqueciSenha(email);

      setEnviado(true);

    } catch (err) {

      setErro(err.message || "Não foi possível enviar o e-mail.");

    } finally {

      setLoading(false);

    }

  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoginBackground />

      <section
        className="
          relative
          z-10

          flex
          items-center
          justify-center

          min-h-screen

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

            <h2 className="text-4xl font-black text-white">
              Esqueceu a senha?
            </h2>

            <p className="mt-3 text-[17px] leading-relaxed text-gray-300">
              Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </p>

          </div>

          {enviado ? (

            <div className="mt-10 space-y-6">

              <div
                className="
                  rounded-2xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  px-4
                  py-3
                  text-sm
                  text-emerald-300
                "
              >
                E-mail enviado! Confira sua caixa de entrada (e o spam) para o link de redefinição.
              </div>

              <Button
                fullWidth
                variant="secondary"
                onClick={() => router.push("/login")}
              >
                Voltar ao login
              </Button>

            </div>

          ) : (

            <form onSubmit={enviar} className="mt-10 space-y-6">

              {erro && (
                <div
                  className="
                    rounded-2xl
                    border
                    border-red-500/20
                    bg-red-500/10
                    px-4
                    py-3
                    text-sm
                    text-red-300
                  "
                >
                  {erro}
                </div>
              )}

              <LoginInput
                label="E-mail"
                type="email"
                icon={<Mail size={20} />}
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                login
                type="submit"
                loading={loading}
                className="w-full h-14 rounded-2xl text-lg font-semibold"
              >
                Enviar link de redefinição
              </Button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2

                  text-sm
                  text-gray-400

                  hover:text-white

                  transition
                "
              >
                <ArrowLeft size={16} />
                Voltar ao login
              </button>

            </form>

          )}

        </div>
      </section>
    </main>
  );
}
