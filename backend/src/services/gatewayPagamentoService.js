const prisma = require('../config/prisma');

const asaasService = require('./asaasService');
const contaPagamentoService = require('./contaPagamentoService');
const BBApi = require('./BBApi');
const whatsappAutomacaoService = require('./whatsappAutomacaoService');

const formatarDataBB = (data) => {
  const d = new Date(data);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

// Número de controle do boleto (parte do "Nosso Número") derivado do
// id da Receita -- determinístico, então reenviar a mesma Receita duas
// vezes gera sempre o mesmo número, em vez de duplicar boleto.
const numeroControleParaReceita = (receitaId) => {
  const hex = receitaId.replace(/-/g, '').slice(0, 12);
  const numero = BigInt('0x' + hex) % 10000000000n;
  return numero.toString().padStart(10, '0');
};

const resolverLocadorId = (receita) => {
  return (
    receita.contrato?.locadorId ||
    receita.inquilino?.kitnet?.unidade?.locadorId ||
    null
  );
};

const enviarPeloBB = async (receita, conta) => {

  // Mesma trava que o asaasService já tem pro lado Asaas -- não manda
  // a mesma Receita duas vezes.
  if (receita.gatewayReferencia) {
    return {
      success: false,
      mensagem: 'Esta receita já foi enviada ao banco.',
    };
  }

  const inquilino =
    receita.inquilino ||
    receita.contrato?.inquilino;

  if (!inquilino) {
    return {
      success: false,
      mensagem: 'Esta receita não está vinculada a um inquilino — não é possível gerar a cobrança.',
    };
  }

  const unidade =
    receita.contrato?.unidade ||
    receita.inquilino?.kitnet?.unidade;

  const cpfDigitos = (inquilino.cpf || '').replace(/\D/g, '');

  const numeroControle = numeroControleParaReceita(receita.id);

  try {

    const resultado = await BBApi.criarBoleto({
      dataEmissao: formatarDataBB(new Date()),
      dataVencimento: formatarDataBB(receita.vencimento || new Date()),
      valor: Number(receita.valor),
      numeroTituloBeneficiario: receita.id.replace(/-/g, '').slice(0, 15).toUpperCase(),
      numeroControle,
      pagador: {
        tipoInscricao: 1, // Inquilino é sempre pessoa física no VIME
        numeroInscricao: Number(cpfDigitos),
        nome: inquilino.nome,
        endereco: unidade ? `${unidade.logradouro || ''} ${unidade.numero || ''}`.trim() : undefined,
        cep: unidade?.cep ? Number(String(unidade.cep).replace(/\D/g, '')) : undefined,
        cidade: unidade?.cidade,
        bairro: unidade?.bairro,
        uf: unidade?.uf,
      },
    }, conta.credenciais);

    const atualizada = await prisma.receita.update({
      where: { id: receita.id },
      data: {
        contaPagamentoId: conta.id,
        gatewayProvider: 'BB',
        gatewayReferencia: resultado.numero,
        linkBoleto: resultado.urlImagemBoleto || null,
      },
    });

    // Não trava o envio da cobrança se o WhatsApp falhar -- o boleto já
    // foi criado no banco de qualquer forma.
    whatsappAutomacaoService
      .notificarNovaCobranca(atualizada, inquilino)
      .catch((erro) => console.error('[WhatsApp] nova_cobranca (BB):', erro.message));

    return {
      success: true,
      mensagem: 'Cobrança enviada ao Banco do Brasil com sucesso.',
      gatewayProvider: 'BB',
      linhaDigitavel: resultado.linhaDigitavel,
      urlBoleto: resultado.urlImagemBoleto,
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Erro ao gerar boleto no Banco do Brasil.',
    };

  }

};

// Ponto único de envio de cobrança -- decide o banco certo pelo
// locador do contrato/inquilino e manda pro provedor correto. Pra
// Asaas (inclusive o caminho antigo, locador com asaasToken próprio,
// ou a conta padrão do sistema), reaproveita o asaasService já
// existente sem mexer nele -- só entra um caminho novo quando o
// locador está de fato numa ContaPagamento do tipo BB.
const enviarCobranca = async (receitaId) => {

  const receita = await prisma.receita.findUnique({
    where: { id: receitaId },
    include: {
      contrato: { include: { inquilino: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } },
    },
  });

  if (!receita) {
    return {
      success: false,
      mensagem: 'Receita não encontrada.',
    };
  }

  const locadorId = resolverLocadorId(receita);
  const conta = await contaPagamentoService.resolverParaLocador(locadorId);

  if (conta?.provider === 'BB') {
    return enviarPeloBB(receita, conta);
  }

  // Sem conta BB vinculada -- segue o fluxo Asaas de sempre.
  const resultado = await asaasService.enviarCobranca(receitaId);

  if (resultado.success) {

    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (inquilino) {

      // Recarrega pra pegar o linkBoleto que o asaasService acabou de gravar.
      const atualizada = await prisma.receita.findUnique({ where: { id: receita.id } });

      whatsappAutomacaoService
        .notificarNovaCobranca(atualizada, inquilino)
        .catch((erro) => console.error('[WhatsApp] nova_cobranca (Asaas):', erro.message));

    }

  }

  return resultado;

};

module.exports = {
  enviarCobranca,
  resolverLocadorId,
  numeroControleParaReceita,
};
