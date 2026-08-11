"use client";

export default function AsaasTabela() {
  const cobrancas = [
    {
      id: 1,
      cliente: "João Silva",
      documento: "CPF • 123.456.789-00",
      valor: "R$ 950,00",
      vencimento: "10/07/2026",
      forma: "PIX",
      status: "Recebido",
    },
    {
      id: 2,
      cliente: "Maria Oliveira",
      documento: "CPF • 987.654.321-00",
      valor: "R$ 1.250,00",
      vencimento: "12/07/2026",
      forma: "Boleto",
      status: "Pendente",
    },
    {
      id: 3,
      cliente: "Carlos Souza",
      documento: "CPF • 456.789.123-55",
      valor: "R$ 780,00",
      vencimento: "05/07/2026",
      forma: "PIX",
      status: "Atrasado",
    },
    {
      id: 4,
      cliente: "Fernanda Lima",
      documento: "CPF • 321.654.987-10",
      valor: "R$ 640,00",
      vencimento: "02/07/2026",
      forma: "Cartão",
      status: "Cancelado",
    },
  ];

  const badge = (status) => {
    switch (status) {
      case "Recebido":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";

      case "Pendente":
        return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20";

      case "Atrasado":
        return "bg-red-500/10 text-red-400 border border-red-500/20";

      default:
        return "bg-white/5 text-gray-300 border border-white/10";
    }
  };

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

            {cobrancas.map((item) => (

              <tr
                key={item.id}
                className="border-t border-white/[0.07] hover:bg-white/5"
              >

                <td className="p-4">

                  <div className="font-semibold text-white">
                    {item.cliente}
                  </div>

                  <div className="text-sm text-gray-400">
                    {item.documento}
                  </div>

                </td>

                <td className="p-4 font-semibold text-white">
                  {item.valor}
                </td>

                <td className="p-4 text-gray-300">
                  {item.vencimento}
                </td>

                <td className="p-4 text-gray-300">
                  {item.forma}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${badge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-end gap-2">

                    <button
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

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="px-6 py-4 border-t border-white/[0.07] flex justify-between items-center">

        <span className="text-gray-400 text-sm">
          Exibindo 4 cobranças
        </span>

        <div className="flex gap-2">

          <button className="border border-white/[0.07] text-gray-200 rounded-lg px-4 py-2 hover:bg-white/5">
            Anterior
          </button>

          <button className="bg-green-700 text-white rounded-lg px-4 py-2">
            1
          </button>

          <button className="border border-white/[0.07] text-gray-200 rounded-lg px-4 py-2 hover:bg-white/5">
            Próxima
          </button>

        </div>

      </div>

    </div>
  );
}