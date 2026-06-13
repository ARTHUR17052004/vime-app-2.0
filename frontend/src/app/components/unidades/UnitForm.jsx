"use client";

import { useState, useEffect } from "react";

export default function UnitForm({
  unidade,
  onSave,
  onCancel,
}) {
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [kitnets, setKitnets] = useState("");
  const [status, setStatus] = useState("Ativa");

  useEffect(() => {
    if (unidade) {
      setNome(unidade.nome || "");
      setCidade(unidade.cidade || "");
      setUf(unidade.uf || "");
      setKitnets(unidade.kitnets || "");
      setStatus(unidade.status || "Ativa");
    } else {
      setNome("");
      setCidade("");
      setUf("");
      setKitnets("");
      setStatus("Ativa");
    }
  }, [unidade]);

  function handleSubmit(e) {
    e.preventDefault();

    onSave({
      nome,
      cidade,
      uf,
      kitnets,
      status,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4"
    >
      <input
        type="text"
        placeholder="Nome da Unidade"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="border rounded-lg p-3"
        required
      />

      <input
        type="text"
        placeholder="Cidade"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        className="border rounded-lg p-3"
        required
      />

      <input
        type="text"
        placeholder="UF"
        value={uf}
        onChange={(e) => setUf(e.target.value)}
        className="border rounded-lg p-3"
        required
      />

      <input
        type="number"
        placeholder="Quantidade de Kitnets"
        value={kitnets}
        onChange={(e) => setKitnets(e.target.value)}
        className="border rounded-lg p-3"
        required
      />

      <div className="col-span-2">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Status da Unidade
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-lg p-3"
        >
          <option value="Ativa">
            Ativa
          </option>

          <option value="Inativa">
            Inativa
          </option>

          <option value="Manutenção">
            Manutenção
          </option>
        </select>
      </div>

      <div className="col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {unidade
            ? "Salvar Alterações"
            : "Salvar Unidade"}
        </button>
      </div>
    </form>
  );
}