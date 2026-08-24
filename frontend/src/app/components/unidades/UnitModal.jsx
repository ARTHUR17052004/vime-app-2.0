"use client";

import Modal from "../ui/Modal";

export default function UnitModal({
  isOpen,
  onClose,
  children,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Residência"
      subtitle="Cadastro e gerenciamento da residência"
      size="xl"
      closeOnOverlay={false}
    >
      {children}
    </Modal>
  );
}