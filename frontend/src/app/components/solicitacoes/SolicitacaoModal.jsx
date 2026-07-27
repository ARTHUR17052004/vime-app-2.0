"use client";

import Modal from "../ui/Modal";

export default function SolicitacaoModal({
  isOpen,
  onClose,
  children,
  title = "Solicitação",
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Preencha as informações da solicitação."
      size="xl"
    >
      {children}
    </Modal>
  );
}