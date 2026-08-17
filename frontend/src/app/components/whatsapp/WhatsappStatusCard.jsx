"use client";

import {
  CheckCircle2,
  XCircle,
  Smartphone,
  Wifi,
  Clock
} from "lucide-react";

export default function WhatsappStatusCard({ dados }) {

  const conectado = dados?.conectado;

  return (

    <div
      className="
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[#101827]
        p-6
        shadow-xl
      "
    >

      <h2 className="mb-6 text-xl font-bold text-[var(--text)]">

        Status da Conexão

      </h2>

      <div className="space-y-5">

        <div className="flex items-center gap-3">

          {

            conectado ? (

              <CheckCircle2
                className="text-green-500"
                size={28}
              />

            ) : (

              <XCircle
                className="text-red-500"
                size={28}
              />

            )

          }

          <div>

            <p className="text-sm text-[var(--text-subtle)]">

              Situação

            </p>

            <p className="font-semibold text-[var(--text)]">

              {

                conectado

                  ? "Conectado"

                  : "Desconectado"

              }

            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          {

            dados?.configurado ? (

              <CheckCircle2
                className="text-green-500"
                size={22}
              />

            ) : (

              <XCircle
                className="text-yellow-500"
                size={22}
              />

            )

          }

          <div>

            <p className="text-sm text-[var(--text-subtle)]">

              Credenciais da API

            </p>

            <p className="font-semibold text-[var(--text)]">

              {

                dados?.configurado

                  ? "Configuradas"

                  : "Não configuradas"

              }

            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Smartphone
            size={22}
            className="text-green-500"
          />

          <div>

            <p className="text-sm text-[var(--text-subtle)]">

              Número

            </p>

            <p className="text-[var(--text)]">

              {

                dados?.numero ||

                "Não conectado"

              }

            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Wifi
            size={22}
            className="text-green-500"
          />

          <div>

            <p className="text-sm text-[var(--text-subtle)]">

              Provider

            </p>

            <p className="text-[var(--text)]">

              {

                dados?.provider ||

                "Meta Cloud API"

              }

            </p>

          </div>

        </div>

        <div className="flex items-center gap-3">

          <Clock
            size={22}
            className="text-green-500"
          />

          <div>

            <p className="text-sm text-[var(--text-subtle)]">

              Última sincronização

            </p>

            <p className="text-[var(--text)]">

              {

                dados?.ultimaSincronizacao ||

                "--"

              }

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}