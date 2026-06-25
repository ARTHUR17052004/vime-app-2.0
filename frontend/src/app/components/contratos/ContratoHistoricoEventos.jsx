"use client";

export default function ContratoHistoricoEventos({
  contrato,
}) {

  const eventos = JSON.parse(
    localStorage.getItem(
      "vime-eventos-contrato"
    ) || "[]"
  );

  const eventosContrato =
    eventos.filter(
      (evento) =>
        String(
          evento.contratoId
        ) ===
        String(
          contrato.id
        )
    );

  return (
    <div className="bg-white rounded-3xl shadow p-8">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Histórico de Eventos
      </h2>

      {eventosContrato.length === 0 ? (

        <div className="text-gray-500">
          Nenhum evento encontrado.
        </div>

      ) : (

        <div className="space-y-4">

          {eventosContrato.map(
            (evento) => (

              <div
                key={evento.id}
                className="
                  border
                  rounded-2xl
                  p-5
                "
              >

                <div
                  className={
                    evento.cor
                  }
                >
                  {evento.titulo}
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  {evento.data}
                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}