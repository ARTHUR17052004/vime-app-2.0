"use client";

import Modal from "../ui/Modal";

export default function FinanceiroModal({
  isOpen,
  onClose,
  children,
}) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlay={false}
    >
      {children}
    </Modal>
  );
}