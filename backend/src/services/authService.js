const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');

const login = async (email, senha) => {
  const usuario = await prisma.usuario.findUnique({
    where: { email }
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  if (usuario.senha !== senha) {
    throw new Error('Senha inválida');
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      perfil: usuario.perfil
    },
    process.env.JWT_SECRET || 'vime_secret_dev',
    {
      expiresIn: '1d'
    }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    }
  };
};

module.exports = {
  login
};