const prisma = require('../config/prisma');
const logService = require('./logService');

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

    const usuario = await prisma.usuario.update({
        where: { id },
        data: dados
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