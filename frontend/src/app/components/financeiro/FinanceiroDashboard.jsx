"use client";

export default function FinanceiroDashboard({
  receitas,
  despesas,
}) {

  const totalReceitas = receitas.reduce(
    (total, item) =>
      total + Number(item.valor || 0),
    0
  );

  const totalDespesas = despesas.reduce(
    (total, item) =>
      total + Number(item.valor || 0),
    0
  );

  const lucroLiquido =
    totalReceitas - totalDespesas;

  const receitasPendentes = receitas
    .filter(
      (item) =>
        item.status !== "Pago"
    )
    .reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  return (
    <div className="space-y-8">

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl shadow p-6">

          <div className="text-gray-500">
            Receita Total
          </div>

          <div className="text-3xl font-bold text-green-700 mt-3">
            R$ {totalReceitas}
          </div>

        </div>

        <div className="bg-white rounded-3xl shadow p-6">

          <div className="text-gray-500">
            Despesas Totais
          </div>

          <div className="text-3xl font-bold text-red-600 mt-3">
            R$ {totalDespesas}
          </div>

        </div>

        <div className="bg-white rounded-3xl shadow p-6">

          <div className="text-gray-500">
            Lucro Líquido
          </div>

          <div className="text-3xl font-bold text-blue-700 mt-3">
            R$ {lucroLiquido}
          </div>

        </div>

        <div className="bg-white rounded-3xl shadow p-6">

          <div className="text-gray-500">
            Receitas Pendentes
          </div>

          <div className="text-3xl font-bold text-yellow-600 mt-3">
            R$ {receitasPendentes}
          </div>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          Dashboard Financeiro
        </h2>

        <div className="space-y-5">

          <div>

            <div className="font-semibold">
              Receitas
            </div>

            <div className="w-full bg-gray-200 rounded-full h-5 mt-2">

              <div
                className="bg-green-600 h-5 rounded-full"
                style={{
                  width: "100%",
                }}
              />

            </div>

          </div>

          <div>

            <div className="font-semibold">
              Despesas
            </div>

            <div className="w-full bg-gray-200 rounded-full h-5 mt-2">

              <div
                className="bg-red-600 h-5 rounded-full"
                style={{
                  width:
                    totalReceitas === 0
                      ? "0%"
                      : `${(
                          totalDespesas /
                          totalReceitas
                        ) * 100}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}