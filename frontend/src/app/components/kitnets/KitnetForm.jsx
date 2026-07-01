"use client";

import { useEffect, useState } from "react";

export default function KitnetForm({
  onSave,
  kitnet,
}) {
  const [unidades, setUnidades] = useState([]);

  const [formData, setFormData] = useState({
    nome: "",
    unidadeId: "",
    unidadeNome: "",
    metragem: "",
    status: "Disponível",
    aluguel: "",
    numero: "",
  });

  useEffect(() => {
    const unidadesSalvas = JSON.parse(
      localStorage.getItem("vime-unidades") || "[]"
    );

    setUnidades(unidadesSalvas);
  }, []);

  useEffect(() => {
    if (kitnet) {
      setFormData({
        nome: kitnet.nome || "",
        unidadeId: kitnet.unidadeId || "",
        unidadeNome: kitnet.unidadeNome || "",
        metragem: kitnet.metragem || "",
        status: kitnet.status || "Disponível",
        aluguel: kitnet.aluguel || "",
        numero: kitnet.numero || "",
      });
    } else {
      setFormData({
        nome: "",
        unidadeId: "",
        unidadeNome: "",
        metragem: "",
        status: "Disponível",
        aluguel: "",
        numero: "",
      });
    }
  }, [kitnet]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "unidadeId") {
      const unidadeSelecionada = unidades.find(
        (u) => String(u.id) === value
      );

      setFormData((prev) => ({
        ...prev,
        unidadeId: value,
        unidadeNome: unidadeSelecionada?.nome || "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);
  };

  const inputStyle =
    "border border-gray-300 rounded-xl p-3 text-gray-900 placeholder:text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4"
    >
      <input
        name="nome"
        placeholder="Nome da Kitnet"
        value={formData.nome}
        onChange={handleChange}
        className={inputStyle}
        required
      />

      <select
        name="unidadeId"
        value={formData.unidadeId}
        onChange={handleChange}
        className={inputStyle}
        required
      >
        <option value="">
          Selecione uma Unidade
        </option>

        {unidades.map((unidade) => (
          <option
            key={unidade.id}
            value={unidade.id}
          >
            {unidade.nome}
          </option>
        ))}
      </select>

      <input
        name="metragem"
        placeholder="Metragem (m²)"
        value={formData.metragem}
        onChange={handleChange}
        className={inputStyle}
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className={inputStyle}
      >
        <option value="Disponível">
          Disponível
        </option>

        <option value="Ocupada">
          Ocupada
        </option>

        <option value="Manutenção">
          Manutenção
        </option>
      </select>

      <input
        name="aluguel"
        placeholder="Valor do aluguel"
        value={formData.aluguel}
        onChange={handleChange}
        className={inputStyle}
      />

      <input
        name="numero"
        placeholder="Número da Kitnet"
        value={formData.numero}
        onChange={handleChange}
        className={inputStyle}
      />

      <div className="col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="submit"
          className="
            bg-green-600
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-green-700
            transition
          "
        >
          {kitnet
            ? "Salvar Alterações"
            : "Salvar Kitnet"}
        </button>
      </div>
    </form>
  );
}