const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

const logService = require("./logService");
const auditoriaService = require("./auditoriaService");

/* =====================================================
   LISTAR
===================================================== */

const listar = () => {

    return prisma.usuario.findMany({

        orderBy: {

            createdAt: "desc",

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
            perfil: dados.perfil,
            senha: senhaHash,
            ativo: dados.ativo,
        },

        select: {

            id: true,

            nome: true,

            email: true,

            perfil: true,

            ativo: true,

            createdAt: true,

            updatedAt: true,

        },

    });

    await auditoriaService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        registroId: usuario.id,

        acao: "CRIAR",

        valorAnterior: null,

        valorNovo: usuario,

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

    console.log("==================================");
    console.log("ATUALIZAR USUÁRIO");
    console.log("ID:", id);
    console.log("DADOS RECEBIDOS:", dados);

    const anterior = await prisma.usuario.findUnique({

        where: {

            id,

        },

    });

    console.log("USUÁRIO ANTES:", anterior);

    const data = {

        nome: dados.nome,

        email: dados.email,

        telefone: dados.telefone,

        perfil: dados.perfil,

        ativo: dados.ativo,

    };

    if (dados.senha) {

        data.senha = await bcrypt.hash(

            dados.senha,

            10

        );

    }

    console.log("DATA ENVIADA AO PRISMA:", data);

    const usuario = await prisma.usuario.update({

        where: {

            id,

        },

        data,

    });

    console.log("USUÁRIO APÓS UPDATE:", usuario);

    await auditoriaService.registrar({

        usuarioId: null,

        usuarioNome: "Sistema",

        modulo: "USUARIOS",

        registroId: usuario.id,

        acao: "ATUALIZAR",

        valorAnterior: anterior,

        valorNovo: usuario,

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

        valorAnterior: usuario,

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

    novaSenha

) => {

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

    });

    if (!usuario) {

        throw new Error(

            "Usuário não encontrado."

        );

    }

    /*
        Aqui entraremos depois com:

        ✔ Nodemailer

        ✔ Resend

        ✔ Gmail SMTP

        ✔ Microsoft 365

        ✔ Amazon SES

        etc.
    */

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