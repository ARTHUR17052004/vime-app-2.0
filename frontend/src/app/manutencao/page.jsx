"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";

import LoginBackground from "../components/auth/LoginBackground";
import { ConfiguracaoService } from "../../services/configuracao.service";

export default function ManutencaoPage() {

  const [mensagem, setMensagem] = useState(
    "O sistema está em manutenção no momento. Tente novamente em breve."
  );

  useEffect(() => {

    let ativo = true;

    async function verificar() {

      try {

        const resposta = await ConfiguracaoService.buscarPublica();
        const dados = resposta.data || resposta;

        if (!ativo) return;

        if (dados.manutencaoMensagem) {
          setMensagem(dados.manutencaoMensagem);
        }

        // Manutenção já foi desligada -- volta pro sistema.
        if (!dados.manutencaoAtiva) {
          window.location.href = "/";
        }

      } catch {
        // se nem der pra checar, mantém a mensagem padrão na tela
      }

    }

    verificar();

    const intervalo = setInterval(verificar, 15000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };

  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoginBackground />

      <section
        className="
          relative
          z-10

          flex
          flex-col
          items-center
          justify-center

          min-h-screen

          px-6
          py-12

          text-center
        "
      >

        <div
          className="
            w-20
            h-20

            rounded-3xl

            bg-emerald-500/10

            border
            border-emerald-500/20

            flex
            items-center
            justify-center

            mb-8
          "
        >
          <Wrench size={34} className="text-emerald-400" />
        </div>

        <h1
          className="
            text-3xl
            md:text-4xl

            font-black

            text-[var(--text)]

            mb-4
          "
        >
          Sistema em manutenção
        </h1>

        <p
          className="
            max-w-md

            text-[var(--text-subtle)]

            text-lg
          "
        >
          {mensagem}
        </p>

        <p className="mt-8 text-sm text-[var(--text-faint)]">
          Esta página atualiza sozinha assim que o sistema voltar.
        </p>

      </section>
    </main>
  );

}
