"use client";

import { useEffect, useState } from "react";

export default function ReceitaForm({
  onSave,
  receitaEditando,
}) {
  const [formData, setFormData] =
    useState({
      unidade: "",
      categoria: "Aluguel",
      descricao: "",
      valor: "",
      status: "Pendente",
      dataVencimento: "",
      dataPagamento: "",
      observacoes: "",
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
    "border border-gray-300 rounded-xl p-3 w-full";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold">
        {receitaEditando
          ? "Editar Receita"
          : "Nova Receita"}
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <input
          name="unidade"
          placeholder="Unidade"
          value={formData.unidade}
          onChange={handleChange}
          className={inputStyle}
          required
        />

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
          <option>Pendente</option>
          <option>Pago</option>
          <option>Atrasado</option>
        </select>

        <input
          type="date"
          name="dataVencimento"
          value={formData.dataVencimento}
          onChange={handleChange}
          className={inputStyle}
        />

        <input
          type="date"
          name="dataPagamento"
          value={formData.dataPagamento}
          onChange={handleChange}
          className={inputStyle}
        />

      </div>

      <textarea
        name="observacoes"
        placeholder="Observações"
        value={formData.observacoes}
        onChange={handleChange}
        className={`${inputStyle} min-h-[120px]`}
      />

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