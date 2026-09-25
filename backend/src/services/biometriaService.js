const crypto = require("crypto");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");

const prisma = require("../config/prisma");
const authService = require("./authService");
const { origensPermitidas } = require("../utils/origensPermitidas");

// Login por digital/rosto (WebAuthn). O aparelho guarda a chave privada e
// só devolve uma assinatura depois de reconhecer o dono; aqui fica só a
// chave pública. Como a credencial é "residente" (discoverable), o login
// não precisa nem de e-mail: o próprio aparelho diz quem é.

const NOME_APP = "VIME 2.0";
const VALIDADE_DESAFIO_MS = 5 * 60 * 1000;

// Desafios em memória (o backend roda em um único processo).
const desafios = new Map();

const guardarDesafio = (chave, dados) => {
  desafios.set(chave, { ...dados, expiraEm: Date.now() + VALIDADE_DESAFIO_MS });
};

const consumirDesafio = (chave) => {
  const d = desafios.get(chave);
  desafios.delete(chave);
  if (!d || d.expiraEm < Date.now()) throw new Error("Desafio expirado. Tente de novo.");
  return d;
};

setInterval(() => {
  const agora = Date.now();
  for (const [k, v] of desafios) if (v.expiraEm < agora) desafios.delete(k);
}, 60 * 1000).unref();

// O navegador diz de qual site veio; só aceita os front-ends autorizados.
const contextoDe = (req) => {

  const origem = req.headers.origin;

  if (!origem || !origensPermitidas.includes(origem)) {
    throw new Error("Origem não autorizada para login por digital.");
  }

  return { origem, rpID: new URL(origem).hostname };

};

const paraBase64url = (buffer) => Buffer.from(buffer).toString("base64url");

/* ---------- Cadastro (usuário já logado) ---------- */

const opcoesDeRegistro = async (usuario, req) => {

  const { rpID } = contextoDe(req);

  const existentes = await prisma.credencialBiometria.findMany({
    where: { usuarioId: usuario.id },
    select: { credentialId: true },
  });

  const opcoes = await generateRegistrationOptions({
    rpName: NOME_APP,
    rpID,
    userName: usuario.email,
    userDisplayName: usuario.nome,
    userID: new TextEncoder().encode(usuario.id),
    attestationType: "none",
    excludeCredentials: existentes.map((c) => ({ id: c.credentialId })),
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "required",
      userVerification: "required",
    },
  });

  guardarDesafio(`reg:${usuario.id}`, { challenge: opcoes.challenge });

  return opcoes;

};

const verificarRegistro = async (usuario, req) => {

  const { origem, rpID } = contextoDe(req);
  const { challenge } = consumirDesafio(`reg:${usuario.id}`);

  const verificacao = await verifyRegistrationResponse({
    response: req.body.resposta,
    expectedChallenge: challenge,
    expectedOrigin: origem,
    expectedRPID: rpID,
    requireUserVerification: true,
  });

  if (!verificacao.verified) throw new Error("Não foi possível confirmar a digital.");

  const { credential } = verificacao.registrationInfo;

  await prisma.credencialBiometria.create({
    data: {
      usuarioId: usuario.id,
      credentialId: credential.id,
      publicKey: paraBase64url(credential.publicKey),
      counter: credential.counter,
      transports: (credential.transports || []).join(",") || null,
      nome: String(req.body.nome || "").slice(0, 80) || null,
    },
  });

  return true;

};

/* ---------- Login (sem senha) ---------- */

const opcoesDeLogin = async (req) => {

  const { rpID } = contextoDe(req);

  const opcoes = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
  });

  const desafioId = crypto.randomUUID();

  guardarDesafio(`login:${desafioId}`, { challenge: opcoes.challenge });

  return { opcoes, desafioId };

};

const verificarLogin = async (req) => {

  const { origem, rpID } = contextoDe(req);
  const { desafioId, resposta } = req.body;

  const { challenge } = consumirDesafio(`login:${desafioId}`);

  const credencial = await prisma.credencialBiometria.findUnique({
    where: { credentialId: resposta?.id || "" },
    include: { usuario: { include: { perfil: true } } },
  });

  if (!credencial) throw new Error("Digital não cadastrada neste sistema.");

  const verificacao = await verifyAuthenticationResponse({
    response: resposta,
    expectedChallenge: challenge,
    expectedOrigin: origem,
    expectedRPID: rpID,
    requireUserVerification: true,
    credential: {
      id: credencial.credentialId,
      publicKey: Buffer.from(credencial.publicKey, "base64url"),
      counter: credencial.counter,
      transports: credencial.transports ? credencial.transports.split(",") : undefined,
    },
  });

  if (!verificacao.verified) throw new Error("Não foi possível confirmar a digital.");

  await prisma.credencialBiometria.update({
    where: { id: credencial.id },
    data: { counter: verificacao.authenticationInfo.newCounter },
  });

  if (!credencial.usuario.ativo) throw new Error("Usuário inativo.");

  return authService.criarSessao(credencial.usuario, "digital");

};

/* ---------- Gerenciar ---------- */

const listar = (usuarioId) =>
  prisma.credencialBiometria.findMany({
    where: { usuarioId },
    select: { id: true, nome: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

const remover = (usuarioId, id) =>
  prisma.credencialBiometria.deleteMany({ where: { id, usuarioId } });

module.exports = {
  opcoesDeRegistro,
  verificarRegistro,
  opcoesDeLogin,
  verificarLogin,
  listar,
  remover,
};
