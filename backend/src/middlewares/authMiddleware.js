const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token não informado.'
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
      success: false,
      message: 'Token inválido.'
    });

  }

};

module.exports = authMiddleware;