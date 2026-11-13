"use client";

import { useState } from "react";
import {
  MoreVertical,
  TrendingDown,
  Plus,
  Pin,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import ActionMenu from "../ui/ActionMenu";

import DespesaVisualizarModal from "./DespesaVisualizarModal";
import DespesaEditarModal from "./DespesaEditarModal";
import { usePermissao } from "../../../hooks/usePermissao";

// Mesmo cabeçalho clicável de FinanceiroReceitas.jsx -- ver o
// comentário lá pra entender `ordens`.
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
      className={`text-left cursor-pointer select-none hover:text-[var(--text)] transition ${
        ativo ? "text-[var(--text)]" : ""
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

function MenuButton({ label, danger, warning, onClick }) {
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

export default function FinanceiroDespesas({
  despesas,
  contas,
  ordenacao,
  onOrdenar,
  onDelete,
  onUpdate,
  onFixar,
  onNovo,
}) {
  const podeEditar = usePermissao("financeiro.editar");

  const [despesaSelecionada, setDespesaSelecionada] =
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
    if (status === "PAGO") {
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
                bg-red-500/10
                border
                border-red-500/20
                flex
                items-center
                justify-center
              "
            >
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>

            <div>

              <h2 className="text-2xl font-bold text-[var(--text)]">
                Despesas
              </h2>

              <p className="text-[var(--text-subtle)]">
                Controle das despesas cadastradas.
              </p>

            </div>

          </div>

          {podeEditar && (
            <button
              onClick={onNovo}
              title="Nova Despesa"
              className="
                w-10
                h-10

                rounded-xl

                flex
                items-center
                justify-center

                bg-red-500/10
                border
                border-red-500/20

                text-red-400

                hover:bg-red-500/20
                transition
              "
            >
              <Plus size={20} />
            </button>
          )}

        </div>

      </div>

      {despesas.length === 0 ? (

        <div className="px-6 pb-6 text-[var(--text-subtle)]">
          Nenhuma despesa cadastrada.
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

                <CabecalhoOrdenavel
                  label="Valor"
                  ordens={["valor-menor", "valor-maior"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <CabecalhoOrdenavel
                  label="Status"
                  ordens={["status"]}
                  ordenacao={ordenacao}
                  onOrdenar={onOrdenar}
                />

                <th className="text-left">
                  Conta
                </th>

                <th></th>

              </tr>

            </thead>

            <tbody>

              {despesas.map((item) => (

                <tr
                  key={item.id}
                  className="
                    border-b
                    border-[var(--border-token)]
                    hover:bg-[var(--surface-2)]
                    transition
                  "
                >

                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      {item.fixado && (
                        <Pin
                          size={14}
                          className="text-red-400 fill-red-400"
                        />
                      )}
                      {item.descricao}
                    </div>
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td className="font-semibold text-red-400">
                    R$ {item.valor}
                  </td>

                  <td>

                    <Badge
                      variant={
                        item.status === "PAGO"
                          ? "emerald"
                          : item.status === "ATRASADA"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {item.status}
                    </Badge>

                  </td>

                  <td className="text-[var(--text-subtle)]">
                    {contas?.find((c) => c.id === item.contaPagamentoId)?.nome || "-"}
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
                          setDespesaSelecionada(item);
                          setVisualizarOpen(true);
                          setMenuAberto(null);
                        }}
                      />

                      {podeEditar && (
                        <MenuButton
                          label="Editar"
                          warning
                          onClick={() => {
                            setDespesaSelecionada(item);
                            setEditarOpen(true);
                            setMenuAberto(null);
                          }}
                        />
                      )}

                      <MenuButton
                        label={item.fixado ? "Desafixar" : "Fixar"}
                        onClick={() => {
                          onFixar?.(item.id, !item.fixado);
                          setMenuAberto(null);
                        }}
                      />

                      {podeEditar && (
                        <MenuButton
                          label="Excluir"
                          danger
                          onClick={() => {
                            onDelete?.(item.id);
                            setMenuAberto(null);
                          }}
                        />
                      )}
                    </ActionMenu>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </Table>

    <DespesaVisualizarModal
      isOpen={visualizarOpen}
      onClose={() =>
        setVisualizarOpen(false)
      }
      despesa={despesaSelecionada}
      contaNome={contas?.find((c) => c.id === despesaSelecionada?.contaPagamentoId)?.nome}
    />

    <DespesaEditarModal
      isOpen={editarOpen}
      onClose={() => {
        setEditarOpen(false);
      }}
      despesa={despesaSelecionada}
      onSave={(dadosAtualizados) => {
        onUpdate?.(
          despesaSelecionada.id,
          dadosAtualizados
        );

        setEditarOpen(false);
      }}
    />

  </>
);
}