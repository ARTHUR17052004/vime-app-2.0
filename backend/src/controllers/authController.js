const authService = require('../services/authService');

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const resultado = await authService.login(email, senha);

    res.cookie("token", resultado.token, {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 dia, mesmo prazo do JWT
    });

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

const logout = async (req, res) => {

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logout realizado com sucesso.",
  });
};

const me = async (req, res) => {

  return res.status(200).json({
    success: true,
    data: req.usuario
  });

};

module.exports = {
  login,
  logout,
  me
};