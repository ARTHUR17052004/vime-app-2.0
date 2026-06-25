"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  DollarSign,
  MoreVertical,
} from "lucide-react";

export default function ContratoCard({
  contratos,
  onDelete,
  onEdit,
  onEncerrar,
  onRenovar,
  onMarcarInadimplente,
}) {
  const [menuAberto, setMenuAberto] =
    useState(null);

  if (contratos.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow p-10 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Módulo Contratos
        </h2>

        <p className="text-gray-500">
          Nenhum contrato cadastrado.
        </p>
      </div>
    );
  }

 return (
  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
    {contratos.map((contrato) => (
      <div
        key={contrato.id}
        className="
          relative
          bg-white
          rounded-3xl
          shadow
          border
          border-gray-100
          p-6
        "
      >
        <div className="flex justify-between items-start">

          <div className="flex gap-3">

            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-green-100
                flex
                items-center
                justify-center
              "
            >
              <FileText className="w-6 h-6 text-green-700" />
            </div>

            <div>

              <h2 className="font-bold text-xl text-gray-800">
                {contrato.inquilinoNome}
              </h2>

              <div className="text-gray-500 text-sm mt-1">
                {contrato.unidadeNome}
              </div>

              <div className="text-gray-500 text-sm">
                {contrato.kitnetNome}
              </div>

            </div>

          </div>

          <button
            onClick={() =>
              setMenuAberto(
                menuAberto === contrato.id
                  ? null
                  : contrato.id
              )
            }
          >
            <MoreVertical className="text-gray-500" />
          </button>

        </div>

        {menuAberto === contrato.id && (
          <div
            className="
              absolute
              top-14
              right-5
              bg-white
              border
              rounded-xl
              shadow-xl
              z-50
              w-48
            "
          >

            <Link
              href={`/contratos/${contrato.id}`}
              className="
                block
                px-4
                py-3
                hover:bg-gray-100
              "
            >
              Visualizar
            </Link>

            <button
              onClick={() => {
                setMenuAberto(null);
                onEdit?.(contrato);
              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-yellow-50
                text-yellow-700
              "
            >
              Editar
            </button>

            <button
              onClick={() => {
                setMenuAberto(null);
                onRenovar?.(
                  contrato.id
                );
              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-green-50
                text-green-700
              "
            >
              Renovar
            </button>

            <button
              onClick={() => {
                setMenuAberto(null);
                onMarcarInadimplente?.(
                  contrato.id
                );
              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-orange-50
                text-orange-700
              "
            >
              Marcar Inadimplente
            </button>

            <button
              onClick={() => {
                setMenuAberto(null);
                onEncerrar?.(
                  contrato.id
                );
              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-blue-50
                text-blue-700
              "
            >
              Encerrar
            </button>

            <button
              onClick={() => {
                setMenuAberto(null);
                onDelete?.(
                  contrato.id
                );
              }}
              className="
                w-full
                text-left
                px-4
                py-3
                hover:bg-red-50
                text-red-700
              "
            >
              Excluir
            </button>

          </div>
        )}

        <div className="mt-6 space-y-4">

          <div className="flex items-center gap-3 text-gray-700">
            <DollarSign size={18} />

            <span>
              R$ {contrato.valorAluguel}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Calendar size={18} />

            <span>
              {contrato.dataInicio} até {contrato.dataFim}
            </span>
          </div>

        </div>

        <div className="border-t mt-6 pt-5">

          <span
            className={`px-3 py-1 rounded-full text-sm ${
              contrato.status === "ATIVO"
                ? "bg-green-100 text-green-700"
                : contrato.status === "PENDENTE"
                ? "bg-yellow-100 text-yellow-700"
                : contrato.status === "ENCERRADO"
                ? "bg-gray-100 text-gray-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {contrato.status}
          </span>

        </div>

      </div>
    ))}
  </div>
)}