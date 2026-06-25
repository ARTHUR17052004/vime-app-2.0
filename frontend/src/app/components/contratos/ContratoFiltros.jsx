"use client";

export default function ContratoFiltros({
  filtroSelecionado,
  setFiltroSelecionado,
}) {
  const filtros = [
    "Todos",
    "Ativos",
    "Pendentes",
    "Inadimplentes",
    "Encerrados",
  ];

  return (
    <div className="bg-white rounded-3xl shadow p-6 mb-8">

      <h2 className="text-xl font-bold mb-5">
        Filtros
      </h2>

      <div className="flex gap-3 flex-wrap">

        {filtros.map((filtro) => (

          <button
            key={filtro}
            onClick={() =>
              setFiltroSelecionado(
                filtro
              )
            }
            className={`
              px-5
              py-2
              rounded-2xl
              transition

              ${
                filtroSelecionado ===
                filtro
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {filtro}
          </button>

        ))}

      </div>

    </div>
  );
}