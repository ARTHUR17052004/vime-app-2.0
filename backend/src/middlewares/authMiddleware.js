const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("===== AUTH =====");
  console.log("Cookies:", req.cookies);
  console.log("Headers:", req.headers.authorization);

  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  console.log("Token encontrado:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token não informado.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "vime_secret_dev"
    );

    req.usuario = decoded;

    next();
  } catch (err) {
    console.log("Erro JWT:", err.message);

    return res.status(401).json({
      success: false,
      message: "Token inválido.",
    });
  }
};

module.exports = authMiddleware;