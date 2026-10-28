import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function nomeComData(base, extensao) {
  const data = new Date().toISOString().slice(0, 10);
  return `${base}-${data}.${extensao}`;
}

export function exportarPDF({
  titulo,
  subtitulo,
  secoes,
  nomeArquivo,
}) {

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(titulo, 14, 18);

  // Aceita uma linha só (string) ou várias (array) -- relatório
  // financeiro usa várias: residência, período consultado e quando
  // foi gerado, cada info na sua linha.
  const linhasSubtitulo = Array.isArray(subtitulo) ? subtitulo : subtitulo ? [subtitulo] : [];

  if (linhasSubtitulo.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    linhasSubtitulo.forEach((linha, i) => {
      doc.text(linha, 14, 25 + i * 5);
    });
    doc.setTextColor(0);
  }

  let cursorY = linhasSubtitulo.length > 0 ? 25 + linhasSubtitulo.length * 5 + 7 : 26;

  secoes.forEach((secao) => {

    if (secao.titulo) {
      doc.setFontSize(12);
      doc.text(secao.titulo, 14, cursorY);
      cursorY += 4;
    }

    autoTable(doc, {
      startY: cursorY,
      head: [secao.colunas],
      body: secao.linhas,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
    });

    cursorY = doc.lastAutoTable.finalY + 12;

  });

  doc.save(nomeComData(nomeArquivo, "pdf"));

}

export function exportarExcel({
  abas,
  nomeArquivo,
  infoLinhas,
}) {

  const workbook = XLSX.utils.book_new();

  abas.forEach((aba) => {

    const planilha = XLSX.utils.aoa_to_sheet([
      // Mesma info de residência/período/geração do PDF, uma linha
      // acima dos cabeçalhos -- cada linha de info numa célula só
      // (coluna A), o resto da linha fica vazio.
      ...(infoLinhas || []).map((linha) => [linha]),
      ...(infoLinhas?.length ? [[]] : []),
      aba.colunas,
      ...aba.linhas,
    ]);

    XLSX.utils.book_append_sheet(
      workbook,
      planilha,
      aba.nome.slice(0, 31)
    );

  });

  XLSX.writeFile(workbook, nomeComData(nomeArquivo, "xlsx"));

}
