const prisma = require('../config/prisma');
const AsaasApi = require('./AsaasApi');
const notificacaoService = require('./notificacaoService');
const whatsappAutomacaoService = require('./whatsappAutomacaoService');
const { emitirAtualizacao } = require('../socket');
const { filtroReceita } = require('../utils/escopoLocador');
const { daReceita: locadorDaReceita } = require('../utils/locadorDeRegistro');

// Acha o locador dono da receita (via contrato, ou via
// inquilino → kitnet → residência quando a receita não tem contrato)
// e devolve o "override" pra usar a conta Asaas própria dele, se tiver
// uma configurada -- senão devolve null e a conta padrão do sistema é
// usada, como sempre foi.
const obterOverrideDoLocador = async (receita) => {

  const locadorId =
    receita.contrato?.locadorId ||
    receita.inquilino?.kitnet?.unidade?.locadorId ||
    receita.contrato?.inquilino?.kitnet?.unidade?.locadorId ||
    null;

  if (!locadorId) return null;

  const locador = await prisma.locador.findUnique({
    where: { id: locadorId },
    include: { contaPagamento: true },
  });

  // Sistema novo (multi-banco, tela "Contas"): se o locador tiver uma
  // ContaPagamento do tipo ASAAS vinculada e ativa, ela manda -- mesmo
  // formato de credenciais que a conta padrão do sistema espera.
  if (locador?.contaPagamento?.provider === 'ASAAS' && locador.contaPagamento.ativo) {

    const cred = locador.contaPagamento.credenciais || {};

    if (cred.apiKey) {
      return {
        apiKey: cred.apiKey,
        walletId: cred.walletId || undefined,
        contaPagamentoId: locador.contaPagamento.id,
      };
    }

  }

  // Compatibilidade com o campo antigo (Locador.asaasToken direto),
  // de antes da tela "Contas" existir.
  if (!locador?.asaasToken) return null;

  return {
    apiKey: locador.asaasToken,
    walletId: locador.asaasWalletId || undefined,
  };

};

const config = async () => {
  const { apiKey, ambiente, walletId, webhookToken } = await AsaasApi.obterConfig();

  return {
    ambiente,
    configurado: !!apiKey,
    walletId: walletId || null,
    webhookConfigurado: !!webhookToken,
  };
};

const status = async () => {
  const { apiKey, ambiente } = await AsaasApi.obterConfig();

  if (!apiKey) {
    return {
      online: false,
      ambiente,
      configurado: false,
    };
  }

  try {
    await AsaasApi.minhaConta();

    return {
      online: true,
      ambiente,
      configurado: true,
    };
  } catch (error) {
    return {
      online: false,
      ambiente,
      configurado: true,
      erro: error.message,
    };
  }
};

const testarConexao = async () => {

  const { apiKey } = await AsaasApi.obterConfig();

  if (!apiKey) {
    return {
      success: false,
      mensagem: 'Nenhuma API Key configurada ainda.'
    };
  }

  try {

    const conta = await AsaasApi.minhaConta();

    return {
      success: true,
      mensagem: 'Conexão realizada com sucesso.',
      conta: {
        nome: conta?.name || conta?.email || null,
        email: conta?.email || null,
      },
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Não foi possível conectar ao Asaas.'
    };

  }

};

// Testa uma conta Asaas própria cadastrada na tela "Contas" (não a
// conta padrão do sistema) -- usa a API Key guardada em
// ContaPagamento.credenciais. Substitui o antigo testarConexaoLocador
// (que olhava Locador.asaasToken direto, de antes da tela "Contas"
// existir).
const testarConexaoConta = async (contaPagamentoId) => {

  const conta = await prisma.contaPagamento.findUnique({ where: { id: contaPagamentoId } });

  if (!conta || conta.provider !== 'ASAAS') {
    return { success: false, mensagem: 'Essa conta não é do Asaas.' };
  }

  const cred = conta.credenciais || {};

  if (!cred.apiKey) {
    return { success: false, mensagem: 'Essa conta ainda não tem uma API Key do Asaas configurada.' };
  }

  const override = { apiKey: cred.apiKey, walletId: cred.walletId || undefined };

  try {

    const contaAsaas = await AsaasApi.minhaConta(override);

    return {
      success: true,
      mensagem: 'Conexão realizada com sucesso.',
      conta: {
        nome: contaAsaas?.name || contaAsaas?.email || null,
        email: contaAsaas?.email || null,
      },
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Não foi possível conectar a essa conta Asaas.',
    };

  }

};

