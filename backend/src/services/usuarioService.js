const prisma = require('../config/prisma');

const logService = require('./logService');
const auditoriaService = require("./auditoriaService");

const listar = () => {
    return prisma.usuario.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const criar = async (dados) => {

    const usuario = await prisma.usuario.create({
        data: dados
    });

    await auditoriaService.registrar({
        usuarioId: null,
        usuarioNome: "Sistema",
        modulo: "USUARIOS",
        registroId: usuario.id,
        acao: "CRIAR",
        valorAnterior: null,
        valorNovo: usuario
    });

    await logService.registrar({
        usuarioId: null,
        usuarioNome: "Sistema",
        modulo: "USUARIOS",
        acao: "CRIAR",
        descricao: `Usuário ${usuario.nome} criado.`
    });

    return usuario;

};

const atualizar = async (id, dados) => {

    const anterior = await prisma.usuario.findUnique({
        where: { id }
    });

    const usuario = await prisma.usuario.update({
        where: { id },
        data: dados
    });

    await auditoriaService.registrar({
        usuarioId: null,
        usuarioNome: "Sistema",
        modulo: "USUARIOS",
        registroId: usuario.id,
        acao: "ATUALIZAR",
        valorAnterior: anterior,
        valorNovo: usuario
    });

    await logService.registrar({
        usuarioId: null,
        usuarioNome: "Sistema",
        modulo: "USUARIOS",
        acao: "ATUALIZAR",
        descricao: `Usuário ${usuario.nome} atualizado.`
    });

    return usuario;

};

const remover = async (id) => {

    const usuario = await prisma.usuario.findUnique({
        where: { id }
    });

    if (!usuario) {
        throw new Error("Usuário não encontrado.");
    }

    await auditoriaService.registrar({
        usuarioId: null,
        usuarioNome: "Sistema",
        modulo: "USUARIOS",
        registroId: usuario.id,
        acao: "EXCLUIR",
        valorAnterior: usuario,
        valorNovo: null
    });

    await logService.registrar({
        usuarioId: null,
        usuarioNome: "Sistema",
        modulo: "USUARIOS",
        acao: "EXCLUIR",
        descricao: `Usuário ${usuario.nome} removido.`
    });

    return prisma.usuario.delete({
        where: { id }
    });

};

module.exports = {
    listar,
    criar,
    atualizar,
    remover
};