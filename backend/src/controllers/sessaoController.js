const { listarOnline } = require("../socket");

const listar = async (req, res) => {

    const sessoes = listarOnline();

    return res.status(200).json({

        success: true,

        data: sessoes,

    });

};

module.exports = {

    listar,

};
