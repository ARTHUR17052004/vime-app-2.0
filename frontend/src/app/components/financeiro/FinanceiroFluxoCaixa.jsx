"use client";

export default function FinanceiroFluxoCaixa({
  receitas,
  despesas,
}) {

  const movimentos = [
    ...receitas.map((item) => ({
      ...item,
      tipo: "Receita",
    })),

    ...despesas.map((item) => ({
      ...item,
      tipo: "Despesa",
    })),
  ];

  movimentos.sort((a, b) =>
    b.id - a.id
  );

  return (
    <div className="bg-white rounded-3xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Fluxo de Caixa
      </h2>

      {movimentos.length === 0 ? (
        <div className="text-gray-500">
          Nenhum lançamento encontrado.
        </div>
      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b text-gray-500">

              <tr>

                <th className="text-left py-4">
                  Tipo
                </th>

                <th className="text-left">
                  Descrição
                </th>

                <th className="text-left">
                  Categoria
                </th>

                <th className="text-left">
                  Valor
                </th>

                <th className="text-left">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {movimentos.map((item) => (

                <tr
                  key={`${item.tipo}-${item.id}`}
                  className="border-b"
                >

                  <td className="py-5">

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-xl
                        text-sm
                        ${
                          item.tipo === "Receita"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {item.tipo}
                    </span>

                  </td>

                  <td>
                    {item.descricao}
                  </td>

                  <td>
                    {item.categoria}
                  </td>

                  <td
                    className={
                      item.tipo === "Receita"
                        ? "font-semibold text-green-700"
                        : "font-semibold text-red-600"
                    }
                  >
                    R$ {item.valor}
                  </td>

                  <td>
                    {item.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}