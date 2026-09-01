const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');
const campoObrigatorioService = require('./campoObrigatorioService');
const { filtroVistoria } = require('../utils/escopoLocador');

const listar = (usuario) => {
  return prisma.vistoria.findMany({
    where: filtroVistoria(usuario),
    include: {
      ocorrencias: true,
      unidade: true,
      kitnet: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.vistoria.findUnique({
    where: { id },
    include: {
      ocorrencias: true,
      unidade: true,
      kitnet: true
    }
  });
};

const converterDatas = (dados) => {

  if (dados.data !== undefined) dados.data = paraDataOuNull(dados.data);
  if (dados.dataUltima !== undefined) dados.dataUltima = paraDataOuNull(dados.dataUltima);
  if (dados.dataProxima !== undefined) dados.dataProxima = paraDataOuNull(dados.dataProxima);
  if (dados.concluidaEm !== undefined) dados.concluidaEm = paraDataOuNull(dados.concluidaEm);

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.historico;
  delete dados.ocorrencias;
  delete dados.unidade;
  delete dados.kitnet;

  return dados;

};

const criar = async (dados) => {

  dados = converterDatas(dados);

  await campoObrigatorioService.validar('vistoria', dados);

  const vistoria = await prisma.vistoria.create({
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "CRIAR",
    valorAnterior: null,
    valorNovo: vistoria
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    acao: "CRIAR",
    descricao: `Vistoria ${vistoria.id} criada.`
  });

  return vistoria;

};

const atualizar = async (id, dados) => {

  dados = converterDatas(dados);

  await campoObrigatorioService.validar('vistoria', dados);

  const anterior = await prisma.vistoria.findUnique({
    where: { id }
  });

  const vistoria = await prisma.vistoria.update({
    where: { id },
    data: dados
  });

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "ATUALIZAR",
    valorAnterior: anterior,
    valorNovo: vistoria
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    acao: "ATUALIZAR",
    descricao: `Vistoria ${vistoria.id} atualizada.`
  });

  return vistoria;

};

const remover = async (id) => {

  const vistoria = await prisma.vistoria.findUnique({
    where: { id }
  });

  if (!vistoria) {
    throw new Error("Vistoria não encontrada.");
  }

  await auditoriaService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    registroId: vistoria.id,
    acao: "EXCLUIR",
    valorAnterior: vistoria,
    valorNovo: null
  });

  await logService.registrar({
    usuarioId: null,
    usuarioNome: "Sistema",
    modulo: "VISTORIAS",
    acao: "EXCLUIR",
    descricao: `Vistoria ${vistoria.id} excluída.`
  });

  return prisma.vistoria.delete({
    where: { id }
  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};