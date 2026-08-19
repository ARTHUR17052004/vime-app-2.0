"use client";

import { useEffect, useState } from "react";

import { InquilinoService } from "../../../services/inquilinos.service";

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
      inquilinoId: "",
    });

  const [inquilinos, setInquilinos] = useState([]);

  useEffect(() => {

    async function carregarInquilinos() {

      try {

        const resposta = await InquilinoService.listar();

        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

        setInquilinos(lista);

      } catch (err) {

        console.error("Erro ao carregar inquilinos:", err);

      }

    }

    carregarInquilinos();

  }, []);

  useEffect(() => {
    if (receitaEditando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...receitaEditando,
        inquilinoId: receitaEditando.inquilinoId || "",
      });
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

    onSave({
      id: formData.id,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor: formData.valor,
      status: formData.status,
      vencimento: formData.vencimento,
      dataPagamento: formData.dataPagamento,
      inquilinoId: formData.inquilinoId || null,
      contratoId: formData.contratoId || undefined,
    });
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

        <div>
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Inquilino (opcional — necessário pra enviar ao Asaas se não houver contrato)
          </label>
          <select
            name="inquilinoId"
            value={formData.inquilinoId}
            onChange={handleChange}
            className={inputStyle}
          >
            <option value="">Nenhum (vinculado só pelo contrato, se houver)</option>
            {inquilinos.map((inq) => (
              <option key={inq.id} value={inq.id}>
                {inq.nome}
              </option>
            ))}
          </select>
        </div>

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