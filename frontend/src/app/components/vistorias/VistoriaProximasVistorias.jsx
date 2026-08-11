"use client";

export default function VistoriaProximasVistorias({
  vistorias,
}) {

  const proximas =
    [...vistorias]
      .filter(
        (vistoria) =>
          vistoria.dataProxima
      )
      .sort(
        (a, b) =>
          new Date(
            a.dataProxima
          ) -
          new Date(
            b.dataProxima
          )
      )
      .slice(0, 5);

  const calcularDias = (
    data
  ) => {

    const hoje =
      new Date();

    const futura =
      new Date(data);

    const diferenca =
      Math.ceil(
        (
          futura - hoje
        ) /
          (
            1000 *
            60 *
            60 *
            24
          )
      );

    return diferenca;

  };

  return (

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-white mb-6">

        Próximas Execuções

      </h2>

      {proximas.length ===
      0 ? (

        <p className="text-gray-300">
          Nenhuma vistoria cadastrada.
        </p>

      ) : (

        <div className="space-y-4">

          {proximas.map(
            (vistoria) => {

              const dias =
                calcularDias(
                  vistoria.dataProxima
                );

              return (

                <div
                  key={
                    vistoria.id
                  }
                  className="
                    border
                    border-white/10
                    rounded-2xl
                    p-5
                  "
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <h3 className="font-bold text-white text-lg">

                        {
                          vistoria.nomeVistoria
                        }

                      </h3>

                      <div className="text-gray-400 mt-1">

                        Responsável:
                        {" "}
                        {
                          vistoria.responsavel
                        }

                      </div>

                      <div className="text-gray-400">

                        Periodicidade:
                        {" "}
                        {
                          vistoria.periodicidade
                        }

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="font-semibold text-emerald-400">

                        {
                          vistoria.dataProxima
                        }

                      </div>

                      <div className="text-sm text-gray-400 mt-1">

                        {dias > 0
                          ? `${dias} dia(s)`
                          : "Vencida"}

                      </div>

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}