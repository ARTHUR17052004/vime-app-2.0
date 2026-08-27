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
import { usePermissao } from "../../../hooks/usePermissao";

export default function ContratoCard({
  contratos,
  onDelete,
  onEdit,
  onEncerrar,
  onRenovar,
}) {

  const podeEditar = usePermissao("contratos.editar");
  const podeExcluir = usePermissao("contratos.excluir");

  const [menuAberto, setMenuAberto] =
    useState(null);

  if (!contratos.length) {

    return (

      <DashboardCard>

        <div className="py-14 text-center">

          <FileText
            size={56}
            className="mx-auto text-[var(--text-faint-2)]"
          />

          <h2 className="mt-6 text-2xl font-bold text-[var(--text)]">

            Nenhum contrato encontrado

          </h2>

          <p className="mt-3 text-[var(--text-subtle)]">

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

          ASSINADO:
            "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",

          PENDENTE:
            "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",

          ENCERRADO:
            "bg-gray-500/15 text-[var(--text-muted)] border border-gray-500/20",

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
                      text-[var(--text)]
                    "
                  >
                    {contrato.inquilino?.nome || contrato.inquilinoNome}
                  </h2>

                  <p className="text-[var(--text-subtle)] mt-1">

                    {contrato.unidade?.nome || contrato.unidadeNome}

                  </p>

                  <p className="text-[var(--text-faint)] text-sm">

                    {contrato.kitnet?.nome || contrato.kitnetNome}

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

                  hover:bg-[var(--surface-2)]
                  transition
                "
              >

                <MoreVertical
                  className="text-[var(--text-subtle)]"
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
                  border-[var(--border-token)]

                  bg-[var(--surface)]

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

                    text-[var(--text-muted)]

                    hover:bg-[var(--surface-2)]
                  "
                >
                  Visualizar
                </Link>

                {contrato.clicksignSigningUrl && (

                  <a
                    href={contrato.clicksignSigningUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuAberto(null)}
                    className="
                      block
                      px-4
                      py-3

                      text-sky-400

                      hover:bg-sky-500/10
                    "
                  >
                    Assinar na Clicksign
                  </a>

                )}

                {podeEditar && (
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
                )}

                {podeEditar && (
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
                )}

                {podeEditar && (
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
                )}

                {podeExcluir && (
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
                )}

              </div>

            )}

            {/* DADOS */}

            <div className="mt-8 space-y-5">

              <div className="flex items-center gap-3 text-[var(--text-muted)]">

                <DollarSign
                  size={18}
                  className="text-emerald-400"
                />

                <span>

                  R$ {contrato.valorAluguel}

                </span>

              </div>

              <div className="flex items-center gap-3 text-[var(--text-muted)]">

                <Calendar
                  size={18}
                  className="text-cyan-400"
                />

                <span>

                  {contrato.dataInicio
                    ? new Date(contrato.dataInicio).toLocaleDateString("pt-BR")
                    : "-"}
                  {" "}até{" "}
                  {contrato.dataFim
                    ? new Date(contrato.dataFim).toLocaleDateString("pt-BR")
                    : "indeterminado"}

                </span>

              </div>

            </div>

            <div className="my-7 border-t border-[var(--border-token)]" />

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