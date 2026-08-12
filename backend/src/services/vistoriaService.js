const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require('./auditoriaService');

const listar = () => {
  return prisma.vistoria.findMany({
    include: {
      ocorrencias: true
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
      ocorrencias: true
    }
  });
};

const converterDatas = (dados) => {

  if (dados.data) dados.data = new Date(dados.data);
  if (dados.dataUltima) dados.dataUltima = new Date(dados.dataUltima);
  if (dados.dataProxima) dados.dataProxima = new Date(dados.dataProxima);

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.historico;
  delete dados.ocorrencias;

  return dados;

};

const criar = async (dados) => {

  dados = converterDatas(dados);

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