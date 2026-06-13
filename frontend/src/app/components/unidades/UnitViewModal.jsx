"use client";

export default function UnitViewModal({
  unidade,
  isOpen,
  onClose,
}) {
  if (!isOpen || !unidade) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Detalhes da Unidade
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <Info label="Nome" value={unidade.nome} />
          <Info label="CEP" value={unidade.cep} />

          <Info label="Endereço" value={unidade.endereco} />
          <Info label="Número" value={unidade.numero} />

          <Info label="Bairro" value={unidade.bairro} />
          <Info label="Cidade" value={unidade.cidade} />

          <Info label="UF" value={unidade.uf} />
          <Info label="Locador" value={unidade.locador} />

          <Info label="Kitnets" value={unidade.kitnets} />
          <Info label="Status" value={unidade.status} />

          <div className="col-span-2">
            <label className="font-medium text-gray-600">
              Observações
            </label>

            <div className="mt-2 border rounded-lg p-3 bg-gray-50 min-h-[100px]">
              {unidade.observacoes || "Nenhuma observação"}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <label className="font-medium text-gray-600">
        {label}
      </label>

      <div className="mt-1 border rounded-lg p-3 bg-gray-50">
        {value || "-"}
      </div>
    </div>
  );
}