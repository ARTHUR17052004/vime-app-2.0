const perfilService = require("../services/perfilService");

/* ==========================================
   LISTAR
========================================== */

const listar = async (req, res) => {

    try {

        const perfis = await perfilService.listar();

        return res.status(200).json({

            success: true,

            data: perfis,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao listar perfis.",

        });

    }

};

/* ==========================================
   BUSCAR POR ID
========================================== */

const buscarPorId = async (req, res) => {

    try {

        const perfil = await perfilService.buscarPorId(

            req.params.id

        );

        if (!perfil) {

            return res.status(404).json({

                success: false,

                message: "Perfil não encontrado.",

            });

        }

        return res.status(200).json({

            success: true,

            data: perfil,

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Erro ao buscar perfil.",

        });

    }

};

/* ==========================================
   CRIAR
========================================== */

const criar = async (req, res) => {

    try {

        const perfil = await perfilService.criar(

            req.body

        );

        return res.status(201).json({

            success: true,

            data: perfil,

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
   ATUALIZAR
========================================== */

const atualizar = async (req, res) => {

    try {

        const perfil = await perfilService.atualizar(

            req.params.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            data: perfil,

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
   REMOVER
========================================== */

const remover = async (req, res) => {

    try {

        await perfilService.remover(

            req.params.id

        );

        return res.status(200).json({

            success: true,

            message: "Perfil removido com sucesso.",

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

module.exports = {

    listar,

    buscarPorId,

    criar,

    atualizar,

    remover,

};