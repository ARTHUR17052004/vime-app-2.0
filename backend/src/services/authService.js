const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const emailService = require('./emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://vimesistema.online';

const login = async (email, senha) => {

  const usuario = await prisma.usuario.findUnique({
    where: {
      email
    },
    include: {
      perfil: true
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
    perfil: usuario.perfil?.nome,
    ativo: usuario.ativo
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
    // O JWT fica enxuto de propósito (payload assinado) -- foto e
    // permissões só vão na resposta HTTP pro front guardar, nunca
    // dentro do token/cookie (o backend nunca confia nisso pra
    // autorizar nada -- permissaoMiddleware sempre confere no banco).
    usuario: {
      ...payload,
      foto: usuario.foto || null,
      permissoes: usuario.perfil?.permissoes || [],
    }
  };

};

const solicitarRedefinicaoSenha = async (email) => {

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new Error('E-mail não cadastrado no sistema.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      resetSenhaToken: token,
      resetSenhaExpiraEm: expiraEm,
    },
  });

  const link = `${FRONTEND_URL}/redefinir-senha?token=${token}`;

  await emailService.enviarEmail({
    para: usuario.email,
    assunto: 'Redefinição de senha — VIME',
    texto: `Olá, ${usuario.nome}. Para redefinir sua senha, acesse: ${link} (válido por 1 hora). Se você não pediu isso, ignore este e-mail.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Redefinição de senha</h2>
        <p>Olá, ${usuario.nome}.</p>
        <p>Recebemos um pedido para redefinir a senha da sua conta no VIME.</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
            Redefinir senha
          </a>
        </p>
        <p style="color:#64748b;font-size:13px;">Este link é válido por 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail com segurança.</p>
      </div>
    `,
  });

};

const redefinirSenha = async (token, novaSenha) => {

  if (!novaSenha || novaSenha.length < 6) {
    throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { resetSenhaToken: token },
  });

  if (!usuario || !usuario.resetSenhaExpiraEm || usuario.resetSenhaExpiraEm < new Date()) {
    throw new Error('Link inválido ou expirado. Solicite a redefinição novamente.');
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senha: senhaHash,
      resetSenhaToken: null,
      resetSenhaExpiraEm: null,
    },
  });

};

module.exports = {
  login,
  solicitarRedefinicaoSenha,
  redefinirSenha,
};