const usuarioService = require('../services/usuarioService');

const listar = async (req, res) => {
    const usuarios = await usuarioService.listar();

    res.json(usuarios);
};

const criar = async (req, res) => {
    const usuario = await usuarioService.criar(req.body);

    res.status(201).json(usuario);
};

const atualizar = async (req, res) => {
    const usuario = await usuarioService.atualizar(
        req.params.id,
        req.body
    );

    res.json(usuario);
};

const remover = async (req, res) => {
    await usuarioService.remover(req.params.id);

    res.json({
        mensagem: 'Usuário removido com sucesso'
    });
};

module.exports = {
    listar,
    criar,
    atualizar,
    remover
};