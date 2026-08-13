"use client";

import { useEffect, useState } from "react";

import { UnidadeService } from "@/services/unidades.service";

export default function ResidenciaFiltro({
  value,
  onChange,
  className = "",
}) {
  const [residencias, setResidencias] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await UnidadeService.listar();
        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];
        setResidencias(lista);
      } catch (err) {
        console.error("Erro ao carregar residências para filtro:", err);
      }
    }

    carregar();
  }, []);

  return (
    <div
      className={`
        flex
        items-center

        h-14

        rounded-2xl

        border
        border-white/10

        bg-white/5

        px-5

        backdrop-blur-xl

        ${className}
      `}
    >
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          h-full

          bg-transparent

          outline-none

          text-white

          text-sm
        "
      >
        <option
          value=""
          style={{ backgroundColor: "#1d2833", color: "#fff" }}
        >
          Todas as residências
        </option>

        {residencias.map((residencia) => (
          <option
            key={residencia.id}
            value={residencia.id}
            style={{ backgroundColor: "#1d2833", color: "#fff" }}
          >
            {residencia.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
