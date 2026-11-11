const receitaService = require('../services/receitaService');

// Usuário restrito a um locador não pode mexer numa receita de fora
// da sua área só porque descobriu o id (a listagem já não mostra, mas
// a rota em si não sabia disso até aqui).
const foraDoEscopo = async (req) => {

  if (!req.usuario?.locadorId) return false;

  const receita = await receitaService.buscarPorId(req.params.id, req.usuario);

  return !receita;

};

const listar = async (req, res) => {

  try {

    const receitas = await receitaService.listar(req.usuario);

    return res.json({
      success: true,
      data: receitas
    });

  } catch (error) {

    // Sem isso, uma falha aqui (ex.: soluço de conexão com o banco)
    // nunca virava resposta nenhuma -- o front só via a requisição
    // falhar e mostrava a tela de Financeiro com tudo zerado, sem
    // nenhum aviso de erro (foi o que aconteceu em 10/11/2026).
    console.error("Erro ao listar receitas:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao carregar receitas. Tente recarregar a página."
    });

  }

};

const buscarPorId = async (req, res) => {

  const receita = await receitaService.buscarPorId(req.params.id, req.usuario);

  if (!receita) {
    return res.status(404).json({
      success: false,
      message: 'Receita não encontrada.'
    });
  }

  return res.json({
    success: true,
    data: receita
  });

};

const taxaBoleto = async (req, res) => {

  const dados = await receitaService.previsaoTaxaBoleto({
    inquilinoId: req.query.inquilinoId || null,
    contratoId: req.query.contratoId || null,
  });

  return res.json({
    success: true,
    data: dados
  });

};

const criar = async (req, res) => {

  const receita = await receitaService.criar(req.body, req.usuario);

  return res.status(201).json({
    success: true,
    data: receita
  });

};

const atualizar = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      success: false,
      message: 'Receita não encontrada.'
    });
  }

  const receita = await receitaService.atualizar(
    req.params.id,
    req.body,
    req.usuario
  );

  return res.json({
    success: true,
    data: receita
  });

};

const remover = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({
      success: false,
      message: 'Receita não encontrada.'
    });
  }

  await receitaService.remover(req.params.id, req.usuario, req.body?.motivoExclusao);

  return res.json({
    success: true,
    message: 'Receita removida com sucesso.'
  });

};

module.exports = {
  listar,
  buscarPorId,
  taxaBoleto,
  criar,
  atualizar,
  remover
};