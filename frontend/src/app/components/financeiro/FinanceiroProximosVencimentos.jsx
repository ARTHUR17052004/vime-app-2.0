"use client";

export default function FinanceiroProximosVencimentos({
  receitas,
}) {

  const hoje = new Date();

  const vencimentos = receitas.filter(
    (item) => item.status !== "Pago"
  );

  return (
    <div className="bg-white rounded-3xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Próximos Vencimentos
      </h2>

      {vencimentos.length === 0 ? (

        <div className="text-gray-500">
          Nenhum vencimento pendente.
        </div>

      ) : (

        <div className="space-y-4">

          {vencimentos.map((item) => (

            <div
              key={item.id}
              className="
                border
                rounded-2xl
                p-5
                flex
                justify-between
                items-center
              "
            >

              <div>

                <div className="font-semibold text-lg">
                  {item.unidade || item.descricao}
                </div>

                <div className="text-gray-500 text-sm">
                  {item.categoria}
                </div>

                <div className="text-gray-500 text-sm">
                  Vencimento:
                  {" "}
                  {item.dataVencimento || "-"}
                </div>

              </div>

              <div className="text-right">

                <div className="font-bold text-xl text-green-700">
                  R$ {item.valor}
                </div>

                <div
                  className={`
                    text-sm
                    ${
                      item.status === "Atrasado"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  `}
                >
                  {item.status}
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}