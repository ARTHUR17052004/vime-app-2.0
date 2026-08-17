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

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-6">

        <div className="text-[var(--text-subtle)]">
          Total
        </div>

        <div className="text-4xl font-bold text-[var(--text)] mt-2">
          {total}
        </div>

      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6">

        <div className="text-blue-400">
          Solicitadas
        </div>

        <div className="text-4xl font-bold text-blue-400 mt-2">
          {solicitadas}
        </div>

      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6">

        <div className="text-yellow-400">
          Em Cotação
        </div>

        <div className="text-4xl font-bold text-yellow-400 mt-2">
          {cotacao}
        </div>

      </div>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6">

        <div className="text-orange-400">
          Aguardando Compra
        </div>

        <div className="text-4xl font-bold text-orange-400 mt-2">
          {compra}
        </div>

      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6">

        <div className="text-emerald-400">
          Atendidas
        </div>

        <div className="text-4xl font-bold text-emerald-400 mt-2">
          {atendidas}
        </div>

      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">

        <div className="text-red-400">
          Rejeitadas
        </div>

        <div className="text-4xl font-bold text-red-400 mt-2">
          {rejeitadas}
        </div>

      </div>

    </div>

  );

}