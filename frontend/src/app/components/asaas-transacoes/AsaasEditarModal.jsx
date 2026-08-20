"use client";

import { useEffect, useState } from "react";

import Modal from "../ui/Modal";

const inputStyle =
  "border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3 w-full";

const labelStyle =
  "text-sm font-semibold text-[var(--text-subtle)] mb-1.5 block";

function paraInputDate(data) {
  if (!data) return "";
  return new Date(data).toISOString().slice(0, 10);
}

export default function AsaasEditarModal({
  open,
  onClose,
  transacaoOriginal,
  onSave,
  salvando,
}) {
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    vencimento: "",
    descontoValor: "",
    descontoDias: "",
    multaValor: "",
    jurosValor: "",
  });

  useEffect(() => {
    if (transacaoOriginal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        descricao: transacaoOriginal.cliente || "",
        valor: transacaoOriginal.valor ?? "",
        vencimento: paraInputDate(transacaoOriginal.vencimento),
        descontoValor: transacaoOriginal.descontoValor ?? "",
        descontoDias: transacaoOriginal.descontoDias ?? "",
        multaValor: transacaoOriginal.multaValor ?? "",
        jurosValor: transacaoOriginal.jurosValor ?? "",
      });
    }
  }, [transacaoOriginal]);

  if (!transacaoOriginal) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave?.(transacaoOriginal.id, {
      descricao: formData.descricao,
      valor: formData.valor,
      vencimento: formData.vencimento,
      descontoValor: formData.descontoValor,
      descontoDias: formData.descontoDias,
      multaValor: formData.multaValor,
      jurosValor: formData.jurosValor,
    });
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="-m-8">
        <div className="px-8 pt-2 pb-5 border-b border-[var(--border-token)]">
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Editar Cobrança
          </h2>

          <p className="text-[var(--text-subtle)] mt-1">
            Ajuste os dados antes de enviar ao Asaas. Só é possível editar
            enquanto a cobrança ainda não foi enviada.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelStyle}>Descrição</label>
              <input
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>Valor (R$)</label>
              <input
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className={labelStyle}>Vencimento</label>
              <input
                type="date"
                name="vencimento"
                value={formData.vencimento}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
          </div>

          <div className="border-t border-[var(--border-token)] pt-6">
            <h3 className="text-[var(--text)] font-semibold mb-4">
              Desconto por pagamento antecipado (opcional)
            </h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Valor do desconto (R$)</label>
                <input
                  name="descontoValor"
                  placeholder="0,00"
                  value={formData.descontoValor}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>
                  Válido até quantos dias antes do vencimento
                </label>
                <input
                  name="descontoDias"
                  placeholder="0"
                  value={formData.descontoDias}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-token)] pt-6">
            <h3 className="text-[var(--text)] font-semibold mb-4">
              Multa e juros por atraso (opcional)
            </h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Multa (%)</label>
                <input
                  name="multaValor"
                  placeholder="0,00"
                  value={formData.multaValor}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Juros ao mês (%)</label>
                <input
                  name="jurosValor"
                  placeholder="0,00"
                  value={formData.jurosValor}
                  onChange={handleChange}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-token)] px-8 py-5 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-[var(--border-token)] text-[var(--text-1)] rounded-xl px-5 py-3 hover:bg-[var(--surface-2)]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-[var(--text)] rounded-xl px-5 py-3"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
