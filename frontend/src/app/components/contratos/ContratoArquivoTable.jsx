"use client";

import { Pencil, Trash2, Download, Paperclip } from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import { usePermissao } from "../../../hooks/usePermissao";

export default function ContratoArquivoTable({
  contratos = [],
  onEdit,
  onDelete,
  onBaixarArquivo,
}) {

  const podeEditar = usePermissao("arquivoContratos.editar");
  const podeExcluir = usePermissao("arquivoContratos.excluir");

  if (!contratos.length) {

    return (
      <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-14 text-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          Nenhum contrato no arquivo
        </h2>
        <p className="mt-3 text-[var(--text-subtle)]">
          Clique em &quot;Adicionar Contrato&quot; pra cadastrar um contrato que já existia em papel.
        </p>
      </div>
    );

  }

  return (

    <Table>

      <table className="w-full text-[var(--text-1)]">

        <thead className="border-b border-[var(--border-token)]">
          <tr>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Inquilino</th>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Residência</th>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Kitnet</th>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Período</th>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Aluguel</th>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Status</th>
            <th className="px-6 py-5 text-left uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Arquivo</th>
            <th className="px-6 py-5 text-center uppercase text-xs tracking-[0.22em] text-[var(--text-subtle)]">Ações</th>
          </tr>
        </thead>

        <tbody>

          {contratos.map((contrato) => (

            <tr
              key={contrato.id}
              className="border-b border-[var(--border-token)] hover:bg-[var(--surface-2)] transition-all"
            >

              <td className="px-6 py-5 font-semibold">
                {contrato.inquilino?.nome || contrato.inquilinoNome || "-"}
              </td>

              <td className="px-6 py-5">
                {contrato.unidade?.nome || contrato.unidadeNome || "-"}
              </td>

              <td className="px-6 py-5">
                {contrato.kitnet?.nome || contrato.kitnet?.numero || contrato.kitnetNome || "-"}
              </td>

              <td className="px-6 py-5 whitespace-nowrap text-sm text-[var(--text-subtle)]">
                {formatarData(contrato.dataInicio)} – {contrato.dataFim ? formatarData(contrato.dataFim) : "sem fim"}
              </td>

              <td className="px-6 py-5">
                R$ {Number(contrato.valorAluguel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>

              <td className="px-6 py-5">
                <Badge
                  variant={
                    contrato.status === "ATIVO" ? "emerald"
                      : contrato.status === "PENDENTE" ? "yellow"
                      : contrato.status === "ENCERRADO" ? "gray"
                      : "red"
                  }
                >
                  {contrato.status}
                </Badge>
              </td>

              <td className="px-6 py-5">
                {contrato.arquivoNomeOriginal ? (
                  <button
                    onClick={() => onBaixarArquivo?.(contrato)}
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition text-sm"
                  >
                    <Paperclip size={14} />
                    {contrato.arquivoNomeOriginal}
                  </button>
                ) : (
                  <span className="text-xs text-[var(--text-faint)]">Sem anexo</span>
                )}
              </td>

              <td className="px-6 py-5">
                <div className="flex items-center justify-center gap-4">

                  {contrato.arquivoNomeOriginal && (
                    <button
                      onClick={() => onBaixarArquivo?.(contrato)}
                      className="text-[var(--text-subtle)] hover:text-emerald-400 transition"
                      aria-label="Baixar arquivo"
                    >
                      <Download size={16} />
                    </button>
                  )}

                  {podeEditar && (
                    <button
                      onClick={() => onEdit?.(contrato)}
                      className="text-[var(--text-subtle)] hover:text-[var(--text)] transition"
                      aria-label="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  )}

                  {podeExcluir && (
                    <button
                      onClick={() => onDelete?.(contrato.id)}
                      className="text-[var(--text-subtle)] hover:text-red-400 transition"
                      aria-label="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}

                </div>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </Table>

  );

}

function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
