"use client";

export default function ContratoDetalhesModal({
  isOpen,
  onClose,
  contrato,
}) {
  if (!isOpen || !contrato)
    return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl p-8 relative">

        <button
          onClick={onClose}
          className="
            absolute
            top-5
            right-5
            text-2xl
            text-gray-500
          "
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold mb-8">
          Detalhes do Contrato
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-gray-500">
              Número Contrato
            </p>

            <p className="font-semibold">
              {contrato.numeroContrato}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Inquilino
            </p>

            <p className="font-semibold">
              {contrato.inquilinoNome}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Unidade
            </p>

            <p className="font-semibold">
              {contrato.unidadeNome}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Kitnet
            </p>

            <p className="font-semibold">
              {contrato.kitnetNome}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Valor Aluguel
            </p>

            <p className="font-semibold">
              R$ {contrato.valorAluguel}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Dia Vencimento
            </p>

            <p className="font-semibold">
              {contrato.diaVencimento}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Data Início
            </p>

            <p className="font-semibold">
              {contrato.dataInicio}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Data Fim
            </p>

            <p className="font-semibold">
              {contrato.dataFim}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Garantia
            </p>

            <p className="font-semibold">
              {contrato.tipoGarantia}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Valor Caução
            </p>

            <p className="font-semibold">
              R$ {contrato.valorCaucao}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Índice Reajuste
            </p>

            <p className="font-semibold">
              {contrato.indiceReajuste}
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Status
            </p>

            <p className="font-semibold">
              {contrato.status}
            </p>
          </div>

        </div>

        <div className="mt-8">

          <p className="text-gray-500 mb-2">
            Observações
          </p>

          <div className="bg-gray-50 rounded-2xl p-5">
            {contrato.observacoes ||
              "Nenhuma observação"}
          </div>

        </div>

      </div>

    </div>
  );
}