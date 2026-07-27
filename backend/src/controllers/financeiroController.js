const financeiroService = require('../services/financeiroService');

const fluxoCaixa = async (req, res) => {

  const fluxo = await financeiroService.fluxoCaixa();

  return res.json({
    success: true,
    data: fluxo
  });

};

const resumo = async (req, res) => {

  const resumo = await financeiroService.resumo();

  return res.json({
    success: true,
    data: resumo
  });

};

module.exports = {
  fluxoCaixa,
  resumo
};