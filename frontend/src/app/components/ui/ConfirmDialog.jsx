"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-3 text-gray-600">
        {description}
      </p>

      <div className="flex justify-end gap-4 mt-8">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button
          variant="danger"
          onClick={onConfirm}
        >
          Confirmar
        </Button>

      </div>
    </Modal>
  );
}