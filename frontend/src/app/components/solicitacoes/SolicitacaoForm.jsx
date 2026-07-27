"use client";

import { useEffect, useState } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

export default function SolicitacaoForm({
  onSave,
  solicitacaoEditando,
}) {

  const [form, setForm] = useState({

    numero: "",
    titulo: "",
    descricao: "",
    responsavel: "",
    status: "SOLICITADA",
    data: "",
    prazo: "",
    observacoes: "",

  });

  useEffect(() => {

    if (solicitacaoEditando) {

      setForm(solicitacaoEditando);

      return;

    }

    setForm({

      numero: `SOL-${Date.now()
        .toString()
        .slice(-6)}`,

      titulo: "",

      descricao: "",

      responsavel: "",

      status: "SOLICITADA",

      data: new Date()
        .toISOString()
        .split("T")[0],

      prazo: "",

      observacoes: "",

    });

  }, [solicitacaoEditando]);

  function alterarCampo(e) {

    setForm((prev) => ({

      ...prev,

      [e.target.name]:
        e.target.value,

    }));

  }

  function salvar(e) {

    e.preventDefault();

    onSave(form);

  }

  const input = `
    w-full
    rounded-xl
    border
    border-white/10
    bg-white/5
    px-4
    py-3
    text-white
    placeholder:text-gray-500
    outline-none
    focus:border-emerald-500
  `;

  return (

    <form
      onSubmit={salvar}
      className="space-y-8"
    >

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Número
          </label>

          <Input
            readOnly
            name="numero"
            value={form.numero}
            className={`${input} bg-white/10`}
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Responsável
          </label>

          <Input
            name="responsavel"
            value={form.responsavel}
            onChange={alterarCampo}
            className={input}
          />

        </div>

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Título
        </label>

        <Input
          name="titulo"
          value={form.titulo}
          onChange={alterarCampo}
          placeholder="Ex.: Troca de chuveiro"
          className={input}
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Descrição
        </label>

        <Textarea
          rows={6}
          name="descricao"
          value={form.descricao}
          onChange={alterarCampo}
          placeholder="Descreva detalhadamente a solicitação..."
          className={`
            ${input}
            min-h-[160px]
            resize-none
          `}
        />

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Data da Solicitação
          </label>

          <Input
            type="date"
            name="data"
            value={form.data}
            onChange={alterarCampo}
            className={input}
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Prazo
          </label>

          <Input
            type="date"
            name="prazo"
            value={form.prazo}
            onChange={alterarCampo}
            className={input}
          />

        </div>

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Observações
        </label>

        <Textarea
          rows={4}
          name="observacoes"
          value={form.observacoes}
          onChange={alterarCampo}
          placeholder="Informações adicionais (opcional)..."
          className={`
            ${input}
            min-h-[120px]
            resize-none
          `}
        />

      </div>

      <div className="flex justify-end pt-2">

        <Button type="submit">
          Salvar Solicitação
        </Button>

      </div>

    </form>

  );

}
