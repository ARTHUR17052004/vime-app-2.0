const { jsPDF } = require("jspdf");

const modeloDocumentoService = require("./modeloDocumentoService");

// Mesmos marcadores usados em frontend/src/utils/gerarContratoPdf.js
// (editor de modelo em /administracao/modelos) — mantidos em sincronia
// manualmente já que backend e frontend não compartilham módulos.
const MODELO_PADRAO_CONTRATO = `CONTRATO DE LOCAÇÃO RESIDENCIAL

LOCADOR: {{locador_nome}}
INQUILINO: {{inquilino_nome}}, CPF {{inquilino_cpf}}

OBJETO: O presente contrato tem como objeto a locação do imóvel {{unidade_nome}}, kitnet {{kitnet_nome}}.

VALOR: O valor do aluguel mensal é de R$ {{valor_aluguel}}, com vencimento todo dia {{dia_vencimento}} de cada mês.

VIGÊNCIA: O presente contrato tem início em {{data_inicio}} e término em {{data_fim}}.

GARANTIA: {{tipo_garantia}}, no valor de R$ {{valor_caucao}}.

REAJUSTE: O valor do aluguel será reajustado anualmente pelo índice {{indice_reajuste}}.

OBSERVAÇÕES: {{observacoes}}

E por estarem justos e contratados, firmam o presente instrumento.`;

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR") : "Indeterminado";
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
}

function preencherModelo(template, contrato) {

  const valores = {
    "{{locador_nome}}": contrato.locador?.nome || "-",
    "{{inquilino_nome}}": contrato.inquilino?.nome || "-",
    "{{inquilino_cpf}}": contrato.inquilino?.cpf || "-",
    "{{unidade_nome}}": contrato.unidade?.nome || "-",
    "{{kitnet_nome}}": contrato.kitnet?.nome || contrato.kitnet?.numero || "-",
    "{{valor_aluguel}}": formatarMoeda(contrato.valorAluguel),
    "{{dia_vencimento}}": contrato.diaVencimento ?? "-",
    "{{data_inicio}}": formatarData(contrato.dataInicio),
    "{{data_fim}}": formatarData(contrato.dataFim),
    "{{tipo_garantia}}": contrato.tipoGarantia || "Não informado",
    "{{valor_caucao}}": formatarMoeda(contrato.valorCaucao),
    "{{indice_reajuste}}": contrato.indiceReajuste || "Não informado",
    "{{observacoes}}": contrato.observacoes || "Nenhuma.",
  };

  let resultado = template;

  Object.entries(valores).forEach(([chave, valor]) => {
    resultado = resultado.split(chave).join(String(valor));
  });

  return resultado;

}

async function gerarContratoPdfBase64(contrato) {

  const modelo = await modeloDocumentoService.buscarPorTipo("CONTRATO");

  const template = modelo?.conteudo || MODELO_PADRAO_CONTRATO;

  const texto = preencherModelo(template, contrato);

  const doc = new jsPDF();

  const margem = 18;
  const larguraUtil = doc.internal.pageSize.getWidth() - margem * 2;
  const alturaPagina = doc.internal.pageSize.getHeight();

  doc.setFontSize(11);

  const linhas = doc.splitTextToSize(texto, larguraUtil);

  let y = margem;

  linhas.forEach((linha) => {

    if (y > alturaPagina - margem) {
      doc.addPage();
      y = margem;
    }

    doc.text(linha, margem, y);

    y += 6;

  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return buffer.toString("base64");

}

module.exports = {
  preencherModelo,
  gerarContratoPdfBase64,
};
