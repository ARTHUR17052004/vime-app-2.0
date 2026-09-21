const prisma = require("../config/prisma");
const { TIPOS } = require("../utils/tiposNotificacao");

// notificacaoService.criar() consulta isso a cada notificação; um cache
// curto evita uma ida ao banco por aviso (a tela de admin limpa na hora
// que alguém altera, então só outra instância do servidor demora até 30s).
const VALIDADE_MS = 30 * 1000;
let cache = null;
let cacheEm = 0;

const carregar = async () => {

  if (cache && Date.now() - cacheEm < VALIDADE_MS) return cache;

  const linhas = await prisma.notificacaoConfig.findMany();

  cache = new Map(linhas.map((l) => [l.tipo, l]));
  cacheEm = Date.now();

  return cache;

};

// Tipo sem linha (ou "OUTROS") = tudo ligado.
const obter = async (tipo) => {

  const mapa = await carregar();
  const linha = mapa.get(tipo);

  return { ativo: linha ? linha.ativo : true, push: linha ? linha.push : true };

};

const listar = async () => {

  const mapa = await carregar();

  return TIPOS.map((t) => ({
    chave: t.chave,
    grupo: t.grupo,
    rotulo: t.rotulo,
    descricao: t.descricao,
    ativo: mapa.has(t.chave) ? mapa.get(t.chave).ativo : true,
    push: mapa.has(t.chave) ? mapa.get(t.chave).push : true,
  }));

};

const atualizar = async (tipo, { ativo, push }) => {

  if (!TIPOS.some((t) => t.chave === tipo)) {
    throw new Error("Tipo de notificação inválido.");
  }

  const dados = {};
  if (typeof ativo === "boolean") dados.ativo = ativo;
  if (typeof push === "boolean") dados.push = push;

  await prisma.notificacaoConfig.upsert({
    where: { tipo },
    update: dados,
    create: { tipo, ...dados },
  });

  cache = null;

  return listar();

};

module.exports = { obter, listar, atualizar };
