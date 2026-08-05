"use client";

import Modal from "../ui/Modal";
import UsuariosForm from "./UsuariosForm";

export default function UsuariosModal({
  isOpen,
  onClose,
  usuario,
  onSave,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
    >
      <UsuariosForm
        usuario={usuario}
        onSave={onSave}
        onCancel={onClose}
      />
    </Modal>
  );
}