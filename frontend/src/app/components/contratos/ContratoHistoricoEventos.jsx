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
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">
        Histórico de Eventos
      </h2>

      {eventosContrato.length === 0 ? (

        <div className="text-gray-400">
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
                  border-white/10
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

                <div className="text-sm text-gray-400 mt-2">
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