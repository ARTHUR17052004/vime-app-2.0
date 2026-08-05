const usuarioService = require("../services/usuarioService");

/* ==========================================
   LISTAR
========================================== */

const listar = async (req, res) => {

    try {

        const usuarios = await usuarioService.listar();

        return res.status(200).json({

            success: true,

            data: usuarios,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao listar usuários.",

        });

    }

};

/* ==========================================
   BUSCAR POR ID
========================================== */

const buscarPorId = async (req, res) => {

    try {

        const usuario = await usuarioService.buscarPorId(

            req.params.id

        );

        if (!usuario) {

            return res.status(404).json({

                success: false,

                message: "Usuário não encontrado.",

            });

        }

        return res.status(200).json({

            success: true,

            data: usuario,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao buscar usuário.",

        });

    }

};

/* ==========================================
   CRIAR
========================================== */

const criar = async (req, res) => {

    try {

        const usuario = await usuarioService.criar(

            req.body

        );

        return res.status(201).json({

            success: true,

            data: usuario,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao criar usuário.",

        });

    }

};

/* ==========================================
   ATUALIZAR
========================================== */

const atualizar = async (req, res) => {

    try {

        const usuario = await usuarioService.atualizar(

            req.params.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            data: usuario,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao atualizar usuário.",

        });

    }

};

/* ==========================================
   REMOVER
========================================== */

const remover = async (req, res) => {

    try {

        await usuarioService.remover(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Usuário removido com sucesso.",

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

/* ==========================================
   REDEFINIR SENHA
========================================== */

const redefinirSenha = async (req, res) => {

    try {

        const {

            novaSenha,

        } = req.body;

        await usuarioService.redefinirSenha(

            req.params.id,

            novaSenha

        );

        return res.status(200).json({

            success: true,

            message: "Senha redefinida com sucesso.",

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao redefinir senha.",

        });

    }

};

/* ==========================================
   ENVIAR ACESSO
========================================== */

const enviarAcesso = async (req, res) => {

    try {

        const resposta = await usuarioService.enviarAcesso(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            data: resposta,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao enviar acesso.",

        });

    }

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