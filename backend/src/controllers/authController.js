const authService = require('../services/authService');

const login = async (req, res) => {
  const { email, senha } = req.body;

  const resultado = await authService.login(
    email,
    senha
  );

  res.json(resultado);
};

module.exports = {
  login
};