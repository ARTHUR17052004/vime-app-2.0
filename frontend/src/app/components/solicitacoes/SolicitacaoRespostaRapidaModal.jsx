"use client";

import Modal from "../ui/Modal";
import SolicitacaoChat from "./SolicitacaoChat";

export default function SolicitacaoRespostaRapidaModal({
  solicitacao,
  onClose,
  onAtualizado,
}) {

  return (

    <Modal
      open={Boolean(solicitacao)}
      onClose={onClose}
      title={solicitacao?.titulo}
      subtitle={solicitacao?.numero}
      size="lg"
    >

      {solicitacao && (

        <SolicitacaoChat
          solicitacaoId={solicitacao.id}
          statusAtual={solicitacao.status}
          onStatusAlterado={() => onAtualizado?.()}
        />

      )}

    </Modal>

  );

}
