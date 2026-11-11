const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const temPermissao = async (usuario, chave) => {

  if (!usuario) return false;

  if (usuario.perfil === "ADMINISTRADOR") return true;

  const perfil = await prisma.perfil.findUnique({
    where: { nome: usuario.perfil },
  });

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

module.exports = permissaoMiddleware;
module.exports.temPermissao = temPermissao;
module.exports.exigirPermissaoParaMarcarPago = exigirPermissaoParaMarcarPago;
module.exports.exigirConfirmacaoEdicaoValor = exigirConfirmacaoEdicaoValor;
module.exports.exigirConfirmacaoExclusao = exigirConfirmacaoExclusao;
