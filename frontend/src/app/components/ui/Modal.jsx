"use client";

export default function Modal({
  open,
  children,
  onClose,
}) {

  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/40
      flex
      items-center
      justify-center
      z-50
      "
      onClick={onClose}
    >
      <div
        className="
        bg-white
        rounded-2xl
        w-full
        max-w-3xl
        p-6
        shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}