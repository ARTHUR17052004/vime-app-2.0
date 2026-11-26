const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default || require("jspdf-autotable");
const XLSX = require("xlsx");

// Mesmo layout de frontend/src/utils/exportar.js (exportarPDF/exportarExcel),
// só que devolvendo um Buffer em vez de disparar download no navegador --
// usado pelo envio agendado de relatório (ver relatorioEnvioService.js),
// que roda sem ninguém com o navegador aberto.

const gerarPdfBuffer = ({ titulo, linhas, colunas }) => {

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(titulo, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 25);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 32,
    head: [colunas],
    body: linhas,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
    margin: { left: 14, right: 14 },
  });

  return Buffer.from(doc.output("arraybuffer"));

};

const gerarExcelBuffer = ({ titulo, linhas, colunas }) => {

  const workbook = XLSX.utils.book_new();

  const planilha = XLSX.utils.aoa_to_sheet([
    colunas,
    ...linhas,
  ]);

  XLSX.utils.book_append_sheet(workbook, planilha, titulo.slice(0, 31));

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

};

module.exports = { gerarPdfBuffer, gerarExcelBuffer };
