const prisma = require('../config/prisma');

const config = async () => {
  return {
    ambiente: process.env.ASAAS_ENV || 'sandbox',
    configurado: !!process.env.ASAAS_API_KEY,
    apiUrl: process.env.ASAAS_API_URL || null
  };
};

const status = async () => {
  return {
    online: true,
    ambiente: process.env.ASAAS_ENV || 'sandbox',
    configurado: !!process.env.ASAAS_API_KEY
  };
};

const testarConexao = async () => {
  return {
    success: true,
    mensagem: 'Conexão simulada realizada com sucesso.'
  };
};

const buscarWallet = async () => {
  return {
    walletId: 'SIMULADO',
    nome: 'Carteira Principal'
  };
};

const listarTransacoes = async () => {

  const receitas = await prisma.receita.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return receitas.map(receita => ({
    id: receita.id,
    cliente: receita.descricao,
    valor: receita.valor,
    vencimento: receita.vencimento,
    formaPagamento: 'PIX',
    status: receita.status
  }));

};

const buscarTransacao = async (id) => {

  const receita = await prisma.receita.findUnique({
    where: { id }
  });

  if (!receita) {
    return null;
  }

  return {
    id: receita.id,
    cliente: receita.descricao,
    valor: receita.valor,
    vencimento: receita.vencimento,
    formaPagamento: 'PIX',
    status: receita.status
  };

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
    }
  });

  if (!receita) {
    return {
      success: false,
      mensagem: "Receita não encontrada."
    };
  }

  switch (evento.event) {

    case "PAYMENT_RECEIVED":

      await prisma.receita.update({
        where: {
          id: receita.id
        },
        data: {
          status: "PAGA",
          dataPagamento: new Date()
        }
      });

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
  resumo,
  sincronizar
};