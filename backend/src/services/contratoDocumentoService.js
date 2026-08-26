const { jsPDF } = require("jspdf");
const { autoTable } = require("jspdf-autotable");
const extenso = require("extenso");

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatarDataExtensa(data) {
  if (!data) return "Indeterminado";
  // Usa métodos UTC: datas vêm do banco como UTC-midnight, e usar
  // getDate()/getMonth() locais pode "voltar" um dia em fusos negativos.
  const d = new Date(data);
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  });
}

function moedaPorExtenso(valor) {
  try {
    return extenso(Number(valor || 0), {
      mode: "currency",
      currency: { type: "BRL" },
    });
  } catch {
    return "";
  }
}

function numeroPorExtenso(valor) {
  try {
    return extenso(Number(valor || 0));
  } catch {
    return "";
  }
}

function somarMeses(data, meses) {
  const d = new Date(data);
  d.setUTCMonth(d.getUTCMonth() + Number(meses || 0));
  return d;
}

function enderecoUnidade(unidade) {
  if (!unidade) return "-";

  const partes = [
    [unidade.logradouro, unidade.numero].filter(Boolean).join(", "),
    unidade.bairro,
    [unidade.cidade, unidade.uf].filter(Boolean).join(" - "),
  ].filter(Boolean);

  return partes.join(", ") || unidade.nome || "-";
}

function enderecoLocador(locador) {
  if (!locador) return "-";

  const partes = [
    locador.endereco,
    [locador.cidade, locador.uf].filter(Boolean).join(" - "),
  ].filter(Boolean);

  return partes.join(", ") || "-";
}

/* ==========================================
   RENDERIZADOR DE PDF (jsPDF, sem DOM/browser)
========================================== */

