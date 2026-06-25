/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";

export default function ContratoForm({
  onSave,
  contratoEditando,
}) {
  const [inquilinos, setInquilinos] =
    useState([]);

  const [formData, setFormData] =
    useState({
      numeroContrato: "",

      inquilinoId: "",

      dataInicio: "",
      dataFim: "",

      valorAluguel: "",

      diaVencimento: "",

      tipoGarantia: "",
      valorCaucao: "",

      indiceReajuste: "",

      status: "ATIVO",

      observacoes: "",
    });

  useEffect(() => {
    const dados = JSON.parse(
      localStorage.getItem(
        "vime-inquilinos"
      ) || "[]"
    );

    setInquilinos(dados);
  }, []);

  useEffect(() => {
    if (!contratoEditando) return;

    setFormData((prev) => ({
      ...prev,
      ...contratoEditando,
    }));
  }, [contratoEditando]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const inquilino = inquilinos.find(
      (i) =>
        String(i.id) ===
        String(formData.inquilinoId)
    );

    onSave({
      ...formData,

      inquilinoNome:
        inquilino?.nome || "",

      kitnetNome:
        inquilino?.kitnetNome || "",

      unidadeNome:
        inquilino?.unidadeNome || "",
    });
  };

  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500";
    
 return (
  <form
    onSubmit={handleSubmit}
    className="space-y-8"
  >
    <div>
      <h2 className="text-2xl font-bold text-gray-800">
        {contratoEditando
          ? "Editar Contrato"
          : "Novo Contrato"}
      </h2>

      <p className="text-gray-500 mt-1">
        Dados do contrato
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-4">

      <input
        name="numeroContrato"
        placeholder="Número do Contrato"
        value={formData.numeroContrato}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="inquilinoId"
        value={formData.inquilinoId}
        onChange={handleChange}
        className={inputStyle}
        required
      >
        <option value="">
          Selecione um Inquilino
        </option>

        {inquilinos.map((inquilino) => (
          <option
            key={inquilino.id}
            value={inquilino.id}
          >
            {inquilino.nome}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="valorAluguel"
        placeholder="Valor do Aluguel"
        value={formData.valorAluguel}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        type="date"
        name="dataInicio"
        value={formData.dataInicio}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        type="date"
        name="dataFim"
        value={formData.dataFim}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        type="number"
        name="diaVencimento"
        placeholder="Dia do vencimento"
        value={formData.diaVencimento}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="tipoGarantia"
        value={formData.tipoGarantia}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="">
          Tipo Garantia
        </option>

        <option value="CAUCAO">
          Caução
        </option>

        <option value="FIADOR">
          Fiador
        </option>

        <option value="SEGURO_FIANCA">
          Seguro Fiança
        </option>
      </select>

      <input
        type="number"
        name="valorCaucao"
        placeholder="Valor Caução"
        value={formData.valorCaucao}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="indiceReajuste"
        placeholder="Índice de reajuste"
        value={formData.indiceReajuste}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="ATIVO">
          Ativo
        </option>

        <option value="PENDENTE">
          Pendente
        </option>

        <option value="INADIMPLENTE">
          Inadimplente
        </option>

        <option value="ENCERRADO">
          Encerrado
        </option>
      </select>

    </div>

    <textarea
      name="observacoes"
      placeholder="Observações"
      value={formData.observacoes}
      onChange={handleChange}
      className={`${inputStyle} w-full min-h-[120px]`}
    />

    <div className="flex justify-end">
      <button
        type="submit"
        className="
          bg-green-700
          text-white
          px-6
          py-3
          rounded-lg
          hover:bg-green-800
        "
      >
        {contratoEditando
          ? "Salvar Alterações"
          : "Salvar Contrato"}
      </button>
    </div>

  </form>
);
}