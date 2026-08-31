const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');

const ClicksignApiV3 = require("./ClicksignApiV3");
const signatarioFixoService = require("./signatarioFixoService");
const logService = require("./logService");
const auditoriaService = require("./auditoriaService");
const WhatsappService = require("./whatsappService");
const notificacaoService = require("./notificacaoService");
const contratoDocumentoService = require("./contratoDocumentoService");
const campoObrigatorioService = require("./campoObrigatorioService");
const { filtroContrato } = require("../utils/escopoLocador");

const {
  formatarDataExtensa,
  formatarMoeda,
  moedaPorExtenso,
  numeroPorExtenso,
  somarMeses,
  enderecoUnidade,
  enderecoLocador,
} = contratoDocumentoService;

// Nome de arquivo legível pro documento no Clicksign -- antes ficava
// "contrato-<uuid>.pdf", sem nenhuma relação visível com o inquilino.
const slugificarNomeArquivo = (nome) => {
  return (nome || 'inquilino')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
};

const DIAS_ALERTA_VENCIMENTO = 10;

// Notifica (uma única vez por contrato) quando o contrato está a até
// DIAS_ALERTA_VENCIMENTO dias do fim. Chamado tanto na hora de criar o
// contrato (pra já avisar se ele já nascer perto do vencimento) quanto
// pelo job diário que varre os contratos já em andamento.
const notificarSeVencimentoProximo = async (contrato) => {

  if (!contrato.dataFim || !['ATIVO', 'PENDENTE'].includes(contrato.status)) return;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const fim = new Date(contrato.dataFim);
  fim.setHours(0, 0, 0, 0);

  const diasRestantes = Math.round((fim - hoje) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0 || diasRestantes > DIAS_ALERTA_VENCIMENTO) return;

  const link = `/contratos/${contrato.id}`;

  const jaNotificado = await prisma.notificacao.findFirst({
    where: { link, titulo: 'Contrato próximo do vencimento' }
  });

  if (jaNotificado) return;

  const inquilino = contrato.inquilino || await prisma.inquilino.findUnique({
    where: { id: contrato.inquilinoId }
  });

  await notificacaoService.criar({
    origem: 'SISTEMA',
    titulo: 'Contrato próximo do vencimento',
    mensagem: `O contrato de ${inquilino?.nome || 'um inquilino'} vence ${diasRestantes === 0 ? 'hoje' : `em ${diasRestantes} dia(s)`} (${fim.toLocaleDateString('pt-BR')}).`,
    link
  });

};

// A tela de edição pré-preenche o formulário espalhando o contrato
// inteiro (que vem com locador/unidade/kitnet/inquilino/receitas
// aninhados), e reenvia tudo isso no salvar -- sem isso o
// prisma.contrato.update() quebra com "Unknown argument" pros campos
// de relação.
const sanitizar = (dados) => {

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.locador;
  delete dados.unidade;
  delete dados.kitnet;
  delete dados.inquilino;
  delete dados.receitas;

  return dados;

};

const listar = (usuario) => {
  return prisma.contrato.findMany({
    where: filtroContrato(usuario),
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true,
      receitas: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = async (id, usuario) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      locador: true,
      unidade: true,
      kitnet: true,
      inquilino: true,
      receitas: true
    }
  });

  if (usuario?.locadorId && contrato && contrato.locadorId !== usuario.locadorId) {
    return null;
  }

  return contrato;

};

