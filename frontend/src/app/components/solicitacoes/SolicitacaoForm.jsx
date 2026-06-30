"use client";

import { useEffect, useState } from "react";

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

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(solicitacaoEditando);

      return;

    }

    setForm({

      numero:
        `SOL-${Date.now()
          .toString()
          .slice(-6)}`,

      titulo: "",

      descricao: "",

      responsavel: "",

      status:
        "SOLICITADA",

      data:
        new Date()
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

  return (

    <form
      onSubmit={salvar}
      className="space-y-8"
    >

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Número

          </label>

          <input
            readOnly
            name="numero"
            value={form.numero}
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-gray-100
              text-gray-900
            "
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Responsável

          </label>

          <input
            name="responsavel"
            value={form.responsavel}
            onChange={alterarCampo}
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-white
              text-gray-900
            "
          />

        </div>

      </div>      <div>

        <label className="block text-sm font-semibold text-gray-900 mb-2">

          Título

        </label>

        <input
          name="titulo"
          value={form.titulo}
          onChange={alterarCampo}
          placeholder="Ex.: Troca de chuveiro"
          className="
            w-full
            border
            rounded-2xl
            px-4
            py-3
            bg-white
            text-gray-900
            placeholder:text-gray-400
          "
        />

      </div>

      <div>

        <label className="block text-sm font-semibold text-gray-900 mb-2">

          Descrição

        </label>

        <textarea
          rows={6}
          name="descricao"
          value={form.descricao}
          onChange={alterarCampo}
          placeholder="Descreva detalhadamente a solicitação..."
          className="
            w-full
            border
            rounded-2xl
            px-4
            py-3
            bg-white
            text-gray-900
            placeholder:text-gray-400
            resize-none
          "
        />

      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Data da Solicitação

          </label>

          <input
            type="date"
            name="data"
            value={form.data}
            onChange={alterarCampo}
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-white
              text-gray-900
            "
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Prazo

          </label>

          <input
            type="date"
            name="prazo"
            value={form.prazo}
            onChange={alterarCampo}
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-white
              text-gray-900
            "
          />

        </div>

      </div>      <div>

        <label className="block text-sm font-semibold text-gray-900 mb-2">

          Observações

        </label>

        <textarea
          rows={4}
          name="observacoes"
          value={form.observacoes}
          onChange={alterarCampo}
          placeholder="Informações adicionais (opcional)..."
          className="
            w-full
            border
            rounded-2xl
            px-4
            py-3
            bg-white
            text-gray-900
            placeholder:text-gray-400
            resize-none
          "
        />

      </div>

      <div className="flex justify-end pt-2">

        <button
          type="submit"
          className="
            bg-green-700
            hover:bg-green-800
            text-white
            px-8
            py-3
            rounded-2xl
            transition
          "
        >

          Salvar Solicitação

        </button>

      </div>

    </form>

  );

}