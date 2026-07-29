"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";

import Button from "../ui/Button";

export default function VistoriaCard({
  vistorias,
  onEdit,
  onDelete,
  onConcluir,
  onCancelar,
}) {

  const [aberto, setAberto] =
    useState(null);

  const [menuAberto, setMenuAberto] =
    useState(null);

  if (!vistorias.length) {

    return (

      <div
        className="
          rounded-[22px]
          border
          border-white/10
          bg-white/[0.04]
          p-10
          text-center
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          Nenhuma vistoria cadastrada
        </h2>

      </div>

    );

  }

  const badgeStatus = (status) => {

    switch (status) {

      case "REALIZADA":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";

      case "PENDENTE":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";

      case "CANCELADA":
        return "bg-red-500/20 text-red-400 border border-red-500/30";

      case "ATRASADA":
        return "bg-red-500/20 text-red-400 border border-red-500/30";

      default:
        return "bg-sky-500/20 text-sky-400 border border-sky-500/30";

    }

  };

  return (

    <div className="space-y-6">

      {vistorias.map((vistoria) => (

        <div
          key={vistoria.id}
          className="
            rounded-[22px]
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            overflow-hidden
            transition-all
            duration-300
            hover:border-emerald-500/30
            hover:shadow-[0_0_40px_rgba(16,185,129,.08)]
          "
        >

          <div
            className="
              p-7
              flex
              items-start
              justify-between
              gap-6
            "
          >

            <div className="flex-1">

              <div className="flex items-center gap-4 flex-wrap">

                <span
                  className={`
                    px-4
                    py-1.5
                    rounded-full
                    text-xs
                    font-semibold
                    ${badgeStatus(vistoria.status)}
                  `}
                >
                  {vistoria.status}
                </span>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-white
                  "
                >
                  {vistoria.nomeVistoria}
                </h2>

              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Unidade / Kitnet
                  </p>

                  <p className="text-gray-300 mt-1">

                    {vistoria.unidadeNome}

                    {" • "}

                    {vistoria.kitnetNome}

                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Responsável
                  </p>

                  <p className="text-gray-300 mt-1">
                    {vistoria.responsavel}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Periodicidade
                  </p>

                  <p className="text-gray-300 mt-1">
                    {vistoria.periodicidade}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Próxima Execução
                  </p>

                  <p className="text-gray-300 mt-1">
                    {vistoria.dataProxima}
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  setMenuAberto(
                    menuAberto === vistoria.id
                      ? null
                      : vistoria.id
                  )
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-white/5
                  transition
                  flex
                  items-center
                  justify-center
                "
              >

                <MoreVertical
                  size={20}
                  className="text-gray-400"
                />

              </button>

              <button
                onClick={() =>
                  setAberto(
                    aberto === vistoria.id
                      ? null
                      : vistoria.id
                  )
                }
                className="
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-white/5
                  transition
                  flex
                  items-center
                  justify-center
                "
              >

                {aberto === vistoria.id ? (

                  <ChevronUp
                    size={20}
                    className="text-gray-400"
                  />

                ) : (

                  <ChevronDown
                    size={20}
                    className="text-gray-400"
                  />

                )}

              </button>

            </div>

          </div>
                    {menuAberto === vistoria.id && (

            <div
              className="
                border-t
                border-white/10
                bg-white/[0.03]
              "
            >

              <Link
                href={`/vistorias/${vistoria.id}`}
                className="
                  block
                  px-6
                  py-4
                  text-gray-300
                  hover:bg-white/5
                  transition
                "
              >
                Visualizar
              </Link>

              <button
                onClick={() => onEdit?.(vistoria)}
                className="
                  w-full
                  text-left
                  px-6
                  py-4
                  text-yellow-400
                  hover:bg-white/5
                  transition
                "
              >
                Editar
              </button>

              <button
                onClick={() => onConcluir?.(vistoria.id)}
                className="
                  w-full
                  text-left
                  px-6
                  py-4
                  text-emerald-400
                  hover:bg-white/5
                  transition
                "
              >
                Realizar
              </button>

              <button
                onClick={() => onCancelar?.(vistoria.id)}
                className="
                  w-full
                  text-left
                  px-6
                  py-4
                  text-orange-400
                  hover:bg-white/5
                  transition
                "
              >
                Cancelar
              </button>

              <button
                onClick={() => onDelete?.(vistoria.id)}
                className="
                  w-full
                  text-left
                  px-6
                  py-4
                  text-red-400
                  hover:bg-white/5
                  transition
                "
              >
                Excluir
              </button>

            </div>

          )}

          {aberto === vistoria.id && (

            <div
              className="
                border-t
                border-white/10
                bg-white/[0.02]
                p-7
              "
            >

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Categoria
                  </p>

                  <p className="text-white mt-1">
                    {vistoria.categoria}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Criticidade
                  </p>

                  <p className="text-white mt-1">
                    {vistoria.criticidade}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Última Execução
                  </p>

                  <p className="text-white mt-1">
                    {vistoria.dataUltima}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500 uppercase">
                    Próxima Execução
                  </p>

                  <p className="text-white mt-1">
                    {vistoria.dataProxima}
                  </p>

                </div>

              </div>

              <div className="mt-8">

                <p className="text-xs text-gray-500 uppercase">
                  Observações
                </p>

                <div
                  className="
                    mt-3
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-5
                    text-gray-300
                    leading-7
                  "
                >
                  {vistoria.observacoes ||
                    "Nenhuma observação cadastrada."}
                </div>

              </div>

              <div className="flex justify-end mt-8">

                <Button
                  onClick={() =>
                    setAberto(null)
                  }
                  variant="secondary"
                >
                  Fechar
                </Button>

              </div>

            </div>

          )}

        </div>

      ))}

    </div>

  );

}