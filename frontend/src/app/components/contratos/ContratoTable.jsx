"use client";

import { useState } from "react";
import Link from "next/link";

import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  PenLine,
  Send,
  RefreshCw,
  Ban,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import Table from "../ui/Table";
import { formatarProximoVencimento } from "../../../utils/vencimento";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";
import { usePermissao } from "../../../hooks/usePermissao";

// Mesmo cabeçalho clicável de FinanceiroReceitas.jsx.
function CabecalhoOrdenavel({ label, ordens, ordenacao, onOrdenar }) {

  const [asc, desc] = ordens;

  const ativo = ordenacao === asc || ordenacao === desc;

  const alternar = () => {
    if (!desc) {
      onOrdenar?.(asc);
      return;
    }
    onOrdenar?.(ordenacao === asc ? desc : asc);
  };

  return (
    <th
      onClick={alternar}
      className={`px-6 py-5 text-left uppercase text-xs tracking-[0.22em] cursor-pointer select-none hover:text-[var(--text)] transition ${
        ativo ? "text-[var(--text)]" : "text-[var(--text-subtle)]"
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {ativo &&
          (desc && ordenacao === desc ? (
            <ChevronDown size={13} />
          ) : (
            <ChevronUp size={13} />
          ))}
      </span>
    </th>
  );
}

export default function ContratoTable({
  contratos = [],
  onEdit,
  onDelete,
  onBaixarPdf,
  onEnviarClicksign,
  onRenovar,
  onEncerrar,
  ordenacao,
  onOrdenar,
}) {

  const podeEditar = usePermissao("contratos.editar");
  const podeExcluir = usePermissao("contratos.excluir");

  const [menuAberto, setMenuAberto] =
    useState(null);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  function abrirMenu(e, id) {

  const rect = e.currentTarget.getBoundingClientRect();

  const larguraMenu = 220;

  let left = rect.right - larguraMenu;
  let top = rect.bottom + 8;

  // evita sair da tela pela direita
  if (left + larguraMenu > window.innerWidth - 16) {
    left = window.innerWidth - larguraMenu - 16;
  }

  // evita ficar muito colado na esquerda
  if (left < 16) {
    left = 16;
  }

  setMenuPosition({
    top,
    left,
  });

  setMenuAberto(id);

}

  if (!contratos.length) {

    return (

      <div
        className="
          rounded-3xl
          border
          border-[var(--border-token)]

          bg-[var(--surface)]

          backdrop-blur-xl

          shadow-xl

          p-14

          text-center
        "
      >

        <h2 className="text-2xl font-bold text-[var(--text)]">

          Nenhum contrato cadastrado

        </h2>

        <p className="mt-3 text-[var(--text-subtle)]">

          Cadastre o primeiro contrato para começar.

        </p>

      </div>

    );

  }

  return (

  <Table>

    <table className="w-full text-[var(--text-1)]">

      <thead className="border-b border-[var(--border-token)]">

        <tr>

          <CabecalhoOrdenavel
            label="Inquilino"
            ordens={["inquilino-asc", "inquilino-desc"]}
            ordenacao={ordenacao}
            onOrdenar={onOrdenar}
          />

          <CabecalhoOrdenavel
            label="Residência"
            ordens={["residencia-asc", "residencia-desc"]}
            ordenacao={ordenacao}
            onOrdenar={onOrdenar}
          />

          <CabecalhoOrdenavel
            label="Kitnet"
            ordens={["kitnet"]}
            ordenacao={ordenacao}
            onOrdenar={onOrdenar}
          />

          <CabecalhoOrdenavel
            label="Aluguel"
            ordens={["aluguel-menor", "aluguel-maior"]}
            ordenacao={ordenacao}
            onOrdenar={onOrdenar}
          />

          <CabecalhoOrdenavel
            label="Vencimento"
            ordens={["vencimento-dia"]}
            ordenacao={ordenacao}
            onOrdenar={onOrdenar}
          />

          <CabecalhoOrdenavel
            label="Status"
            ordens={["status"]}
            ordenacao={ordenacao}
            onOrdenar={onOrdenar}
          />

          <th className="px-6 py-5 text-center uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">
            Ações
          </th>

        </tr>

      </thead>

      <tbody>

        {contratos.map((contrato) => (

          <tr
            key={contrato.id}
            className="
              border-b
              border-[var(--border-token)]
              hover:bg-[var(--surface-2)]
              transition-all
            "
          >

            <td className="px-6 py-5 font-semibold">

              {contrato.inquilino?.nome ||
                contrato.inquilinoNome ||
                "-"}

            </td>

            <td className="px-6 py-5">

              {contrato.unidade?.nome ||
                contrato.unidadeNome ||
                "-"}

            </td>

            <td className="px-6 py-5">

              {contrato.kitnet?.nome ||
                contrato.kitnetNome ||
                "-"}

            </td>

            <td className="px-6 py-5">

              R$ {Number(
                contrato.valorAluguel || 0
              ).toLocaleString(
                "pt-BR",
                {
                  minimumFractionDigits: 2,
                }
              )}

            </td>

            <td className="px-6 py-5">

              {formatarProximoVencimento(contrato.diaVencimento)}

            </td>

            <td className="px-6 py-5">

              <Badge
                variant={
                  contrato.status === "ATIVO" || contrato.status === "ASSINADO"
                    ? "emerald"
                    : contrato.status === "PENDENTE"
                    ? "yellow"
                    : contrato.status === "ENCERRADO"
                    ? "gray"
                    : "red"
                }
              >

                {contrato.status}

              </Badge>

            </td>

            <td className="px-6 py-5 text-center">

              <button
                onClick={(e) => {

                  if (
                    menuAberto === contrato.id
                  ) {

                    setMenuAberto(null);

                    return;

                  }

                  abrirMenu(
                    e,
                    contrato.id
                  );

                }}
                className="
                  flex
                  items-center
                  justify-center

                  w-10
                  h-10

                  mx-auto

                  rounded-xl

                  bg-[var(--surface-2)]

                  hover:bg-[var(--surface-3)]

                  transition-all
                "
              >

                <MoreVertical
                  size={18}
                  className="text-[var(--text-muted)]"
                />

              </button>

              <ActionMenu
                open={
                  menuAberto === contrato.id
                }
                position={menuPosition}
                onClose={() =>
                  setMenuAberto(null)
                }
              >
                                <Link
                  href={`/contratos/${contrato.id}`}
                  className="
                    flex
                    items-center
                    gap-3

                    px-5
                    py-3

                    text-[var(--text-muted)]

                    hover:bg-[var(--surface-2)]
                    transition
                  "
                >

                  <Eye size={18} />

                  Visualizar

                </Link>

                <button
                  onClick={() => {

                    setMenuAberto(null);

                    onBaixarPdf?.(contrato.id);

                  }}
                  className="
                    flex
                    items-center
                    gap-3

                    w-full

                    px-5
                    py-3

                    text-emerald-400

                    hover:bg-emerald-500/10
                    transition
                  "
                >

                  <Download size={18} />

                  Baixar PDF

                </button>

                {podeEditar && !contrato.clicksignEnvelopeId && (

                  <button
                    onClick={() => {

                      setMenuAberto(null);

                      onEnviarClicksign?.(contrato.id);

                    }}
                    className="
                      flex
                      items-center
                      gap-3

                      w-full

                      px-5
                      py-3

                      text-sky-400

                      hover:bg-sky-500/10
                      transition
                    "
                  >

                    <Send size={18} />

                    Enviar à Clicksign

                  </button>

                )}

                {contrato.clicksignSigningUrl && (

                  <a
                    href={contrato.clicksignSigningUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuAberto(null)}
                    className="
                      flex
                      items-center
                      gap-3

                      px-5
                      py-3

                      text-sky-400

                      hover:bg-sky-500/10
                      transition
                    "
                  >

                    <PenLine size={18} />

                    Assinar na Clicksign

                  </a>

                )}

                {podeEditar && (

                  <button
                    onClick={() => {

                      setMenuAberto(null);

                      onRenovar?.(contrato.id);

                    }}
                    className="
                      flex
                      items-center
                      gap-3

                      w-full

                      px-5
                      py-3

                      text-emerald-400

                      hover:bg-emerald-500/10
                      transition
                    "
                  >

                    <RefreshCw size={18} />

                    Renovar

                  </button>

                )}

                {podeEditar && contrato.status === "ATIVO" && (

                  <button
                    onClick={() => {

                      setMenuAberto(null);

                      onEncerrar?.(contrato.id);

                    }}
                    className="
                      flex
                      items-center
                      gap-3

                      w-full

                      px-5
                      py-3

                      text-orange-400

                      hover:bg-orange-500/10
                      transition
                    "
                  >

                    <Ban size={18} />

                    Encerrar Contrato

                  </button>

                )}

                {podeEditar && (

                  <button
                    onClick={() => {

                      setMenuAberto(null);

                      onEdit?.(contrato);

                    }}
                    className="
                      flex
                      items-center
                      gap-3

                      w-full

                      px-5
                      py-3

                      text-yellow-400

                      hover:bg-yellow-500/10
                      transition
                    "
                  >

                    <Pencil size={18} />

                    Editar

                  </button>

                )}

                {podeExcluir && (

                  <button
                    onClick={() => {

                      setMenuAberto(null);

                      onDelete?.(contrato.id);

                    }}
                    className="
                      flex
                      items-center
                      gap-3

                      w-full

                      px-5
                      py-3

                      text-red-400

                      hover:bg-red-500/10
                      transition
                    "
                  >

                    <Trash2 size={18} />

                    Excluir

                  </button>

                )}

              </ActionMenu>

            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </Table>

);
}