// Registra o mesmo endpoint de webhook do sistema (/asaas/webhook)
// dentro de uma conta Asaas própria (tela "Contas") -- sem isso,
// pagamentos feitos nela nunca avisam o VIME quando são pagos/atrasam,
// já que cada conta Asaas tem sua própria configuração de webhook.
// Substitui o antigo registrarWebhookLocador (mesmo motivo do
// testarConexaoConta acima).
const registrarWebhookConta = async (contaPagamentoId, webhookUrl) => {

  const conta = await prisma.contaPagamento.findUnique({ where: { id: contaPagamentoId } });

  if (!conta || conta.provider !== 'ASAAS') {
    return { success: false, mensagem: 'Essa conta não é do Asaas.' };
  }

  const cred = conta.credenciais || {};

  if (!cred.apiKey) {
    return { success: false, mensagem: 'Essa conta ainda não tem uma API Key do Asaas configurada.' };
  }

  const { webhookToken } = await AsaasApi.obterConfig();

  const override = { apiKey: cred.apiKey, walletId: cred.walletId || undefined };

  try {

    await AsaasApi.configurarWebhook(
      webhookUrl,
      webhookToken || undefined,
      ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'PAYMENT_DELETED', 'PAYMENT_RESTORED'],
      override
    );

    return {
      success: true,
      mensagem: 'Webhook registrado com sucesso nessa conta Asaas.',
      url: webhookUrl,
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Não foi possível registrar o webhook nessa conta.',
    };

  }

};

const buscarWallet = async () => {

  const { apiKey } = await AsaasApi.obterConfig();

  if (!apiKey) {
    return {
      success: false,
      mensagem: 'Nenhuma API Key configurada ainda.'
    };
  }

  try {

    const conta = await AsaasApi.minhaConta();

    if (!conta?.walletId) {
      // A Asaas não expõe o Wallet ID em nenhum endpoint da API v3 (nem
      // /myAccount, nem nenhum outro) — só existe no painel deles mesmo.
      return {
        success: false,
        mensagem:
          'A Asaas não disponibiliza o Wallet ID pela API. Copie direto no painel deles: Integrações (canto superior direito) → aba Início → seção "Wallet ID" (o valor começa com "wal_").'
      };
    }

    await prisma.configuracao.updateMany({
      data: {
        asaasWalletId: conta.walletId,
      },
    });

    return {
      success: true,
      walletId: conta.walletId,
      nome: conta?.name || 'Carteira Principal',
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Não foi possível buscar a wallet.'
    };

  }

};

// Resolve o locador dono da receita pelo mesmo caminho usado em todo
// lugar (contrato -> locador, ou inquilino -> kitnet -> unidade -> locador).
const resolverLocadorDaReceita = (receita) => {
  return (
    receita.contrato?.locador ||
    receita.contrato?.inquilino?.kitnet?.unidade?.locadorRel ||
    receita.inquilino?.kitnet?.unidade?.locadorRel ||
    null
  );
};

