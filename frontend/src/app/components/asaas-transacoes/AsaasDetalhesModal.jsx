"use client";

import Modal from "../ui/Modal";

const formatarValor = (valor) => {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatarData = (data) => {
  if (!data) return "-";

  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
};

const rotuloStatus = (status) => {
  switch (status) {
    case "PAGA":
      return "Recebido";

    case "PENDENTE":
      return "Pendente";

    case "ATRASADA":
      return "Atrasado";

    case "CANCELADA":
      return "Cancelado";

    case "ESTORNADA":
      return "Estornado";

    default:
      return status || "-";
  }
};

export default function AsaasDetalhesModal({
  open,
  onClose,
  transacao,
}) {

  if (!transacao) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
    >

      <div className="-m-8">

        <div className="px-8 pt-2 pb-5 border-b border-white/[0.07]">
          <h2 className="text-2xl font-bold text-white">
            Detalhes da Cobrança
          </h2>

          <p className="text-gray-400 mt-1">
            Visualização completa das informações da transação.
          </p>
        </div>

        <div className="p-8 space-y-6">

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Cliente
              </label>

              <p className="mt-2 font-semibold text-white">
                {transacao.cliente || "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                ID Asaas
              </label>

              <p className="mt-2 font-semibold text-white break-all">
                {transacao.asaasPaymentId || "Ainda não enviada"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Valor
              </label>

              <p className="mt-2 text-2xl font-bold text-green-400">
                {formatarValor(transacao.valor)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Status
              </label>

              <div className="mt-2">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                  {rotuloStatus(transacao.status)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Forma de Pagamento
              </label>

              <p className="mt-2 text-gray-200">
                {transacao.formaPagamento || "-"}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Vencimento
              </label>

              <p className="mt-2 text-gray-200">
                {formatarData(transacao.vencimento)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Data de Pagamento
              </label>

              <p className="mt-2 text-gray-200">
                {formatarData(transacao.dataPagamento)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-400">
                Sincronizada com Asaas
              </label>

              <p className="mt-2 text-gray-200">
                {transacao.enviadaAsaas ? "Sim" : "Não"}
              </p>
            </div>

          </div>

        </div>

        <div className="border-t border-white/[0.07] px-8 py-5 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="
            border
            border-white/[0.07]
            text-gray-200
            rounded-xl
            px-5
            py-3
            hover:bg-white/5
            "
          >
            Fechar
          </button>

        </div>

      </div>

    </Modal>
  );
}
