"use client";

import Modal from "../ui/Modal";

export default function VistoriaModal({
  isOpen,
  onClose,
  children,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Vistoria"
      size="xl"
    >
      {children}
    </Modal>
  );
}