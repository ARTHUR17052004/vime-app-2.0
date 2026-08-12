"use client";

import Button from "../ui/Button";

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

    <div
      className="
        rounded-3xl
        border
        border-white/10
        bg-slate-900/80
        backdrop-blur-xl
        p-6
        shadow-xl
      "
    >

      <h2
        className="
          text-xl
          font-bold
          text-white
          mb-5
        "
      >
        Categoria
      </h2>

      <div className="flex flex-wrap gap-3">

      {filtros.map((filtro) => (

        <Button
          key={filtro}
          type="button"
          onClick={() =>
            setFiltroSelecionado(filtro)
          }
          variant={
            filtroSelecionado === filtro
              ? "primary"
              : "secondary"
          }
        >
          {filtro}
        </Button>

      ))}

      </div>

    </div>

  );

}