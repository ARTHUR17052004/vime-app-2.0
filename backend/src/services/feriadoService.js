const prisma = require("../config/prisma");
const diaUtil = require("../utils/diaUtil");
const logService = require("./logService");

// Lista nacionais (calculados, só leitura) + adicionais (cadastrados --
// estadual, ou qualquer ponto facultativo que o locador queira tratar
// como não-útil) de um ano, já mesclados e ordenados -- pra tela
// Administração > Feriados mostrar os dois juntos, diferenciando só
// pelo campo `origem` (front usa isso pra desabilitar editar/excluir
// nos nacionais).
const listar = async (ano) => {

  const anoNumero = Number(ano) || new Date().getFullYear();

  const nacionais = diaUtil
    .feriadosNacionais(anoNumero)
    .map((f) => ({ ...f, origem: "NACIONAL", id: null }));

  const adicionais = await prisma.feriado.findMany({
    where: {
      data: {
        gte: new Date(anoNumero, 0, 1),
        lt: new Date(anoNumero + 1, 0, 1),
      },
    },
  });

  const todos = [
    ...nacionais,
    ...adicionais.map((f) => ({ id: f.id, data: f.data, nome: f.nome, origem: "ADICIONAL" })),
  ];

  todos.sort((a, b) => new Date(a.data) - new Date(b.data));

  return todos;

};

const criar = async ({ data, nome }, autor) => {

  if (!data) {
    const erro = new Error("Data é obrigatória.");
    erro.status = 400;
    throw erro;
  }

  if (!nome || !nome.trim()) {
    const erro = new Error("Nome é obrigatório.");
    erro.status = 400;
    throw erro;
  }

  // "YYYY-MM-DD" (o que o <input type="date"> manda) vira meia-noite
  // UTC se passar direto pro Date() -- aí .setHours(0,0,0,0), que zera
  // em horário LOCAL, empurrava um dia pra trás em qualquer fuso
  // negativo (ex.: 28/10 virava 27/10 -- bug encontrado testando isso
  // em 23/11/2026). Em "YYYY-MM-DD", monta a data já em componentes
  // locais; só cai no `new Date(data)` genérico se vier em outro
  // formato (ex.: já um Date/ISO completo).
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const dataFeriado = partes
    ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]))
    : new Date(data);
  dataFeriado.setHours(0, 0, 0, 0);

  const feriado = await prisma.feriado.create({
    data: { data: dataFeriado, nome: nome.trim() },
  });

  diaUtil.invalidarCache();

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "FERIADOS",
    acao: "CRIAR",
    descricao: `Feriado "${feriado.nome}" (${dataFeriado.toLocaleDateString("pt-BR")}) cadastrado por ${autor?.nome || "Sistema"}.`,
  });

  return feriado;

};

const remover = async (id, autor) => {

  const feriado = await prisma.feriado.findUnique({ where: { id } });

  if (!feriado) {
    const erro = new Error("Feriado não encontrado.");
    erro.status = 404;
    throw erro;
  }

  await prisma.feriado.delete({ where: { id } });

  diaUtil.invalidarCache();

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "FERIADOS",
    acao: "EXCLUIR",
    descricao: `Feriado "${feriado.nome}" (${new Date(feriado.data).toLocaleDateString("pt-BR")}) excluído por ${autor?.nome || "Sistema"}.`,
  });

  return feriado;

};

module.exports = {
  listar,
  criar,
  remover,
};
