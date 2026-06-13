const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('AUTH MIDDLEWARE EXECUTOU');

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensagem: 'Token não informado'
    });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'vime_secret_dev'
    );

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      mensagem: 'Token inválido'
    });
  }
};

module.exports = authMiddleware;