const prisma = require('../config/prisma');
const { paraDataOuNull } = require('../utils/data');
const { validarCpf } = require('../utils/cpf');
const contratoService = require('./contratoService');
const campoObrigatorioService = require('./campoObrigatorioService');

const sanitizar = (dados) => {

  if (dados.cpf) {
    if (!validarCpf(dados.cpf)) {
      throw new Error('CPF inválido.');
    }
  }

  if (dados.dataNascimento !== undefined) dados.dataNascimento = paraDataOuNull(dados.dataNascimento);
  if (dados.dataFimContrato !== undefined) dados.dataFimContrato = paraDataOuNull(dados.dataFimContrato);

  if (dados.dataInicioContrato !== undefined) {
    if (!dados.dataInicioContrato) {
      throw new Error('Data de início do contrato é obrigatória.');
    }
    dados.dataInicioContrato = new Date(dados.dataInicioContrato);
  }

  if (dados.prazoContrato !== undefined && dados.prazoContrato !== "") {
    dados.prazoContrato = Number(dados.prazoContrato);
  } else {
    dados.prazoContrato = null;
  }

  if (dados.valorCaucao !== undefined && dados.valorCaucao !== "") {
    dados.valorCaucao = Number(dados.valorCaucao);
  } else {
    dados.valorCaucao = null;
  }

  delete dados.id;
  delete dados.createdAt;
  delete dados.updatedAt;
  delete dados.kitnetNome;
  delete dados.unidadeNome;
  delete dados.kitnet;
  delete dados.contratos;

  return dados;

};

const listar = () => {
  return prisma.inquilino.findMany({
    include: {
      kitnet: {
        include: {
          unidade: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.inquilino.findUnique({
    where: { id },
    include: {
      kitnet: {
        include: {
          unidade: true
        }
      }
    }
  });
};

const criar = async (dados) => {

  const gerarContratoAutomatico = dados.gerarContratoAutomatico === true;
  delete dados.gerarContratoAutomatico;

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('inquilino', dados);

  const inquilino = await prisma.inquilino.create({
    data: dados
  });

  await prisma.kitnet.update({
    where: {
      id: dados.kitnetId
    },
    data: {
      ocupada: true,
      status: 'OCUPADA'
    }
  });

  let avisoContrato = null;
  let contratoId = null;

  if (gerarContratoAutomatico) {

    try {

      const kitnet = await prisma.kitnet.findUnique({
        where: { id: inquilino.kitnetId }
      });

      const unidade = kitnet
        ? await prisma.unidade.findUnique({ where: { id: kitnet.unidadeId } })
        : null;

      if (!unidade || !unidade.locadorId) {

        avisoContrato =
          'Inquilino cadastrado, mas o contrato automático não foi gerado: a unidade não tem um locador vinculado.';

      } else {

        const dataInicio = new Date(inquilino.dataInicioContrato);

        const contrato = await contratoService.criar({
          locadorId: unidade.locadorId,
          unidadeId: unidade.id,
          kitnetId: kitnet.id,
          inquilinoId: inquilino.id,
          dataInicio: inquilino.dataInicioContrato,
          dataFim: inquilino.dataFimContrato || undefined,
          valorAluguel: kitnet.aluguel,
          diaVencimento: unidade.vencimento || dataInicio.getDate(),
          indiceReajuste: inquilino.indiceReajuste || null,
          tipoGarantia: inquilino.tipoGarantia || null,
          valorCaucao: inquilino.valorCaucao || null,
          // Índice de Reajuste não tem mais campo na etapa 3 do cadastro
          // de inquilino -- não trava a criação automática do contrato
          // por causa dele, mesmo que "Contratos" o exija.
          ignorarObrigatorios: ['indiceReajuste'],
        });

        contratoId = contrato.id;

      }

    } catch (erroContrato) {

      console.error(
        'Erro ao gerar contrato automático para novo inquilino:',
        erroContrato.message
      );

      avisoContrato =
        erroContrato.message ||
        'Inquilino cadastrado, mas não foi possível gerar o contrato automático.';

    }

  }

  return { ...inquilino, avisoContrato, contratoId };
};

const atualizar = async (id, dados) => {

  const anterior = await prisma.inquilino.findUnique({
    where: { id }
  });

  dados = sanitizar(dados);

  await campoObrigatorioService.validar('inquilino', dados);

  const inquilino = await prisma.inquilino.update({
    where: { id },
    data: dados
  });

  if (
    anterior &&
    dados.kitnetId &&
    dados.kitnetId !== anterior.kitnetId
  ) {

    await prisma.kitnet.update({
      where: {
        id: anterior.kitnetId
      },
      data: {
        ocupada: false,
        status: 'DISPONIVEL'
      }
    });

    await prisma.kitnet.update({
      where: {
        id: dados.kitnetId
      },
      data: {
        ocupada: true,
        status: 'OCUPADA'
      }
    });

  }

  return inquilino;
};

const remover = async (id) => {

  const inquilino = await prisma.inquilino.findUnique({
    where: { id }
  });

  if (inquilino) {
    await prisma.kitnet.update({
      where: {
        id: inquilino.kitnetId
      },
      data: {
        ocupada: false,
        status: 'DISPONIVEL'
      }
    });
  }

  return prisma.inquilino.delete({
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
