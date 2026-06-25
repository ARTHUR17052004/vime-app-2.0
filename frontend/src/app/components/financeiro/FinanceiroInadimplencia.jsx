"use client";

export default function FinanceiroInadimplencia({
  receitas,
}) {

  const inadimplentes = receitas.filter(
    (item) =>
      item.status === "Atrasado"
  );

  const totalEmAberto = inadimplentes.reduce(
    (total, item) =>
      total + Number(item.valor || 0),
    0
  );

  const pendentes = receitas.filter(
    (item) =>
      item.status === "Pendente"
  ).length;

  return (
    <div className="bg-white rounded-3xl shadow p-6">

      <h2 className="text-2xl font-bold mb-6">
        Inadimplência
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="border rounded-2xl p-5">

          <div className="text-gray-500">
            Total em Aberto
          </div>

          <div className="text-3xl font-bold text-red-600 mt-3">
            R$ {totalEmAberto}
          </div>

        </div>

        <div className="border rounded-2xl p-5">

          <div className="text-gray-500">
            Pendentes
          </div>

          <div className="text-3xl font-bold text-yellow-600 mt-3">
            {pendentes}
          </div>

        </div>

        <div className="border rounded-2xl p-5">

          <div className="text-gray-500">
            Atrasados
          </div>

          <div className="text-3xl font-bold text-red-600 mt-3">
            {inadimplentes.length}
          </div>

        </div>

      </div>

      {inadimplentes.length === 0 ? (

        <div className="text-gray-500">
          Nenhum inadimplente encontrado.
        </div>

      ) : (

        <div className="space-y-4">

          {inadimplentes.map((item) => (

            <div
              key={item.id}
              className="border rounded-2xl p-5"
            >

              <div className="font-semibold text-lg">
                {item.unidade || item.descricao}
              </div>

              <div className="text-gray-500 mt-1">
                {item.categoria}
              </div>

              <div className="font-bold text-red-600 mt-3">
                R$ {item.valor}
              </div>

              <div className="text-red-500 mt-2">
                Status: {item.status}
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}