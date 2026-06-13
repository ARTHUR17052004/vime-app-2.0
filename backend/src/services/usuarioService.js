const prisma = require('../config/prisma');

const listar = () => {
    return prisma.usuario.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};

const criar = (dados) => {
    return prisma.usuario.create({
        data: dados
    });
};

const atualizar = (id, dados) => {
    return prisma.usuario.update({
        where: { id },
        data: dados
    });
};

const remover = (id) => {
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