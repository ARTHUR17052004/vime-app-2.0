const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const temPermissao = async (usuario, chave) => {

  if (!usuario) return false;

  if (usuario.perfil === "ADMINISTRADOR") return true;

  // Busca por id (sempre exato) sempre que possível. Buscar por nome
  // quebra se o nome do Perfil tiver espaço sobrando (ex.: "GERENCIA "
  // cadastrado com espaço no fim) -- bug real encontrado em 25/11/2026:
  // a Mariana (perfil GERENCIA) ficou sem nenhuma permissão porque
  // authMiddleware guarda o nome JÁ sem espaço (perfilSemEspaco), e
  // essa busca por nome exigia bater com o nome crú do banco, que tinha
  // o espaço -- nunca encontrava o Perfil e caía no fallback de [].
  const perfil = usuario.perfilId
    ? await prisma.perfil.findUnique({ where: { id: usuario.perfilId } })
    : await prisma.perfil.findFirst({ where: { nome: usuario.perfil } });

  const permissoes = perfil?.permissoes || [];

  return permissoes.includes(chave);

};

const permissaoMiddleware = (chave) => {

  return async (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado.",
      });
    }

    try {

      const permitido = await temPermissao(req.usuario, chave);

      if (!permitido) {
        return res.status(403).json({
          success: false,
          message: "Você não tem permissão para realizar esta ação.",
        });
      }

      return next();

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erro ao verificar permissão.",
      });

    }

  };

};

// Confirmar que uma receita/despesa foi paga é um ponto sensível (é
// literalmente dizer "o dinheiro entrou/saiu") -- quem só tem
// financeiro.editar não pode sozinho fazer isso, precisa também de
// financeiro.marcarPago. Só entra em ação quando o pedido tenta
// DEIXAR o registro como PAGO/PAGA; editar qualquer outro campo (ou
// mudar pra outro status) segue exigindo só financeiro.editar, como
// já era.
const exigirPermissaoParaMarcarPago = async (req, res, next) => {

  const statusNovo = String(req.body?.status || "").toUpperCase();

  if (statusNovo !== "PAGO" && statusNovo !== "PAGA") {
    return next();
  }

  try {

    const permitido = await temPermissao(req.usuario, "financeiro.marcarPago");

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para marcar isso como pago.",
      });
    }

    return next();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro ao verificar permissão.",
    });

  }

};

// Editar uma cobrança já lançada é sensível (afeta o que o inquilino
// vê/paga de verdade) -- pedido explícito pra travar QUALQUER edição
// com permissão própria ("financeiro.editarValor", separada de
// "financeiro.editar") + motivo + a senha de quem está editando (re-
// autenticação: confirma que é mesmo essa pessoa no teclado, não
// alguém que pegou a sessão já aberta). Começou só travando mudança de
// VALOR, mas o pedido depois foi "pra qualquer edição" -- por isso o
// gatilho agora é "veio do formulário de Editar" (reconhecido por
// trazer descrição/categoria/vencimento junto, campos que as ações
// rápidas de um clique só -- marcar pago, fixar, enviar pro histórico,
// ativar recorrência -- nunca mandam sozinhas) em vez de só "o valor
// mudou". Essas ações rápidas continuam sem pedir senha, de propósito.
const exigirConfirmacaoEdicaoValor = async (req, res, next) => {

  const vemDoFormularioDeEditar =
    req.body?.descricao !== undefined ||
    req.body?.categoria !== undefined ||
    req.body?.vencimento !== undefined ||
    req.body?.valor !== undefined;

  if (!vemDoFormularioDeEditar || !req.params?.id) {
    return next();
  }

  try {

    const receita = await prisma.receita.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    // Receita não encontrada -- deixa o controller tratar o 404 normal.
    if (!receita) return next();

    const permitido = await temPermissao(req.usuario, "financeiro.editarValor");

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para editar esta cobrança.",
      });
    }

    if (!String(req.body.motivoEdicaoValor || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Digite o motivo da edição.",
      });
    }

    if (!req.body.senhaConfirmacao) {
      return res.status(400).json({
        success: false,
        message: "Digite sua senha para confirmar a edição.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    const senhaValida =
      usuario && (await bcrypt.compare(req.body.senhaConfirmacao, usuario.senha));

    if (!senhaValida) {
      return res.status(403).json({
        success: false,
        message: "Senha incorreta.",
      });
    }

    return next();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro ao verificar a edição.",
    });

  }

};

