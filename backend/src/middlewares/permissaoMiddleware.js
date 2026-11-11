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

// Mudar o VALOR de uma cobrança já lançada é sensível (afeta o que o
// inquilino paga de verdade) -- pedido explícito pra travar isso com
// permissão própria ("financeiro.editarValor", separada de
// "financeiro.editar") + motivo + a senha de quem está editando (re-
// autenticação: confirma que é mesmo essa pessoa no teclado, não
// alguém que pegou a sessão já aberta). Só entra em ação quando o
// pedido realmente MUDA o valor -- editar qualquer outro campo sem
// mexer no valor segue exigindo só financeiro.editar, como já era.
const exigirConfirmacaoEdicaoValor = async (req, res, next) => {

  if (req.body?.valor === undefined || !req.params?.id) {
    return next();
  }

  try {

    const receita = await prisma.receita.findUnique({
      where: { id: req.params.id },
      select: { valor: true },
    });

    // Receita não encontrada -- deixa o controller tratar o 404 normal.
    if (!receita) return next();

    const valorNovo = Number(String(req.body.valor).replace(",", "."));
    const valorAtual = Number(receita.valor);

    // Não mudou de verdade (ou valor inválido, que a validação normal
    // do service já reprova) -- segue só com financeiro.editar.
    if (Number.isNaN(valorNovo) || Math.abs(valorNovo - valorAtual) < 0.005) {
      return next();
    }

    const permitido = await temPermissao(req.usuario, "financeiro.editarValor");

    if (!permitido) {
      return res.status(403).json({
        success: false,
        message: "Você não tem permissão para editar o valor desta cobrança.",
      });
    }

    const MOTIVOS_VALIDOS = ["TAXA", "MULTA", "OUTROS"];
    const motivo = String(req.body.motivoEdicaoValor || "").toUpperCase();

    if (!MOTIVOS_VALIDOS.includes(motivo)) {
      return res.status(400).json({
        success: false,
        message: "Selecione o motivo da edição do valor (Taxa, Multa ou Outros).",
      });
    }

    if (!req.body.senhaConfirmacao) {
      return res.status(400).json({
        success: false,
        message: "Digite sua senha para confirmar a edição do valor.",
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
      message: "Erro ao verificar a edição do valor.",
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
