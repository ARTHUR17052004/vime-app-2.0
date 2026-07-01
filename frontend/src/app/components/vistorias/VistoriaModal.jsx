"use client";

export default function VistoriaModal({
  isOpen,
  onClose,
  children,
}) {

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div
        className="
          bg-white
          rounded-3xl
          p-8
          w-full
          max-w-4xl
          max-h-[90vh]
          overflow-y-auto
        "
      >

        <div className="flex justify-end mb-6">

          <button
            onClick={onClose}
            className="bg-red-700 text-white px-4 py-2 rounded-xl"
          >
            Fechar
          </button>

        </div>

        {children}

      </div>

    </div>

  );

}