const criar = async (dados) => {

  // Signatários extras não são mais definidos na criação do contrato --
  // agora são escolhidos na hora de enviar à Clicksign (ver
  // enviarParaClicksign). Não é campo do model Contrato, então sai do
  // payload antes do create, se vier.
  delete dados.signatariosExtras;

  // O cadastro de Inquilino já exige na etapa 3 os mesmos campos que
  // "Contratos" marca como obrigatórios, então o contrato automático
  // normalmente chega aqui completo. `ignorarObrigatorios` cobre o caso
  // de um campo (ex.: Índice de Reajuste) não ter mais entrada nenhuma
  // naquele formulário -- não faz sentido travar por ele; dá pra
  // completar depois editando o contrato.
  const pularValidacaoObrigatorios = dados.pularValidacaoObrigatorios === true;
  const ignorarObrigatorios = dados.ignorarObrigatorios || [];
  delete dados.pularValidacaoObrigatorios;
  delete dados.ignorarObrigatorios;

  if (!pularValidacaoObrigatorios) {
    await campoObrigatorioService.validar('contrato', dados, { ignorar: ignorarObrigatorios });
  }

  if (!dados.dataInicio) {
    throw new Error('Data de início do contrato é obrigatória.');
  }
  dados.dataInicio = new Date(dados.dataInicio);
  dados.dataFim = dados.dataFim !== undefined ? paraDataOuNull(dados.dataFim) : null;

  // Sem data final informada, o contrato vale por 4 meses a partir do
  // início -- valor padrão, ainda editável em Contratos depois.
  if (!dados.dataFim) {
    const fimPadrao = new Date(dados.dataInicio);
    fimPadrao.setMonth(fimPadrao.getMonth() + 4);
    dados.dataFim = fimPadrao;
  }

  const kitnet = await prisma.kitnet.findUnique({
    where: {
      id: dados.kitnetId
    }
  });

  const unidade = await prisma.unidade.findUnique({
    where: {
      id: dados.unidadeId
    }
  });

  const locador = await prisma.locador.findUnique({
    where: {
      id: dados.locadorId
    }
  });

  const inquilino = await prisma.inquilino.findUnique({
    where: {
      id: dados.inquilinoId
    }
  });

  if (!kitnet) {
    throw new Error('Kitnet não encontrada.');
  }

  if (!unidade) {
    throw new Error('Unidade não encontrada.');
  }

  if (!locador) {
    throw new Error('Locador não encontrado.');
  }

  if (!inquilino) {
    throw new Error('Inquilino não encontrado.');
  }

  // "PENDENTE" entra na checagem junto de "ATIVO": um contrato recém-criado
  // fica pendente até a assinatura na Clicksign, mas já ocupa a kitnet/o
  // inquilino nesse meio-tempo — sem isso dava pra criar dois contratos
  // pro mesmo inquilino/kitnet enquanto o primeiro ainda esperava assinatura.
  const statusEmVigor = { in: ["ATIVO", "PENDENTE"] };

  const contratoAtivo = await prisma.contrato.findFirst({
    where: {
      inquilinoId: dados.inquilinoId,
      status: statusEmVigor
    }
  });

  const contratoKitnet = await prisma.contrato.findFirst({
    where: {
      kitnetId: dados.kitnetId,
      status: statusEmVigor
    }
  });

  if (contratoKitnet) {
    throw new Error(
      "Esta kitnet já possui um contrato ativo."
    );
  }

  const contratoUnidade = await prisma.contrato.findFirst({
    where: {
      unidadeId: dados.unidadeId,
      kitnetId: dados.kitnetId,
      status: statusEmVigor
    }
  });

  if (
    contratoUnidade &&
    contratoUnidade.id !== contratoKitnet?.id
  ) {
    throw new Error(
      "Já existe um contrato ativo para esta unidade/kitnet."
    );
  }

  if (contratoAtivo) {
    throw new Error(
      "Este inquilino já possui um contrato ativo."
    );
  }

  if (kitnet.unidadeId !== unidade.id) {
    throw new Error(
      'A kitnet informada não pertence à unidade selecionada.'
    );
  }

  if (unidade.locadorId !== locador.id) {
    throw new Error(
      'A unidade informada não pertence ao locador selecionado.'
    );
  }

  if (inquilino.kitnetId !== kitnet.id) {
    throw new Error(
      'O inquilino informado não pertence à kitnet selecionada.'
    );
  }

  // Não checamos kitnet.ocupada aqui: esse flag é marcado assim que um
  // inquilino é vinculado (inquilinoService.criar), antes de chegar
  // neste ponto — checar aqui sempre barraria a criação. A checagem
  // real de contrato duplicado já é feita acima via `contratoKitnet`.

  if (dados.valorAluguel <= 0) {
    throw new Error(
      'Valor do aluguel inválido.'
    );
  }

  if (
    dados.diaVencimento < 1 ||
    dados.diaVencimento > 31
  ) {
    throw new Error(
      'Dia de vencimento inválido.'
    );
  }

  if (
    dados.dataFim &&
    new Date(dados.dataFim) <= new Date(dados.dataInicio)
  ) {
    throw new Error(
      'A data final deve ser maior que a data inicial.'
    );
  }

  const contrato = await prisma.contrato.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: contrato
  });

  // O contrato NÃO é mais enviado à Clicksign automaticamente aqui --
  // fica só salvo no VIME. O envio agora é uma ação separada e
  // deliberada (ver enviarParaClicksign), pedida depois que o usuário
  // confere o demonstrativo do contrato na tela.
  try {

    await WhatsappService.enviarMensagem({
      numero: inquilino.telefone,
      mensagem: `Olá ${inquilino.nome}, seu contrato foi criado com sucesso. Em breve você receberá o link para assinatura.`
    });

  } catch (integracaoError) {

    console.error(
      "Erro ao enviar mensagem de WhatsApp na criação do contrato:",
      integracaoError.message
    );

  }

  // A receita/cobrança do aluguel é criada só depois que o contrato
  // for assinado de verdade (ver processarWebhook -> "signature_finished").

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  await prisma.inquilino.update({
    where: {
      id: dados.inquilinoId
    },
    data: {
      ativo: true
    }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "CRIAR",
    descricao: `Contrato ${contrato.id} criado.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Novo contrato criado",
    mensagem: `Contrato de ${inquilino.nome} na kitnet ${kitnet.numero} foi criado.`,
    link: `/contratos/${contrato.id}`
  });

  try {
    await notificarSeVencimentoProximo({ ...contrato, inquilino });
  } catch (erroNotificacao) {
    console.error("Erro ao notificar vencimento próximo do contrato recém-criado:", erroNotificacao.message);
  }

  return contrato;

};

const atualizar = async (id, dados) => {

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('contrato', dados);

  if (dados.dataInicio !== undefined) {
    if (!dados.dataInicio) {
      throw new Error('Data de início do contrato é obrigatória.');
    }
    dados.dataInicio = new Date(dados.dataInicio);
  }
  if (dados.dataFim !== undefined) dados.dataFim = paraDataOuNull(dados.dataFim);

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  if (dados.inquilinoId && dados.inquilinoId !== anterior?.inquilinoId) {

    const contratoAtivo = await prisma.contrato.findFirst({
      where: {
        inquilinoId: dados.inquilinoId,
        status: { in: ["ATIVO", "PENDENTE"] },
        id: { not: id },
      }
    });

    if (contratoAtivo) {
      throw new Error("Este inquilino já possui um contrato ativo.");
    }

  }

  const contrato = await prisma.contrato.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: contrato
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ATUALIZAR",
    descricao: `Contrato ${contrato.id} atualizado.`
  });

  return contrato;

};

const remover = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id },
    include: {
      receitas: true
    }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  if (contrato.receitas.length > 0) {
    throw new Error(
      'Não é possível excluir um contrato que possui receitas vinculadas.'
    );
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "EXCLUIR",
    valorAnterior: contrato,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "EXCLUIR",
    descricao: `Contrato ${contrato.id} excluído.`
  });

  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: "DISPONIVEL"
    }
  });

  await prisma.inquilino.update({
    where: {
      id: contrato.inquilinoId
    },
    data: {
      ativo: false
    }
  });

  return prisma.contrato.delete({
    where: { id }
  });

};

const encerrar = async (id) => {

  const contrato = await prisma.contrato.findUnique({
    where: { id }
  });

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  const contratoEncerrado = await prisma.contrato.update({
    where: { id },
    data: {
      status: 'ENCERRADO',
      dataFim: contrato.dataFim || new Date()
    }
  });

  await prisma.kitnet.update({
    where: {
      id: contrato.kitnetId
    },
    data: {
      ocupada: false,
      status: 'DISPONIVEL'
    }
  });

  await prisma.inquilino.update({
    where: {
      id: contrato.inquilinoId
    },
    data: {
      ativo: false
    }
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "ENCERRAR",
    valorAnterior: contrato,
    valorNovo: contratoEncerrado
  });

  await prisma.receita.updateMany({
    where: {
      contratoId: contrato.id,
      status: "PENDENTE",
      vencimento: {
        gt: new Date()
      }
    },
    data: {
      status: "CANCELADA"
    }
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "ENCERRAR",
    descricao: `Contrato ${contrato.id} encerrado.`
  });

  await notificacaoService.criar({
    origem: "SISTEMA",
    titulo: "Contrato encerrado",
    mensagem: `Contrato ${contrato.id} foi encerrado.`,
    link: `/contratos/${contrato.id}`
  });

  try {
    await WhatsappService.enviarMensagem({
      numero: contrato.inquilino?.telefone,
      mensagem: "Seu contrato foi encerrado."
    });
  } catch (whatsappError) {
    console.error("Erro ao enviar WhatsApp de encerramento:", whatsappError.message);
  }

  return contratoEncerrado;

};

// Prazo padrão de renovação: sempre 4 meses a partir do dia em que o
// usuário clica em "Renovar" (não a partir do fim do contrato anterior
// -- combinado com o usuário: a renovação conta da data do clique).
const MESES_RENOVACAO = 4;

const renovar = async (id) => {

  const anterior = await prisma.contrato.findUnique({
    where: { id }
  });

  if (!anterior) {
    throw new Error('Contrato não encontrado.');
  }

  const novaDataFim = somarMeses(new Date(), MESES_RENOVACAO);

  const contrato = await prisma.contrato.update({
    where: { id },
    data: {
      dataFim: novaDataFim,
      status: 'ATIVO',
    }
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    registroId: contrato.id,
    acao: "RENOVAR",
    valorAnterior: anterior,
    valorNovo: contrato
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CONTRATOS",
    acao: "RENOVAR",
    descricao: `Contrato ${contrato.id} renovado.`
  });

  return contrato;

};

// Monta os dados no formato exato esperado pelo Modelo cadastrado na
// Clicksign (ver docs/modelo-contrato-clicksign.txt -- os nomes de
// campo aqui têm que bater 100% com os {{placeholders}} do modelo).
const montarDadosModeloClicksign = (contrato) => {

  const locador = contrato.locador || {};
  const inquilino = contrato.inquilino || {};
  const unidade = contrato.unidade || {};
  const kitnet = contrato.kitnet || {};

  const locadorEhPJ = (locador.tipoPessoa || 'PJ') === 'PJ';
  const locadorDocumento = locador.cpfCnpj || '';

  const dataInicio = contrato.dataInicio;
  const prazoMeses = inquilino.prazoContrato || null;
  const dataFim = contrato.dataFim || (prazoMeses ? somarMeses(dataInicio, prazoMeses) : null);

  const valorAluguel = contrato.valorAluguel || 0;
  const valorNotaPromissoria = valorAluguel * 3;
  const vencimentoNotaPromissoria = somarMeses(dataInicio, 1);

  return {
    locador_nome: locador.nome || '',
    locador_cpf: locadorEhPJ ? '' : locadorDocumento,
    locador_cnpj: locadorEhPJ ? locadorDocumento : '',
    locador_endereco: enderecoLocador(locador),
    inquilino_nome: inquilino.nome || '',
    inquilino_cpf: inquilino.cpf || '',
    kitnet_nome: kitnet.nome || kitnet.numero || '',
    nome_unidade: unidade.nome || '',
    unidade_logradouro: enderecoUnidade(unidade),
    cep_unidade: unidade.cep || '',
    inquilino_prazo: prazoMeses ? `${prazoMeses} (${numeroPorExtenso(prazoMeses)}) meses` : 'Indeterminado',
    inquilino_inicio_do_contrato: formatarDataExtensa(dataInicio),
    inquilino_fim_do_contrato: formatarDataExtensa(dataFim),
    unidade_dia_do_vencimento: String(contrato.diaVencimento || ''),
    unidade_valor_do_aluguel: formatarMoeda(valorAluguel),
    nota_promissoria_valor: formatarMoeda(valorNotaPromissoria),
    nota_promissoria_valor_extenso: moedaPorExtenso(valorNotaPromissoria),
    nota_promissoria_vencimento: formatarDataExtensa(vencimentoNotaPromissoria),
  };

};

// Envia o contrato pra Clicksign (API v3, Envelopes + Modelo) -- ação
// separada e deliberada, chamada só quando o usuário confere o
// demonstrativo e clica em "Enviar à Clicksign". `signatariosExtras`
// são signatários só deste envio específico (além do inquilino e dos
// signatários fixos, que entram sempre).
const enviarParaClicksign = async (contratoId, signatariosExtras = []) => {

  const contrato = await buscarPorId(contratoId);

  if (!contrato) {
    throw new Error('Contrato não encontrado.');
  }

  if (contrato.clicksignEnvelopeId) {
    throw new Error('Este contrato já foi enviado à Clicksign.');
  }

  const { templateKey } = await ClicksignApiV3.obterConfig();

  if (!templateKey) {
    throw new Error('Nenhum modelo da Clicksign configurado. Configure a "Chave do Modelo" em Configurações > Clicksign.');
  }

  const dadosModelo = montarDadosModeloClicksign(contrato);

  const envelopeId = await ClicksignApiV3.criarEnvelope(`Contrato - ${contrato.inquilino.nome}`);

  if (!envelopeId) {
    throw new Error('Não foi possível criar o envelope na Clicksign.');
  }

  const documentId = await ClicksignApiV3.criarDocumentoDeModelo(
    envelopeId,
    templateKey,
    dadosModelo,
    // A Clicksign exige extensão .docx pro filename de documento gerado
    // por Modelo (o Modelo em si é um .docx com {{placeholders}}) --
    // usar .pdf aqui é rejeitado com "filename não está em um formato
    // válido". O arquivo final que os signatários recebem/assinam
    // continua sendo processado normalmente pela Clicksign.
    `Contrato-${slugificarNomeArquivo(contrato.inquilino.nome)}.docx`
  );

  if (!documentId) {
    throw new Error('Não foi possível gerar o documento a partir do modelo.');
  }

  const signatariosFixos = await signatarioFixoService.listarAtivos();

  const listaSignatarios = [
    { nome: contrato.inquilino.nome, email: contrato.inquilino.email },
    ...signatariosFixos.map((s) => ({ nome: s.nome, email: s.email })),
    ...signatariosExtras.filter((s) => s?.nome && s?.email),
  ];

  for (const signatario of listaSignatarios) {

    try {

      const signerId = await ClicksignApiV3.adicionarSignatario(envelopeId, signatario);

      if (signerId) {
        await ClicksignApiV3.criarRequisitosAssinatura(envelopeId, documentId, signerId);
      }

    } catch (erroSignatario) {
      console.error(`Erro ao adicionar signatário "${signatario.nome}" ao envelope ${envelopeId}:`, erroSignatario.message);
    }

  }

  await ClicksignApiV3.ativarEnvelope(envelopeId);
  await ClicksignApiV3.enviarNotificacoes(envelopeId);

  await prisma.contrato.update({
    where: { id: contrato.id },
    data: {
      clicksignEnvelopeId: envelopeId,
      clicksignDocumentKey: documentId,
      clicksignEnviadoEm: new Date(),
    },
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "CLICKSIGN",
    acao: "ENVIAR_ENVELOPE",
    descricao: `Contrato ${contrato.id} enviado à Clicksign (envelope ${envelopeId}).`
  });

  await notificacaoService.criar({
    origem: 'CLICKSIGN',
    titulo: 'Contrato enviado para assinatura',
    mensagem: `Contrato de ${contrato.inquilino.nome} foi enviado à Clicksign para assinatura.`,
    link: `/contratos/${contrato.id}`
  });

  return { envelopeId, documentId };

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  encerrar,
  renovar,
  notificarSeVencimentoProximo,
  enviarParaClicksign
};