// Mudar o dia de vencimento de um Contrato não é só um detalhe de
// exibição -- é o campo que a geração automática mensal de cobrança
// usa pra todo mês seguinte (ver cobrancaRecorrenteService.gerarCobrancaParaContrato,
// `contrato.diaVencimento`), então editar isso sem perceber desloca a
// data de vencimento de TODO aluguel futuro desse contrato, não só da
// cobrança do mês. Pedido do usuário em 25/11/2026, com medo de uma
// edição por engano gerar cobrança futura com data errada. Exige senha
// (re-autenticação) na edição, com a mensagem já explicando o motivo --
// sem motivo escrito nem permissão própria (diferente de
// exigirConfirmacaoEdicaoValor/Exclusao), só a confirmação em si.
const exigirConfirmacaoEdicaoVencimentoContrato = async (req, res, next) => {

  if (req.body?.diaVencimento === undefined || !req.params?.id) {
    return next();
  }

  try {

    const contrato = await prisma.contrato.findUnique({
      where: { id: req.params.id },
      select: { diaVencimento: true },
    });

    // Contrato não encontrado, ou reenviando o mesmo dia de sempre
    // (formulário de Editar manda o valor atual de volta junto) --
    // nada realmente mudando, não trava.
    if (!contrato || Number(req.body.diaVencimento) === contrato.diaVencimento) {
      return next();
    }

    if (!req.body.senhaConfirmacao) {
      return res.status(400).json({
        success: false,
        message:
          "Mudar o dia de vencimento do contrato altera a data de todas as próximas cobranças geradas automaticamente, não só da atual. Digite sua senha pra confirmar.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    const senhaValida =
      usuario && (await bcrypt.compare(req.body.senhaConfirmacao, usuario.senha));

    if (!senhaValida) {
      return res.status(403).json({
        success: false,
        message: "Senha incorreta.",
      });
    }

    return next();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro ao verificar a edição do dia de vencimento.",
    });

  }

};

// Excluir uma cobrança de vez é tão (ou mais) sensível quanto mudar o
// valor dela -- principalmente depois do apagão de 11/2026 (29
// cobranças duplicadas de aluguel), onde excluir ao invés de cancelar
// teria apagado o rastro da duplicata sem deixar auditoria nenhuma.
// Mesma trava de permissão + motivo + senha (re-autenticação) de
// exigirConfirmacaoEdicaoValor, agora pra exclusão.
const exigirConfirmacaoExclusao = async (req, res, next) => {

  try {

    const permitido = await temPermissao(req.usuario, "financeiro.excluir");

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para excluir cobranças.",
      });
    }

    if (!String(req.body?.motivoExclusao || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Digite o motivo da exclusão.",
      });
    }

    if (!req.body?.senhaConfirmacao) {
      return res.status(400).json({
        success: false,
        message: "Digite sua senha para confirmar a exclusão.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    const senhaValida =
      usuario && (await bcrypt.compare(req.body.senhaConfirmacao, usuario.senha));

    if (!senhaValida) {
      return res.status(403).json({
        success: false,
        message: "Senha incorreta.",
      });
    }

    return next();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro ao verificar a exclusão.",
    });

  }

};

// Motivos fixos pra "quebra de contrato" -- os 3 que o usuário pediu,
// nada de texto livre aqui (a observação é que é livre).
const MOTIVOS_TERMINO_ANTECIPADO = ["ABANDONO", "INADIMPLENCIA", "QUEBRA_DO_INQUILINO"];

// Classificar uma Receita como inadimplência de verdade (botão
// "Inadimplência" nos 3 pontinhos do Financeiro) -- mesmo motivo fixo +
// observação + senha de exigirConfirmacaoTerminoAntecipado, só que aqui
// é só um registro da RECEITA (não mexe em contrato/kitnet -- isso já
// aconteceu antes, na vistoria de esvaziar kitnet). Reaproveita os
// mesmos 3 motivos pra manter um vocabulário só no sistema inteiro.
const exigirConfirmacaoInadimplencia = async (req, res, next) => {

  try {

    const permitido = await temPermissao(req.usuario, "financeiro.editar");

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para classificar inadimplência.",
      });
    }

    const motivo = String(req.body?.motivoInadimplencia || "").toUpperCase();

    if (!MOTIVOS_TERMINO_ANTECIPADO.includes(motivo)) {
      return res.status(400).json({
        success: false,
        message: "Selecione o motivo (Abandono, Inadimplência ou Quebra de Contrato).",
      });
    }

    if (!String(req.body?.observacaoInadimplencia || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Escreva a observação.",
      });
    }

    if (!req.body?.senhaConfirmacao) {
      return res.status(400).json({
        success: false,
        message: "Digite sua senha para confirmar.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    const senhaValida =
      usuario && (await bcrypt.compare(req.body.senhaConfirmacao, usuario.senha));

    if (!senhaValida) {
      return res.status(403).json({
        success: false,
        message: "Senha incorreta.",
      });
    }

    req.body.motivoInadimplencia = motivo;

    return next();

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro ao verificar a classificação de inadimplência.",
    });

  }

};

