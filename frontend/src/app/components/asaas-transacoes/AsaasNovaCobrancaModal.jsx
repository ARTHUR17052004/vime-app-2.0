"use client";

import { useEffect, useState } from "react";

import Modal from "../ui/Modal";

import { ContratoService } from "@/services/contratos.service";
import { ReceitaService } from "@/services/financeiro.service";
import { AsaasService } from "@/services/asaas.service";

const FORM_INICIAL = {
  contratoId: "",
  categoria: "Aluguel",
  descricao: "",
  valor: "",
  vencimento: "",
};

const rotuloContrato = (contrato) => {
  const inquilino =
    contrato.inquilino?.nome || contrato.inquilinoNome || "Sem inquilino";

  const imovel =
    contrato.unidade?.nome ||
    contrato.unidadeNome ||
    contrato.kitnet?.nome ||
    contrato.kitnetNome ||
    "";

  return imovel ? `${inquilino} • ${imovel}` : inquilino;
};

export default function AsaasNovaCobrancaModal({
  open,
  onClose,
  onCriada,
}) {

  const [form, setForm] =
    useState(FORM_INICIAL);

  const [contratos, setContratos] =
    useState([]);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  useEffect(() => {

    if (!open) return;

    setForm(FORM_INICIAL);
    setErro("");

    ContratoService.listar()
      .then((resposta) => {
        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        setContratos(lista);
      })
      .catch((err) => {
        console.error("Erro ao carregar contratos:", err);
      });

  }, [open]);

  const handleChange = (campo) => (e) => {
    setForm((atual) => ({
      ...atual,
      [campo]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setErro("");
    setSalvando(true);

    try {

      const dados = {
        categoria: form.categoria,
        descricao: form.descricao,
        valor: Number(form.valor),
        vencimento: form.vencimento || null,
        status: "PENDENTE",
        ...(form.contratoId && { contratoId: form.contratoId }),
      };

      const resposta = await ReceitaService.criar(dados);

      const receitaCriada = resposta.data || resposta;

      const enviarAgora = form.contratoId
        ? window.confirm(
            "Receita criada. Deseja enviar esta cobrança ao Asaas agora?"
          )
        : false;

      if (enviarAgora) {

        try {

          await AsaasService.enviarCobranca(receitaCriada.id);

        } catch (err) {

          alert(
            err.message ||
            "Receita criada, mas não foi possível enviá-la ao Asaas agora."
          );

        }

      }

      onCriada?.();

    } catch (err) {

      setErro(err.message || "Erro ao criar cobrança.");

    } finally {

      setSalvando(false);

    }

  };

  const inputStyle =
    "border border-white/[0.07] bg-white/5 text-white rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-600";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova Cobrança"
      subtitle="Cria uma receita e, se desejar, envia a cobrança ao Asaas."
      size="md"
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {erro && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm">
            {erro}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Contrato (inquilino)
          </label>

          <select
            value={form.contratoId}
            onChange={handleChange("contratoId")}
            className={inputStyle}
          >
            <option value="" className="bg-[#1b2430]">
              Sem contrato vinculado
            </option>

            {contratos.map((contrato) => (
              <option
                key={contrato.id}
                value={contrato.id}
                className="bg-[#1b2430]"
              >
                {rotuloContrato(contrato)}
              </option>
            ))}
          </select>

          <p className="text-xs text-gray-500 mt-1">
            Necessário para enviar a cobrança ao Asaas (o inquilino do contrato
            vira o cliente da cobrança).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Categoria
            </label>

            <select
              value={form.categoria}
              onChange={handleChange("categoria")}
              className={inputStyle}
            >
              <option className="bg-[#1b2430]">Aluguel</option>
              <option className="bg-[#1b2430]">Multa</option>
              <option className="bg-[#1b2430]">Taxa</option>
              <option className="bg-[#1b2430]">Outros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Valor
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor}
              onChange={handleChange("valor")}
              className={inputStyle}
              required
            />
          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Descrição
          </label>

          <input
            value={form.descricao}
            onChange={handleChange("descricao")}
            placeholder="Ex: Aluguel referente a Agosto/2026"
            className={inputStyle}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Vencimento
          </label>

          <input
            type="date"
            value={form.vencimento}
            onChange={handleChange("vencimento")}
            className={inputStyle}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            onClick={onClose}
            className="
              border
              border-white/[0.07]
              text-gray-200
              rounded-xl
              px-5
              py-3
              hover:bg-white/5
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="
              bg-green-700
              hover:bg-green-800
              disabled:opacity-50
              disabled:cursor-not-allowed
              text-white
              rounded-xl
              px-5
              py-3
            "
          >
            {salvando ? "Salvando..." : "Criar Cobrança"}
          </button>

        </div>

      </form>

    </Modal>
  );
}
