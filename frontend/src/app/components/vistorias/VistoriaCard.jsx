"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  CheckCircle2,
  XCircle,
  Trash2,
  Pin,
} from "lucide-react";

import Button from "../ui/Button";
import { formatDate, formatDateTime } from "@/utils/formatDate";
import { usePermissao } from "../../../hooks/usePermissao";

export default function VistoriaCard({
  vistorias,
  onEdit,
  onDelete,
  onConcluir,
  onCancelar,
  onFixar,
}) {

  const podeEditar = usePermissao("vistorias.editar");
  const podeExcluir = usePermissao("vistorias.excluir");

  const [aberto, setAberto] =
    useState(null);

  if (!vistorias.length) {

    return (

      <div
        className="
          rounded-[22px]
          border
          border-[var(--border-token)]
          bg-[var(--surface)]
          backdrop-blur-xl
          p-10
          text-center
        "
      >

        <h2
          className="
            text-2xl
            font-bold
            text-[var(--text)]
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
            border-[var(--border-token)]
            bg-[var(--surface)]
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
                    text-[var(--text)]
                  "
                >
                  {vistoria.nomeVistoria}
                </h2>

                {vistoria.fixado && (
                  <Pin
                    size={18}
                    className="text-emerald-400 fill-emerald-400"
                  />
                )}

              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Residência / Kitnet
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">

                    {vistoria.unidadeNome}

                    {" • "}

                    {vistoria.kitnetNome}

                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Responsável
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">
                    {vistoria.responsavel}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Periodicidade
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">
                    {vistoria.periodicidade}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Próxima Execução
                  </p>

                  <p className="text-[var(--text-muted)] mt-1">
                    {formatDate(vistoria.dataProxima)}
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() =>
                  onFixar?.(vistoria.id, !vistoria.fixado)
                }
                title={vistoria.fixado ? "Desafixar" : "Fixar"}
                className={`
                  w-10
                  h-10
                  rounded-xl
                  hover:bg-[var(--surface-2)]
                  transition
                  flex
                  items-center
                  justify-center
                  ${vistoria.fixado ? "text-emerald-400" : "text-[var(--text-subtle)]"}
                `}
              >

                <Pin
                  size={18}
                  className={vistoria.fixado ? "fill-emerald-400" : ""}
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
                  hover:bg-[var(--surface-2)]
                  transition
                  flex
                  items-center
                  justify-center
                "
              >

                {aberto === vistoria.id ? (

                  <ChevronUp
                    size={20}
                    className="text-[var(--text-subtle)]"
                  />

                ) : (

                  <ChevronDown
                    size={20}
                    className="text-[var(--text-subtle)]"
                  />

                )}

              </button>

            </div>

          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
              px-7
              pb-6
            "
          >

            <Link
              href={`/vistorias/${vistoria.id}`}
              className="
                flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-[var(--border-token)]
                text-[var(--text-muted)]
                text-sm
                font-semibold
                hover:bg-[var(--surface-2)]
                transition
              "
            >
              <Eye size={16} />
              Visualizar
            </Link>

            {podeEditar && (
              <button
                onClick={() => onEdit?.(vistoria)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-yellow-500/20
                  bg-yellow-500/10
                  text-yellow-400
                  text-sm
                  font-semibold
                  hover:bg-yellow-500/20
                  transition
                "
              >
                <Pencil size={16} />
                Editar
              </button>
            )}

            {podeEditar && (
              <button
                onClick={() => onConcluir?.(vistoria.id)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  text-emerald-400
                  text-sm
                  font-semibold
                  hover:bg-emerald-500/20
                  transition
                "
              >
                <CheckCircle2 size={16} />
                Realizar
              </button>
            )}

            {podeEditar && (
              <button
                onClick={() => onCancelar?.(vistoria.id)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-orange-500/20
                  bg-orange-500/10
                  text-orange-400
                  text-sm
                  font-semibold
                  hover:bg-orange-500/20
                  transition
                "
              >
                <XCircle size={16} />
                Cancelar
              </button>
            )}

            {podeExcluir && (
              <button
                onClick={() => onDelete?.(vistoria.id)}
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  text-red-400
                  text-sm
                  font-semibold
                  hover:bg-red-500/20
                  transition
                "
              >
                <Trash2 size={16} />
                Excluir
              </button>
            )}

          </div>

          {aberto === vistoria.id && (

            <div
              className="
                border-t
                border-[var(--border-token)]
                bg-[var(--surface-2)]
                p-7
              "
            >

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Categoria
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {vistoria.categoria}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Criticidade
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {vistoria.criticidade}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Última Execução
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {formatDate(vistoria.dataUltima)}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Próxima Execução
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {formatDate(vistoria.dataProxima)}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-[var(--text-faint)] uppercase">
                    Baixa Registrada Em
                  </p>

                  <p className="text-[var(--text)] mt-1">
                    {formatDateTime(vistoria.concluidaEm)}
                  </p>

                </div>

              </div>

              <div className="mt-8">

                <p className="text-xs text-[var(--text-faint)] uppercase">
                  Observações
                </p>

                <div
                  className="
                    mt-3
                    rounded-2xl
                    border
                    border-[var(--border-token)]
                    bg-[var(--surface-2)]
                    p-5
                    text-[var(--text-muted)]
                    leading-7
                  "
                >
                  {vistoria.observacoes ||
                    "Nenhuma observação cadastrada."}
                </div>

              </div>

              {vistoria.fotosConclusao?.length > 0 && (

                <div className="mt-8">

                  <p className="text-xs text-[var(--text-faint)] uppercase mb-3">
                    Fotos e Vídeos da Baixa
                  </p>

                  <div className="grid md:grid-cols-3 gap-4">

                    {vistoria.fotosConclusao.map((midia, index) =>
                      midia.startsWith("data:video") ? (
                        <video
                          key={index}
                          src={midia}
                          controls
                          className="w-full h-40 object-cover rounded-2xl border border-[var(--border-token)]"
                        />
                      ) : (
                        <img
                          key={index}
                          src={midia}
                          alt={`Mídia ${index + 1}`}
                          className="w-full h-40 object-cover rounded-2xl border border-[var(--border-token)]"
                        />
                      )
                    )}

                  </div>

                </div>

              )}

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