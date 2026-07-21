const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const resultado = await authService.login(email, senha);

    return res.status(200).json({
      success: true,
      data: resultado
    });

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: error.message
    });

  }
};

const me = async (req, res) => {

  return res.status(200).json({
    success: true,
    data: req.usuario
  });

};

module.exports = {
  login,
  me
};