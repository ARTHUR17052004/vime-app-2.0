"use client";

export default function SolicitacaoProximas({
  solicitacoes = [],
}) {

  const proximas = [...solicitacoes]
    .filter(
      (item) =>
        item.status !== "CONCLUIDA" &&
        item.status !== "CANCELADA" &&
        item.prazo
    )
    .sort(
      (a, b) =>
        new Date(a.prazo) -
        new Date(b.prazo)
    )
    .slice(0, 5);

  return (

    <div className="bg-white rounded-3xl shadow border p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            Próximos Prazos
          </h2>

          <p className="text-gray-500 mt-1">
            Solicitações com vencimento mais próximo
          </p>

        </div>

      </div>

      {proximas.length === 0 ? (

        <div className="text-center py-10 text-gray-500">
          Nenhuma solicitação com prazo definido.
        </div>

      ) : (

        <div className="space-y-4 max-h-[400px] overflow-y-auto">

          {proximas.map((item) => (

            <div
              key={item.id}
              className="
                border
                rounded-2xl
                p-5
                hover:shadow
                transition
              "
            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-sm text-gray-500">
                    {item.numero}
                  </p>

                  <h3 className="font-bold text-lg text-gray-900 mt-1">
                    {item.titulo}
                  </h3>

                </div>

                <span className="text-sm bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full">
                  {item.prioridade}
                </span>

              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">

                <div>

                  <p className="text-sm text-gray-500">
                    Responsável
                  </p>

                  <p className="font-semibold">
                    {item.responsavel}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Prazo
                  </p>

                  <p className="font-semibold">
                    {item.prazo}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="font-semibold">
                    {item.status}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}