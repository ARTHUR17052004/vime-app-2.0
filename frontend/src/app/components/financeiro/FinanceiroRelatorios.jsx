"use client";

import {
  FileBarChart,
  FileSpreadsheet,
  Download,
} from "lucide-react";

import Table from "../ui/Table";
import { exportarPDF, exportarExcel } from "@/utils/exportar";
import { formatDate } from "@/utils/formatDate";
import { usePermissao } from "../../../hooks/usePermissao";

const COLUNAS_RECEITAS = ["VIME", "Kitnet", "Categoria", "Descrição", "Valor", "Vencimento", "Status"];
const COLUNAS_DESPESAS = ["VIME", "Categoria", "Descrição", "Valor", "Vencimento", "Status"];

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR") : "-";
}

// Receita não tem residência/kitnet direto -- vem do contrato (quando
// tem) ou do inquilino (receita avulsa, sem contrato formal). Os dois
// caminhos levam ao mesmo lugar, só checa os dois.
function imovelDaReceita(item) {

  const kitnet = item.contrato?.kitnet || item.inquilino?.kitnet || null;
  const unidade = item.contrato?.unidade || item.inquilino?.kitnet?.unidade || null;

  return {
    vime: unidade?.nome || "-",
    kitnet: kitnet?.numero ? `Kitnet ${kitnet.numero}` : "-",
  };

}

// Despesa é por residência (VIME) só -- o cadastro não tem kitnet
// nenhuma amarrada, por isso não existe coluna "Kitnet" pra ela.
function imovelDaDespesa(item) {
  return { vime: item.unidade?.nome || "-" };
}

// Sem residência escolhida no filtro (relatório de "todas"), ordena
// pelo imóvel -- VIME e, pra receita, depois Kitnet -- em vez de deixar
// na ordem que a tabela da tela já estava (vencimento, valor...). Com
// uma residência já escolhida, todo mundo já é dela mesma: mantém a
// ordem que veio.
function ordenarPorImovel(itens, resolverImovel) {

  return [...itens].sort((a, b) => {

    const imovelA = resolverImovel(a);
    const imovelB = resolverImovel(b);

    const porVime = imovelA.vime.localeCompare(imovelB.vime, "pt-BR");
    if (porVime !== 0) return porVime;

    return (imovelA.kitnet || "").localeCompare(imovelB.kitnet || "", "pt-BR");

  });

}

export default function FinanceiroRelatorios({
  receitas = [],
  despesas = [],
  nomeResidencia,
  dataDe,
  dataAte,
}) {

  const podeExportar = usePermissao("financeiro.exportar");

  // dataDe/dataAte vêm cru de <input type="date"> ("AAAA-MM-DD") --
  // formatDate() (não formatarData() local) é o que trata esse formato
  // sem o bug de fuso (new Date() direto nessa string "volta" um dia).
  const linhasInfo = [
    nomeResidencia ? `Residência: ${nomeResidencia}` : "Residência: Todas as residências",
    dataDe || dataAte
      ? `Período: ${dataDe ? formatDate(dataDe) : "início"} até ${dataAte ? formatDate(dataAte) : "hoje"}`
      : "Período: todos os registros (sem filtro de data)",
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
  ];

  // Só reordena por imóvel quando NENHUMA residência foi escolhida no
  // filtro -- com uma já escolhida, a lista toda já é dela mesma.
  const receitasOrdenadas = nomeResidencia
    ? receitas
    : ordenarPorImovel(receitas, imovelDaReceita);

  const despesasOrdenadas = nomeResidencia
    ? despesas
    : ordenarPorImovel(despesas, imovelDaDespesa);

  const linhasReceitas = receitasOrdenadas.map((item) => {
    const { vime, kitnet } = imovelDaReceita(item);
    return [
      vime,
      kitnet,
      item.categoria || "-",
      item.descricao || "-",
      formatarMoeda(item.valor),
      formatarData(item.vencimento),
      item.status || "-",
    ];
  });

  const linhasDespesas = despesasOrdenadas.map((item) => [
    imovelDaDespesa(item).vime,
    item.categoria || "-",
    item.descricao || "-",
    formatarMoeda(item.valor),
    formatarData(item.vencimento),
    item.status || "-",
  ]);

  const handleExportarPDF = () => {

    exportarPDF({
      titulo: `Relatório Financeiro - ${nomeResidencia || "Todas as Residências"}`,
      subtitulo: [...linhasInfo, `Receitas: ${receitas.length} · Despesas: ${despesas.length}`],
      secoes: [
        { titulo: "Receitas", colunas: COLUNAS_RECEITAS, linhas: linhasReceitas },
        { titulo: "Despesas", colunas: COLUNAS_DESPESAS, linhas: linhasDespesas },
      ],
      nomeArquivo: "relatorio-financeiro",
    });

  };

  const handleExportarExcel = () => {

    exportarExcel({
      abas: [
        { nome: "Receitas", colunas: COLUNAS_RECEITAS, linhas: linhasReceitas },
        { nome: "Despesas", colunas: COLUNAS_DESPESAS, linhas: linhasDespesas },
      ],
      infoLinhas: [`Relatório Financeiro - ${nomeResidencia || "Todas as Residências"}`, ...linhasInfo],
      nomeArquivo: "relatorio-financeiro",
    });

  };

  return (

    <Table>

      <div className="px-6 pt-6">

        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12

              rounded-2xl

              bg-blue-500/10

              border
              border-blue-500/20

              flex
              items-center
              justify-center
            "
          >

            <FileBarChart className="w-6 h-6 text-blue-400" />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-[var(--text)]">
              Relatórios
            </h2>

            <p className="text-[var(--text-subtle)]">
              Exportação de informações financeiras.
            </p>

          </div>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 p-6">

        <div
          className="
            rounded-2xl

            border
            border-[var(--border-token)]

            bg-[var(--surface-2)]

            p-6

            hover:bg-[var(--surface-2)]

            transition
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <FileBarChart className="w-6 h-6 text-red-400" />

            <h3 className="text-xl font-semibold text-[var(--text)]">
              Relatório PDF
            </h3>

          </div>

          <p className="text-[var(--text-subtle)] mb-6">
            Exportar receitas, despesas e fluxo de caixa.
          </p>

          {podeExportar && (
            <button
              onClick={handleExportarPDF}
              className="
                flex
                items-center
                gap-2

                rounded-xl

                bg-red-500/15

                border
                border-red-500/20

                px-5
                py-3

                text-red-400

                hover:bg-red-500/25

                transition
              "
            >

              <Download size={18} />

              Exportar PDF

            </button>
          )}

        </div>

        <div
          className="
            rounded-2xl

            border
            border-[var(--border-token)]

            bg-[var(--surface-2)]

            p-6

            hover:bg-[var(--surface-2)]

            transition
          "
        >

          <div className="flex items-center gap-3 mb-4">

            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />

            <h3 className="text-xl font-semibold text-[var(--text)]">
              Relatório Excel
            </h3>

          </div>

          <p className="text-[var(--text-subtle)] mb-6">
            Exportar planilhas financeiras.
          </p>

          {podeExportar && (
            <button
              onClick={handleExportarExcel}
              className="
                flex
                items-center
                gap-2

                rounded-xl

                bg-emerald-500/15

                border
                border-emerald-500/20

                px-5
                py-3

                text-emerald-400

                hover:bg-emerald-500/25

                transition
              "
            >

              <Download size={18} />

              Exportar Excel

            </button>
          )}

        </div>

      </div>

    </Table>

  );

}