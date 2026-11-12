"use client";

import { ChevronUp, ChevronDown, Repeat } from "lucide-react";

import Badge from "../ui/Badge";
import { statusExibidoReceita } from "@/utils/statusReceita";

// Mesmo cabeçalho clicável de FinanceiroReceitas.jsx -- `ordens` é
// [valorAscendente, valorDescendente] (toggle nos dois sentidos) ou só
// [valorUnico] (liga/desliga, sem direção -- ex.: Forma, Status).
function CabecalhoOrdenavel({ label, ordens, ordenacao, onOrdenar, className = "" }) {

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
      className={`text-left p-4 cursor-pointer select-none hover:text-[var(--text)] transition ${
        ativo ? "text-[var(--text)]" : "text-[var(--text-muted)]"
      } ${className}`}
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

const formatarValor = (valor) => {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatarData = (data) => {
  if (!data) return "-";

  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
};

// Mesmo padrão de status do Financeiro (statusExibidoReceita) --
// "Pendente" só quando NUNCA foi enviada a banco nenhum; já enviada e
// ainda não paga vira "Em Aberto". Antes essa tela tinha sua própria
// régua solta (Pendente pra tudo que não era paga/atrasada/cancelada),
// divergindo do que o resto do sistema já mostra pro mesmo status.

export default function AsaasTabela({
  transacoes = [],
  loading = false,
  onVisualizar,
  onDetalhes,
  onEditar,
  onEnviar,
  enviandoId,
  selecionados = new Set(),
  onAlternarSelecionado,
  onAlternarTodos,
  onEnviarSelecionados,
  enviandoLote = false,
  podeEditar = true,
  podeEnviar = true,
  ordenacao,
  onOrdenar,
}) {

  // enviadaAsaas só cobre o caminho Asaas -- uma receita mandada pelo
  // BB fica com gatewayReferencia preenchida em vez disso.
  const foiEnviada = (t) => t.enviadaAsaas || !!t.gatewayReferencia;

  const enviaveis = transacoes.filter((t) => !foiEnviada(t));
  const todosSelecionados =
    enviaveis.length > 0 && enviaveis.every((t) => selecionados.has(t.id));

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] overflow-hidden">

      <div className="px-6 py-5 border-b border-[var(--border-token)]">

        <h2 className="text-xl font-bold text-[var(--text)]">
          Cobranças
        </h2>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-[var(--surface-2)]">

            <tr>

              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={() => onAlternarTodos?.(enviaveis.map((t) => t.id))}
                  disabled={enviaveis.length === 0}
                />
              </th>

              <CabecalhoOrdenavel
                label="Cliente"
                ordens={["cliente-asc", "cliente-desc"]}
                ordenacao={ordenacao}
                onOrdenar={onOrdenar}
              />

              <CabecalhoOrdenavel
                label="Valor"
                ordens={["valor-menor", "valor-maior"]}
                ordenacao={ordenacao}
                onOrdenar={onOrdenar}
              />

              <CabecalhoOrdenavel
                label="Vencimento"
                ordens={["vencimento-proximo", "vencimento-distante"]}
                ordenacao={ordenacao}
                onOrdenar={onOrdenar}
              />

              <CabecalhoOrdenavel
                label="Forma"
                ordens={["forma"]}
                ordenacao={ordenacao}
                onOrdenar={onOrdenar}
              />

              <CabecalhoOrdenavel
                label="Status"
                ordens={["status"]}
                ordenacao={ordenacao}
                onOrdenar={onOrdenar}
              />

              <th className="text-right p-4 text-[var(--text-muted)]">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--text-subtle)]">
                  Carregando cobranças...
                </td>
              </tr>
            )}

            {!loading && transacoes.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[var(--text-subtle)]">
                  Nenhuma cobrança encontrada.
                </td>
              </tr>
            )}

            {!loading && transacoes.map((item) => (

              <tr
                key={item.id}
                className="border-t border-[var(--border-token)] hover:bg-[var(--surface-2)]"
              >

                <td className="p-4">
                  {!foiEnviada(item) && (
                    <input
                      type="checkbox"
                      checked={selecionados.has(item.id)}
                      onChange={() => onAlternarSelecionado?.(item.id)}
                    />
                  )}
                </td>

                <td className="p-4">

                  <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                    {item.clienteNome || item.cliente}
                    {item.recorrente && (
                      <Repeat size={13} className="text-sky-400 shrink-0" title="Cobrança recorrente" />
                    )}
                  </div>

                  <div className="text-sm text-[var(--text-subtle)] truncate">
                    {item.descricao || item.cliente}
                    {item.residenciaNome && ` · ${item.residenciaNome}`}
                    {item.kitnetNome && ` · Kitnet ${item.kitnetNome}`}
                  </div>

                  <div
                    className={
                      item.gatewayProvider === "BB" || item.enviadaAsaas
                        ? "text-sm text-[var(--text-subtle)]"
                        : "text-sm font-semibold text-yellow-400"
                    }
                  >
                    {item.gatewayProvider === "BB"
                      ? `BB • ${item.gatewayReferencia || "sincronizado"}`
                      : item.enviadaAsaas
                      ? `Asaas • ${item.asaasPaymentId || "sincronizado"}`
                      : "⚠ Ainda não enviada a nenhum banco"}
                  </div>

                </td>

                <td className="p-4 font-semibold text-[var(--text)]">
                  {formatarValor(item.valor)}
                </td>

                <td className="p-4 text-[var(--text-muted)]">
                  {formatarData(item.vencimento)}
                </td>

                <td className="p-4 text-[var(--text-muted)]">
                  {item.formaPagamento || "-"}
                </td>

                <td className="p-4">

                  <Badge variant={statusExibidoReceita(item).variant}>
                    {statusExibidoReceita(item).texto}
                  </Badge>

                </td>

                <td className="p-4">

                  <div className="flex justify-end gap-2 flex-wrap">

                    <button
                      onClick={() => onVisualizar?.(item)}
                      className="
                        px-4
                        py-2
                        rounded-lg
                        border
                        border-[var(--border-token)]
                        text-[var(--text-1)]
                        hover:bg-[var(--surface-2)]
                      "
                    >
                      Visualizar
                    </button>

                    <button
                      onClick={() => onDetalhes?.(item)}
                      className="
                        px-4
                        py-2
                        rounded-lg
                        bg-green-700
                        hover:bg-green-800
                        text-[var(--text)]
                      "
                    >
                      Detalhes
                    </button>

                    {!foiEnviada(item) && podeEditar && (
                      <button
                        onClick={() => onEditar?.(item)}
                        className="
                          px-4
                          py-2
                          rounded-lg
                          border
                          border-yellow-500/30
                          text-yellow-400
                          hover:bg-yellow-500/10
                        "
                      >
                        Editar
                      </button>
                    )}

                    {!foiEnviada(item) && podeEnviar && (
                      <button
                        onClick={() => onEnviar?.(item)}
                        disabled={enviandoId === item.id}
                        className="
                          px-4
                          py-2
                          rounded-lg
                          bg-sky-600
                          hover:bg-sky-700
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          text-[var(--text)]
                        "
                      >
                        {enviandoId === item.id
                          ? "Enviando..."
                          : "Enviar ao Banco"}
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="px-6 py-4 border-t border-[var(--border-token)] flex justify-between items-center flex-wrap gap-3">

        <span className="text-[var(--text-subtle)] text-sm">
          Exibindo {transacoes.length} cobrança(s)
          {selecionados.size > 0 && ` • ${selecionados.size} selecionada(s)`}
        </span>

        {selecionados.size > 0 && podeEnviar && (
          <button
            onClick={() => onEnviarSelecionados?.()}
            disabled={enviandoLote}
            className="
              px-5
              py-2.5
              rounded-lg
              bg-sky-600
              hover:bg-sky-700
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-[var(--text)]
              font-semibold
            "
          >
            {enviandoLote
              ? "Enviando..."
              : `Enviar ${selecionados.size} selecionada(s)`}
          </button>
        )}

      </div>

    </div>
  );
}
