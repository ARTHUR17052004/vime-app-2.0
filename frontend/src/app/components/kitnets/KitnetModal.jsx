"use client";

import Modal from "../ui/Modal";

export default function KitnetModal({
  isOpen,
  onClose,
  children,
  kitnet,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      title={
        kitnet
          ? "Editar Kitnet"
          : "Nova Kitnet"
      }
      subtitle="Cadastre ou atualize as informações da kitnet."
    >
      {children}
    </Modal>
  );
}