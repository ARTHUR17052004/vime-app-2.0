"use client";

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

const rotuloStatus = (status) => {
  switch (status) {
    case "PAGA":
      return "Recebido";

    case "PENDENTE":
      return "Pendente";

    case "ATRASADA":
      return "Atrasado";

    case "CANCELADA":
      return "Cancelado";

    case "ESTORNADA":
      return "Estornado";

    default:
      return status || "-";
  }
};

const badge = (status) => {
  switch (status) {
    case "PAGA":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

    case "PENDENTE":
      return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20";

    case "ATRASADA":
      return "bg-red-500/10 text-red-400 border border-red-500/20";

    default:
      return "bg-white/5 text-gray-300 border border-white/10";
  }
};

export default function AsaasTabela({
  transacoes = [],
  loading = false,
  onVisualizar,
  onDetalhes,
  onEnviar,
  enviandoId,
}) {

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] overflow-hidden">

      <div className="px-6 py-5 border-b border-white/[0.07]">

        <h2 className="text-xl font-bold text-white">
          Cobranças
        </h2>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-white/5">

            <tr>

              <th className="text-left p-4 text-gray-300">
                Cliente
              </th>

              <th className="text-left p-4 text-gray-300">
                Valor
              </th>

              <th className="text-left p-4 text-gray-300">
                Vencimento
              </th>

              <th className="text-left p-4 text-gray-300">
                Forma
              </th>

              <th className="text-left p-4 text-gray-300">
                Status
              </th>

              <th className="text-right p-4 text-gray-300">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Carregando cobranças...
                </td>
              </tr>
            )}

            {!loading && transacoes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  Nenhuma cobrança encontrada.
                </td>
              </tr>
            )}

            {!loading && transacoes.map((item) => (

              <tr
                key={item.id}
                className="border-t border-white/[0.07] hover:bg-white/5"
              >

                <td className="p-4">

                  <div className="font-semibold text-white">
                    {item.cliente}
                  </div>

                  <div className="text-sm text-gray-400">
                    {item.enviadaAsaas
                      ? `Asaas • ${item.asaasPaymentId || "sincronizado"}`
                      : "Ainda não enviada ao Asaas"}
                  </div>

                </td>

                <td className="p-4 font-semibold text-white">
                  {formatarValor(item.valor)}
                </td>

                <td className="p-4 text-gray-300">
                  {formatarData(item.vencimento)}
                </td>

                <td className="p-4 text-gray-300">
                  {item.formaPagamento || "-"}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${badge(
                      item.status
                    )}`}
                  >
                    {rotuloStatus(item.status)}
                  </span>

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
                        border-white/[0.07]
                        text-gray-200
                        hover:bg-white/5
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
                        text-white
                      "
                    >
                      Detalhes
                    </button>

                    {!item.enviadaAsaas && (
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
                          text-white
                        "
                      >
                        {enviandoId === item.id
                          ? "Enviando..."
                          : "Enviar ao Asaas"}
                      </button>
                    )}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="px-6 py-4 border-t border-white/[0.07] flex justify-between items-center">

        <span className="text-gray-400 text-sm">
          Exibindo {transacoes.length} cobrança(s)
        </span>

      </div>

    </div>
  );
}
