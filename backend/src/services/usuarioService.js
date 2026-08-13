const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const logService = require("./logService");
const auditoriaService = require("./auditoriaService");

const semSenha = (usuario) => {

    if (!usuario) return usuario;

    const { senha, ...resto } = usuario;

    return resto;

};

/* =====================================================
   LISTAR
===================================================== */

const listar = () => {

    return prisma.usuario.findMany({

        orderBy: {

            createdAt: "desc",

        },

        omit: {

            senha: true,

        },

        include: {

            perfil: {

                select: {

                    id: true,

                    nome: true,

                },

            },

        },

    });

};

/* =====================================================
   BUSCAR POR ID
===================================================== */

const buscarPorId = (id) => {

    return prisma.usuario.findUnique({

        where: {

            id,

        },

        omit: {

            senha: true,

        },

        include: {

            perfil: {

                select: {

                    id: true,

                    nome: true,

                },

            },

        },

    });

};

/* =====================================================
   CRIAR
===================================================== */

const criar = async (dados) => {

    const senhaHash = await bcrypt.hash(

        dados.senha,

        10

    );

    const usuario = await prisma.usuario.create({

    data: {

        nome: dados.nome,

        email: dados.email,

        telefone: dados.telefone,

        senha: senhaHash,

        ativo: dados.ativo ?? true,

        perfil: {

            connect: {

                id: dados.perfilId,

            },

        },

    },

    omit: {

        senha: true,

    },

    include: {

        perfil: true,

    },

});

    await auditoriaService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        registroId: usuario.id,

        acao: "CRIAR",

        valorAnterior: null,

        valorNovo: semSenha(usuario),

    });

    await logService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        acao: "CRIAR",

        descricao: `Usuário ${usuario.nome} criado.`,

    });

    return usuario;

};
/* =====================================================
   ATUALIZAR
===================================================== */

/* =====================================================
   ATUALIZAR
===================================================== */

const atualizar = async (id, dados) => {

    const anterior = await prisma.usuario.findUnique({

        where: {

            id,

        },

        omit: {

            senha: true,

        },

        include: {

            perfil: true,

        },

    });

    const data = {

        nome: dados.nome,

        email: dados.email,

        telefone: dados.telefone,

        ativo: dados.ativo,

    };

    if (dados.perfilId) {

        data.perfil = {

            connect: {

                id: dados.perfilId,

            },

        };

    }

    if (dados.senha) {

        data.senha = await bcrypt.hash(

            dados.senha,

            10

        );

    }

    const usuario = await prisma.usuario.update({

        where: {

            id,

        },

        data,

        omit: {

            senha: true,

        },

        include: {

            perfil: true,

        },

    });

    await auditoriaService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        registroId: usuario.id,

        acao: "ATUALIZAR",

        valorAnterior: semSenha(anterior),

        valorNovo: semSenha(usuario),

    });

    await logService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        acao: "ATUALIZAR",

        descricao: `Usuário ${usuario.nome} atualizado.`,

    });

    return usuario;

};

/* =====================================================
   REMOVER
===================================================== */

const remover = async (id) => {

    const usuario = await prisma.usuario.findUnique({

        where: {

            id,

        },

        omit: {

            senha: true,

        },

        include: {

            perfil: true,

        },

    });

    if (!usuario) {

        throw new Error(

            "Usuário não encontrado."

        );

    }

    await auditoriaService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        registroId: usuario.id,

        acao: "EXCLUIR",

        valorAnterior: semSenha(usuario),

        valorNovo: null,

    });

    await logService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        acao: "EXCLUIR",

        descricao: `Usuário ${usuario.nome} removido.`,

    });

    return prisma.usuario.delete({

        where: {

            id,

        },

    });

};
/* =====================================================
   REDEFINIR SENHA
===================================================== */

const redefinirSenha = async (

    id,

    novaSenha,

    senhaAtual

) => {

    if (senhaAtual !== undefined) {

        const usuario = await prisma.usuario.findUnique({
            where: { id }
        });

        const senhaValida = usuario && await bcrypt.compare(
            senhaAtual,
            usuario.senha
        );

        if (!senhaValida) {
            throw new Error('Senha atual inválida.');
        }

    }

    const senhaHash = await bcrypt.hash(

        novaSenha,

        10

    );

    return prisma.usuario.update({

        where: {

            id,

        },

        data: {

            senha: senhaHash,

        },

        omit: {

            senha: true,

        },

    });

};

/* =====================================================
   ENVIAR ACESSO
===================================================== */

const enviarAcesso = async (id) => {

    const usuario = await prisma.usuario.findUnique({

        where: {

            id,

        },

        omit: {

            senha: true,

        },

    });

    if (!usuario) {

        throw new Error(

            "Usuário não encontrado."

        );

    }

    return {

        success: true,

        message: "Convite preparado para envio.",

    };

};
module.exports = {

    listar,

    buscarPorId,

    criar,

    atualizar,

    remover,

    redefinirSenha,

    enviarAcesso,

};