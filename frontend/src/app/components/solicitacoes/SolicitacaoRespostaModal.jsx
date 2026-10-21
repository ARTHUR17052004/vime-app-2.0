"use client";

import { useEffect, useState } from "react";

import SolicitacaoModal from "./SolicitacaoModal";

import Button from "../ui/Button";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";

export default function SolicitacaoRespostaModal({
  isOpen,
  onClose,
  onSalvar,
  solicitacao,
}) {

  const [resposta, setResposta] = useState("");

  const [status, setStatus] = useState("SOLICITADA");

  useEffect(() => {

    if (!solicitacao) return;

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

  const input = `
    w-full
    rounded-xl
    border
    border-[var(--border-token)]
    bg-[var(--surface-2)]
    px-4
    py-3
    text-[var(--text)]
    placeholder:text-[var(--text-faint)]
    outline-none
    focus:border-emerald-500
  `;

  return (

    <SolicitacaoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Responder Solicitação"
    >

      <form
        onSubmit={enviar}
        className="space-y-8"
      >

        <div>

          <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">

            Resposta

          </label>

          <Textarea
            rows={8}
            value={resposta}
            onChange={(e) =>
              setResposta(e.target.value)
            }
            placeholder="Digite a resposta da solicitação..."
            className={`
              ${input}
              min-h-[220px]
              resize-none
            `}
          />

        </div>

        <div>

          <label className="block text-sm font-semibold text-[var(--text-muted)] mb-2">

            Novo Status

          </label>

          <Select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className={input}
          >

            <option>SOLICITADA</option>

            <option>EM COTAÇÃO</option>

            <option>AGUARDANDO COMPRA</option>

            <option>ATENDIDA</option>

            <option>REJEITADA</option>

          </Select>

        </div>

        <div
          className="
            sticky bottom-0 -mx-8 -mb-8 mt-2
            flex flex-col-reverse sm:flex-row sm:justify-end
            gap-3 sm:gap-4
            border-t border-[var(--border-token)]
            bg-[var(--surface)]
            px-8 py-5
          "
        >

          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button type="submit" className="w-full sm:w-auto">
            Enviar Resposta
          </Button>

        </div>

      </form>

    </SolicitacaoModal>

  );

}