"use client";

import { formatDate } from "@/utils/formatDate";

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

    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

      <h2 className="text-2xl font-bold text-[var(--text)] mb-6">

        Próximas Execuções

      </h2>

      {proximas.length ===
      0 ? (

        <p className="text-[var(--text-muted)]">
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
                    border-[var(--border-token)]
                    rounded-2xl
                    p-5
                  "
                >

                  <div className="flex justify-between items-start">

                    <div>

                      <h3 className="font-bold text-[var(--text)] text-lg">

                        {
                          vistoria.nomeVistoria
                        }

                      </h3>

                      <div className="text-[var(--text-subtle)] mt-1">

                        Responsável:
                        {" "}
                        {
                          vistoria.responsavel
                        }

                      </div>

                      <div className="text-[var(--text-subtle)]">

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
                          formatDate(vistoria.dataProxima)
                        }

                      </div>

                      <div className="text-sm text-[var(--text-subtle)] mt-1">

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