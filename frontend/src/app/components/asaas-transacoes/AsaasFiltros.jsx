"use client";

import { useState } from "react";

const FILTROS_INICIAIS = {
  busca: "",
  status: "Todos",
  forma: "Todas",
  periodo: "",
};

export default function AsaasFiltros({ onFiltrar, onLimpar }) {

  const [filtros, setFiltros] =
    useState(FILTROS_INICIAIS);

  const handleChange = (campo) => (e) => {
    setFiltros((atual) => ({
      ...atual,
      [campo]: e.target.value,
    }));
  };

  const aplicarFiltros = () => {
    onFiltrar?.(filtros);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
    onLimpar?.();
  };

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-[var(--text)]">
            Filtros
          </h2>

          <p className="text-[var(--text-subtle)] mt-1">
            Localize rapidamente qualquer cobrança.
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">

        <div className="xl:col-span-2">

          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Pesquisar
          </label>

          <input
            type="text"
            value={filtros.busca}
            onChange={handleChange("busca")}
            onKeyDown={(e) => e.key === "Enter" && aplicarFiltros()}
            placeholder="Cliente, cobrança..."
            className="w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Status
          </label>

          <select
            value={filtros.status}
            onChange={handleChange("status")}
            className="w-full border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
          >

            <option className="bg-[#1b2430]">Todos</option>
            <option className="bg-[#1b2430]">Recebido</option>
            <option className="bg-[#1b2430]">Pendente</option>
            <option className="bg-[#1b2430]">Atrasado</option>
            <option className="bg-[#1b2430]">Cancelado</option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Forma
          </label>

          <select
            value={filtros.forma}
            onChange={handleChange("forma")}
            className="w-full border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
          >

            <option className="bg-[#1b2430]">Todas</option>
            <option className="bg-[#1b2430]">PIX</option>
            <option className="bg-[#1b2430]">Boleto</option>
            <option className="bg-[#1b2430]">Cartão</option>

          </select>

        </div>

        <div>

          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Vencimento até
          </label>

          <input
            type="date"
            value={filtros.periodo}
            onChange={handleChange("periodo")}
            className="w-full rounded-xl p-3"
          />

        </div>

        <div className="flex items-end gap-3">

          <button
            onClick={aplicarFiltros}
            className="
              flex-1
              bg-green-700
              hover:bg-green-800
              text-[var(--text)]
              rounded-xl
              py-3
            "
          >
            Filtrar
          </button>

          <button
            onClick={limparFiltros}
            className="
              flex-1
              border
              border-[var(--border-token)]
              text-[var(--text-1)]
              hover:bg-[var(--surface-2)]
              rounded-xl
              py-3
            "
          >
            Limpar
          </button>

        </div>

      </div>

    </div>
  );
}
