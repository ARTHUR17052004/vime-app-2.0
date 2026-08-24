const errorMiddleware = (err, req, res, next) => {

    console.error(err);

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'Registro não encontrado.'
        });
    }

    if (err.code === 'P2002') {
        return res.status(400).json({
            success: false,
            message: 'Registro duplicado.'
        });
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            success: false,
            message: 'Um dos campos selecionados não corresponde a um registro válido (ex.: locador, kitnet ou unidade inexistente).'
        });
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor.'
    });

};

module.exports = errorMiddleware;