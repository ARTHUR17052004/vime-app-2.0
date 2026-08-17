"use client";

import { useState } from "react";

export default function SolicitacaoResponder({
  solicitacao,
  onSalvar,
  onCancelar,
}) {

  const [resposta, setResposta] =
    useState("");

  const [status, setStatus] =
    useState(
      solicitacao?.status ||
      "SOLICITADA"
    );

  function salvar() {

    if (!resposta.trim()) {

      alert(
        "Digite uma resposta."
      );

      return;

    }

    onSalvar({

      resposta,

      status,

    });

  }

  return (

    <div className="space-y-6">

      <div>

        <label
          className="
            block
            text-sm
            font-semibold
            text-[var(--text-muted)]
            mb-2
          "
        >

          Resposta

        </label>

        <textarea
          rows={6}
          value={resposta}
          onChange={(e) =>
            setResposta(
              e.target.value
            )
          }
          className="
            w-full
            border
            border-[var(--border-token)]
            rounded-2xl
            px-4
            py-3
            bg-[var(--surface-2)]
            text-[var(--text)]
          "
        />

      </div>

      <div>

        <label
          className="
            block
            text-sm
            font-semibold
            text-[var(--text-muted)]
            mb-2
          "
        >

          Novo Status

        </label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
          className="
            w-full
            border
            border-[var(--border-token)]
            rounded-2xl
            px-4
            py-3
            bg-[var(--surface-2)]
            text-[var(--text)]
          "
        >

          <option>
            SOLICITADA
          </option>

          <option>
            EM COTAÇÃO
          </option>

          <option>
            AGUARDANDO COMPRA
          </option>

          <option>
            ATENDIDA
          </option>

          <option>
            REJEITADA
          </option>

        </select>

      </div>

      <div
        className="
          flex
          justify-end
          gap-4
          pt-4
        "
      >

        <button
          onClick={onCancelar}
          className="
            px-6
            py-3
            rounded-2xl
            border
          "
        >

          Cancelar

        </button>

        <button
          onClick={salvar}
          className="
            px-6
            py-3
            rounded-2xl
            bg-green-700
            text-[var(--text)]
            hover:bg-green-800
          "
        >

          Salvar Resposta

        </button>

      </div>

    </div>

  );

}