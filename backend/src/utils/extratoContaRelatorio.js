// Mesma lógica de frontend/src/app/components/financeiro/FinanceiroAsaas.jsx
// (montarLinhaRelatorio/exportarRelatorioReceitas) -- cópia fiel, pro
// envio agendado (ver relatorioEnvioService.js) gerar esse Extrato de
// Receitas por conta/mês sem precisar do navegador aberto. Mantém as
// MESMAS contas/colunas/fórmulas dos dois lados -- ver aquele arquivo
// pro porquê de cada campo (valor real confirmado vs. estimado, Nosso
// Número por provider, etc.).

function diasDeAtraso(vencimento, dataPagamento) {
  if (!vencimento || !dataPagamento) return 0;
  const umDia = 24 * 60 * 60 * 1000;
  const dias = Math.floor((new Date(dataPagamento) - new Date(vencimento)) / umDia);
  return Math.max(0, dias);
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatarData(valor) {
  if (!valor) return "-";
  try {
    return new Date(valor).toLocaleDateString("pt-BR");
  } catch {
    return "-";
  }
}

function montarLinhaRelatorio(item, taxaBoletoValor) {

  const valorAluguel = item.valorAluguelContrato ?? item.valorBruto;
  const excedentes = item.valorAluguelContrato != null
    ? Math.max(0, item.valorBruto - item.valorAluguelContrato)
    : 0;

  const temValorConfirmado = item.valorMultaRecebida != null || item.valorJurosRecebido != null;

  let jurosMulta;

  if (temValorConfirmado) {
    jurosMulta = Number(item.valorMultaRecebida || 0) + Number(item.valorJurosRecebido || 0);
  } else {
    const atraso = diasDeAtraso(item.vencimento, item.dataPagamento);
    const multa = atraso > 0 ? item.valorBruto * (Number(item.multaValor || 0) / 100) : 0;
    const juros = atraso > 0 ? item.valorBruto * (Number(item.jurosValor || 0) / 100) * (atraso / 30) : 0;
    jurosMulta = multa + juros;
  }

  const tarifaBoleto = Number(taxaBoletoValor || 0);
  const deducao = item.valorDeducaoInquilino ?? item.taxaAdministracaoLocador ?? 0;

  const valorFinal = valorAluguel + jurosMulta - tarifaBoleto - deducao + excedentes;

  const mesReferencia = item.vencimento
    ? new Date(item.vencimento).toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric", timeZone: "UTC" })
    : "-";

  const vigenciaContrato = item.contratoDataInicio
    ? `${formatarData(item.contratoDataInicio)} a ${item.contratoDataFim ? formatarData(item.contratoDataFim) : "-"}`
    : "-";

  return {
    nossoNumero: item.nossoNumero || "-",
    cpf: item.cpf || "-",
    pagador: item.pagador || "-",
    dataPagamento: item.dataCredito ?? item.dataPagamento,
    unidadeKitnet: [item.unidade, item.kitnet ? `Kitnet ${item.kitnet}` : null].filter(Boolean).join(" - ") || "-",
    enderecoCompleto: item.enderecoCompleto || "-",
    cep: item.cep || "-",
    mesReferencia,
    vigenciaContrato,
    valorAluguel,
    jurosMulta,
    tarifaBoleto,
    deducao,
    excedentes,
    valorFinal,
  };

}

// `resultado` = retorno de contaPagamentoService.recebidoDoMes(contaId, mes).
const gerarRelatorioExtratoConta = (resultado) => {

  const ehAsaas = resultado.receitas?.[0]?.gatewayProvider === "ASAAS";
  const linhas = (resultado.receitas || []).map((item) => montarLinhaRelatorio(item, resultado.taxaBoletoValor));

  const colunas = [
    "Nosso nº", ehAsaas ? "Data de Recebimento" : "Pagamento", "CPF", "Locatário",
    "Unidade/Kitnet", "Endereço", "CEP", "Mês referência", "Vigência do contrato",
    "Valor aluguel", "Juros / mult", "Tarifa boleto", "Dedução",
    ...(ehAsaas ? [] : ["Excedentes"]),
    "Valor final",
  ];

  const soma = (campo) => linhas.reduce((total, l) => total + Number(l[campo] || 0), 0);

  const linhaPlanilha = (l) => [
    l.nossoNumero,
    formatarData(l.dataPagamento),
    l.cpf,
    l.pagador,
    l.unidadeKitnet,
    l.enderecoCompleto,
    l.cep,
    l.mesReferencia,
    l.vigenciaContrato,
    formatarMoeda(l.valorAluguel),
    formatarMoeda(l.jurosMulta),
    formatarMoeda(l.tarifaBoleto),
    formatarMoeda(l.deducao),
    ...(ehAsaas ? [] : [formatarMoeda(l.excedentes)]),
    formatarMoeda(l.valorFinal),
  ];

  const linhasPlanilha = [
    ...linhas.map(linhaPlanilha),
    [],
    linhaPlanilha({
      cpf: "", pagador: "Total", unidadeKitnet: "", enderecoCompleto: "", cep: "",
      mesReferencia: "", vigenciaContrato: "",
      valorAluguel: soma("valorAluguel"),
      jurosMulta: soma("jurosMulta"),
      tarifaBoleto: soma("tarifaBoleto"),
      deducao: soma("deducao"),
      excedentes: soma("excedentes"),
      valorFinal: soma("valorFinal"),
    }),
  ];

  return {
    titulo: `Relatório de Receitas - ${resultado.contaNome || ""} - ${resultado.mes}`,
    colunas,
    linhas: linhasPlanilha,
  };

};

module.exports = { gerarRelatorioExtratoConta };