const mapearTransacao = (receita) => {

  const locador = resolverLocadorDaReceita(receita);

  // "cliente" sempre foi a DESCRIÇÃO ("Aluguel - 12/2026"), nunca o
  // nome de quem deve -- a tela mostrava só isso, sem dizer de quem é
  // a cobrança, de onde veio (kitnet/residência) nem se é recorrente.
  // Esses campos novos resolvem isso sem quebrar quem já lê "cliente"
  // esperando a descrição.
  const inquilino = receita.inquilino || receita.contrato?.inquilino;
  const kitnet = inquilino?.kitnet || null;

  return {
    id: receita.id,
    cliente: receita.descricao,
    descricao: receita.descricao,
    clienteNome: inquilino?.nome || receita.pagadorNome || null,
    kitnetNome: kitnet?.nome || kitnet?.numero || null,
    residenciaNome: kitnet?.unidade?.nome || null,
    recorrente: !!receita.recorrente,
    valor: receita.valor,
    vencimento: receita.vencimento,
    dataPagamento: receita.dataPagamento,
    // Usados pelo "demonstrativo" do painel de Transações (ver
    // utils/statusReceita.js demonstrativoReceita) -- createdAt é quando
    // a receita foi lançada, cobrancaEnviadaEm é quando foi de fato
    // mandada pro banco (pode ser bem depois do createdAt), dataCredito
    // é quando o dinheiro caiu de verdade (BB não credita no mesmo dia
    // do pagamento).
    createdAt: receita.createdAt,
    cobrancaEnviadaEm: receita.cobrancaEnviadaEm,
    dataCredito: receita.dataCredito,
    formaPagamento: receita.formaPagamento || (receita.enviadaAsaas ? 'BOLETO' : '-'),
    status: receita.status,
    enviadaAsaas: receita.enviadaAsaas,
    asaasPaymentId: receita.asaasPaymentId,
    // Genéricos -- só vêm preenchidos depois que a receita passa pelo
    // gatewayPagamentoService (Asaas continua preenchendo os dois
    // formatos, BB só o genérico).
    gatewayProvider: receita.gatewayProvider || (receita.enviadaAsaas ? 'ASAAS' : null),
    gatewayReferencia: receita.gatewayReferencia || receita.asaasPaymentId,
    linkBoleto: receita.linkBoleto,
    descontoValor: receita.descontoValor,
    descontoDias: receita.descontoDias,
    multaValor: receita.multaValor,
    jurosValor: receita.jurosValor,
    locadorId: locador?.id || null,
    locadorNome: locador?.nome || null,
    // Pagador avulso (nome+CPF digitados na hora, sem cadastrar
    // inquilino) -- só importa quando não tem inquilino/contrato
    // vinculado (ver gatewayPagamentoService.resolverPagador).
    temInquilino: !!(receita.inquilino || receita.contrato?.inquilino),
    pagadorNome: receita.pagadorNome,
    pagadorCpf: receita.pagadorCpf,
    pagadorEmail: receita.pagadorEmail,
    pagadorTelefone: receita.pagadorTelefone,
  };

};

const listarTransacoes = async (usuario) => {

  const receitas = await prisma.receita.findMany({
    where: filtroReceita(usuario),
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      contrato: {
        include: {
          locador: true,
          inquilino: { include: { kitnet: { include: { unidade: { include: { locadorRel: true } } } } } },
        },
      },
      inquilino: { include: { kitnet: { include: { unidade: { include: { locadorRel: true } } } } } },
    },
  });

  return receitas.map(mapearTransacao);

};

const buscarTransacao = async (id, usuario) => {

  const receita = await prisma.receita.findFirst({
    where: { id, ...filtroReceita(usuario) },
    include: {
      contrato: {
        include: {
          locador: true,
          inquilino: { include: { kitnet: { include: { unidade: { include: { locadorRel: true } } } } } },
        },
      },
      inquilino: { include: { kitnet: { include: { unidade: { include: { locadorRel: true } } } } } },
    },
  });

  if (!receita) {
    return null;
  }

  return mapearTransacao(receita);

};

// Mantém o boleto já registrado na Asaas alinhado quando alguém adia o
// vencimento aqui no sistema DEPOIS de enviado. Sem isso, a Asaas
// continua cobrando (e marcando como vencido) pelo vencimento ANTIGO,
// e os jobs de conferência (verificarAsaasJob/webhook) voltam a marcar
// a receita como ATRASADA sozinhos mesmo com o vencimento novo sendo
// futuro -- bug real encontrado em 25/11/2026: JOSÉ ELIAS DE JESUS
// teve o vencimento adiado de 21/11 pra 30/11 só aqui no sistema, a
// Asaas nunca soube, continuou com dueDate=21/11 e reabriu a cobrança
// como OVERDUE a cada consulta do job de 15 em 15 minutos. Melhor
// esforço só -- nunca trava a edição em si (o vencimento aqui é o que
// importa pro usuário; se a Asaas estiver fora do ar, loga e segue).
const sincronizarVencimentoNaAsaas = async (receita, novoVencimento) => {

  if (!receita?.gatewayReferencia || receita.gatewayProvider !== 'ASAAS') return;
  if (!novoVencimento) return;

  try {

    const cred = receita.contaPagamento?.credenciais || {};
    const override = cred.apiKey
      ? { apiKey: cred.apiKey, walletId: cred.walletId || undefined }
      : null;

    await AsaasApi.atualizarCobranca(
      receita.gatewayReferencia,
      { dueDate: new Date(novoVencimento).toISOString().slice(0, 10) },
      override
    );

  } catch (erro) {

    console.error(
      `[asaasService] Falha ao sincronizar novo vencimento da receita ${receita.id} com a Asaas:`,
      erro.message
    );

  }

};

