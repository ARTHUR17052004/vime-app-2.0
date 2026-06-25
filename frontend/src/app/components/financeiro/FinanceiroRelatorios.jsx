"use client";

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
    <div className="bg-white rounded-3xl shadow p-6">

      <h2 className="text-2xl font-bold mb-8">
        Relatórios
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="border rounded-3xl p-6">

          <h3 className="text-xl font-bold mb-3">
            Relatório PDF
          </h3>

          <p className="text-gray-500 mb-6">
            Exportar receitas,
            despesas e fluxo de caixa.
          </p>

          <button
            onClick={exportarPDF}
            className="
              bg-red-600
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Exportar PDF
          </button>

        </div>

        <div className="border rounded-3xl p-6">

          <h3 className="text-xl font-bold mb-3">
            Relatório Excel
          </h3>

          <p className="text-gray-500 mb-6">
            Exportar planilhas financeiras.
          </p>

          <button
            onClick={exportarExcel}
            className="
              bg-green-700
              text-white
              px-6
              py-3
              rounded-xl
            "
          >
            Exportar Excel
          </button>

        </div>

      </div>

    </div>
  );
}