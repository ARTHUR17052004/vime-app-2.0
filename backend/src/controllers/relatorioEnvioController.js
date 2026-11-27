const relatorioEnvioService = require("../services/relatorioEnvioService");

const listar = async (req, res) => {
  const dados = await relatorioEnvioService.listar();
  return res.json({ success: true, data: dados });
};

const criar = async (req, res) => {
  const dados = await relatorioEnvioService.criar(req.body || {}, req.usuario);
  return res.status(201).json({ success: true, data: dados });
};

const cancelar = async (req, res) => {
  const dados = await relatorioEnvioService.cancelar(req.params.id, req.usuario);
  return res.json({ success: true, data: dados });
};

const baixarArquivo = async (req, res) => {
  const { buffer, nomeArquivo, mimeType } = await relatorioEnvioService.obterArquivo(req.params.id);
  res.set("Content-Type", mimeType);
  res.set("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
  return res.send(buffer);
};

module.exports = { listar, criar, cancelar, baixarArquivo };
