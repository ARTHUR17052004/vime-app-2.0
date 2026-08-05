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

      isOpen={isOpen}

      onClose={onClose}

      maxWidth="max-w-4xl"

    >

      <UsuariosForm

        usuario={usuario}

        onSave={onSave}

        onCancel={onClose}

      />

    </Modal>

  );

}