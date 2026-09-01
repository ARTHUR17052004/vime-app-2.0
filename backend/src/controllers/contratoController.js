const contratoService = require('../services/contratoService');
const contratoDocumentoService = require('../services/contratoDocumentoService');
const ClicksignApiV3 = require('../services/ClicksignApiV3');

// Usuário restrito a um locador não pode mexer num contrato de fora
// da sua área só porque descobriu o id (a listagem já não mostra, mas
// a rota em si não sabia disso até aqui).
const foraDoEscopo = async (req) => {

  if (!req.usuario?.locadorId) return false;

  const contrato = await contratoService.buscarPorId(req.params.id, req.usuario);

  return !contrato;

};

const listar = async (req, res) => {

  const contratos = await contratoService.listar(req.usuario);

  return res.json({
    success: true,
    data: contratos
  });

};

const buscarPorId = async (req, res) => {

  const contrato = await contratoService.buscarPorId(req.params.id, req.usuario);

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

  const contrato = await contratoService.buscarPorId(req.params.id, req.usuario);

  if (!contrato) {
    return res.status(404).json({
      success: false,
      message: 'Contrato não encontrado.'
    });
  }

  let buffer;
  let assinado = false;

  // Se já foi enviado pra Clicksign, tenta baixar o arquivo real de lá
  // (com a autenticação/assinatura deles aplicada). Se não der — ainda
  // não foi assinado, ou algo falhou — cai pro PDF gerado pelo VIME
  // (usado também como "demonstrativo" antes do envio).
  if (contrato.clicksignEnvelopeId && contrato.clicksignDocumentKey) {

    try {
      buffer = await ClicksignApiV3.baixarArquivoDocumento(contrato.clicksignEnvelopeId, contrato.clicksignDocumentKey);
      assinado = true;
    } catch (err) {
      console.error('Não foi possível baixar o arquivo da Clicksign, usando o gerado pelo VIME:', err.message);
    }

  }

  if (!buffer) {
    const base64 = await contratoDocumentoService.gerarContratoPdfBase64(contrato);
    buffer = Buffer.from(base64, 'base64');
  }

  const nomeInquilino = (contrato.inquilino?.nome || 'contrato')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');

  const sufixo = assinado ? '-assinado' : '';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="contrato-${nomeInquilino}${sufixo}.pdf"`);

  return res.send(buffer);

};

const criar = async (req, res) => {

  const contrato = await contratoService.criar(req.body, req.usuario);

  return res.status(201).json({
    success: true,
    data: contrato
  });

};

const atualizar = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  }

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

  if (await foraDoEscopo(req)) {
    return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  }

  await contratoService.remover(req.params.id);

  return res.json({
    success: true,
    message: 'Contrato removido com sucesso.'
  });

};

const encerrar = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  }

  const contrato = await contratoService.encerrar(req.params.id);

  return res.json({
    success: true,
    data: contrato
  });

};

const renovar = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  }

  const contrato = await contratoService.renovar(
    req.params.id
  );

  return res.json({
    success: true,
    data: contrato
  });

};

const enviarClicksign = async (req, res) => {

  if (await foraDoEscopo(req)) {
    return res.status(404).json({ success: false, message: 'Contrato não encontrado.' });
  }

  const resultado = await contratoService.enviarParaClicksign(
    req.params.id,
    req.body?.signatariosExtras
  );

  return res.json({
    success: true,
    data: resultado
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
  renovar,
  enviarClicksign
};