"use client";

// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
export default function SolicitacaoRelatorios({
  solicitacoes = [],
}) {

  const total = solicitacoes.length;

  const solicitadas =
    solicitacoes.filter(
      (item) =>
        item.status === "SOLICITADA"
    ).length;

  const cotacao =
    solicitacoes.filter(
      (item) =>
        item.status === "EM COTAÇÃO"
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

 function exportarPDF() {

  alert(
    "Teste do botão PDF."
  );

}

  function exportarExcel() {

  alert(
    "Teste do botão Excel."
  );

}

  function imprimir() {

    window.print();

  }

  return (

    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Relatórios
          </h2>

          <p className="text-gray-400 mt-1">
            Resumo geral das solicitações
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">

        <div
          className="
            bg-white/5
            rounded-2xl
            border
            border-white/10
            p-6
            hover:shadow-[0_18px_45px_rgba(0,0,0,.35)]
            transition
          "
        >

          <p className="text-sm text-gray-400">
            Total
          </p>

          <h3 className="text-3xl font-bold mt-2 text-white">
            {total}
          </h3>

        </div>

        <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">

          <p className="text-sm text-blue-400">
            Solicitadas
          </p>

          <h3 className="text-3xl font-bold mt-2 text-blue-400">
            {solicitadas}
          </h3>

        </div>

        <div className="bg-yellow-500/10 rounded-2xl p-6 border border-yellow-500/20">

          <p className="text-sm text-yellow-400">
            Em Cotação
          </p>

          <h3 className="text-3xl font-bold mt-2 text-yellow-400">
            {cotacao}
          </h3>

        </div>

        <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-500/20">

          <p className="text-sm text-orange-400">
            Aguardando Compra
          </p>

          <h3 className="text-3xl font-bold mt-2 text-orange-400">
            {compra}
          </h3>

        </div>

        <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20">

          <p className="text-sm text-emerald-400">
            Atendidas
          </p>

          <h3 className="text-3xl font-bold mt-2 text-emerald-400">
            {atendidas}
          </h3>

        </div>

        <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">

          <p className="text-sm text-red-400">
            Rejeitadas
          </p>

          <h3 className="text-3xl font-bold mt-2 text-red-400">
            {rejeitadas}
          </h3>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

  <button
    onClick={exportarPDF}
    className="
      bg-green-700
      hover:bg-green-800
      text-white
      rounded-2xl
      p-5
      transition
    "
  >
    Exportar PDF
  </button>

  <button
    onClick={exportarExcel}
    className="
      bg-green-700
      hover:bg-green-800
      text-white
      rounded-2xl
      p-5
      transition
    "
  >
    Exportar Excel
  </button>

  <button
    onClick={imprimir}
    className="
      bg-gray-800
      hover:bg-black
      text-white
      rounded-2xl
      p-5
      transition
    "
  >
    Imprimir Relatório
  </button>

    </div>

  </div>

  );

}