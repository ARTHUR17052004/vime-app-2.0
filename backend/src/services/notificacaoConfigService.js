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

// Tipo sem linha (ou "OUTROS") = tudo ligado, sem mensagem customizada,
// pra todos os perfis.
const obter = async (tipo) => {

  const mapa = await carregar();
  const linha = mapa.get(tipo);

  return {
    ativo: linha ? linha.ativo : true,
    push: linha ? linha.push : true,
    mensagemTemplate: linha?.mensagemTemplate || null,
    perfis: linha?.perfis || [],
  };

};

const listar = async () => {

  const mapa = await carregar();

  return TIPOS.map((t) => {

    const linha = mapa.get(t.chave);

    return {
      chave: t.chave,
      grupo: t.grupo,
      rotulo: t.rotulo,
      descricao: t.descricao,
      variaveis: t.variaveis || [],
      mensagemPadrao: t.mensagemPadrao || null,
      ativo: linha ? linha.ativo : true,
      push: linha ? linha.push : true,
      mensagemTemplate: linha?.mensagemTemplate || null,
      perfis: linha?.perfis || [],
    };

  });

};

const atualizar = async (tipo, { ativo, push, mensagemTemplate, perfis }) => {

  if (!TIPOS.some((t) => t.chave === tipo)) {
    throw new Error("Tipo de notificação inválido.");
  }

  const dados = {};
  if (typeof ativo === "boolean") dados.ativo = ativo;
  if (typeof push === "boolean") dados.push = push;
  // string vazia = volta a usar o texto padrão do código (não grava "").
  if (mensagemTemplate !== undefined) dados.mensagemTemplate = mensagemTemplate || null;
  if (Array.isArray(perfis)) dados.perfis = perfis;

  await prisma.notificacaoConfig.upsert({
    where: { tipo },
    update: dados,
    create: { tipo, ...dados },
  });

  cache = null;

  return listar();

};

module.exports = { obter, listar, atualizar };
