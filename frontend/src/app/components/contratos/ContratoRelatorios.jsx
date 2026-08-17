"use client";

import {
  FileSpreadsheet,
  FileBarChart,
  Download,
} from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";

export default function ContratoRelatorios() {

  const relatorios = [
    {
      titulo: "Contratos Ativos",
      descricao: "Lista de contratos ativos",
    },
    {
      titulo: "Contratos Encerrados",
      descricao: "Histórico de contratos",
    },
    {
      titulo: "Receita Contratada",
      descricao: "Valor total contratado",
    },
  ];

  return (

    <DashboardCard>

      {/* HEADER */}

      <div className="flex items-center gap-4 mb-8">

        <div
          className="
            w-14
            h-14

            rounded-2xl

            flex
            items-center
            justify-center

            bg-emerald-500/10

            border
            border-emerald-500/20
          "
        >

          <FileBarChart
            size={28}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-[var(--text)]
            "
          >
            Relatórios
          </h2>

          <p className="text-[var(--text-subtle)]">
            Exportação de PDF e Excel (em breve)
          </p>

        </div>

      </div>

      {/* CARDS */}

      <div className="grid md:grid-cols-2 gap-6">

        {relatorios.map((item) => (

          <div
            key={item.titulo}
            className="
              rounded-2xl

              border
              border-[var(--border-token)]

              bg-[var(--surface-2)]

              p-6

              transition-all
              duration-300

              hover:bg-[var(--surface-2)]
              hover:-translate-y-1
            "
          >

            <div className="flex justify-between items-start">

              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                    text-[var(--text)]
                  "
                >
                  {item.titulo}
                </h3>

                <p className="mt-2 text-[var(--text-subtle)]">
                  {item.descricao}
                </p>

              </div>

              <div
                className="
                  w-12
                  h-12

                  rounded-2xl

                  flex
                  items-center
                  justify-center

                  bg-emerald-500/10

                  border
                  border-emerald-500/20
                "
              >

                <FileSpreadsheet
                  size={22}
                  className="text-emerald-400"
                />

              </div>

            </div>

            <button
              className="
                mt-8

                flex
                items-center
                gap-2

                rounded-xl

                border
                border-emerald-500/20

                bg-emerald-500/10

                px-5
                py-3

                text-sm
                font-semibold

                text-emerald-400

                transition-all
                duration-300

                hover:bg-emerald-500/20
              "
            >

              <Download size={16} />

              Exportar

            </button>

          </div>

        ))}

      </div>

    </DashboardCard>

  );

}