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

  );

}