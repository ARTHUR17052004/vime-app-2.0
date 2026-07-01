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

const sincronizar = async () => {

  return {
    success: true,
    mensagem: 'Sincronização simulada concluída.'
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