const enviarCobranca = async (receitaId, contaResolvida = null) => {

  const receita = await prisma.receita.findUnique({
    where: { id: receitaId },
    include: {
      contrato: {
        include: { inquilino: true, locador: true },
      },
      inquilino: {
        include: { kitnet: { include: { unidade: true } } },
      },
    },
  });

  if (!receita) {
    return {
      success: false,
      mensagem: 'Receita não encontrada.',
    };
  }

  if (receita.asaasPaymentId) {
    return {
      success: false,
      mensagem: 'Esta receita já foi enviada ao Asaas.',
    };
  }

  // Cobrança pode vir de um contrato (aluguel), vinculada direto a um
  // inquilino (ex: multa avulsa, sem precisar de contrato), ou de um
  // pagador avulso (nome+CPF digitados na hora, sem cadastrar
  // ninguém -- ver model Receita).
  const inquilino = receita.inquilino || receita.contrato?.inquilino;

  const pagador = inquilino
    ? {
        nome: inquilino.nome,
        email: inquilino.email,
        telefone: inquilino.telefone,
        cpf: inquilino.cpf,
      }
    : (receita.pagadorNome && receita.pagadorCpf)
      ? {
          nome: receita.pagadorNome,
          email: receita.pagadorEmail,
          telefone: receita.pagadorTelefone,
          cpf: receita.pagadorCpf,
        }
      : null;

  if (!pagador) {
    return {
      success: false,
      mensagem: 'Informe um inquilino ou os dados do pagador (nome e CPF) antes de enviar ao banco.',
    };
  }

  // Se já veio uma conta resolvida de fora (sempre o caso vindo do
  // gatewayPagamentoService -- por kitnet, depois locador) e ela for
  // Asaas, usa as credenciais dela direto; senão (chamada direta, sem
  // conta pré-resolvida) cai no caminho antigo por locador.
  const contaAsaas = contaResolvida?.provider === 'ASAAS' ? contaResolvida : null;

  const override = contaAsaas
    ? {
        apiKey: contaAsaas.credenciais?.apiKey,
        walletId: contaAsaas.credenciais?.walletId || undefined,
        contaPagamentoId: contaAsaas.id,
      }
    : await obterOverrideDoLocador(receita);

  // "Conta padrão" = a mesma Asaas de sempre (reaproveita customerId
  // já salvo no inquilino) -- sem override nenhum, OU a ContaPagamento
  // marcada como padrão do sistema. Qualquer conta específica (de
  // locador ou de kitnet) sempre cria o cliente de novo nela.
  const usandoContaPadrao = !override || (contaAsaas ? contaAsaas.padrao === true : false);

  const { apiKey } = await AsaasApi.obterConfig(override);

  if (!apiKey) {
    return {
      success: false,
      mensagem: override
        ? 'A conta Asaas desta cobrança não tem uma API Key configurada.'
        : 'Configure a API Key do Asaas antes de enviar cobranças.',
    };
  }

  try {

    // O customerId é específico da conta Asaas onde o cliente foi
    // criado -- se este envio for pra conta própria de um locador/
    // kitnet, não dá pra reaproveitar um customerId criado na conta
    // padrão (ou vice-versa). Pagador avulso não tem cadastro de
    // inquilino pra guardar o customerId -- cria de novo a cada envio
    // (é sempre um "cliente" novo pra Asaas, cobrança única).
    let customerId = (inquilino && usandoContaPadrao) ? inquilino.asaasCustomerId : null;

    if (!customerId) {

      // O cadastro de inquilino/pagador avulso não tem máscara no
      // telefone/CPF, então pode chegar aqui formatado ("(11)
      // 98765-4321", "111.222.333-44"). A Asaas recusa esses campos
      // com qualquer caractere que não seja dígito.
      const cliente = await AsaasApi.criarCliente({
        name: pagador.nome,
        email: pagador.email,
        mobilePhone: (pagador.telefone || '').replace(/\D/g, ''),
        cpfCnpj: (pagador.cpf || '').replace(/\D/g, ''),
      }, override);

      customerId = cliente.id;

      // Só grava no cadastro do inquilino quando for a conta padrão --
      // gravar um customerId de conta de locador/kitnet ali criaria
      // confusão se esse mesmo inquilino um dia tiver outra receita
      // na conta padrão (o campo é único, não dá pra guardar os dois).
      if (inquilino && usandoContaPadrao) {
        await prisma.inquilino.update({
          where: { id: inquilino.id },
          data: { asaasCustomerId: customerId },
        });
      }

    }

    const payload = {
      customer: customerId,
      // UNDEFINED oferece Pix e Boleto juntos (o inquilino escolhe na
      // hora de pagar) -- pedido explícito depois que o Pix foi
      // liberado na conta Asaas.
      billingType: 'UNDEFINED',
      value: receita.valor,
      dueDate: receita.vencimento
        ? new Date(receita.vencimento).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      description: receita.descricao,
      externalReference: receita.id,
    };

    // Desconto/multa/juros são opcionais — só vão no payload se a
    // receita tiver sido configurada com esses valores antes do envio
    // (tela de Asaas Transações -> Editar).
    if (receita.descontoValor) {
      payload.discount = {
        value: receita.descontoValor,
        dueDateLimitDays: receita.descontoDias || 0,
        type: 'FIXED',
      };
    }

    if (receita.multaValor) {
      payload.fine = {
        value: receita.multaValor,
        type: 'PERCENTAGE',
      };
    }

    if (receita.jurosValor) {
      // Ao contrário de discount/fine, o objeto "interest" da Asaas NÃO
      // tem campo "type" (juros de mora é sempre % ao mês, sem opção de
      // valor fixo) -- mandar "type" aqui derrubava a cobrança inteira
      // com "Propriedade desconhecida (não está no schema)" assim que
      // jurosValor passou a vir preenchido de verdade (10/11/2026).
      payload.interest = {
        value: receita.jurosValor,
      };
    }

    const cobranca = await AsaasApi.criarCobranca(payload, override);

    const atualizada = await prisma.receita.update({
      where: { id: receita.id },
      data: {
        asaasPaymentId: cobranca.id,
        asaasCustomerId: customerId,
        enviadaAsaas: true,
        formaPagamento: cobranca.billingType || 'BOLETO',
        linkBoleto: cobranca.bankSlipUrl || cobranca.invoiceUrl || null,
        // Genérico (ver comentário no model Receita) -- sem isso, o
        // caminho Asaas era o único que não marcava por qual conta
        // passou, e ficava de fora de qualquer relatório "recebido
        // por conta".
        contaPagamentoId: override?.contaPagamentoId || null,
        cobrancaEnviadaEm: new Date(),
        gatewayProvider: 'ASAAS',
        gatewayReferencia: cobranca.id,
        // Nosso Número de verdade (o que aparece impresso no boleto) --
        // gatewayReferencia/cobranca.id é só o id interno da Asaas
        // (pay_xxxx), usado pra consultar a API, nunca o que o relatório
        // de receitas deve mostrar como "Nosso nº" (pedido do usuário
        // em 26/11/2026).
        nossoNumero: cobranca.nossoNumero || null,
      },
    });

    return {
      success: true,
      mensagem: 'Cobrança enviada ao Asaas com sucesso.',
      transacao: mapearTransacao(atualizada),
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Erro ao enviar cobrança ao Asaas.',
    };

  }

};

