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
        return "bg-green-100 text-green-700";

      case "Pendente":
        return "bg-yellow-100 text-yellow-700";

      case "Atrasado":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">

      <div className="px-6 py-5 border-b">

        <h2 className="text-xl font-bold text-gray-800">
          Cobranças
        </h2>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="text-left p-4 text-gray-700">
                Cliente
              </th>

              <th className="text-left p-4 text-gray-700">
                Valor
              </th>

              <th className="text-left p-4 text-gray-700">
                Vencimento
              </th>

              <th className="text-left p-4 text-gray-700">
                Forma
              </th>

              <th className="text-left p-4 text-gray-700">
                Status
              </th>

              <th className="text-right p-4 text-gray-700">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {cobrancas.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4">

                  <div className="font-semibold text-gray-800">
                    {item.cliente}
                  </div>

                  <div className="text-sm text-gray-500">
                    {item.documento}
                  </div>

                </td>

                <td className="p-4 font-semibold text-gray-800">
                  {item.valor}
                </td>

                <td className="p-4 text-gray-700">
                  {item.vencimento}
                </td>

                <td className="p-4 text-gray-700">
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
                        hover:bg-gray-100
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

      <div className="px-6 py-4 border-t flex justify-between items-center">

        <span className="text-gray-500 text-sm">
          Exibindo 4 cobranças
        </span>

        <div className="flex gap-2">

          <button className="border rounded-lg px-4 py-2 hover:bg-gray-100">
            Anterior
          </button>

          <button className="bg-green-700 text-white rounded-lg px-4 py-2">
            1
          </button>

          <button className="border rounded-lg px-4 py-2 hover:bg-gray-100">
            Próxima
          </button>

        </div>

      </div>

    </div>
  );
}