"use client";

import { exportarExcel, exportarPDF } from "@/utils/exportar";

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

const formatarValor = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarData = (data) =>
  data
    ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : "-";

const COLUNAS = ["Cliente", "Valor", "Vencimento", "Forma", "Status"];

const linhasDe = (transacoes) =>
  transacoes.map((item) => [
    item.cliente || "-",
    formatarValor(item.valor),
    formatarData(item.vencimento),
    item.formaPagamento || "-",
    rotuloStatus(item.status),
  ]);

export default function AsaasExportar({ transacoes = [] }) {

  const handleExportarExcel = () => {

    exportarExcel({
      abas: [
        {
          nome: "Cobranças Asaas",
          colunas: COLUNAS,
          linhas: linhasDe(transacoes),
        },
      ],
      nomeArquivo: "asaas-cobrancas",
    });

  };

  const handleExportarPDF = () => {

    exportarPDF({
      titulo: "Cobranças Asaas",
      subtitulo: `Total de ${transacoes.length} cobrança(s)`,
      secoes: [
        {
          titulo: "Cobranças",
          colunas: COLUNAS,
          linhas: linhasDe(transacoes),
        },
      ],
      nomeArquivo: "asaas-cobrancas",
    });

  };

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] p-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h2 className="text-xl font-bold text-white">
            Exportação
          </h2>

          <p className="text-gray-400 mt-1">
            Exporte as cobranças para análise externa.
          </p>

        </div>

        <div className="flex gap-4">

          <button
            onClick={handleExportarExcel}
            disabled={transacoes.length === 0}
            className="
            border
            border-white/[0.07]
            text-gray-200
            rounded-xl
            px-6
            py-3
            hover:bg-white/5
            disabled:opacity-50
            disabled:cursor-not-allowed
            "
          >
            Exportar Excel
          </button>

          <button
            onClick={handleExportarPDF}
            disabled={transacoes.length === 0}
            className="
            bg-red-600
            hover:bg-red-700
            text-white
            rounded-xl
            px-6
            py-3
            disabled:opacity-50
            disabled:cursor-not-allowed
            "
          >
            Exportar PDF
          </button>

        </div>

      </div>

    </div>
  );
}
