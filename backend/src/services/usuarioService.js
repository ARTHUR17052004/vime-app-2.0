const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const logService = require("./logService");
const auditoriaService = require("./auditoriaService");
const emailService = require("./emailService");

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://vimesistema.online';

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

        foto: dados.foto,

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

    // Reaproveita o mesmo mecanismo de "esqueci minha senha" -- o link
    // leva pra tela de redefinir/definir senha, que serve igual pra
    // primeiro acesso e pra reset. Manda o e-mail antes de gravar o
    // token: se o SMTP falhar, não fica um token válido no banco que
    // ninguém recebeu por e-mail.
    const token = crypto.randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const link = `${FRONTEND_URL}/redefinir-senha?token=${token}`;

    await emailService.enviarEmail({
        para: usuario.email,
        assunto: 'Seu acesso ao VIME',
        texto: `Olá, ${usuario.nome}. Você foi cadastrado no VIME. Para definir sua senha e acessar o sistema, entre em: ${link} (link válido por 7 dias).`,
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Bem-vindo(a) ao VIME</h2>
        <p>Olá, ${usuario.nome}.</p>
        <p>Você foi cadastrado(a) no sistema. Clique abaixo para definir sua senha e acessar:</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Definir senha e acessar
          </a>
        </p>
        <p style="color:#64748b;font-size:13px;">Este link é válido por 7 dias.</p>
      </div>
    `,
    });

    await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
            resetSenhaToken: token,
            resetSenhaExpiraEm: expiraEm,
        },
    });

    return {

        success: true,

        message: "Convite enviado por e-mail.",

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