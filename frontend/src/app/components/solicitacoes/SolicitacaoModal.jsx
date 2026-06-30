"use client";

export default function SolicitacaoModal({
  isOpen,
  onClose,
  children,
  title = "Solicitação",
}) {

  if (!isOpen) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        flex
        items-center
        justify-center
        p-6
      "
    >

      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          w-full
          max-w-5xl
          max-h-[90vh]
          overflow-y-auto
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            px-8
            py-6
            sticky
            top-0
            bg-white
            rounded-t-3xl
          "
        >

          <div>

            <h2 className="text-2xl font-bold text-gray-900">
              {title}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Preencha as informações da solicitação.
            </p>

          </div>

          <button
            onClick={onClose}
            className="
              w-10
              h-10
              rounded-full
              hover:bg-gray-100
              text-2xl
              transition
            "
          >
            ×
          </button>

        </div>

        <div className="p-8">

          {children}

        </div>

      </div>

    </div>

  );

}