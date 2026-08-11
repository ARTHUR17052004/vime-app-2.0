const dashboardService = require('../services/dashboardService');

const resumo = async (req, res) => {
  try {
    const dados = await dashboardService.resumo();

    return res.status(200).json({
      success: true,
      data: dados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const atividades = async (req, res) => {
  try {
    const dados = await dashboardService.atividades();

    return res.status(200).json({
      success: true,
      data: dados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const alertas = async (req, res) => {
  try {
    const dados = await dashboardService.alertas();

    return res.status(200).json({
      success: true,
      data: dados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const ocupacao = async (req, res) => {
  try {
    const dados = await dashboardService.ocupacao();

    return res.status(200).json({
      success: true,
      data: dados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const financeiro = async (req, res) => {
  try {
    const dados = await dashboardService.financeiro();

    return res.status(200).json({
      success: true,
      data: dados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const receitasMensais = async (req, res) => {
  try {
    const anoParam = parseInt(req.query.ano, 10);

    const ano = Number.isInteger(anoParam)
      ? anoParam
      : new Date().getFullYear();

    const dados = await dashboardService.receitasMensais(ano);

    return res.status(200).json({
      success: true,
      data: dados
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  resumo,
  atividades,
  alertas,
  ocupacao,
  financeiro,
  receitasMensais
};