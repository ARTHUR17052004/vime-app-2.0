const financeiroService = require('../services/financeiroService');

const fluxoCaixa = async (req, res) => {

  const fluxo = await financeiroService.fluxoCaixa();

  res.json(fluxo);

};

module.exports = {
  fluxoCaixa
};