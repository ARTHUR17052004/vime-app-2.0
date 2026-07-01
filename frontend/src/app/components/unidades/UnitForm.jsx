"use client";

import { useState, useEffect } from "react";

export default function UnitForm({
  unidade,
  onSave,
  onCancel,
}) {
  const initialState = {
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
  };

  const [formData, setFormData] = useState(initialState);

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
    } else {
      setFormData(initialState);
    }
  }, [unidade]);

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    console.log("Buscando CEP:", cepLimpo);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      console.log("Resposta ViaCEP:", data);

      if (data.erro) {
        console.log("CEP não encontrado.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
      }));

      console.log("Campos preenchidos.");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "cep") {
      buscarCep(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

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
        className={inputStyle}
        required
      />

      <input
        name="cep"
        placeholder="CEP"
        value={formData.cep}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="logradouro"
        placeholder="Logradouro"
        value={formData.logradouro}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="numero"
        placeholder="Número"
        value={formData.numero}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="bairro"
        placeholder="Bairro"
        value={formData.bairro}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="cidade"
        placeholder="Cidade"
        value={formData.cidade}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="uf"
        placeholder="UF"
        value={formData.uf}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="locador"
        placeholder="Locador"
        value={formData.locador}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="kitnets"
        placeholder="Quantidade de Kitnets"
        value={formData.kitnets}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="aluguel"
        placeholder="Valor Aluguel"
        value={formData.aluguel}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="vencimento"
        placeholder="Dia Vencimento"
        value={formData.vencimento}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="Ativa">Ativa</option>
        <option value="Inativa">Inativa</option>
        <option value="Manutenção">Manutenção</option>
      </select>

      <textarea
        name="observacoes"
        placeholder="Observações"
        value={formData.observacoes}
        onChange={handleChange}
        className="col-span-2 border border-gray-300 rounded-xl p-3 h-32 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />

      <div className="col-span-2 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {unidade
            ? "Salvar Alterações"
            : "Salvar Unidade"}
        </button>
      </div>
    </form>
  );
}