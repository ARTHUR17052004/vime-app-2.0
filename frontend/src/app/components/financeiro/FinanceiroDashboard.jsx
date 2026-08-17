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

  const hoje = new Date().toISOString().split("T")[0];

  const estaVencido = (item) =>
    item.vencimento &&
    item.vencimento.slice(0, 10) < hoje &&
    item.status !== "PAGO" &&
    item.status !== "PAGA";

  const totalVencidos =
    [...receitas, ...despesas]
      .filter(estaVencido)
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      );

  return (
    <div className="space-y-8">

      <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-6">

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

          <div className="text-[var(--text-subtle)]">
            Receita Total
          </div>

          <div className="text-3xl font-bold text-green-400 mt-3">
            R$ {totalReceitas}
          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

          <div className="text-[var(--text-subtle)]">
            Despesas Totais
          </div>

          <div className="text-3xl font-bold text-red-400 mt-3">
            R$ {totalDespesas}
          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

          <div className="text-[var(--text-subtle)]">
            Vencidos
          </div>

          <div className="text-3xl font-bold text-orange-400 mt-3">
            R$ {totalVencidos}
          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

          <div className="text-[var(--text-subtle)]">
            Lucro Líquido
          </div>

          <div className="text-3xl font-bold text-blue-400 mt-3">
            R$ {lucroLiquido}
          </div>

        </div>

        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

          <div className="text-[var(--text-subtle)]">
            Receitas Pendentes
          </div>

          <div className="text-3xl font-bold text-yellow-400 mt-3">
            R$ {receitasPendentes}
          </div>

        </div>

      </div>

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