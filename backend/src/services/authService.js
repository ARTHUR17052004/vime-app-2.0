const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (email, senha) => {

  const usuario = await prisma.usuario.findUnique({
    where: {
      email
    }
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado.');
  }

  const senhaValida = await bcrypt.compare(
    senha,
    usuario.senha
  );

  if (!senhaValida) {
    throw new Error('Senha inválida.');
  }

  const payload = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'vime_secret_dev',
    {
      expiresIn: '1d'
    }
  );

  const logService = require("./logService");
  await logService.registrar({

  usuarioId: usuario.id,

  usuarioNome: usuario.nome,

  modulo: "AUTH",

  acao: "LOGIN",

  descricao: "Usuário realizou login.",

});

  return {
    token,
    usuario: payload
  };

};

module.exports = {
  login
};