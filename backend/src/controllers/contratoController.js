const contratoService = require('../services/contratoService');
const contratoDocumentoService = require('../services/contratoDocumentoService');

const listar = async (req, res) => {

  const contratos = await contratoService.listar();

  return res.json({
    success: true,
    data: contratos
  });

};

const buscarPorId = async (req, res) => {

  const contrato = await contratoService.buscarPorId(req.params.id);

  if (!contrato) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado.'
    });
  }

  return res.json({
    success: true,
    data: contrato
  });

};

const baixarPdf = async (req, res) => {

  const contrato = await contratoService.buscarPorId(req.params.id);

  if (!contrato) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado.'
    });
  }

  const base64 = await contratoDocumentoService.gerarContratoPdfBase64(contrato);

  const buffer = Buffer.from(base64, 'base64');

  const nomeInquilino = (contrato.inquilino?.nome || 'contrato')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="contrato-${nomeInquilino}.pdf"`);

  return res.send(buffer);

};

const criar = async (req, res) => {

  const contrato = await contratoService.criar(req.body);

  return res.status(201).json({
    success: true,
    data: contrato
  });

};

const atualizar = async (req, res) => {

  const contrato = await contratoService.atualizar(
    req.params.id,
    req.body
  );

  return res.json({
    success: true,
    data: contrato
  });

};

const remover = async (req, res) => {

  await contratoService.remover(req.params.id);

  return res.json({
    success: true,
    message: 'Contrato removido com sucesso.'
  });

};

const encerrar = async (req, res) => {

  const contrato = await contratoService.encerrar(req.params.id);

  return res.json({
    success: true,
    data: contrato
  });

};

const renovar = async (req, res) => {

  const contrato = await contratoService.renovar(
    req.params.id,
    req.body
  );

  return res.json({
    success: true,
    data: contrato
  });

};

module.exports = {
  listar,
  buscarPorId,
  baixarPdf,
  criar,
  atualizar,
  remover,
  encerrar,
  renovar
};