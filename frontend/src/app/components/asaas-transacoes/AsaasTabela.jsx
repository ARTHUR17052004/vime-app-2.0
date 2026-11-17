"use client";

import { ChevronUp, ChevronDown, Repeat, Clock, Send, TriangleAlert, CheckCircle2, Ban } from "lucide-react";

import Badge from "../ui/Badge";
import { statusExibidoReceita, demonstrativoReceita } from "@/utils/statusReceita";

// Transações é só um painel de acompanhamento -- quem lança, edita e
// envia ao banco (inclusive em lote) é o Financeiro agora. Aqui só dá
// pra olhar ("Visualizar"/"Detalhes"); nada de checkbox, Editar ou
// Enviar ao Banco.

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

const ICONE_POR_TIPO = {
  aguardando: Clock,
  enviada: Send,
  atrasada: TriangleAlert,
  paga: CheckCircle2,
  cancelada: Ban,
};

const COR_POR_TIPO = {
  aguardando: "text-yellow-400",
  enviada: "text-sky-400",
  atrasada: "text-red-400",
  paga: "text-emerald-400",
  cancelada: "text-[var(--text-faint)]",
};

// Demonstrativo da cobrança -- cada estado (aguardando envio, enviada
// e aguardando pagamento, vencida, paga, cancelada) mostra as datas e
// a origem relevantes pra ele, em vez de uma linha única igual pra
// tudo (ver utils/statusReceita.js demonstrativoReceita).
function Demonstrativo({ item }) {

  const { tipo, titulo, linhas } = demonstrativoReceita(item);
  const Icone = ICONE_POR_TIPO[tipo];
  const cor = COR_POR_TIPO[tipo];

  return (
    <div className="mt-1 flex items-start gap-1.5">
      <Icone size={13} className={`mt-0.5 shrink-0 ${cor}`} />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${cor}`}>{titulo}</p>
        {linhas.map((linha) => (
          <p key={linha} className="text-xs text-[var(--text-faint)]">{linha}</p>
        ))}
      </div>
    </div>
  );

}

export default function AsaasTabela({
  transacoes = [],
  loading = false,
  onVisualizar,
  onDetalhes,
  ordenacao,
  onOrdenar,
}) {

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
                <td colSpan={6} className="p-8 text-center text-[var(--text-subtle)]">
                  Carregando cobranças...
                </td>
              </tr>
            )}

            {!loading && transacoes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--text-subtle)]">
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

                  <Demonstrativo item={item} />

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

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="px-6 py-4 border-t border-[var(--border-token)]">

        <span className="text-[var(--text-subtle)] text-sm">
          Exibindo {transacoes.length} cobrança(s)
        </span>

      </div>

    </div>
  );
}
