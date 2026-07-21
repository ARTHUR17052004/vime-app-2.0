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
      title="Unidade"
      subtitle="Cadastro e gerenciamento da unidade"
      size="xl"
    >
      {children}
    </Modal>
  );
}