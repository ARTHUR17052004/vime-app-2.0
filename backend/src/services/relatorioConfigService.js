const prisma = require("../config/prisma");
const { TIPOS } = require("../utils/tiposRelatorio");

// Mesmo padrão de notificacaoConfigService.js: cache curto evita ida ao
// banco a cada carregamento da tela de Relatórios.
const VALIDADE_MS = 30 * 1000;
let cache = null;
let cacheEm = 0;

const carregar = async () => {

  if (cache && Date.now() - cacheEm < VALIDADE_MS) return cache;

  const linhas = await prisma.relatorioConfig.findMany();

  cache = new Map(linhas.map((l) => [l.tipo, l]));
  cacheEm = Date.now();

  return cache;

};

const listar = async () => {

  const mapa = await carregar();

  return TIPOS.map((t) => ({
    chave: t.chave,
    grupo: t.grupo,
    rotulo: t.rotulo,
    descricao: t.descricao,
    ativo: mapa.has(t.chave) ? mapa.get(t.chave).ativo : true,
  }));

};

const atualizar = async (tipo, { ativo }) => {

  if (!TIPOS.some((t) => t.chave === tipo)) {
    throw new Error("Tipo de relatório inválido.");
  }

  const dados = {};
  if (typeof ativo === "boolean") dados.ativo = ativo;

  await prisma.relatorioConfig.upsert({
    where: { tipo },
    update: dados,
    create: { tipo, ...dados },
  });

  cache = null;

  return listar();

};

module.exports = { listar, atualizar };
