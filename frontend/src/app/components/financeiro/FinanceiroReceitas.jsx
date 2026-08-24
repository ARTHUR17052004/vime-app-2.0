"use client";

import { useState } from "react";
import {
  MoreVertical,
  Wallet,
  Plus,
  Pin,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

import ReceitaVisualizarModal from "./ReceitaVisualizarModal";
import ReceitaEditarModal from "./ReceitaEditarModal";

function MenuButton({ label, danger, success, warning, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        text-left
        px-4
        py-3
        transition
        ${
          danger
            ? "text-red-400 hover:bg-red-500/10"
            : success
            ? "text-green-400 hover:bg-green-500/10"
            : warning
            ? "text-yellow-400 hover:bg-yellow-500/10"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        }
      `}
    >
      {label}
    </button>
  );
}

export default function FinanceiroReceitas({
  receitas,
  onDelete,
  onUpdate,
  onMarcarPago,
  onFixar,
  onNovo,
}) {
  const [receitaSelecionada, setReceitaSelecionada] =
    useState(null);

  const [visualizarOpen, setVisualizarOpen] =
    useState(false);

  const [editarOpen, setEditarOpen] =
    useState(false);

  const [menuAberto, setMenuAberto] = useState(null);

  const [posicaoMenu, setPosicaoMenu] = useState({ top: 0, left: 0 });

  function abrirMenu(e, id) {
    const rect = e.currentTarget.getBoundingClientRect();
    const largura = 200;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left < 16) left = 16;
    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    setPosicaoMenu({ top, left });
    setMenuAberto(id);
  }

  const corStatus = (status) => {
    if (status === "PAGO" || status === "PAGA") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (status === "ATRASADA") {
      return "bg-red-500/10 text-red-400";
    }

    return "bg-yellow-500/10 text-yellow-400";
  };

  return (
  <>
    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12

                rounded-2xl

                bg-emerald-500/10

                border
                border-emerald-500/20

                flex
                items-center
                justify-center
              "
            >

              <Wallet className="w-6 h-6 text-emerald-400" />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-[var(--text)]">
                Receitas
              </h2>

              <p className="text-[var(--text-subtle)]">
                Controle das receitas cadastradas.
              </p>

            </div>

          </div>

          <button
            onClick={onNovo}
            title="Nova Receita"
            className="
              w-10
              h-10

              rounded-xl

              flex
              items-center
              justify-center

              bg-emerald-500/10
              border
              border-emerald-500/20

              text-emerald-400

              hover:bg-emerald-500/20
              transition
            "
          >
            <Plus size={20} />
          </button>

        </div>

      </div>

      {receitas.length === 0 ? (
        <div className="px-6 pb-6 text-[var(--text-subtle)]">
          Nenhuma receita cadastrada.
        </div>
      ) : (
        <div className="overflow-x-auto mt-6 px-6 pb-6">

          <table className="w-full text-[var(--text-1)]">

            <thead
              className="
                border-b
                border-[var(--border-token)]

                text-[var(--text-subtle)]

                uppercase

                tracking-[0.22em]

                text-xs
              "
            >
              <tr>
                <th className="text-left py-4">
                  Descrição
                </th>

                <th className="text-left">
                  Categoria
                </th>

                <th className="text-left">
                  Inquilino
                </th>

                <th className="text-left">
                  Residencial
                </th>

                <th className="text-left">
                  Kitnet
                </th>

                <th className="text-left">
                  Vencimento
                </th>

                <th className="text-left">
                  Valor
                </th>

                <th className="text-left">
                  Status
                </th>

                <th></th>
              </tr>
            </thead>

            <tbody>

              {receitas.map((item) => {

                const inquilino = item.inquilino || item.contrato?.inquilino;
                const unidade = item.contrato?.unidade || item.inquilino?.kitnet?.unidade;
                const kitnet = item.contrato?.kitnet || item.inquilino?.kitnet;

                return (

                <tr
                  key={item.id}
                  className="border-b border-[var(--border-token)] hover:bg-[var(--surface-2)] transition"
                >

                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      {item.fixado && (
                        <Pin
                          size={14}
                          className="text-emerald-400 fill-emerald-400"
                        />
                      )}
                      {item.descricao}
                    </div>
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td className="text-[var(--text-subtle)]">
                    {inquilino?.nome || "-"}
                  </td>

                  <td className="text-[var(--text-subtle)]">
                    {unidade?.nome || "-"}
                  </td>

                  <td className="text-[var(--text-subtle)]">
                    {kitnet?.nome || kitnet?.numero || "-"}
                  </td>

                  <td className="text-[var(--text-subtle)]">
                    {item.vencimento
                      ? new Date(item.vencimento).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>

                  <td
                    className={`font-semibold ${
                      item.status === "ATRASADA"
                        ? "text-red-400"
                        : item.status === "PAGO" || item.status === "PAGA"
                        ? "text-emerald-400"
                        : "text-yellow-400"
                    }`}
                  >
                    R$ {item.valor}
                  </td>

                  <td>
                    <div className="flex items-center gap-2 flex-wrap">

                      <Badge
                        variant={
                          item.status === "PAGO" || item.status === "PAGA"
                            ? "emerald"
                            : item.status === "ATRASADA"
                            ? "red"
                            : "yellow"
                        }
                      >
                        {item.status}
                      </Badge>

                      <Badge
                        variant={item.enviadaAsaas ? "blue" : "gray"}
                        size="sm"
                        title={
                          item.enviadaAsaas
                            ? `Sincronizada com Asaas${
                                item.asaasPaymentId
                                  ? ` (${item.asaasPaymentId})`
                                  : ""
                              }`
                            : "Ainda não enviada ao Asaas"
                        }
                      >
                        {item.enviadaAsaas ? "Asaas" : "Local"}
                      </Badge>

                    </div>
                  </td>

                  <td>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        menuAberto === item.id
                          ? setMenuAberto(null)
                          : abrirMenu(e, item.id);
                      }}
                      className="
                        w-9
                        h-9
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        hover:bg-[var(--surface-3)]
                        transition
                      "
                    >
                      <MoreVertical size={18} />
                    </button>

                    <ActionMenu
                      open={menuAberto === item.id}
                      position={posicaoMenu}
                      onClose={() => setMenuAberto(null)}
                    >
                      <MenuButton
                        label="Visualizar"
                        onClick={() => {
                          setReceitaSelecionada(item);
                          setVisualizarOpen(true);
                          setMenuAberto(null);
                        }}
                      />

                      <MenuButton
                        label="Editar"
                        warning
                        onClick={() => {
                          setReceitaSelecionada(item);
                          setEditarOpen(true);
                          setMenuAberto(null);
                        }}
                      />

                      <MenuButton
                        label="Marcar Pago"
                        success
                        onClick={() => {
                          onMarcarPago?.(item.id);
                          setMenuAberto(null);
                        }}
                      />

                      <MenuButton
                        label={item.fixado ? "Desafixar" : "Fixar"}
                        onClick={() => {
                          onFixar?.(item.id, !item.fixado);
                          setMenuAberto(null);
                        }}
                      />

                      <MenuButton
                        label="Excluir"
                        danger
                        onClick={() => {
                          onDelete?.(item.id);
                          setMenuAberto(null);
                        }}
                      />
                    </ActionMenu>

                  </td>

                </tr>

                );

              })}

            </tbody>

          </table>

        </div>
      )}

    </Table>

    <ReceitaVisualizarModal
      isOpen={visualizarOpen}
      onClose={() =>
        setVisualizarOpen(false)
      }
      receita={receitaSelecionada}
    />

    <ReceitaEditarModal
      isOpen={editarOpen}
      onClose={() => {
        setEditarOpen(false);
      }}
      receita={receitaSelecionada}
      onSave={(dadosAtualizados) => {
        onUpdate?.(
          receitaSelecionada.id,
          dadosAtualizados
        );

        setEditarOpen(false);
      }}
    />

  </>
);
}