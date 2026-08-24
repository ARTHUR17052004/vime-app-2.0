"use client";

import {
  FileSpreadsheet,
  FileBarChart,
  Download,
} from "lucide-react";

import DashboardCard from "../dashboard/DashboardCard";
import { exportarPDF, exportarExcel } from "@/utils/exportar";

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR") : "-";
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function linhaContrato(c) {
  return [
    c.inquilino?.nome || c.inquilinoNome || "-",
    c.unidade?.nome || c.unidadeNome || "-",
    c.kitnet?.nome || c.kitnet?.numero || c.kitnetNome || "-",
    formatarValor(c.valorAluguel),
    formatarData(c.dataInicio),
    formatarData(c.dataFim),
  ];
}

const COLUNAS = ["Inquilino", "Residência", "Kitnet", "Aluguel", "Início", "Fim"];

export default function ContratoRelatorios({
  contratos = [],
}) {

  const ativos = contratos.filter((c) => c.status === "ATIVO");
  const encerrados = contratos.filter((c) => c.status === "ENCERRADO");
  const receitaTotal = ativos.reduce(
    (soma, c) => soma + Number(c.valorAluguel || 0),
    0
  );

  const relatorios = [
    {
      titulo: "Contratos Ativos",
      descricao: "Lista de contratos ativos",
      dados: ativos,
      arquivo: "contratos-ativos",
    },
    {
      titulo: "Contratos Encerrados",
      descricao: "Histórico de contratos",
      dados: encerrados,
      arquivo: "contratos-encerrados",
    },
    {
      titulo: "Receita Contratada",
      descricao: `Valor total contratado: ${formatarValor(receitaTotal)}`,
      dados: ativos,
      arquivo: "receita-contratada",
    },
  ];

  function exportarPdfRelatorio(relatorio) {

    exportarPDF({
      titulo: relatorio.titulo,
      subtitulo: relatorio.descricao,
      secoes: [
        {
          colunas: COLUNAS,
          linhas: relatorio.dados.map(linhaContrato),
        },
      ],
      nomeArquivo: relatorio.arquivo,
    });

  }

  function exportarExcelRelatorio(relatorio) {

    exportarExcel({
      abas: [
        {
          nome: relatorio.titulo,
          colunas: COLUNAS,
          linhas: relatorio.dados.map(linhaContrato),
        },
      ],
      nomeArquivo: relatorio.arquivo,
    });

  }

  return (

    <DashboardCard>

      {/* HEADER */}

      <div className="flex items-center gap-4 mb-8">

        <div
          className="
            w-14
            h-14

            rounded-2xl

            flex
            items-center
            justify-center

            bg-emerald-500/10

            border
            border-emerald-500/20
          "
        >

          <FileBarChart
            size={28}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2
            className="
              text-3xl
              font-black
              text-[var(--text)]
            "
          >
            Relatórios
          </h2>

          <p className="text-[var(--text-subtle)]">
            Exportação de PDF e Excel
          </p>

        </div>

      </div>

      {/* CARDS */}

      <div className="grid md:grid-cols-2 gap-6">

        {relatorios.map((item) => (

          <div
            key={item.titulo}
            className="
              rounded-2xl

              border
              border-[var(--border-token)]

              bg-[var(--surface-2)]

              p-6

              transition-all
              duration-300

              hover:bg-[var(--surface-2)]
              hover:-translate-y-1
            "
          >

            <div className="flex justify-between items-start">

              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                    text-[var(--text)]
                  "
                >
                  {item.titulo}
                </h3>

                <p className="mt-2 text-[var(--text-subtle)]">
                  {item.descricao}
                </p>

                <p className="mt-1 text-xs text-[var(--text-faint)]">
                  {item.dados.length} registro(s)
                </p>

              </div>

              <div
                className="
                  w-12
                  h-12

                  rounded-2xl

                  flex
                  items-center
                  justify-center

                  bg-emerald-500/10

                  border
                  border-emerald-500/20
                "
              >

                <FileSpreadsheet
                  size={22}
                  className="text-emerald-400"
                />

              </div>

            </div>

            <div className="mt-8 flex gap-3">

              <button
                onClick={() => exportarPdfRelatorio(item)}
                disabled={item.dados.length === 0}
                className="
                  flex
                  items-center
                  gap-2

                  rounded-xl

                  border
                  border-emerald-500/20

                  bg-emerald-500/10

                  px-5
                  py-3

                  text-sm
                  font-semibold

                  text-emerald-400

                  transition-all
                  duration-300

                  hover:bg-emerald-500/20

                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >

                <Download size={16} />

                PDF

              </button>

              <button
                onClick={() => exportarExcelRelatorio(item)}
                disabled={item.dados.length === 0}
                className="
                  flex
                  items-center
                  gap-2

                  rounded-xl

                  border
                  border-sky-500/20

                  bg-sky-500/10

                  px-5
                  py-3

                  text-sm
                  font-semibold

                  text-sky-400

                  transition-all
                  duration-300

                  hover:bg-sky-500/20

                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >

                <FileSpreadsheet size={16} />

                Excel

              </button>

            </div>

          </div>

        ))}

      </div>

    </DashboardCard>

  );

}
