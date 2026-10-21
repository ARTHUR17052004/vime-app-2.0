const prisma = require("../config/prisma");

const logService = require("./logService");
const auditoriaService = require("./auditoriaService");
const { diffCampos } = require("../utils/diffCampos");

const CAMPOS_PERFIL = {
    nome: "nome",
    descricao: "descrição",
    ativo: "ativo",
};

// Permissões é array -- diffCampos não dá conta disso (só compara
// igual/diferente), então lista separadamente o que foi ligado/desligado.
const diffPermissoes = (antes = [], depois = []) => {

    const adicionadas = depois.filter((p) => !antes.includes(p));
    const removidas = antes.filter((p) => !depois.includes(p));

    const partes = [];
    if (adicionadas.length) partes.push(`+${adicionadas.length} permissão(ões)`);
    if (removidas.length) partes.push(`-${removidas.length} permissão(ões)`);

    return partes.join(", ");

};

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

const criar = async (dados, autor) => {

    const perfil = await prisma.perfil.create({

        data: {

            nome: dados.nome,
            descricao: dados.descricao,
            ativo: dados.ativo ?? true,

        },

    });

    await auditoriaService.registrar({

        usuarioId: autor?.id || null,
        usuarioNome: autor?.nome || "Sistema",

        modulo: "PERFIS",

        registroId: perfil.id,

        acao: "CRIAR",

        valorAnterior: null,

        valorNovo: perfil,

    });

    await logService.registrar({

        usuarioId: autor?.id || null,
        usuarioNome: autor?.nome || "Sistema",

        modulo: "PERFIS",

        acao: "CRIAR",

        descricao: `Perfil "${perfil.nome}" criado por ${autor?.nome || "Sistema"}.`,

    });

    return perfil;

};

/* =====================================================
   ATUALIZAR
===================================================== */

const atualizar = async (id, dados, autor) => {

    const anterior = await prisma.perfil.findUnique({

        where: {

            id,

        },

    });

    const data = {

        nome: dados.nome,
        descricao: dados.descricao,
        ativo: dados.ativo,

    };

    if (dados.permissoes !== undefined) {

        data.permissoes = dados.permissoes;

    }

    const perfil = await prisma.perfil.update({

        where: {

            id,

        },

        data,

    });

    await auditoriaService.registrar({

        usuarioId: autor?.id || null,
        usuarioNome: autor?.nome || "Sistema",

        modulo: "PERFIS",

        registroId: perfil.id,

        acao: "ATUALIZAR",

        valorAnterior: anterior,

        valorNovo: perfil,

    });

    const alteracoes = [
        diffCampos(anterior, perfil, CAMPOS_PERFIL),
        dados.permissoes !== undefined ? diffPermissoes(anterior.permissoes, perfil.permissoes) : "",
    ].filter(Boolean).join("; ");

    await logService.registrar({

        usuarioId: autor?.id || null,
        usuarioNome: autor?.nome || "Sistema",

        modulo: "PERFIS",

        acao: "ATUALIZAR",

        descricao: `Perfil "${perfil.nome}" atualizado por ${autor?.nome || "Sistema"}${alteracoes ? `: ${alteracoes}` : ""}.`,

    });

    return perfil;

};

/* =====================================================
   REMOVER
===================================================== */

const remover = async (id, autor) => {

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

        usuarioId: autor?.id || null,
        usuarioNome: autor?.nome || "Sistema",

        modulo: "PERFIS",

        registroId: perfil.id,

        acao: "EXCLUIR",

        valorAnterior: perfil,

        valorNovo: null,

    });

    await logService.registrar({

        usuarioId: autor?.id || null,
        usuarioNome: autor?.nome || "Sistema",

        modulo: "PERFIS",

        acao: "EXCLUIR",

        descricao: `Perfil "${perfil.nome}" removido por ${autor?.nome || "Sistema"}.`,

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