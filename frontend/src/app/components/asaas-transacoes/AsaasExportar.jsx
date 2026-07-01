export default function AsaasExportar() {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            Exportação
          </h2>

          <p className="text-gray-500 mt-1">
            Exporte as cobranças para análise externa.
          </p>

        </div>

        <div className="flex gap-4">

          <button
            className="
            border
            border-gray-300
            rounded-xl
            px-6
            py-3
            hover:bg-gray-100
            "
          >
            Exportar Excel
          </button>

          <button
            className="
            bg-red-600
            hover:bg-red-700
            text-white
            rounded-xl
            px-6
            py-3
            "
          >
            Exportar PDF
          </button>

        </div>

      </div>

    </div>
  );
}