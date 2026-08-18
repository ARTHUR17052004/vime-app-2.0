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
        border-[var(--border-token)]

        bg-[var(--surface-2)]

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

          text-[var(--text)]

          text-sm
        "
      >
        <option
          value=""
          style={{ backgroundColor: "#1d2833", color: "#020000" }}
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