class DocBuilder {

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.margin = 20;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.usableWidth = this.pageWidth - this.margin * 2;
    this.y = this.margin;
  }

  quebrarSeNecessario(altura) {
    if (this.y + altura > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.y = this.margin;
    }
  }

  novaPagina() {
    this.doc.addPage();
    this.y = this.margin;
  }

  titulo(texto) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(13);
    this.quebrarSeNecessario(10);
    this.doc.text(texto, this.pageWidth / 2, this.y, { align: "center" });
    this.y += 10;
  }

  secao(texto) {
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10.5);
    this.quebrarSeNecessario(9);
    const linhas = this.doc.splitTextToSize(texto, this.usableWidth);
    linhas.forEach((linha) => {
      this.quebrarSeNecessario(5.5);
      this.doc.text(linha, this.margin, this.y);
      this.y += 5.5;
    });
    this.y += 2;
  }

  paragrafo(texto, { indent = 8 } = {}) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    const linhas = this.doc.splitTextToSize(texto, this.usableWidth - indent);
    linhas.forEach((linha) => {
      this.quebrarSeNecessario(5.2);
      this.doc.text(linha, this.margin + indent, this.y);
      this.y += 5.2;
    });
    this.y += 2.5;
  }

  itemLista(texto) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    const linhas = this.doc.splitTextToSize(`•  ${texto}`, this.usableWidth - 8);
    linhas.forEach((linha, i) => {
      this.quebrarSeNecessario(5.2);
      this.doc.text(linha, this.margin + 8, this.y);
      this.y += 5.2;
    });
    this.y += 1;
  }

  centralizado(texto, { bold = false, size = 10 } = {}) {
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.quebrarSeNecessario(6);
    this.doc.text(texto, this.pageWidth / 2, this.y, { align: "center" });
    this.y += size > 11 ? 7 : 5.5;
  }

  espaco(mm = 4) {
    this.y += mm;
  }

  tabela(head, body) {
    this.quebrarSeNecessario(20);
    autoTable(this.doc, {
      head: [head],
      body,
      startY: this.y,
      margin: { left: this.margin, right: this.margin },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, valign: "top" },
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 45 } },
    });
    this.y = this.doc.lastAutoTable.finalY + 6;
  }

  assinatura(nome, papel) {
    this.espaco(14);
    this.quebrarSeNecessario(16);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    const largura = 80;
    const x = this.pageWidth / 2 - largura / 2;
    this.doc.line(x, this.y, x + largura, this.y);
    this.y += 4.5;
    this.doc.setFont("helvetica", "bold");
    this.doc.text(nome, this.pageWidth / 2, this.y, { align: "center" });
    this.y += 4.5;
    this.doc.setFont("helvetica", "normal");
    this.doc.text(papel, this.pageWidth / 2, this.y, { align: "center" });
    this.y += 6;
  }

  numerarPaginas() {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(120);
      this.doc.text(
        `Página ${i} de ${total}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: "center" }
      );
      this.doc.setTextColor(0);
    }
  }

}

/* ==========================================
   CONTRATO DE LOCAÇÃO RESIDENCIAL
========================================== */

async function gerarContratoPdfBase64(contrato) {

  const locador = contrato.locador || {};
  const inquilino = contrato.inquilino || {};
  const unidade = contrato.unidade || {};
  const kitnet = contrato.kitnet || {};

  const locadorEhPJ = (locador.tipoPessoa || "PJ") === "PJ";
  const locadorDocumento = locador.cpfCnpj || "-";
  const locadorCpfTxt = locadorEhPJ ? "" : `CPF sob o nº ${locadorDocumento}`;
  const locadorCnpjTxt = locadorEhPJ ? `CNPJ sob o nº ${locadorDocumento}` : "";

  const enderecoImovel = enderecoUnidade(unidade);
  const enderecoLocadora = enderecoLocador(locador);
  const cepImovel = unidade.cep || "-";
  const nomeKitnet = kitnet.nome || kitnet.numero || "-";
  const nomeUnidade = unidade.nome || "-";

  const dataInicio = contrato.dataInicio;
  const prazoMeses = inquilino.prazoContrato || null;

  const dataFim =
    contrato.dataFim ||
    (prazoMeses ? somarMeses(dataInicio, prazoMeses) : null);

  const diaVencimento = contrato.diaVencimento || 5;
  const valorAluguel = contrato.valorAluguel || 0;

  // Data usada em todas as assinaturas/anexos/nota promissória do
  // documento -- é a data de início do contrato, NÃO "hoje". O PDF é
  // regerado toda vez que alguém clica em "Baixar" (baixarPdf), então
  // usar new Date() aqui faria a data do contrato mudar a cada
  // download, o que não faz sentido (e já gerava inconsistência: a
  // nota promissória aparecia "emitida" depois do próprio vencimento).
  const hoje = new Date(dataInicio);

  const valorNotaPromissoria = valorAluguel * 3;
  const vencimentoNotaPromissoria = somarMeses(dataInicio, 1);

  const enderecoInquilinoAtual = `${enderecoImovel}, Kitnet ${nomeKitnet}`;

  const b = new DocBuilder();

  /* ---------- CAPA / QUADRO RESUMO ---------- */

  b.titulo("CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL");
  b.espaco(2);
  b.secao("1. QUADRO RESUMO");

  b.tabela(
    ["ITEM", "ESPECIFICAÇÃO", "DETALHAMENTO DAS INFORMAÇÕES"],
    [
      [
        "1",
        "Locadora",
        `${locador.nome || "-"}\n${[locadorCpfTxt, locadorCnpjTxt].filter(Boolean).join(" ")}\nEndereço: ${enderecoLocadora}`,
      ],
      [
        "2",
        "Locatário",
        `${inquilino.nome || "-"}\nCPF: ${inquilino.cpf || "-"}`,
      ],
      [
        "3",
        "Imóvel Locado",
        `Kitnet ${nomeKitnet} - Unidade ${nomeUnidade}\nEndereço: ${enderecoImovel}, CEP: ${cepImovel}`,
      ],
      ["4", "Prazo de Locação", prazoMeses ? `${prazoMeses} (${numeroPorExtenso(prazoMeses)}) meses` : "Indeterminado"],
      ["5", "Data de Início", formatarDataExtensa(dataInicio)],
      ["6", "Data de Término", formatarDataExtensa(dataFim)],
      ["7", "Dia do Pagamento", `Dia ${diaVencimento} (${numeroPorExtenso(diaVencimento)}) de cada mês subsequente`],
      ["8", "Valor do Aluguel", `R$ ${formatarMoeda(valorAluguel)}`],
      ["9", "Limite de Água Incluso", "Até R$ 30,00 (trinta reais) mensais"],
      ["10", "Limite de Energia Incluso", "Até R$ 80,00 (oitenta reais) mensais"],
      ["11", "Taxa de Pintura", "R$ 600,00 (seiscentos reais) pagos na desocupação"],
      ["12", "Taxa de Faxina", "R$ 80,00 (oitenta reais) pagos na desocupação"],
      ["13", "Multa por Portão Aberto", "R$ 230,00 (duzentos e trinta reais) por ocorrência"],
      ["14", "Termo de Vistoria", "ANEXO - I"],
      ["15", "Termo De Entrega De Chaves", "ANEXO - II"],
      ["16", "Declaração De Ciência E Aceite", "ANEXO - III"],
    ]
  );

  b.secao("2. IDENTIFICAÇÃO DAS PARTES");

  b.paragrafo(
    `${locador.nome || "-"}, pessoa ${locadorEhPJ ? "jurídica de direito privado, inscrita no CNPJ sob o nº " + locadorDocumento : "física, inscrita no CPF sob o nº " + locadorDocumento}, com endereço em ${enderecoLocadora}.`,
    { indent: 0 }
  );

  b.paragrafo(
    `LOCATÁRIO: ${inquilino.nome || "-"}, brasileiro(a), profissão e estado civil ignorados, inscrito(a) no CPF sob o nº ${inquilino.cpf || "-"}.`,
    { indent: 0 }
  );

  b.paragrafo(
    "As partes acima qualificadas celebram entre si o presente Contrato de Locação Residencial, regido pela Lei nº 8.245, de 18 de outubro de 1991, mediante as cláusulas e condições seguintes:",
    { indent: 0 }
  );

  /* ---------- CLÁUSULAS ---------- */

  b.secao("3. CLÁUSULA 1 – DO OBJETO");
  b.paragrafo("O objeto deste contrato é a locação do imóvel residencial de propriedade da LOCADORA, especificado no Item 3 do Quadro Resumo.");
  b.paragrafo("O imóvel encontra-se em condições adequadas de habitabilidade e destina-se exclusivamente ao uso residencial do LOCATÁRIO, sendo vedada qualquer alteração de sua destinação, bem como a sublocação, cessão ou empréstimo do imóvel, total ou parcialmente, sem o consentimento prévio e por escrito da LOCADORA.");

  b.secao("4. CLÁUSULA 2 – DA ENTREGA");
  b.paragrafo("A posse do imóvel será entregue ao LOCATÁRIO na data de início especificada no Quadro Resumo, aceitando o LOCATÁRIO as condições e o estado de conservação do bem conforme Termo de Vistoria e Entrega de Chaves, que passa a fazer parte integrante deste instrumento.");

  b.secao("5. CLÁUSULA 3 – DO PRAZO DE LOCAÇÃO E RENOVAÇÃO");
  b.paragrafo("O prazo de locação é aquele definido no Quadro Resumo, com início e término nas datas ali indicadas.");
  b.paragrafo("Parágrafo Primeiro: Se o LOCATÁRIO devolver o imóvel antes do prazo ajustado, deverá comunicar a desocupação com antecedência mínima de 30 (trinta) dias e pagará à LOCADORA a multa compensatória correspondente a 3 (três) meses de aluguel vigente.");
  b.paragrafo("Parágrafo Segundo: O contrato será renovado automaticamente a cada ciclo igual ao prazo de locação inicial, independentemente de notificação prévia, ressalvado o direito de qualquer das partes de comunicar a intenção de retomada ou devolução do imóvel com antecedência mínima de 30 (trinta) dias do término de cada período.");
  b.paragrafo("Parágrafo Terceiro: Em caso de alienação ou oneração do imóvel durante a vigência do contrato, fica garantido ao LOCATÁRIO o direito de preferência nos termos da legislação vigente. Caso ocorra a desapropriação do imóvel, a LOCADORA ficará desobrigada de todas as cláusulas deste contrato.");
  b.paragrafo("Parágrafo Quarto: As partes convencionam que, ocorrendo a renovação automática ou estando o contrato vigente no mês de agosto, o valor do aluguel será reajustado pela variação acumulada do IGP-M (Índice Geral de Preços de Mercado) ou, na sua falta, pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo).");

  b.secao("6. CLÁUSULA 4 – DA DESTINAÇÃO DO IMÓVEL LOCADO");
  b.paragrafo("O imóvel destina-se única e exclusivamente à moradia do LOCATÁRIO, sendo vedada a sublocação, cessão ou empréstimo do imóvel, no todo ou em parte, sem o consentimento prévio e por escrito da LOCADORA.");
  b.paragrafo("Parágrafo Primeiro: O LOCATÁRIO é responsável pela conservação e manutenção do imóvel. Caso sejam necessários reparos, estes deverão ser realizados por profissional indicado pela LOCADORA e cobrados do LOCATÁRIO de forma destacada do aluguel.");
  b.paragrafo("Parágrafo Segundo: O não pagamento imediato dos custos de reparos de responsabilidade do LOCATÁRIO ensejará a rescisão imediata do contrato, com a aplicação das penalidades previstas neste instrumento.");

  b.secao("7. CLÁUSULA 5 – DO ALUGUEL E ENCARGOS");
  b.paragrafo("O valor do aluguel mensal é aquele estipulado no Quadro Resumo, devendo ser pago até a data de vencimento ali indicada.");
  b.paragrafo("Parágrafo Primeiro: Estão incluídos no valor do aluguel os serviços de água, energia elétrica e internet por rede sem fio (wi-fi), observados os limites de consumo mensal estabelecidos no Quadro Resumo. O LOCATÁRIO obriga-se a pagar a diferença que exceder os referidos limites no prazo de 5 (cinco) dias do vencimento da respectiva fatura.");
  b.paragrafo("Parágrafo Segundo: O atraso no pagamento do aluguel ou encargos sujeitará o LOCATÁRIO ao pagamento de multa moratória de 10% (dez por cento) sobre o valor do débito, juros de mora de 1% (um por cento) ao mês e correção monetária pelo IGP-M.");
  b.paragrafo("Parágrafo Terceiro: Em caso de inadimplemento, a LOCADORA fica autorizada a realizar a inscrição do nome do LOCATÁRIO nos órgãos de proteção ao crédito (SPC e SERASA) a partir do dia subsequente ao do vencimento, sem necessidade de aviso prévio.");
  b.paragrafo("Parágrafo Quarto: As partes convencionam que, em caso de atraso no pagamento, a LOCADORA poderá suspender o fornecimento de água, energia elétrica e internet do imóvel até a quitação dos débitos. Após o pagamento integral, a LOCADORA restabelecerá os serviços em até 48 (quarenta e oito) horas.");

  b.secao("8. CLÁUSULA 6 – DA FORMA DE PAGAMENTO");
  b.paragrafo("Todo e qualquer pagamento decorrente deste contrato será realizado exclusivamente por meio de boleto bancário emitido e enviado ao LOCATÁRIO, não sendo aceita outra modalidade de pagamento.");
  b.paragrafo("Parágrafo Primeiro: Eventual pagamento realizado por meio diverso não será considerado válido, sujeitando o LOCATÁRIO à obrigação de realizar novo pagamento por boleto bancário.");
  b.paragrafo("Parágrafo Segundo: O LOCATÁRIO obriga-se a solicitar o envio do boleto bancário à LOCADORA com antecedência mínima de 2 (dois) dias da data de vencimento.");

  b.secao("9. CLÁUSULA 7 – DAS BENFEITORIAS");
  b.paragrafo("O LOCATÁRIO poderá realizar benfeitorias úteis no imóvel, desde que previamente autorizadas por escrito pela LOCADORA.");
  b.paragrafo("Parágrafo Primeiro: Ao término da locação, todas as benfeitorias realizadas incorporar-se-ão ao imóvel, sem que assista ao LOCATÁRIO qualquer direito de retenção, indenização ou compensação.");
  b.paragrafo("Parágrafo Segundo: A LOCADORA poderá exigir a remoção das benfeitorias realizadas, correndo por conta exclusiva do LOCATÁRIO os custos de retirada e de recomposição do imóvel ao estado original verificado na vistoria inicial.");

  b.secao("10. CLÁUSULA 8 – DA MULTA CONTRATUAL");
  b.paragrafo("A infração de qualquer cláusula ou condição deste contrato sujeitará a parte infratora ao pagamento de multa compensatória equivalente a 3 (três) meses de aluguel vigente à época da infração, calculada proporcionalmente ao tempo restante do contrato, sem prejuízo da rescisão de pleno direito da locação e da cobrança de perdas e danos adicionais.");

  b.secao("11. CLÁUSULA 9 – DAS OBRIGAÇÕES DO LOCATÁRIO");
  b.paragrafo("O LOCATÁRIO obriga-se a cumprir as seguintes obrigações, além das demais previstas em lei:");
  b.paragrafo("Parágrafo Primeiro: As partes convencionam que a LOCADORA poderá requerer, a qualquer momento, a vistoria do imóvel, devendo o LOCATÁRIO permitir o livre acesso ao bem, além das vistorias mensais ordinárias que serão registradas por termo de vistoria assinado pelo LOCATÁRIO.");
  b.paragrafo("Parágrafo Segundo: Comunicar imediatamente à LOCADORA qualquer avaria ou necessidade de reparo no imóvel, autorizando a execução dos serviços necessários, cujos custos serão cobrados do LOCATÁRIO caso decorram de uso inadequado.");
  b.paragrafo("Parágrafo Terceiro: Manter o imóvel, bem como suas redes elétrica e hidráulica, em perfeito estado de conservação e funcionamento.");
  b.paragrafo("Parágrafo Quarto: Devolver o imóvel nas mesmas condições em que o recebeu, livre de objetos e pertences pessoais, com a pintura nova realizada pela LOCADORA mediante o pagamento da taxa de pintura especificada no Quadro Resumo.");
  b.paragrafo("Parágrafo Quinto: Responsabilizar-se pela guarda das chaves do imóvel. Em caso de perda, os custos para confecção de novas chaves e serviços de chaveiro correrão por conta exclusiva do LOCATÁRIO.");
  b.paragrafo("Parágrafo Sexto: Pagar a taxa de faxina especificada no Quadro Resumo no momento da desocupação do imóvel, ou entregá-lo em perfeitas condições de limpeza.");
  b.paragrafo("Parágrafo Sétimo: A rescisão do contrato e a cessação da obrigação de pagar o aluguel somente ocorrerão com a efetiva entrega das chaves à LOCADORA, sendo o aluguel cobrado proporcionalmente até essa data.");
  b.paragrafo("Parágrafo Oitavo: O LOCATÁRIO declara-se ciente de que o serviço de internet é fornecido por mera cortesia, não integrando o objeto do contrato, razão pela qual a LOCADORA não responde por interrupções, oscilações ou qualidade da conexão, podendo suspender o serviço a qualquer tempo, sem aviso prévio.");
  b.paragrafo("Parágrafo Nono: Manter o portão de acesso coletivo devidamente trancado, sob pena de aplicação da multa por descumprimento de norma de segurança especificada no Quadro Resumo.");
  b.paragrafo("Parágrafo Décimo: A caixa de correios é de uso coletivo, não respondendo a LOCADORA por extravios, danos ou perdas de correspondências.");

  b.secao("12. CLÁUSULA 10 – DA REMOÇÃO DE PERTENCES E GARANTIA");
  b.paragrafo("Parágrafo Primeiro: As partes convencionam que, persistindo o atraso no pagamento do aluguel ou de qualquer encargo contratual por prazo igual ou superior a 30 (trinta) dias, a LOCADORA fica expressamente autorizada a ingressar no imóvel, realizar a desocupação administrativa e remover todos os pertences pessoais e bens móveis do LOCATÁRIO, conduzindo-os para o depósito da LOCADORA.");
  b.paragrafo("Parágrafo Segundo: Os pertences removidos nos termos desta cláusula somente serão devolvidos ao LOCATÁRIO mediante a quitação integral de todos os débitos pendentes, acrescidos dos encargos contratuais e das despesas decorrentes da remoção e do depósito dos bens.");
  b.paragrafo("Parágrafo Terceiro: Caso transcorram 30 (trinta) dias contados da data da remoção sem que o LOCATÁRIO realize o pagamento integral do débito, os pertences removidos serão dados em pagamento à LOCADORA, operando-se a transferência de propriedade para amortização ou quitação da dívida, sem prejuízo da cobrança de eventual saldo remanescente.");

  b.secao("13. CLÁUSULA 11 – DAS PROIBIÇÕES");
  b.paragrafo("O descumprimento de qualquer das proibições desta cláusula ensejará a rescisão imediata do contrato e a obrigação de desocupação voluntária do imóvel no prazo de 24 (vinte e quatro) horas.");
  b.paragrafo("Parágrafo Primeiro: É expressamente proibido armazenar, guardar ou utilizar no imóvel ou em suas áreas comuns substâncias químicas, tóxicas, entorpecentes ou substâncias ilícitas nos termos da Lei nº 11.343/2006, sob pena de rescisão contratual imediata e denúncia às autoridades competentes.");
  b.paragrafo("Parágrafo Segundo: A locação possui caráter estritamente unipessoal, sendo vedada a residência ou permanência de terceiros, inclusive crianças, em razão das dimensões reduzidas do imóvel, que não comportam condições adequadas de habitabilidade para mais de uma pessoa.");
  b.paragrafo("Parágrafo Terceiro: É expressamente proibida a manutenção, permanência ou guarda de animais de estimação de qualquer porte no imóvel, sob pena de rescisão contratual imediata.");

  b.secao("14. CLÁUSULA 12 – DISPOSIÇÕES GERAIS");
  b.paragrafo("Parágrafo Único: O inadimplemento do aluguel ou de seus encargos autoriza a LOCADORA a pleitear a desocupação liminar do imóvel por meio de medida judicial, sem prejuízo da cobrança das multas e demais encargos contratuais.");

  b.secao("15. CLÁUSULA 13 – DA VISTORIA DO IMÓVEL");
  b.paragrafo("As partes convencionam que a LOCADORA poderá requerer, a qualquer momento, a vistoria do imóvel, devendo o LOCATÁRIO permitir o livre acesso ao bem.");

  b.secao("16. CLÁUSULA 14 – DO FORO");
  b.paragrafo("As partes, sendo pessoas capazes e tendo negociado livremente o presente instrumento, elegem, de forma irrevogável e irretratável, para dirimir eventuais dúvidas resultantes deste contrato, o foro da Comarca de Goiânia, GO, com a expressa renúncia de qualquer outro, por mais privilegiado que possa ser.");
  b.paragrafo("As partes reconhecem como válidas e eficazes as assinaturas eletrônicas previstas em lei que garantam autenticidade, integridade e não repúdio, nos termos da Medida Provisória nº 2.200-2/2001, constituindo título executivo extrajudicial, nos termos do art. 784, §4º, do Código de Processo Civil.");
  b.paragrafo("E, por estarem assim justas e contratadas, assinam o presente instrumento em (02) duas vias de igual teor, na presença das testemunhas abaixo ou eletronicamente, constituindo título executivo extrajudicial, nos termos dos Artigos 784 III e §4º, do Código de Processo Civil.");

  b.espaco(4);
  b.centralizado(`Goiânia, GO, ${formatarDataExtensa(hoje)}.`);
  b.assinatura(locador.nome || "-", "Locadora");
  b.assinatura(inquilino.nome || "-", "Locatário");

  b.espaco(6);
  b.secao("Testemunhas:");
  b.espaco(10);
  b.doc.setFont("helvetica", "normal");
  b.doc.setFontSize(9.5);
  b.doc.text("________________________________________", b.margin, b.y);
  b.doc.text("________________________________________", b.pageWidth / 2 + 5, b.y);
  b.y += 5;
  b.doc.text("Nome:", b.margin, b.y);
  b.doc.text("Nome:", b.pageWidth / 2 + 5, b.y);
  b.y += 5;
  b.doc.text("CPF:", b.margin, b.y);
  b.doc.text("CPF:", b.pageWidth / 2 + 5, b.y);

  /* ---------- ANEXO I – TERMO DE VISTORIA ---------- */

  b.novaPagina();
  b.titulo("ANEXO – I");
  b.espaco(2);
  b.secao("16. TERMO DE VISTORIA PARA FINS DE LOCAÇÃO RESIDENCIAL");

  b.paragrafo(`LOCADORA: ${locador.nome || "-"}.`, { indent: 0 });
  b.paragrafo(`LOCATÁRIO: ${inquilino.nome || "-"}.`, { indent: 0 });
  b.paragrafo(`IMÓVEL: Kitnet ${nomeKitnet}, Unidade ${nomeUnidade}, localizado(a) em ${enderecoImovel}, CEP: ${cepImovel}.`, { indent: 0 });

  b.espaco(2);
  b.paragrafo("Pelo presente instrumento, as partes declaram que vistoriaram o imóvel objeto da locação e constataram que este se encontra em bom estado de conservação, com todos os seus pertences, utensílios e acessórios em perfeito estado de funcionamento, comprometendo-se o LOCATÁRIO a devolvê-lo nas mesmas condições ao término do contrato.", { indent: 0 });

  b.espaco(2);
  b.itemLista("Pintura: Todas as paredes internas e tetos foram pintados com tinta semibrilho na cor branca.");
  b.itemLista("Trincos e Fechaduras: Em bom estado de conservação e funcionamento, com todas as respectivas chaves.");
  b.itemLista("Parte Hidráulica: Em bom estado de conservação e funcionamento, sem vazamentos.");
  b.itemLista("Pisos e Azulejos: Em bom estado de conservação.");
  b.itemLista("Parte Elétrica: Em bom estado de conservação e funcionamento.");
  b.itemLista("Vidraças: Vidros de janelas e basculantes sem trincas.");

  b.espaco(4);
  b.centralizado(`Goiânia, GO, ${formatarDataExtensa(hoje)}.`);
  b.assinatura(locador.nome || "-", "Locadora");
  b.assinatura(inquilino.nome || "-", "Locatário");

  /* ---------- ANEXO II – TERMO DE ENTREGA DE CHAVES ---------- */

  b.novaPagina();
  b.titulo("ANEXO – II");
  b.espaco(2);
  b.secao("17. TERMO DE ENTREGA DE CHAVES");

  b.paragrafo(`O LOCATÁRIO declara que recebeu as chaves do imóvel situado em ${enderecoImovel}, CEP: ${cepImovel}, Kitnet ${nomeKitnet}, passando a exercer a posse direta do imóvel a partir desta data, podendo usá-lo e fruí-lo nos termos do contrato de locação.`, { indent: 0 });

  b.espaco(4);
  b.centralizado(`Goiânia, GO, ${formatarDataExtensa(hoje)}.`);
  b.assinatura(inquilino.nome || "-", "Locatário");

  /* ---------- ANEXO III – DECLARAÇÃO DE CIÊNCIA E ACEITE ---------- */

  b.novaPagina();
  b.titulo("ANEXO – III");
  b.espaco(2);
  b.secao("18. DECLARAÇÃO DE CIÊNCIA E ACEITE");

  b.paragrafo("O LOCATÁRIO declara plena ciência e concordância de que a LOCADORA, em caso de inadimplência no pagamento do aluguel ou encargos, procederá ao bloqueio e à suspensão do fornecimento dos serviços de água, energia elétrica e internet do imóvel até a efetiva quitação dos débitos.", { indent: 0 });
  b.paragrafo("Declara, ainda, ciência de que, após a comprovação do pagamento integral, a LOCADORA terá o prazo de até 48 (quarenta e oito) horas para restabelecer o fornecimento dos serviços suspensos.", { indent: 0 });
  b.paragrafo("As partes convencionam que, persistindo o atraso no pagamento do aluguel ou de qualquer encargo contratual por prazo igual ou superior a 30 (trinta) dias, a LOCADORA fica expressamente autorizada a ingressar no imóvel, realizar a desocupação administrativa e remover todos os pertences pessoais e bens móveis do LOCATÁRIO, conduzindo-os para o depósito da LOCADORA.", { indent: 0 });

  b.espaco(4);
  b.centralizado(`Goiânia, GO, ${formatarDataExtensa(hoje)}.`);
  b.assinatura(inquilino.nome || "-", "Locatário");

  /* ---------- NOTA PROMISSÓRIA ---------- */

  b.novaPagina();
  b.titulo("NOTA PROMISSÓRIA");
  b.espaco(4);

  b.doc.setFont("helvetica", "normal");
  b.doc.setFontSize(10);
  b.doc.text("Número: 001", b.margin, b.y);
  b.y += 5.5;
  b.doc.text(`Vencimento: ${formatarDataExtensa(vencimentoNotaPromissoria)}`, b.margin, b.y);
  b.y += 5.5;
  b.doc.text(`Valor: R$ ${formatarMoeda(valorNotaPromissoria)} (${moedaPorExtenso(valorNotaPromissoria)})`, b.margin, b.y);
  b.y += 8;

  b.paragrafo(
    `No dia ${formatarDataExtensa(hoje)}, pagará por esta única via de nota promissória, na praça de Goiânia, Estado de Goiás, a ${locador.nome || "-"}${locadorEhPJ ? `, inscrita no CNPJ sob o nº ${locadorDocumento}` : `, inscrito(a) no CPF sob o nº ${locadorDocumento}`}, ou à sua ordem, a quantia de R$ ${formatarMoeda(valorNotaPromissoria)} (${moedaPorExtenso(valorNotaPromissoria)}) em moeda corrente nacional.`,
    { indent: 0 }
  );

  b.espaco(2);
  b.centralizado(`Goiânia, GO, ${formatarDataExtensa(hoje)}.`);

  b.espaco(10);
  b.assinatura(inquilino.nome || "-", "Emitente");
  b.centralizado(`CPF: ${inquilino.cpf || "-"}`, { size: 9 });
  b.centralizado(`Endereço: ${enderecoInquilinoAtual}`, { size: 9 });

  b.numerarPaginas();

  const buffer = Buffer.from(b.doc.output("arraybuffer"));

  return buffer.toString("base64");

}

module.exports = {
  gerarContratoPdfBase64,
  formatarDataExtensa,
  formatarMoeda,
  moedaPorExtenso,
  numeroPorExtenso,
  somarMeses,
  enderecoUnidade,
  enderecoLocador,
};
