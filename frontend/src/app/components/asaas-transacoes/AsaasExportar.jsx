export default function AsaasExportar() {
  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] p-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h2 className="text-xl font-bold text-white">
            Exportação
          </h2>

          <p className="text-gray-400 mt-1">
            Exporte as cobranças para análise externa.
          </p>

        </div>

        <div className="flex gap-4">

          <button
            className="
            border
            border-white/[0.07]
            text-gray-200
            rounded-xl
            px-6
            py-3
            hover:bg-white/5
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