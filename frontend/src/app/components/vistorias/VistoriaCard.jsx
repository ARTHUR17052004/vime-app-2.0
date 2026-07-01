"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";

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

      <div className="bg-white rounded-3xl shadow p-10">

        <h2 className="text-2xl font-bold text-gray-900">
          Nenhuma vistoria cadastrada
        </h2>

      </div>

    );

  }

 return (

  <div className="space-y-4">

    {vistorias.map(
      (vistoria) => (

        <div
          key={vistoria.id}
          className="
            bg-white
            rounded-3xl
            shadow
            border
            overflow-hidden
          "
        >

          <div
            className="
              p-6
              flex
              items-center
              justify-between
            "
          >

            <div>

              <div className="flex items-center gap-3">

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-medium

                    ${
                      vistoria.status ===
                      "REALIZADA"
                        ? "bg-green-100 text-green-700"
                        : vistoria.status ===
                          "PENDENTE"
                        ? "bg-yellow-100 text-yellow-700"
                        : vistoria.status ===
                          "CANCELADA"
                        ? "bg-red-100 text-red-700"
                        : vistoria.status ===
                          "ATRASADA"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  `}
                >
                  {vistoria.status}
                </span>

                <h2 className="text-xl font-bold text-gray-900">
                  {vistoria.nomeVistoria}
                </h2>

              </div>

              <div className="mt-3 text-gray-800">

                {vistoria.unidadeNome}
                {" • "}
                {vistoria.kitnetNome}

              </div>

              <div className="mt-2 text-gray-700">

                Responsável:
                {" "}
                {vistoria.responsavel}

              </div>

              <div className="text-gray-700">

                Periodicidade:
                {" "}
                {vistoria.periodicidade}

              </div>

              <div className="text-gray-700">

                Próxima:
                {" "}
                {vistoria.dataProxima}

              </div>

            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setMenuAberto(
                    menuAberto ===
                    vistoria.id
                      ? null
                      : vistoria.id
                  )
                }
              >
                <MoreVertical
                  size={20}
                  className="text-gray-700"
                />
              </button>

              <button
                onClick={() =>
                  setAberto(
                    aberto ===
                    vistoria.id
                      ? null
                      : vistoria.id
                  )
                }
              >
                {aberto ===
                vistoria.id ? (
                  <ChevronUp size={20}
                  className="text-gray-700" />
                ) : (
                  <ChevronDown size={20} className="text-gray-700" />
                )}
              </button>

            </div>

          </div>

          {menuAberto ===
            vistoria.id && (

            <div className="border-t bg-white">

              <Link
                href={`/vistorias/${vistoria.id}`}
                className="
                  block
                  px-6
                  py-3
                  text-gray-900
                  font-medium
                  hover:bg-gray-50
                "
              >
                Visualizar
              </Link>

              <button
                onClick={() =>
                  onEdit?.(
                    vistoria
                  )
                }
                className="
                  w-full
                  text-left
                  px-6
                  py-3
                  text-yellow-700
                  font-medium
                  hover:bg-yellow-50
                "
              >
                Editar
              </button>

              <button
                onClick={() =>
                  onConcluir?.(
                    vistoria.id
                  )
                }
                className="
                  w-full
                  text-left
                  px-6
                  py-3
                  text-green-700
                  font-medium
                  hover:bg-green-50
                "
              >
                Realizar
              </button>

              <button
                onClick={() =>
                  onCancelar?.(
                    vistoria.id
                  )
                }
                className="
                  w-full
                  text-left
                  px-6
                  py-3
                  text-orange-700
                  font-medium
                  hover:bg-orange-50
                "
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  onDelete?.(
                    vistoria.id
                  )
                }
                className="
                  w-full
                  text-left
                  px-6
                  py-3
                  text-red-700
                  font-medium
                  hover:bg-red-50
                "
              >
                Excluir
              </button>

            </div>

          )}

          {aberto ===
            vistoria.id && (

            <div className="border-t p-6 bg-gray-50">

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <div className="font-semibold text-gray-900">
                    Categoria
                  </div>

                  <div className="text-gray-700">
                    {vistoria.categoria}
                  </div>

                </div>

                <div>

                  <div className="font-semibold text-gray-900">
                    Criticidade
                  </div>

                  <div className="text-gray-700">
                    {vistoria.criticidade}
                  </div>

                </div>

                <div>

                  <div className="font-semibold text-gray-900">
                    Última Execução
                  </div>

                  <div className="text-gray-700">
                    {vistoria.dataUltima}
                  </div>

                </div>

                <div>

                  <div className="font-semibold text-gray-900">
                    Próxima Execução
                  </div>

                  <div className="text-gray-700">
                    {vistoria.dataProxima}
                  </div>

                </div>

              </div>

              <div className="mt-6">

                <div className="font-semibold text-gray-900">
                  Observações
                </div>

                <div className="text-gray-700 mt-2">
                  {
                    vistoria.observacoes ||
                    "Nenhuma observação cadastrada."
                  }
                </div>

              </div>

            </div>

          )}

        </div>

      )
    )}

  </div>

)}