const resumo = async (usuario) => {

  const receitas = await prisma.receita.findMany({
    where: filtroReceita(usuario)
  });

  return {
    total: receitas.length,
    valorTotal: receitas.reduce((soma, r) => soma + r.valor, 0)
  };

};

// "YYYY-MM-DD" (formato que a Asaas usa em paymentDate/creditDate) --
// meio-dia local pra não cair no dia errado por fuso, mesma convenção
// do paraData do bbService.
function paraDataAsaas(valor) {
  if (!valor || typeof valor !== "string") return null;
  const match = valor.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(`${valor}T12:00:00`);
}

// Valor em REAIS de verdade recebido de multa/juros -- a Asaas devolve
// originalValue (nominal, SEM multa/juros) só quando aplicou algum;
// null quando não aplicou nada (pagou em dia ou sem multa/juros
// configurado). interestValue é a parte de JUROS já separada; o resto
// da diferença (value - originalValue - interestValue) é a MULTA.
// Confirmado ao vivo em 25/11/2026 contra uma cobrança Asaas paga com
// atraso mas sem multa/juros configurados na conta (originalValue
// null, interestValue null) -- bate com valor=originalValue, igual
// esperado. Mesmo princípio do bbService.extrairValorMultaRecebido:
// usado pelo relatório no lugar do cálculo ESTIMADO sempre que
// disponível.
function extrairMultaJurosRecebidoAsaas(payment) {

  if (!Number.isFinite(Number(payment?.value))) {
    return { valorMultaRecebida: null, valorJurosRecebido: null };
  }

  // originalValue null = a própria Asaas confirma que NÃO aplicou
  // multa/juros nessa cobrança -- é um ZERO confirmado, não "sem
  // informação". Tratar como null (como era antes) fazia o relatório
  // cair pro cálculo ESTIMADO de novo bem no caso que já estava 100%
  // confirmado como R$0,00 -- bug irmão do de 25/11/2026 encontrado no
  // bbService (mesma raiz: confundir "não sabemos" com "sabemos que é
  // zero").
  if (payment?.originalValue == null) {
    return { valorMultaRecebida: 0, valorJurosRecebido: 0 };
  }

  const valor = Number(payment.value);
  const original = Number(payment.originalValue);

  if (!Number.isFinite(original)) {
    return { valorMultaRecebida: null, valorJurosRecebido: null };
  }

  const juros = Number.isFinite(Number(payment?.interestValue)) ? Number(payment.interestValue) : 0;
  const multa = Math.max(0, valor - original - juros);

  return { valorMultaRecebida: multa, valorJurosRecebido: juros };

}

