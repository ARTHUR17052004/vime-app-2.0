"use client";

import { exportarPDF, exportarExcel } from "@/utils/exportar";

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

  const colunas = [
    "Número",
    "Título",
    "Responsável",
    "Status",
    "Prazo",
  ];

  const linhas = solicitacoes.map((item) => [
    item.numero || "-",
    item.titulo || "-",
    item.responsavel || "-",
    item.status || "-",
    item.prazo
      ? new Date(item.prazo).toLocaleDateString("pt-BR")
      : "-",
  ]);

  function handleExportarPDF() {

    exportarPDF({
      titulo: "Relatório de Solicitações",
      subtitulo: `Total: ${total} · Solicitadas: ${solicitadas} · Em Cotação: ${cotacao} · Aguardando Compra: ${compra} · Atendidas: ${atendidas} · Rejeitadas: ${rejeitadas}`,
      secoes: [
        {
          colunas,
          linhas,
        },
      ],
      nomeArquivo: "relatorio-solicitacoes",
    });

  }

  function handleExportarExcel() {

    exportarExcel({
      abas: [
        {
          nome: "Solicitações",
          colunas,
          linhas,
        },
      ],
      nomeArquivo: "relatorio-solicitacoes",
    });

  }

  function imprimir() {

    window.print();

  }

  return (

    <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">
            Relatórios
          </h2>

          <p className="text-[var(--text-subtle)] mt-1">
            Resumo geral das solicitações
          </p>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 mb-8">

        <div
          className="
            bg-[var(--surface-2)]
            rounded-2xl
            border
            border-[var(--border-token)]
            p-6
            hover:shadow-[0_18px_45px_rgba(0,0,0,.35)]
            transition
          "
        >

          <p className="text-sm text-[var(--text-subtle)]">
            Total
          </p>

          <h3 className="text-3xl font-bold mt-2 text-[var(--text)]">
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
    onClick={handleExportarPDF}
    className="
      bg-green-700
      hover:bg-green-800
      text-[var(--text)]
      rounded-2xl
      p-5
      transition
    "
  >
    Exportar PDF
  </button>

  <button
    onClick={handleExportarExcel}
    className="
      bg-green-700
      hover:bg-green-800
      text-[var(--text)]
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
      text-[var(--text)]
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