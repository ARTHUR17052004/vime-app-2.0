"use client";

export default function LocadorModal({
  isOpen,
  onClose,
  children,
}) {
  if (!isOpen) return null;

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
        p-4
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
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
            top-4
            right-4
            text-gray-500
            hover:text-gray-800
            text-xl
          "
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}