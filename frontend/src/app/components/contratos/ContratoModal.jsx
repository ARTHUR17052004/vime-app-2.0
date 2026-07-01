"use client";

export default function ContratoModal({
  isOpen,
  onClose,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        bg-black/40
        flex
        items-center
        justify-center
        z-50
        p-4
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          bg-white
          rounded-3xl
          shadow-xl
          w-full
          max-w-5xl
          max-h-[90vh]
          overflow-y-auto
          p-8
          relative
        "
      >
        <button
          onClick={onClose}
          className="
            absolute
            top-5
            right-5
            text-gray-500
            hover:text-gray-800
            text-2xl
          "
        >
          ✕
        </button>

        {children}

      </div>
    </div>
  );
}