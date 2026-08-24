const prisma = require('../config/prisma');
const AsaasApi = require('./AsaasApi');
const notificacaoService = require('./notificacaoService');

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

const mapearTransacao = (receita) => ({
  id: receita.id,
  cliente: receita.descricao,
  valor: receita.valor,
  vencimento: receita.vencimento,
  dataPagamento: receita.dataPagamento,
  formaPagamento: receita.formaPagamento || (receita.enviadaAsaas ? 'BOLETO' : '-'),
  status: receita.status,
  enviadaAsaas: receita.enviadaAsaas,
  asaasPaymentId: receita.asaasPaymentId,
  descontoValor: receita.descontoValor,
  descontoDias: receita.descontoDias,
  multaValor: receita.multaValor,
  jurosValor: receita.jurosValor,
});

const listarTransacoes = async () => {

  const receitas = await prisma.receita.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return receitas.map(mapearTransacao);

};

const buscarTransacao = async (id) => {

  const receita = await prisma.receita.findUnique({
    where: { id }
  });

  if (!receita) {
    return null;
  }

  return mapearTransacao(receita);

};

const enviarCobranca = async (receitaId) => {

  const { apiKey } = await AsaasApi.obterConfig();

  if (!apiKey) {
    return {
      success: false,
      mensagem: 'Configure a API Key do Asaas antes de enviar cobranças.',
    };
  }

  const receita = await prisma.receita.findUnique({
    where: { id: receitaId },
    include: {
      contrato: {
        include: { inquilino: true },
      },
      inquilino: true,
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

  // Cobrança pode vir de um contrato (aluguel) ou vinculada direto a um
  // inquilino (ex: multa avulsa, sem precisar de contrato).
  const inquilino = receita.inquilino || receita.contrato?.inquilino;

  if (!inquilino) {
    return {
      success: false,
      mensagem: 'Esta receita não está vinculada a um inquilino — não é possível gerar a cobrança.',
    };
  }

  try {

    let customerId = inquilino.asaasCustomerId;

    if (!customerId) {

      // O cadastro de inquilino não tem máscara no telefone/CPF, então
      // pode chegar aqui formatado ("(11) 98765-4321", "111.222.333-44").
      // A Asaas recusa esses campos com qualquer caractere que não seja
      // dígito.
      const cliente = await AsaasApi.criarCliente({
        name: inquilino.nome,
        email: inquilino.email,
        mobilePhone: (inquilino.telefone || '').replace(/\D/g, ''),
        cpfCnpj: (inquilino.cpf || '').replace(/\D/g, ''),
      });

      customerId = cliente.id;

      await prisma.inquilino.update({
        where: { id: inquilino.id },
        data: { asaasCustomerId: customerId },
      });

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
      payload.interest = {
        value: receita.jurosValor,
        type: 'PERCENTAGE',
      };
    }

    const cobranca = await AsaasApi.criarCobranca(payload);

    const atualizada = await prisma.receita.update({
      where: { id: receita.id },
      data: {
        asaasPaymentId: cobranca.id,
        asaasCustomerId: customerId,
        enviadaAsaas: true,
        formaPagamento: cobranca.billingType || 'BOLETO',
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

const resumo = async () => {

  const receitas = await prisma.receita.findMany();

  return {
    total: receitas.length,
    valorTotal: receitas.reduce((soma, r) => soma + r.valor, 0)
  };

};

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

        await prisma.receita.update({
          where: {
            id: receita.id
          },
          data: {
            status: "PAGA",
            dataPagamento: new Date()
          }
        });

        await notificacaoService.criar({
          origem: "ASAAS",
          titulo: "Cobrança paga",
          mensagem: `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} foi confirmado como pago no Asaas.`,
          link: "/asaas-transacoes",
        });

      }

      break;

    case "PAYMENT_OVERDUE":

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
        mensagem: `${receita.descricao}${nomeInquilino ? ` (${nomeInquilino})` : ""} — R$ ${receita.valor} venceu e ainda não foi pago.`,
        link: "/asaas-transacoes",
      });

      break;

    case "PAYMENT_REFUNDED":

      await prisma.receita.update({
        where: {
          id: receita.id
        },
        data: {
          status: "ESTORNADA"
        }
      });

      break;

    case "PAYMENT_DELETED":

      await prisma.receita.update({
        where: {
          id: receita.id
        },
        data: {
          status: "CANCELADA"
        }
      });

      break;

    case "PAYMENT_RESTORED":

      await prisma.receita.update({
        where: {
          id: receita.id
        },
        data: {
          status: "PENDENTE"
        }
      });

      break;

  }

  return {
    success: true
  };

};

module.exports = {
  config,
  status,
  testarConexao,
  buscarWallet,
  listarTransacoes,
  buscarTransacao,
  enviarCobranca,
  resumo,
  sincronizar
};