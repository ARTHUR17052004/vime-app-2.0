const prisma = require('../config/prisma');

const asaasService = require('./asaasService');
const contaPagamentoService = require('./contaPagamentoService');
const BBApi = require('./BBApi');
const EFIApi = require('./EFIApi');
const BRBApi = require('./BRBApi');
const whatsappAutomacaoService = require('./whatsappAutomacaoService');
const emailAutomacaoService = require('./emailAutomacaoService');
const { emitirAtualizacao } = require('../socket');

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

// Inquilino cadastrado (com kitnet/contrato) ou pagador avulso
// (nome+CPF digitados na hora, sem precisar cadastrar ninguém) -- ver
// comentário do model Receita. Nenhum dos dois = não dá pra gerar
// boleto nenhum (banco exige CPF/nome de verdade pelo pagador).
const resolverPagador = (receita) => {

  const inquilino = receita.inquilino || receita.contrato?.inquilino;

  if (inquilino) {
    return {
      nome: inquilino.nome,
      cpf: inquilino.cpf,
      email: inquilino.email,
      telefone: inquilino.telefone,
      inquilino,
    };
  }

  if (receita.pagadorNome && receita.pagadorCpf) {
    return {
      nome: receita.pagadorNome,
      cpf: receita.pagadorCpf,
      email: receita.pagadorEmail,
      telefone: receita.pagadorTelefone,
      inquilino: null,
    };
  }

  return null;

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

  const pagador = resolverPagador(receita);

  if (!pagador) {
    return {
      success: false,
      mensagem: 'Informe um inquilino ou os dados do pagador (nome e CPF) antes de enviar ao banco.',
    };
  }

  const unidade =
    receita.contrato?.unidade ||
    receita.inquilino?.kitnet?.unidade;

  const cpfDigitos = (pagador.cpf || '').replace(/\D/g, '');

  const numeroControle = numeroControleParaReceita(receita.id);

  try {

    const resultado = await BBApi.criarBoleto({
      dataEmissao: formatarDataBB(new Date()),
      dataVencimento: formatarDataBB(receita.vencimento || new Date()),
      valor: Number(receita.valor),
      numeroTituloBeneficiario: receita.id.replace(/-/g, '').slice(0, 15).toUpperCase(),
      numeroControle,
      pagador: {
        tipoInscricao: 1, // Pessoa física -- inquilino ou pagador avulso, sempre CPF no VIME
        numeroInscricao: Number(cpfDigitos),
        nome: pagador.nome,
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
        linhaDigitavel: resultado.linhaDigitavel || null,
      },
    });

    // Não trava o envio da cobrança se o WhatsApp/e-mail falharem -- o
    // boleto já foi criado no banco de qualquer forma. Pagador avulso
    // não é usuário do sistema (sem telefone/e-mail cadastrado aqui
    // de verdade), então não tem quem avisar.
    if (pagador.inquilino) {

      whatsappAutomacaoService
        .notificarNovaCobranca(atualizada, pagador.inquilino)
        .catch((erro) => console.error('[WhatsApp] nova_cobranca (BB):', erro.message));

      emailAutomacaoService
        .notificarNovaCobranca(atualizada, pagador.inquilino)
        .catch((erro) => console.error('[E-mail] nova_cobranca (BB):', erro.message));

    }

    emitirAtualizacao('receita');

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

// Mesmo roteiro de enviarPeloBB, só trocando o provedor -- ver
// EFIApi.js (payload/endpoint ainda não confirmados contra a EFI de
// verdade, testar em homologação antes de usar pra valer).
const enviarPelaEFI = async (receita, conta) => {

  if (receita.gatewayReferencia) {
    return {
      success: false,
      mensagem: 'Esta receita já foi enviada ao banco.',
    };
  }

  const pagador = resolverPagador(receita);

  if (!pagador) {
    return {
      success: false,
      mensagem: 'Informe um inquilino ou os dados do pagador (nome e CPF) antes de enviar ao banco.',
    };
  }

  const cpfDigitos = (pagador.cpf || '').replace(/\D/g, '');

  try {

    const resultado = await EFIApi.criarBoleto({
      descricao: receita.descricao,
      valor: Number(receita.valor),
      dataVencimento: receita.vencimento
        ? new Date(receita.vencimento).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      pagador: {
        nome: pagador.nome,
        cpf: cpfDigitos,
        email: pagador.email,
        telefone: (pagador.telefone || '').replace(/\D/g, ''),
      },
    }, conta.credenciais);

    const atualizada = await prisma.receita.update({
      where: { id: receita.id },
      data: {
        contaPagamentoId: conta.id,
        gatewayProvider: 'EFI',
        gatewayReferencia: resultado.numero,
        linkBoleto: resultado.urlImagemBoleto || null,
        linhaDigitavel: resultado.linhaDigitavel || null,
      },
    });

    if (pagador.inquilino) {

      whatsappAutomacaoService
        .notificarNovaCobranca(atualizada, pagador.inquilino)
        .catch((erro) => console.error('[WhatsApp] nova_cobranca (EFI):', erro.message));

      emailAutomacaoService
        .notificarNovaCobranca(atualizada, pagador.inquilino)
        .catch((erro) => console.error('[E-mail] nova_cobranca (EFI):', erro.message));

    }

    emitirAtualizacao('receita');

    return {
      success: true,
      mensagem: 'Cobrança enviada à EFI com sucesso.',
      gatewayProvider: 'EFI',
      linhaDigitavel: resultado.linhaDigitavel,
      urlBoleto: resultado.urlImagemBoleto,
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Erro ao gerar boleto na EFI.',
    };

  }

};

// Mesmo roteiro de enviarPeloBB -- ver BRBApi.js: esqueleto não
// confirmado contra o BRB de verdade ainda (sem manual técnico deles
// em mãos). Não vincular nenhum locador de verdade a uma conta BRB
// antes de testar em homologação.
const enviarPeloBRB = async (receita, conta) => {

  if (receita.gatewayReferencia) {
    return {
      success: false,
      mensagem: 'Esta receita já foi enviada ao banco.',
    };
  }

  const pagador = resolverPagador(receita);

  if (!pagador) {
    return {
      success: false,
      mensagem: 'Informe um inquilino ou os dados do pagador (nome e CPF) antes de enviar ao banco.',
    };
  }

  const unidade =
    receita.contrato?.unidade ||
    receita.inquilino?.kitnet?.unidade;

  const cpfDigitos = (pagador.cpf || '').replace(/\D/g, '');

  const numeroControle = numeroControleParaReceita(receita.id);

  try {

    const resultado = await BRBApi.criarBoleto({
      dataEmissao: formatarDataBB(new Date()),
      dataVencimento: formatarDataBB(receita.vencimento || new Date()),
      valor: Number(receita.valor),
      numeroTituloBeneficiario: receita.id.replace(/-/g, '').slice(0, 15).toUpperCase(),
      numeroControle,
      pagador: {
        tipoInscricao: 1,
        numeroInscricao: Number(cpfDigitos),
        nome: pagador.nome,
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
        gatewayProvider: 'BRB',
        gatewayReferencia: resultado.numero,
        linkBoleto: resultado.urlImagemBoleto || null,
        linhaDigitavel: resultado.linhaDigitavel || null,
      },
    });

    if (pagador.inquilino) {

      whatsappAutomacaoService
        .notificarNovaCobranca(atualizada, pagador.inquilino)
        .catch((erro) => console.error('[WhatsApp] nova_cobranca (BRB):', erro.message));

      emailAutomacaoService
        .notificarNovaCobranca(atualizada, pagador.inquilino)
        .catch((erro) => console.error('[E-mail] nova_cobranca (BRB):', erro.message));

    }

    emitirAtualizacao('receita');

    return {
      success: true,
      mensagem: 'Cobrança enviada ao BRB com sucesso.',
      gatewayProvider: 'BRB',
      linhaDigitavel: resultado.linhaDigitavel,
      urlBoleto: resultado.urlImagemBoleto,
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || 'Erro ao gerar boleto no BRB.',
    };

  }

};

// Ponto único de envio de cobrança -- decide o banco certo pelo
// locador do contrato/inquilino e manda pro provedor correto (BB, EFI
// ou BRB, cada um no seu próprio caminho abaixo). Pra Asaas (inclusive
// o caminho antigo, locador com asaasToken próprio, ou a conta padrão
// do sistema), reaproveita o asaasService já existente sem mexer
// nele -- só entra um caminho novo quando o locador está de fato numa
// ContaPagamento de outro provider.
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

  if (conta?.provider === 'EFI') {
    return enviarPelaEFI(receita, conta);
  }

  if (conta?.provider === 'BRB') {
    return enviarPeloBRB(receita, conta);
  }

  // Sem conta BB/EFI/BRB vinculada -- segue o fluxo Asaas de sempre.
  const resultado = await asaasService.enviarCobranca(receitaId);

  if (resultado.success) {

    emitirAtualizacao('receita');

    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (inquilino) {

      // Recarrega pra pegar o linkBoleto que o asaasService acabou de gravar.
      const atualizada = await prisma.receita.findUnique({ where: { id: receita.id } });

      whatsappAutomacaoService
        .notificarNovaCobranca(atualizada, inquilino)
        .catch((erro) => console.error('[WhatsApp] nova_cobranca (Asaas):', erro.message));

      emailAutomacaoService
        .notificarNovaCobranca(atualizada, inquilino)
        .catch((erro) => console.error('[E-mail] nova_cobranca (Asaas):', erro.message));

    }

  }

  return resultado;

};

module.exports = {
  enviarCobranca,
  resolverLocadorId,
  numeroControleParaReceita,
};
