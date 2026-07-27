"use client";

import Modal from "../ui/Modal";

export default function DespesaModal({
  isOpen,
  onClose,
  children,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
    >
      {children}
    </Modal>
  );
}