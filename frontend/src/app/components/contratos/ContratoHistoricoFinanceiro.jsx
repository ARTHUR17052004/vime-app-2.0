"use client";

export default function ContratoHistoricoFinanceiro({
  contratoId,
}) {

  const receitas = JSON.parse(
    localStorage.getItem(
      "vime-receitas"
    ) || "[]"
  );

  const receitasContrato =
    receitas.filter(
      (receita) =>
        String(
          receita.contratoId
        ) === String(
          contratoId
        )
    );

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">
        Histórico Financeiro
      </h2>

      {receitasContrato.length === 0 ? (

        <div className="text-gray-400">
          Nenhuma movimentação encontrada.
        </div>

      ) : (

        <div className="space-y-4">

          {receitasContrato.map(
            (receita) => (

              <div
                key={receita.id}
                className="
                  border
                  border-white/10
                  rounded-2xl
                  p-5
                  flex
                  justify-between
                  items-center
                "
              >

                <div>

                  <h3 className="font-semibold text-white">
                    {receita.descricao}
                  </h3>

                  <div className="text-sm text-gray-400">
                    {receita.categoria}
                  </div>

                </div>

                <div className="text-right">

                  <div className="font-bold text-green-700">
                    R$ {receita.valor}
                  </div>

                  <div
                    className={`
                      text-sm
                      ${
                        receita.status ===
                        "Pago"
                          ? "text-green-600"
                          : "text-orange-600"
                      }
                    `}
                  >
                    {receita.status}
                  </div>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}