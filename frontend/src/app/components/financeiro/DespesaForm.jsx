"use client";

import { useEffect, useState } from "react";

import { UnidadeService } from "@/services/unidades.service";

export default function DespesaForm({
  onSave,
  despesaEditando,
}) {
  const [residencias, setResidencias] = useState([]);

  const [formData, setFormData] =
    useState({
      categoria:
        "Manutenção e Reparos",

      descricao: "",

      valor: "",

      status: "PAGO",

      vencimento: "",

      dataPagamento: "",

      unidadeId: "",
    });

  useEffect(() => {
    async function carregarResidencias() {
      try {
        const resposta = await UnidadeService.listar();
        setResidencias(
          Array.isArray(resposta) ? resposta : resposta.data || []
        );
      } catch (err) {
        console.error("Erro ao carregar residências:", err);
      }
    }

    carregarResidencias();
  }, []);

  useEffect(() => {
    if (despesaEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        unidadeId: "",
        ...despesaEditando,
      });
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
    "border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-[var(--text)]">
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

        <select
          name="unidadeId"
          value={formData.unidadeId || ""}
          onChange={handleChange}
          className={inputStyle}
        >
          <option value="">Residência (opcional)</option>
          {residencias.map((residencia) => (
            <option key={residencia.id} value={residencia.id}>
              {residencia.nome}
            </option>
          ))}
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