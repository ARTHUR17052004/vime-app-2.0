"use client";

import {
  FileSpreadsheet,
  FileBarChart,
  Download,
} from "lucide-react";

export default function ContratoRelatorios() {
  const relatorios = [
    {
      titulo: "Contratos Ativos",
      descricao:
        "Lista de contratos ativos",
    },

    {
      titulo: "Contratos Encerrados",
      descricao:
        "Histórico de contratos",
    },

    {
      titulo: "Inadimplência",
      descricao:
        "Contratos inadimplentes",
    },

    {
      titulo: "Receita Contratada",
      descricao:
        "Valor total contratado",
    },
  ];

  return (
    <div className="bg-white rounded-3xl shadow p-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">

          <FileBarChart className="w-6 h-6 text-blue-700" />

        </div>

        <div>

          <h2 className="text-2xl font-bold">
            Relatórios
          </h2>

          <p className="text-gray-500">
            Exportação futura PDF e Excel
          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-4">

        {relatorios.map((item) => (

          <div
            key={item.titulo}
            className="
              border
              rounded-2xl
              p-5
            "
          >

            <div className="flex justify-between items-center">

              <div>

                <div className="font-semibold">
                  {item.titulo}
                </div>

                <div className="text-sm text-gray-500">
                  {item.descricao}
                </div>

              </div>

              <FileSpreadsheet
                className="
                  w-6
                  h-6
                  text-green-700
                "
              />

            </div>

            <button
              className="
                mt-4
                flex
                items-center
                gap-2
                bg-green-700
                text-white
                px-4
                py-2
                rounded-xl
              "
            >
              <Download size={16} />
              Exportar
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}