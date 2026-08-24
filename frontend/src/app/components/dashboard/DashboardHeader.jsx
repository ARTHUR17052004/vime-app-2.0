"use client";

import { useRouter } from "next/navigation";
import { Tv } from "lucide-react";

import { useTheme } from "../../../context/ThemeContext";

export default function DashboardHeader({
  usuario = "Visitante",
  perfil,
  modulo = "Dashboard",
  sistema = "2.0",
  ultimaAtualizacao,
}) {
  const router = useRouter();
  const { mensagemBoasVindas } = useTheme();
  const hora = new Date().getHours();

  let saudacao = "Boa noite";

  if (hora < 12) {
    saudacao = "Bom dia";
  } else if (hora < 18) {
    saudacao = "Boa tarde";
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section
      className="
        pt-6
        mb-10
      "
    >
      <div className="flex items-end justify-between">

        {/* ESQUERDA */}

        <div className="pt-2">

          <h1
            className="
              text-4xl
              xl:text-[52px]
              font-extrabold
              tracking-tight
              text-[var(--text)]
              leading-none
            "
          >
            {saudacao}, {usuario}
            <span className="ml-3">👋</span>
          </h1>

          {perfil && (
            <span
              className="
                mt-2
                inline-block
                rounded-full
                bg-emerald-500/10
                border
                border-emerald-500/20
                px-3
                py-1
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-emerald-400
              "
            >
              {perfil}
            </span>
          )}

          <p
            className="
              mt-3
              text-base
              text-[var(--text-muted)]
              capitalize
              font-medium
            "
          >
            {hoje}
          </p>

          {ultimaAtualizacao && (
            <p className="mt-2 text-sm text-[var(--text-subtle)]">
              Atualizado em {ultimaAtualizacao}
            </p>
          )}

          {mensagemBoasVindas && (
            <p className="mt-2 text-sm text-emerald-300/90">
              {mensagemBoasVindas}
            </p>
          )}

        </div>

        {/* DIREITA */}

        <div className="text-right select-none pt-4">

          <button
            onClick={() => router.push("/tv")}
            title="Abrir Modo TV"
            className="
              mb-3
              inline-flex
              items-center
              gap-2

              rounded-full

              border
              border-emerald-500/30

              bg-emerald-500/10

              px-4
              py-2

              text-[12px]
              font-semibold
              uppercase
              tracking-[0.15em]

              text-emerald-400

              transition

              hover:bg-emerald-500/20
              hover:border-emerald-500/50
            "
          >
            <Tv size={15} />
            Modo TV
          </button>

          <p
            className="
              text-[11px]
              uppercase
              tracking-[0.45em]
              text-emerald-400
              font-semibold
            "
          >
            {modulo}
          </p>

          <h2
            className="
              mt-1
              text-5xl
              font-black
              text-emerald-500
              leading-none
            "
          >
            {sistema}
          </h2>

        </div>

      </div>
    </section>
  );
}