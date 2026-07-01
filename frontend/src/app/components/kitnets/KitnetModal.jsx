"use client";

export default function KitnetModal({
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
        bg-black/50
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
          shadow-2xl
          w-full
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
        "
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Nova Kitnet
          </h2>

          <button
            onClick={onClose}
            className="
              text-gray-500
              hover:text-red-500
              text-3xl
              transition
            "
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}