// Esvaziar a kitnet (excluir inquilino), excluir o contrato, excluir a
// kitnet, ou encerrar manualmente -- ANTES do dataFim do contrato (o
// ciclo que o sistema já respeita pra fechar sozinho, ver
// contratoService.criar/renovar) -- é sempre quebra de contrato, nunca
// um fim normal. Trava com motivo (fixo) + observação (livre) + senha.
//
// IMPORTANTE: quando confirmado, isso NUNCA deixa a ação original
// (excluir) continuar -- em vez disso, ENCERRA o contrato de verdade
// (contratoService.encerrar, com o motivo/observação gravados) e
// responde direto, sem chamar next(). Kitnet fica vazia, inquilino
// fica inativo, contrato fica ENCERRADO com o motivo visível --
// nada é apagado, pra manter o histórico rastreável (pedido
// explícito: excluir de vez não é a forma certa de registrar uma
// quebra de contrato). Só quando o contrato JÁ chegou no fim (ou não
// tem contrato nenhum pra quebrar) é que next() deixa a ação original
// (exclusão de verdade, ou o encerrar comum) acontecer.
//
// Fábrica porque cada rota resolve o contrato de um jeito diferente
// (direto, ou via Contrato ATIVO do Inquilino/Kitnet sendo excluído) --
// `obterContrato(req)` devolve `{ id, dataFim }` do contrato a
// avaliar/encerrar, ou null se não tiver nenhum.
const exigirConfirmacaoTerminoAntecipado = (obterContrato) => async (req, res, next) => {

  try {

    const contrato = await obterContrato(req);

    // Sem contrato pra avaliar, ou o ciclo já realmente acabou -- fim
    // normal, segue sem travar (ação original: exclusão de verdade, ou
    // o próprio encerrar comum).
    if (!contrato?.dataFim || new Date(contrato.dataFim) <= new Date()) {
      return next();
    }

    const motivo = String(req.body?.motivoTerminoAntecipado || "").toUpperCase();

    if (!MOTIVOS_TERMINO_ANTECIPADO.includes(motivo)) {
      return res.status(400).json({
        success: false,
        requerConfirmacaoTerminoAntecipado: true,
        message: "Selecione o motivo (Abandono, Inadimplência ou Quebra do inquilino).",
      });
    }

    if (!String(req.body?.observacaoTerminoAntecipado || "").trim()) {
      return res.status(400).json({
        success: false,
        requerConfirmacaoTerminoAntecipado: true,
        message: "Escreva a observação.",
      });
    }

    if (!req.body?.senhaConfirmacao) {
      return res.status(400).json({
        success: false,
        requerConfirmacaoTerminoAntecipado: true,
        message: "Digite sua senha para confirmar.",
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
    });

    const senhaValida =
      usuario && (await bcrypt.compare(req.body.senhaConfirmacao, usuario.senha));

    if (!senhaValida) {
      return res.status(403).json({
        success: false,
        requerConfirmacaoTerminoAntecipado: true,
        message: "Senha incorreta.",
      });
    }

    // Confirmado -- vira um encerrar de verdade, nunca a exclusão
    // original. require() aqui dentro (não no topo do arquivo) só pra
    // não criar um ciclo de require entre os dois módulos.
    const contratoService = require("../services/contratoService");

    const contratoEncerrado = await contratoService.encerrar(contrato.id, req.usuario, {
      motivoEncerramento: motivo,
      observacaoEncerramento: req.body.observacaoTerminoAntecipado,
      gerarVistoriaEntrega: req.body.gerarVistoriaEntrega,
    });

    return res.json({
      success: true,
      quebraDeContrato: true,
      message: "Contrato encerrado por quebra de contrato.",
      data: contratoEncerrado,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erro ao verificar o encerramento antecipado.",
    });

  }

};

// Libera se o usuário tiver QUALQUER uma das chaves (não todas) --
// usado em "/asaas/transacoes/:id/enviar", que hoje é chamada tanto
// pelo Financeiro (envio avulso/em lote de receitas -- financeiro.editar)
// quanto por Transações (criar e já enviar uma cobrança avulsa --
// asaasTransacoes.enviar/criar).
const permissaoOuMiddleware = (...chaves) => {

  return async (req, res, next) => {

    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado.",
      });
    }

    try {

      for (const chave of chaves) {
        if (await temPermissao(req.usuario, chave)) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para realizar esta ação.",
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Erro ao verificar permissão.",
      });

    }

  };

};

module.exports = permissaoMiddleware;
module.exports.temPermissao = temPermissao;
module.exports.permissaoOuMiddleware = permissaoOuMiddleware;
module.exports.exigirPermissaoParaMarcarPago = exigirPermissaoParaMarcarPago;
module.exports.exigirConfirmacaoEdicaoValor = exigirConfirmacaoEdicaoValor;
module.exports.exigirConfirmacaoEdicaoVencimentoContrato = exigirConfirmacaoEdicaoVencimentoContrato;
module.exports.exigirConfirmacaoExclusao = exigirConfirmacaoExclusao;
module.exports.exigirConfirmacaoTerminoAntecipado = exigirConfirmacaoTerminoAntecipado;
module.exports.exigirConfirmacaoInadimplencia = exigirConfirmacaoInadimplencia;
module.exports.MOTIVOS_TERMINO_ANTECIPADO = MOTIVOS_TERMINO_ANTECIPADO;
