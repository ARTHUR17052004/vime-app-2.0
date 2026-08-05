const prisma = require("../config/prisma");

const logService = require("./logService");
const auditoriaService = require("./auditoriaService");

/* =====================================================
   LISTAR
===================================================== */

const listar = () => {

    return prisma.perfil.findMany({

        orderBy: {

            nome: "asc",

        },

        include: {

            _count: {

                select: {

                    usuarios: true,

                },

            },

        },

    });

};

/* =====================================================
   BUSCAR POR ID
===================================================== */

const buscarPorId = (id) => {

    return prisma.perfil.findUnique({

        where: {

            id,

        },

        include: {

            usuarios: {

                select: {

                    id: true,
                    nome: true,
                    email: true,
                    ativo: true,

                },

            },

        },

    });

};

/* =====================================================
   CRIAR
===================================================== */

const criar = async (dados) => {

    const perfil = await prisma.perfil.create({

        data: {

            nome: dados.nome,
            descricao: dados.descricao,
            ativo: dados.ativo ?? true,

        },

    });

    await auditoriaService.registrar({

        usuarioId: null,
        usuarioNome: "Sistema",

        modulo: "PERFIS",

        registroId: perfil.id,

        acao: "CRIAR",

        valorAnterior: null,

        valorNovo: perfil,

    });

    await logService.registrar({

        usuarioId: null,
        usuarioNome: "Sistema",

        modulo: "PERFIS",

        acao: "CRIAR",

        descricao: `Perfil ${perfil.nome} criado.`,

    });

    return perfil;

};

/* =====================================================
   ATUALIZAR
===================================================== */

const atualizar = async (id, dados) => {

    const anterior = await prisma.perfil.findUnique({

        where: {

            id,

        },

    });

    const perfil = await prisma.perfil.update({

        where: {

            id,

        },

        data: {

            nome: dados.nome,
            descricao: dados.descricao,
            ativo: dados.ativo,

        },

    });

    await auditoriaService.registrar({

        usuarioId: null,
        usuarioNome: "Sistema",

        modulo: "PERFIS",

        registroId: perfil.id,

        acao: "ATUALIZAR",

        valorAnterior: anterior,

        valorNovo: perfil,

    });

    await logService.registrar({

        usuarioId: null,
        usuarioNome: "Sistema",

        modulo: "PERFIS",

        acao: "ATUALIZAR",

        descricao: `Perfil ${perfil.nome} atualizado.`,

    });

    return perfil;

};

/* =====================================================
   REMOVER
===================================================== */

const remover = async (id) => {

    const perfil = await prisma.perfil.findUnique({

        where: {

            id,

        },

        include: {

            _count: {

                select: {

                    usuarios: true,

                },

            },

        },

    });

    if (!perfil) {

        throw new Error("Perfil não encontrado.");

    }

    if (perfil._count.usuarios > 0) {

        throw new Error(

            "Não é possível excluir um perfil que possui usuários vinculados."

        );

    }

    await auditoriaService.registrar({

        usuarioId: null,
        usuarioNome: "Sistema",

        modulo: "PERFIS",

        registroId: perfil.id,

        acao: "EXCLUIR",

        valorAnterior: perfil,

        valorNovo: null,

    });

    await logService.registrar({

        usuarioId: null,
        usuarioNome: "Sistema",

        modulo: "PERFIS",

        acao: "EXCLUIR",

        descricao: `Perfil ${perfil.nome} removido.`,

    });

    return prisma.perfil.delete({

        where: {

            id,

        },

    });

};

module.exports = {

    listar,

    buscarPorId,

    criar,

    atualizar,

    remover,

};