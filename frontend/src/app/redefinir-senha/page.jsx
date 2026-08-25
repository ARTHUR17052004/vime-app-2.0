"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";

import LoginBackground from "../components/auth/LoginBackground";
import LoginLogo from "../components/auth/LoginLogo";
import LoginInput from "../components/auth/LoginInput";
import Button from "../components/ui/Button";

import { AuthService } from "../../services/auth.service";

function RedefinirSenhaForm() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function redefinir(e) {

    e.preventDefault();

    setErro("");

    if (!token) {
      setErro("Link inválido: token não encontrado.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {

      await AuthService.redefinirSenha(token, novaSenha);

      setSucesso(true);

      setTimeout(() => router.push("/login"), 2500);

    } catch (err) {

      setErro(err.message || "Não foi possível redefinir a senha.");

    } finally {

      setLoading(false);

    }

  }

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
      <LoginLogo />

      <div className="mt-12 text-center">

        <h2 className="text-4xl font-black text-white">
          Nova senha
        </h2>

        <p className="mt-3 text-[17px] leading-relaxed text-gray-300">
          Digite e confirme sua nova senha de acesso.
        </p>

      </div>

      {sucesso ? (

        <div className="mt-10">

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
            Senha redefinida com sucesso! Redirecionando para o login...
          </div>

        </div>

      ) : (

        <form onSubmit={redefinir} className="mt-10 space-y-6">

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
            label="Nova senha"
            type="password"
            icon={<Lock size={20} />}
            placeholder="Digite sua nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />

          <LoginInput
            label="Confirmar senha"
            type="password"
            icon={<Lock size={20} />}
            placeholder="Digite a senha novamente"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />

          <Button
            login
            type="submit"
            loading={loading}
            className="w-full h-14 rounded-2xl text-lg font-semibold"
          >
            Redefinir senha
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
  );

}

export default function RedefinirSenhaPage() {
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
          <Suspense fallback={null}>
            <RedefinirSenhaForm />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
