const bbService = require('../services/bbService');

const webhook = async (req, res) => {

  try {

    const resultado = await bbService.sincronizar(req.body);

    return res.json(resultado);

  } catch (error) {

    console.error('Erro processando webhook BB:', error.message, JSON.stringify(req.body));

    // Sempre 200 pro BB não ficar re-tentando em loop por um erro
    // nosso -- mesma postura já usada no webhook da Asaas.
    return res.status(200).json({ success: false, mensagem: error.message });

  }

};

module.exports = {
  webhook,
};
