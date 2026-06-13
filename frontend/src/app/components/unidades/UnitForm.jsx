"use client";

import { useState, useEffect } from "react";

export default function UnitForm({
  unidade,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    locador: "",
    kitnets: "",
    aluguel: "",
    vencimento: "10",
    status: "Ativa",
    observacoes: "",
  });

  useEffect(() => {
    if (unidade) {
      setFormData({
        nome: unidade.nome || "",
        cep: unidade.cep || "",
        logradouro: unidade.logradouro || "",
        numero: unidade.numero || "",
        complemento: unidade.complemento || "",
        bairro: unidade.bairro || "",
        cidade: unidade.cidade || "",
        uf: unidade.uf || "",
        locador: unidade.locador || "",
        kitnets: unidade.kitnets || "",
        aluguel: unidade.aluguel || "",
        vencimento: unidade.vencimento || "10",
        status: unidade.status || "Ativa",
        observacoes: unidade.observacoes || "",
      });
    }
  }, [unidade]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4"
    >
      <input
        name="nome"
        placeholder="Nome da Unidade"
        value={formData.nome}
        onChange={handleChange}
        className="border rounded-lg p-3"
        required
      />

      <input
        name="cep"
        placeholder="CEP"
        value={formData.cep}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="logradouro"
        placeholder="Logradouro"
        value={formData.logradouro}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="numero"
        placeholder="Número"
        value={formData.numero}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="bairro"
        placeholder="Bairro"
        value={formData.bairro}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="cidade"
        placeholder="Cidade"
        value={formData.cidade}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="uf"
        placeholder="UF"
        value={formData.uf}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="locador"
        placeholder="Locador"
        value={formData.locador}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="kitnets"
        placeholder="Quantidade de Kitnets"
        value={formData.kitnets}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="aluguel"
        placeholder="Valor Aluguel"
        value={formData.aluguel}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <input
        name="vencimento"
        placeholder="Dia Vencimento"
        value={formData.vencimento}
        onChange={handleChange}
        className="border rounded-lg p-3"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="border rounded-lg p-3"
      >
        <option>Ativa</option>
        <option>Inativa</option>
        <option>Manutenção</option>
      </select>

      <textarea
        name="observacoes"
        placeholder="Observações"
        value={formData.observacoes}
        onChange={handleChange}
        className="col-span-2 border rounded-lg p-3 h-32"
      />

      <div className="col-span-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          {unidade
            ? "Salvar Alterações"
            : "Salvar Unidade"}
        </button>
      </div>
    </form>
  );
}