const sincronizar = async (evento) => {

  if (!evento) {
    return {
      success: false,
      mensagem: "Evento inválido."
    };
  }

  const { payment } = evento;

  if (!payment) {
    return {
      success: false,
      mensagem: "Pagamento não informado."
    };
  }

  const receita = await prisma.receita.findFirst({
    where: {
      id: payment.externalReference
    },
    include: {
      inquilino: true,
      contrato: { include: { inquilino: true } },
    },
  });

  if (!receita) {
    return {
      success: false,
      mensagem: "Receita não encontrada."
    };
  }

  const nomeInquilino = receita.inquilino?.nome || receita.contrato?.inquilino?.nome || "";

  switch (evento.event) {

    // CONFIRMED = pagamento identificado mas ainda não creditado na
    // conta (comum em boleto, some dias antes de RECEIVED); RECEIVED =
    // já creditado. Tratamos os dois como "pago" pro locador — é o que
    // a própria Asaas mostra como "Confirmada" no painel deles.
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED":

      // Evita notificar duas vezes quando CONFIRMED e RECEIVED chegam
      // pro mesmo pagamento (comum em boleto).
      if (receita.status !== "PAGA") {

        const { valorMultaRecebida, valorJurosRecebido } = extrairMultaJurosRecebidoAsaas(payment);

        const atualizada = await prisma.receita.update({
          where: {
            id: receita.id
          },
          data: {
            status: "PAGA",
            // paymentDate/creditDate vêm direto da Asaas (data real de
            // pagamento/crédito) -- new Date() era só a hora em que
            // ESSE webhook chegou aqui, podia vir bem depois do
            // pagamento de verdade (retry, fila, etc.).
            dataPagamento: paraDataAsaas(payment.paymentDate) || new Date(),
            dataCredito: paraDataAsaas(payment.creditDate) || paraDataAsaas(payment.paymentDate) || null,
            valorMultaRecebida,
            valorJurosRecebido,
            confirmacaoPagtoEnviadaEm: new Date(),
          }
        });

        await notificacaoService.criar({
          origem: "ASAAS",
          titulo: "Cobrança paga",
          mensagem: await notificacaoService.renderizarMensagem(
            'COBRANCA_PAGA',
            { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor, banco: 'Asaas' },
            `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} foi confirmado como pago no Asaas.`
          ),
          link: "/asaas-transacoes",
          locadorId: await locadorDaReceita(receita.id),
        });

        const inquilino = receita.inquilino || receita.contrato?.inquilino;

        if (inquilino) {
          whatsappAutomacaoService
            .notificarPagamentoConfirmado(atualizada, inquilino)
            .catch((erro) => console.error('[WhatsApp] pagamento_confirmado (Asaas):', erro.message));
        }

      }

      break;

    case "PAYMENT_OVERDUE":

      // A Asaas reenvia esse evento várias vezes pro mesmo pagamento
      // (retry de webhook, ou um novo aviso periódico deles) -- sem essa
      // trava (mesmo padrão do PAYMENT_CONFIRMED/RECEIVED acima), cada
      // reenvio criava outra notificação igualzinha, lotando o sino em
      // minutos com a mesma cobrança (bug relatado em 19/11/2026: 5
      // notificações iguais em 37 minutos). Só processa na TRANSIÇÃO de
      // verdade pra ATRASADA.
      if (receita.status !== "ATRASADA") {

        await prisma.receita.update({
          where: {
            id: receita.id
          },
          data: {
            status: "ATRASADA"
          }
        });

        await notificacaoService.criar({
          origem: "ASAAS",
          titulo: "Cobrança atrasada",
          mensagem: await notificacaoService.renderizarMensagem(
            'COBRANCA_ATRASADA',
            { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor },
            `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} venceu e ainda não foi pago.`
          ),
          link: "/asaas-transacoes",
          locadorId: await locadorDaReceita(receita.id),
        });

      }

      break;

    // Esses 3 eventos acontecem por uma ação direta na própria Asaas
    // (painel ou API dela, fora do nosso sistema) -- nunca somos nós
    // quem cancela/estorna/restaura um boleto, só recebemos o aviso.
    // Antes trocavam o status calado, sem log nem notificação nenhuma
    // -- bug real encontrado em 26/11/2026: 18 boletos de aluguel
    // sumiram da Asaas (limpeza de duplicata que alguém fez direto lá)
    // e ninguém no sistema ficou sabendo, só foi notado dias depois
    // olhando a tela do Financeiro. Mesmo princípio já aplicado nos
    // jobs automáticos: nenhuma mudança dessas pode acontecer calada.
    case "PAYMENT_REFUNDED":

      if (receita.status !== "ESTORNADA") {

        await prisma.receita.update({
          where: { id: receita.id },
          data: { status: "ESTORNADA" }
        });

        await notificacaoService.criar({
          origem: "ASAAS",
          titulo: "Cobrança estornada",
          mensagem: await notificacaoService.renderizarMensagem(
            'COBRANCA_ESTORNADA_ASAAS',
            { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor },
            `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} foi estornado direto na Asaas.`
          ),
          link: "/asaas-transacoes",
          locadorId: await locadorDaReceita(receita.id),
        });

      }

      break;

    case "PAYMENT_DELETED":

      if (receita.status !== "CANCELADA") {

        await prisma.receita.update({
          where: { id: receita.id },
          data: { status: "CANCELADA", canceladaEm: new Date(), canceladaPor: "Asaas" }
        });

        await notificacaoService.criar({
          origem: "ASAAS",
          titulo: "Cobrança excluída na Asaas",
          mensagem: await notificacaoService.renderizarMensagem(
            'COBRANCA_EXCLUIDA_ASAAS',
            { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor },
            `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} foi excluído direto na Asaas (confira se não ficou sem nenhuma cobrança no lugar).`
          ),
          link: "/asaas-transacoes",
          locadorId: await locadorDaReceita(receita.id),
        });

      }

      break;

    case "PAYMENT_RESTORED":

      if (receita.status !== "PENDENTE") {

        await prisma.receita.update({
          where: { id: receita.id },
          data: { status: "PENDENTE" }
        });

        await notificacaoService.criar({
          origem: "ASAAS",
          titulo: "Cobrança restaurada na Asaas",
          mensagem: await notificacaoService.renderizarMensagem(
            'COBRANCA_RESTAURADA_ASAAS',
            { descricao: receita.descricao, inquilino: nomeInquilino, valor: receita.valor },
            `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} foi restaurado direto na Asaas.`
          ),
          link: "/asaas-transacoes",
          locadorId: await locadorDaReceita(receita.id),
        });

      }

      break;

  }

  // Cobre qualquer um dos cases acima -- sem isso, quem estivesse com
  // Financeiro/Transações abertas só via a receita atualizada depois
  // de dar F5.
  emitirAtualizacao("receita");

  return {
    success: true
  };

};

module.exports = {
  config,
  status,
  testarConexao,
  testarConexaoConta,
  registrarWebhookConta,
  buscarWallet,
  listarTransacoes,
  buscarTransacao,
  enviarCobranca,
  resumo,
  sincronizar,
  sincronizarVencimentoNaAsaas
};