"use client";

import {
  FileBarChart,
  FileSpreadsheet,
  Download,
} from "lucide-react";

import Table from "../ui/Table";

export default function FinanceiroRelatorios({
  receitas,
  despesas,
}) {

  const exportarPDF = () => {
    alert(
      "Em breve: exportação PDF."
    );
  };

  const exportarExcel = () => {
    alert(
      "Em breve: exportação Excel."
    );
  };

  return (

    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-blue-500/10

              border
              border-blue-500/20

              flex
              items-center
              justify-center
            "
          >

            <FileBarChart className="w-6 h-6 text-blue-400" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-white">
              Relatórios
            </h2>

            <p className="text-gray-400">
              Exportação de informações financeiras.
            </p>

          </div>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 p-6">

        <div
          className="
            rounded-2xl

            border
            border-white/10

            bg-white/[0.02]

            p-6

            hover:bg-white/[0.04]

            transition
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <FileBarChart className="w-6 h-6 text-red-400" />

            <h3 className="text-xl font-semibold text-white">
              Relatório PDF
            </h3>

          </div>

          <p className="text-gray-400 mb-6">
            Exportar receitas, despesas e fluxo de caixa.
          </p>

          <button
            onClick={exportarPDF}
            className="
              flex
              items-center
              gap-2

              rounded-xl

              bg-red-500/15

              border
              border-red-500/20

              px-5
              py-3

              text-red-400

              hover:bg-red-500/25

              transition
            "
          >

            <Download size={18} />

            Exportar PDF

          </button>

        </div>

        <div
          className="
            rounded-2xl

            border
            border-white/10

            bg-white/[0.02]

            p-6

            hover:bg-white/[0.04]

            transition
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />

            <h3 className="text-xl font-semibold text-white">
              Relatório Excel
            </h3>

          </div>

          <p className="text-gray-400 mb-6">
            Exportar planilhas financeiras.
          </p>

          <button
            onClick={exportarExcel}
            className="
              flex
              items-center
              gap-2

              rounded-xl

              bg-emerald-500/15

              border
              border-emerald-500/20

              px-5
              py-3

              text-emerald-400

              hover:bg-emerald-500/25

              transition
            "
          >

            <Download size={18} />

            Exportar Excel

          </button>

        </div>

      </div>

    </Table>

  );

}