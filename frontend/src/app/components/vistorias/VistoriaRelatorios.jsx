"use client";

import { useMemo, useState } from "react";
import { FileBarChart, FileSpreadsheet, Download } from "lucide-react";

import Table from "../ui/Table";
import { formatDateTime } from "@/utils/formatDate";
import { exportarPDF, exportarExcel } from "@/utils/exportar";
import { usePermissao } from "../../../hooks/usePermissao";

const COLUNAS_EXPORT = ["Vistoria", "Residência", "Data/Hora Realizada", "Responsável"];

// `missoesRealizadas` vem de cima (vistorias/page.js) -- um estado só,
// compartilhado com a aba Realizadas, pra editar/excluir uma missão lá
// já refletir aqui também, sem cada um buscar (e ficar) com sua
// própria cópia.
export default function VistoriaRelatorios({
  vistorias = [],
  missoesRealizadas = [],
}) {

  const podeExportar = usePermissao("vistorias.exportar");

  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");

  // Junta as duas fontes de "realizada" que existem no sistema: cada
  // missão de uma vistoria "Geral" (uma por residência/ciclo, já é
  // histórico completo) e a última execução registrada de uma vistoria
  // normal (concluidaEm -- só a mais recente, essa não guarda histórico
  // de toda vez que já foi concluída antes).
  const todasRealizadas = useMemo(() => {

    const deMissoes = missoesRealizadas.map((m) => ({
      vistoria: m.vistoria?.titulo || "-",
      residencia: m.unidade?.nome || "-",
      dataHora: m.dataRealizacao,
      responsavel: m.realizadoPor || "-",
    }));

    const deRegulares = vistorias
      .filter((v) => v.unidadeId && v.concluidaEm)
      .map((v) => ({
        vistoria: v.nomeVistoria,
        residencia: v.unidadeNome,
        dataHora: v.concluidaEm,
        responsavel: v.responsavel || "-",
      }));

    return [...deMissoes, ...deRegulares].sort(
      (a, b) => new Date(b.dataHora) - new Date(a.dataHora)
    );

  }, [missoesRealizadas, vistorias]);

  const dentroDoIntervalo = (dataHora) => {

    if (!dataDe && !dataAte) return true;

    const valor = new Date(dataHora).getTime();

    if (dataDe && valor < new Date(dataDe).getTime()) return false;
    if (dataAte && valor > new Date(dataAte).getTime() + 86399999) return false;

    return true;

  };

  const realizadasNoPeriodo = todasRealizadas.filter((item) => dentroDoIntervalo(item.dataHora));

  const linhasExport = realizadasNoPeriodo.map((item) => [
    item.vistoria,
    item.residencia,
    formatDateTime(item.dataHora),
    item.responsavel,
  ]);

  const colunasTabela = [
    { key: "vistoria", title: "Vistoria" },
    { key: "residencia", title: "Residência" },
    { key: "dataHora", title: "Data/Hora Realizada", render: (item) => formatDateTime(item.dataHora) },
    { key: "responsavel", title: "Responsável" },
  ];

  const handleExportarPDF = () => {

    exportarPDF({
      titulo: "Relatório de Vistorias Realizadas",
      subtitulo: `${realizadasNoPeriodo.length} vistoria(s) realizada(s)${dataDe || dataAte ? " no período selecionado" : ""}`,
      secoes: [
        { colunas: COLUNAS_EXPORT, linhas: linhasExport },
      ],
      nomeArquivo: "vistorias-realizadas",
    });

  };

  const handleExportarExcel = () => {

    exportarExcel({
      abas: [
        { nome: "Vistorias Realizadas", colunas: COLUNAS_EXPORT, linhas: linhasExport },
      ],
      nomeArquivo: "vistorias-realizadas",
    });

  };

  return (

    <div className="space-y-6">

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileBarChart className="w-6 h-6 text-blue-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[var(--text)]">Relatórios</h2>
              <p className="text-[var(--text-subtle)]">
                Todas as vistorias realizadas, com residência, data/hora e responsável.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-end gap-3">

            <div>
              <label className="block text-xs text-[var(--text-faint)] mb-1">De</label>
              <input
                type="date"
                value={dataDe}
                onChange={(e) => setDataDe(e.target.value)}
                className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-faint)] mb-1">Até</label>
              <input
                type="date"
                value={dataAte}
                onChange={(e) => setDataAte(e.target.value)}
                className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-emerald-500"
              />
            </div>

            {(dataDe || dataAte) && (
              <button
                onClick={() => { setDataDe(""); setDataAte(""); }}
                className="text-xs text-[var(--text-faint)] hover:text-[var(--text)] underline px-2 py-2"
              >
                Limpar período
              </button>
            )}

          </div>

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <p className="text-[var(--text-subtle)]">
            <span className="text-2xl font-bold text-[var(--text)] mr-2">{realizadasNoPeriodo.length}</span>
            vistoria(s) realizada(s) {dataDe || dataAte ? "no período selecionado" : "no total"}
          </p>

          {podeExportar && (
            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={handleExportarPDF}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/15 border border-red-500/20 px-5 py-3 text-red-400 hover:bg-red-500/25 transition"
              >
                <FileBarChart size={18} />
                <Download size={16} />
                Exportar PDF
              </button>

              <button
                onClick={handleExportarExcel}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 px-5 py-3 text-emerald-400 hover:bg-emerald-500/25 transition"
              >
                <FileSpreadsheet size={18} />
                <Download size={16} />
                Exportar Excel
              </button>

            </div>
          )}

        </div>

      </div>

      <Table
        columns={colunasTabela}
        data={realizadasNoPeriodo}
        emptyMessage="Nenhuma vistoria realizada nesse período."
      />

    </div>

  );

}
