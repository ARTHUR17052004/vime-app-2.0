"use client";

import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({
  open,

  onClose,

  onConfirm,

  title = "Confirmação",

  description = "Deseja realmente continuar?",

  confirmText = "Confirmar",

  cancelText = "Cancelar",

  confirmVariant = "danger",

  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <p
        className="
          text-[var(--text-muted)]
          leading-relaxed
        "
      >
        {description}
      </p>

      <div
        className="
          flex
          justify-end
          gap-3
          mt-8
        "
      >
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>

        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}