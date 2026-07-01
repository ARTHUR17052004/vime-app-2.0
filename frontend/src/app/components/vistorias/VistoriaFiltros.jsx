"use client";

export default function VistoriaFiltros({
  filtroSelecionado,
  setFiltroSelecionado,
}) {

  const filtros = [
    "Todos",
    "Preventiva",
    "Corretiva",
    "Inspeção",
    "Limpeza",
    "Segurança",
    "Estrutural",
  ];

  return (

    <div className="flex gap-4 mb-8 flex-wrap">

      {filtros.map((filtro) => (

        <button
          key={filtro}
          onClick={() =>
            setFiltroSelecionado(
              filtro
            )
          }
          className={`px-5 py-3 rounded-2xl transition
          ${
            filtroSelecionado ===
            filtro
              ? "bg-green-700 text-white"
              : "bg-white text-gray-900 border"
          }`}
        >
          {filtro}
        </button>

      ))}

    </div>

  );

}