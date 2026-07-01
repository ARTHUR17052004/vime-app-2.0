const dashboardService = require('../services/dashboardService');

const resumo = async (req, res) => {
  const dados = await dashboardService.resumo();
  res.json(dados);
};

const atividades = async (req, res) => {
  const dados = await dashboardService.atividades();
  res.json(dados);
};

const alertas = async (req, res) => {
  const dados = await dashboardService.alertas();
  res.json(dados);
};

const ocupacao = async (req, res) => {
  const dados = await dashboardService.ocupacao();
  res.json(dados);
};

const financeiro = async (req, res) => {
  const dados = await dashboardService.financeiro();
  res.json(dados);
};

module.exports = {
  resumo,
  atividades,
  alertas,
  ocupacao,
  financeiro
};