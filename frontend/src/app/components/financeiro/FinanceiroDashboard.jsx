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
        item.status !== "PAGO"
    )
    .reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  return (
    <div className="space-y-8">

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6">

          <div className="text-gray-400">
            Receita Total
          </div>

          <div className="text-3xl font-bold text-green-400 mt-3">
            R$ {totalReceitas}
          </div>

        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6">

          <div className="text-gray-400">
            Despesas Totais
          </div>

          <div className="text-3xl font-bold text-red-400 mt-3">
            R$ {totalDespesas}
          </div>

        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6">

          <div className="text-gray-400">
            Lucro Líquido
          </div>

          <div className="text-3xl font-bold text-blue-400 mt-3">
            R$ {lucroLiquido}
          </div>

        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6">

          <div className="text-gray-400">
            Receitas Pendentes
          </div>

          <div className="text-3xl font-bold text-yellow-400 mt-3">
            R$ {receitasPendentes}
          </div>

        </div>

      </div>

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6">

        <h2 className="text-2xl font-bold text-white mb-6">
          Dashboard Financeiro
        </h2>

        <div className="space-y-5">

          <div>

            <div className="font-semibold text-gray-200">
              Receitas
            </div>

            <div className="w-full bg-white/10 rounded-full h-5 mt-2">

              <div
                className="bg-green-600 h-5 rounded-full"
                style={{
                  width: "100%",
                }}
              />

            </div>

          </div>

          <div>

            <div className="font-semibold text-gray-200">
              Despesas
            </div>

            <div className="w-full bg-white/10 rounded-full h-5 mt-2">

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