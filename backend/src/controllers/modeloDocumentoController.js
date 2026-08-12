const modeloDocumentoService = require("../services/modeloDocumentoService");

const listar = async (req, res) => {

  const modelos = await modeloDocumentoService.listar();

  return res.json({
    success: true,
    data: modelos,
  });

};

const buscarPorTipo = async (req, res) => {

  const modelo = await modeloDocumentoService.buscarPorTipo(
    req.params.tipo
  );

  return res.json({
    success: true,
    data: modelo,
  });

};

const salvar = async (req, res) => {

  const modelo = await modeloDocumentoService.salvar(
    req.params.tipo,
    req.body
  );

  return res.json({
    success: true,
    data: modelo,
  });

};

module.exports = {
  listar,
  buscarPorTipo,
  salvar,
};
