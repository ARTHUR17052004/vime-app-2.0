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

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] shadow-[0_18px_45px_rgba(0,0,0,.45)] rounded-3xl w-full max-w-3xl p-8 relative">

        <button
          onClick={onClose}
          className="
            absolute
            top-5
            right-5
            text-2xl
            text-gray-400
          "
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-white mb-8">
          Detalhes do Contrato
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-gray-400">
              Inquilino
            </p>

            <p className="font-semibold text-white">
              {contrato.inquilino?.nome || contrato.inquilinoNome}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Unidade
            </p>

            <p className="font-semibold text-white">
              {contrato.unidade?.nome || contrato.unidadeNome}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Kitnet
            </p>

            <p className="font-semibold text-white">
              {contrato.kitnet?.nome || contrato.kitnetNome}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Valor Aluguel
            </p>

            <p className="font-semibold text-white">
              R$ {contrato.valorAluguel}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Dia Vencimento
            </p>

            <p className="font-semibold text-white">
              {contrato.diaVencimento}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Data de Criação
            </p>

            <p className="font-semibold text-white">
              {contrato.dataInicio
                ? new Date(contrato.dataInicio).toLocaleDateString("pt-BR")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Data Final do Contrato
            </p>

            <p className="font-semibold text-white">
              {contrato.dataFim
                ? new Date(contrato.dataFim).toLocaleDateString("pt-BR")
                : "Indeterminado"}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Garantia
            </p>

            <p className="font-semibold text-white">
              {contrato.tipoGarantia}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Valor Caução
            </p>

            <p className="font-semibold text-white">
              R$ {contrato.valorCaucao}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Índice Reajuste
            </p>

            <p className="font-semibold text-white">
              {contrato.indiceReajuste}
            </p>
          </div>

          <div>
            <p className="text-gray-400">
              Status
            </p>

            <p className="font-semibold text-white">
              {contrato.status}
            </p>
          </div>

        </div>

        <div className="mt-8">

          <p className="text-gray-400 mb-2">
            Observações
          </p>

          <div className="bg-white/5 border border-white/10 text-gray-200 rounded-2xl p-5">
            {contrato.observacoes ||
              "Nenhuma observação"}
          </div>

        </div>

      </div>

    </div>
  );
}