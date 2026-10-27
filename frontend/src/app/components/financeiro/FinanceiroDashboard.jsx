"use client";

// Os 4 cards de totais (Receita/Despesas/Lucro/etc) ficaram só no
// topo da página (FinanceiroResumo) -- tinha duas fileiras mostrando
// quase a mesma coisa, uma delas ficando no caminho do gráfico.
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

  return (
    <div className="space-y-8">

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

        <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
          Dashboard Financeiro
        </h2>

        <div className="space-y-5">

          <div>

            <div className="font-semibold text-[var(--text-1)]">
              Receitas
            </div>

            <div className="w-full bg-[var(--surface-3)] rounded-full h-5 mt-2">

              <div
                className="bg-green-600 h-5 rounded-full"
                style={{
                  width: "100%",
                }}
              />

            </div>

          </div>

          <div>

            <div className="font-semibold text-[var(--text-1)]">
              Despesas
            </div>

            <div className="w-full bg-[var(--surface-3)] rounded-full h-5 mt-2">

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