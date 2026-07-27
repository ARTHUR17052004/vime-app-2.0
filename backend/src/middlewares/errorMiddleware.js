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

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor.'
    });

};

module.exports = errorMiddleware;