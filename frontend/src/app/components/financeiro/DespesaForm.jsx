"use client";

import { useEffect, useState } from "react";

export default function DespesaForm({
  onSave,
  despesaEditando,
}) {
  const [formData, setFormData] =
    useState({
      categoria:
        "Manutenção e Reparos",

      descricao: "",

      valor: "",

      status: "PAGO",

      vencimento: "",

      dataPagamento: "",
    });

  useEffect(() => {
    if (despesaEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(despesaEditando);
    }
  }, [despesaEditando]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);
  };

  const inputStyle =
    "border border-gray-300 rounded-xl p-3 w-full";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold">
        {despesaEditando
          ? "Editar Despesa"
          : "Nova Despesa"}
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className={inputStyle}
        >
          <option>Manutenção e Reparos</option>
          <option>Impostos e Taxas</option>
          <option>Seguros</option>
          <option>Pessoal</option>
          <option>Condomínio</option>
          <option>Administrativo</option>
          <option>Marketing</option>
          <option>Reformas</option>
          <option>Financeiras</option>
          <option>Depreciação</option>
          <option>Devolução de Caução</option>
        </select>

        <input
          name="descricao"
          placeholder="Descrição"
          value={formData.descricao}
          onChange={handleChange}
          className={inputStyle}
          required
        />

        <input
          name="valor"
          placeholder="Valor"
          value={formData.valor}
          onChange={handleChange}
          className={inputStyle}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputStyle}
        >
          <option value="PAGO">Pago</option>
          <option value="PENDENTE">Pendente</option>
        </select>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">
            Vencimento
          </label>
          <input
            type="date"
            name="vencimento"
            value={formData.vencimento}
            onChange={handleChange}
            className={`${inputStyle} w-full`}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">
            Data de Pagamento
          </label>
          <input
            type="date"
            name="dataPagamento"
            value={formData.dataPagamento}
            onChange={handleChange}
            className={`${inputStyle} w-full`}
          />
        </div>

      </div>

      <div className="flex justify-end">
        <button
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-xl
          "
        >
          Salvar
        </button>
      </div>

    </form>
  );
}