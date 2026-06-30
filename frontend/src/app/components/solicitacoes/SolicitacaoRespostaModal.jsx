"use client";

import { useEffect, useState } from "react";

import SolicitacaoModal from "./SolicitacaoModal";

export default function SolicitacaoRespostaModal({
  isOpen,
  onClose,
  onSalvar,
  solicitacao,
}) {

  const [resposta, setResposta] =
    useState("");

  const [status, setStatus] =
    useState("SOLICITADA");

  useEffect(() => {

    if (!solicitacao) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResposta(
      solicitacao.resposta || ""
    );

    setStatus(
      solicitacao.status || "SOLICITADA"
    );

  }, [solicitacao]);

  function enviar(e) {

    e.preventDefault();

    onSalvar({

      resposta,

      status,

    });

    onClose();

  }

  return (

    <SolicitacaoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Responder Solicitação"
    >

      <form
        onSubmit={enviar}
        className="space-y-6"
      >

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Resposta

          </label>

          <textarea
            rows={8}
            value={resposta}
            onChange={(e) =>
              setResposta(e.target.value)
            }
            placeholder="Digite a resposta da solicitação..."
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-white
              text-gray-900
              resize-none
            "
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-gray-900 mb-2">

            Novo Status

          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-3
              bg-white
              text-gray-900
            "
          >

            <option>SOLICITADA</option>

            <option>EM COTAÇÃO</option>

            <option>AGUARDANDO COMPRA</option>

            <option>ATENDIDA</option>

            <option>REJEITADA</option>

          </select>

        </div>

        <div className="flex justify-end gap-4">

          <button
            type="button"
            onClick={onClose}
            className="
              px-6
              py-3
              rounded-2xl
              border
              hover:bg-gray-100
            "
          >

            Cancelar

          </button>

          <button
            type="submit"
            className="
              px-8
              py-3
              rounded-2xl
              bg-green-700
              text-white
              hover:bg-green-800
            "
          >

            Enviar Resposta

          </button>

        </div>

      </form>

    </SolicitacaoModal>

  );

}