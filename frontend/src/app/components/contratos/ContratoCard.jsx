"use client";

import { useState } from "react";
import Link from "next/link";

import {
  FileText,
  Calendar,
  DollarSign,
  MoreVertical,
} from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";

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

  if (!contratos.length) {

    return (

      <DashboardCard>

        <div className="py-14 text-center">

          <FileText
            size={56}
            className="mx-auto text-gray-600"
          />

          <h2 className="mt-6 text-2xl font-bold text-white">

            Nenhum contrato encontrado

          </h2>

          <p className="mt-3 text-gray-400">

            Cadastre o primeiro contrato para começar.

          </p>

        </div>

      </DashboardCard>

    );

  }

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">

      {contratos.map((contrato) => {

        const statusColor = {

          ATIVO:
            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",

          PENDENTE:
            "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",

          ENCERRADO:
            "bg-gray-500/15 text-gray-300 border border-gray-500/20",

          INADIMPLENTE:
            "bg-red-500/15 text-red-400 border border-red-500/20",

        };

        return (

          <DashboardCard
            key={contrato.id}
            className="
              relative
              overflow-visible

              transition-all
              duration-300

              hover:-translate-y-2
              hover:shadow-2xl
              hover:shadow-emerald-900/20
            "
          >

            {/* HEADER */}

            <div className="flex items-start justify-between">

              <div className="flex gap-4">

                <div
                  className="
                    flex
                    items-center
                    justify-center

                    w-12
                    h-12

                    rounded-xl

                    bg-emerald-500/10
                    border
                    border-emerald-500/20
                  "
                >

                  <FileText
                    className="text-emerald-400"
                    size={24}
                  />

                </div>

                <div>

                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-white
                    "
                  >
                    {contrato.inquilinoNome}
                  </h2>

                  <p className="text-gray-400 mt-1">

                    {contrato.unidadeNome}

                  </p>

                  <p className="text-gray-500 text-sm">

                    {contrato.kitnetNome}

                  </p>

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
                className="
                  w-10
                  h-10

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  hover:bg-white/5
                  transition
                "
              >

                <MoreVertical
                  className="text-gray-400"
                  size={20}
                />

              </button>

            </div>

            {/* MENU */}

            {menuAberto === contrato.id && (

              <div
                className="
                  absolute

                  top-14
                  right-0

                  w-52

                  rounded-2xl

                  border
                  border-white/10

                  bg-slate-900/95

                  backdrop-blur-xl

                  shadow-2xl

                  overflow-hidden

                  z-50
                "
              >

                <Link
                  href={`/contratos/${contrato.id}`}
                  className="
                    block
                    px-4
                    py-3

                    text-gray-300

                    hover:bg-white/5
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

                    text-yellow-400

                    hover:bg-yellow-500/10
                  "
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onRenovar?.(contrato.id);
                  }}
                  className="
                    w-full
                    text-left

                    px-4
                    py-3

                    text-emerald-400

                    hover:bg-emerald-500/10
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

                    text-orange-400

                    hover:bg-orange-500/10
                  "
                >
                  Marcar Inadimplente
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onEncerrar?.(contrato.id);
                  }}
                  className="
                    w-full
                    text-left

                    px-4
                    py-3

                    text-cyan-400

                    hover:bg-cyan-500/10
                  "
                >
                  Encerrar
                </button>

                <button
                  onClick={() => {
                    setMenuAberto(null);
                    onDelete?.(contrato.id);
                  }}
                  className="
                    w-full
                    text-left

                    px-4
                    py-3

                    text-red-400

                    hover:bg-red-500/10
                  "
                >
                  Excluir
                </button>

              </div>

            )}

            {/* DADOS */}

            <div className="mt-8 space-y-5">

              <div className="flex items-center gap-3 text-gray-300">

                <DollarSign
                  size={18}
                  className="text-emerald-400"
                />

                <span>

                  R$ {contrato.valorAluguel}

                </span>

              </div>

              <div className="flex items-center gap-3 text-gray-300">

                <Calendar
                  size={18}
                  className="text-cyan-400"
                />

                <span>

                  {contrato.dataInicio} até {contrato.dataFim}

                </span>

              </div>

            </div>

            <div className="my-7 border-t border-white/10" />

            <span
              className={`
                inline-flex

                rounded-xl

                px-4
                py-2

                text-xs

                uppercase
                tracking-[0.18em]

                font-bold

                ${statusColor[contrato.status]}
              `}
            >
              {contrato.status}
            </span>

          </DashboardCard>

        );

      })}

    </div>

  );

}