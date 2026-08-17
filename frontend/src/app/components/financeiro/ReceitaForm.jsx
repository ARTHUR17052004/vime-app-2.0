"use client";

import { useEffect, useState } from "react";

export default function ReceitaForm({
  onSave,
  receitaEditando,
}) {
  const [formData, setFormData] =
    useState({
      categoria: "Aluguel",
      descricao: "",
      valor: "",
      status: "PENDENTE",
      vencimento: "",
      dataPagamento: "",
    });

  useEffect(() => {
    if (receitaEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(receitaEditando);
    }
  }, [receitaEditando]);

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
    "border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-[var(--text)]">
        {receitaEditando
          ? "Editar Receita"
          : "Nova Receita"}
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className={inputStyle}
        >
          <option>Aluguel</option>
          <option>Multa</option>
          <option>Taxa</option>
          <option>Outros</option>
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
          required
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className={inputStyle}
        >
          <option value="PENDENTE">Pendente</option>
          <option value="PAGA">Pago</option>
          <option value="ATRASADA">Atrasado</option>
        </select>

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
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
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
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
            text-[var(--text)]
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