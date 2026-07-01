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

    <div className="bg-white rounded-3xl shadow border p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-bold text-gray-900">
            Relatórios
          </h2>

          <p className="text-gray-500 mt-1">
            Resumo geral das solicitações
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">

        <div
          className="
            bg-gray-50
            rounded-2xl
            border
            p-6
            hover:shadow-lg
            transition
          "
        >

          <p className="text-sm text-gray-500">
            Total
          </p>

          <h3 className="text-3xl font-bold mt-2">
            {total}
          </h3>

        </div>

        <div className="bg-blue-50 rounded-2xl p-6 border">

          <p className="text-sm text-blue-700">
            Solicitadas
          </p>

          <h3 className="text-3xl font-bold mt-2 text-blue-700">
            {solicitadas}
          </h3>

        </div>

        <div className="bg-yellow-50 rounded-2xl p-6 border">

          <p className="text-sm text-yellow-700">
            Em Cotação
          </p>

          <h3 className="text-3xl font-bold mt-2 text-yellow-700">
            {cotacao}
          </h3>

        </div>

        <div className="bg-orange-50 rounded-2xl p-6 border">

          <p className="text-sm text-orange-700">
            Aguardando Compra
          </p>

          <h3 className="text-3xl font-bold mt-2 text-orange-700">
            {compra}
          </h3>

        </div>

        <div className="bg-green-50 rounded-2xl p-6 border">

          <p className="text-sm text-green-700">
            Atendidas
          </p>

          <h3 className="text-3xl font-bold mt-2 text-green-700">
            {atendidas}
          </h3>

        </div>

        <div className="bg-red-50 rounded-2xl p-6 border">

          <p className="text-sm text-red-700">
            Rejeitadas
          </p>

          <h3 className="text-3xl font-bold mt-2 text-red-700">
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