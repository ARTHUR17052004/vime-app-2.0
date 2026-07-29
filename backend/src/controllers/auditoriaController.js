const prisma = require("../config/prisma");

const listar = async (req, res) => {

  const auditorias = await prisma.auditoria.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({
    success: true,
    data: auditorias
  });

};

module.exports = {
  listar
};