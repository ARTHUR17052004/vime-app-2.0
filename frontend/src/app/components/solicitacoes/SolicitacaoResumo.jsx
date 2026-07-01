"use client";

export default function SolicitacaoResumo({
  solicitacoes = [],
}) {

  const total =
    solicitacoes.length;

  const solicitadas =
    solicitacoes.filter(
      (item) =>
        item.status ===
        "SOLICITADA"
    ).length;

  const cotacao =
    solicitacoes.filter(
      (item) =>
        item.status ===
        "EM COTAÇÃO"
    ).length;

  const compra =
    solicitacoes.filter(
      (item) =>
        item.status ===
        "AGUARDANDO COMPRA"
    ).length;

  const atendidas =
    solicitacoes.filter(
      (item) =>
        item.status ===
        "ATENDIDA"
    ).length;

  const rejeitadas =
    solicitacoes.filter(
      (item) =>
        item.status ===
        "REJEITADA"
    ).length;

  return (

    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">

      <div className="bg-white rounded-3xl shadow p-6">

        <div className="text-gray-500">
          Total
        </div>

        <div className="text-4xl font-bold text-gray-900 mt-2">
          {total}
        </div>

      </div>

      <div className="bg-blue-50 rounded-3xl shadow p-6">

        <div className="text-blue-700">
          Solicitadas
        </div>

        <div className="text-4xl font-bold text-blue-700 mt-2">
          {solicitadas}
        </div>

      </div>

      <div className="bg-yellow-50 rounded-3xl shadow p-6">

        <div className="text-yellow-700">
          Em Cotação
        </div>

        <div className="text-4xl font-bold text-yellow-700 mt-2">
          {cotacao}
        </div>

      </div>

      <div className="bg-orange-50 rounded-3xl shadow p-6">

        <div className="text-orange-700">
          Aguardando Compra
        </div>

        <div className="text-4xl font-bold text-orange-700 mt-2">
          {compra}
        </div>

      </div>

      <div className="bg-green-50 rounded-3xl shadow p-6">

        <div className="text-green-700">
          Atendidas
        </div>

        <div className="text-4xl font-bold text-green-700 mt-2">
          {atendidas}
        </div>

      </div>

      <div className="bg-red-50 rounded-3xl shadow p-6">

        <div className="text-red-700">
          Rejeitadas
        </div>

        <div className="text-4xl font-bold text-red-700 mt-2">
          {rejeitadas}
        </div>

      </div>

    </div>

  );

}