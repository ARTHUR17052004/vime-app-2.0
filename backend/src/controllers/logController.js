const logService = require("../services/logService");

const listar = async (req, res) => {

  const logs = await logService.listar();

  res.json(logs);

};

module.exports = {
  listar,
};