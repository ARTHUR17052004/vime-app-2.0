const prisma = require('../config/prisma');
const vistoriaService = require('./vistoriaService');

/*
  Ponte entre Financeiro e Vistorias pro "risco de corte" -- antes só
  existia o caminho de ida (verificarAtrasoCorteJob.js cria a vistoria
  quando uma cobrança vira 72h+ atrasada), nunca o de volta. Resultado:
  a cobrança deixava de estar em risco (foi paga, a data foi corrigida
  pro futuro, foi cancelada) e a vistoria ficava aberta pra sempre,
  achando que ainda tinha risco de corte -- bug relatado em 12/11/2026
  (Guilherme Rodrigues Oliveira: vencimento corrigido e cobrança
  enviada, mas a vistoria de corte continuava Pendente).
*/

// Mesmo critério de 72h usado na criação (verificarAtrasoCorteJob.js) --
// "ainda em risco" = atrasada, enviada ao banco, vencida há 72h+.
const aindaEmRisco = (receita) => {

  if (!receita) return false;
  if (receita.status === 'PAGO' || receita.status === 'PAGA' || receita.status === 'CANCELADA') return false;
  if (!receita.gatewayReferencia) return false;
  if (!receita.vencimento) return false;

  const limite = new Date(receita.vencimento);
  limite.setHours(limite.getHours() + 72);

  return limite <= new Date();

};

// Chamado toda vez que uma Receita muda (editar, marcar paga, cancelar,
// webhook de pagamento...) E pela varredura do job (pega quem mudou por
// outro caminho, ex.: confirmação direta do banco). Idempotente -- não
// faz nada se não tiver vistoria vinculada, ou se ela já estiver
// Cancelada/Realizada.
const resolverSeNaoCabeMais = async (receitaId) => {

  const receita = await prisma.receita.findUnique({ where: { id: receitaId } });

  if (!receita?.vistoriaCorteId) return;

  if (aindaEmRisco(receita)) return;

  const vistoria = await prisma.vistoria.findUnique({ where: { id: receita.vistoriaCorteId } });

  if (vistoria && vistoria.status !== 'CANCELADA' && vistoria.status !== 'REALIZADA') {

    await vistoriaService.atualizar(vistoria.id, {
      status: 'CANCELADA',
      observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- a cobrança que gerou esse risco de corte não está mais em atraso/aberta.`,
    });

  }

  // Libera o vínculo (e o dedupe) -- se essa mesma receita voltar a
  // ficar 72h+ atrasada de novo no futuro, pode gerar outra vistoria.
  await prisma.receita.update({
    where: { id: receita.id },
    data: { vistoriaCorteId: null, vistoriaCorteAtrasoCriadaEm: null },
  });

};

// Caminho INVERSO do resolverSeNaoCabeMais (que parte da Receita) --
// varre direto as Vistorias de corte ainda abertas e cancela qualquer
// uma que não tenha mais uma Receita de verdade te back-la (ex.: a
// Receita que gerou ela foi excluída/cancelada por fora do fluxo
// normal, sem passar por cancelarVinculada). Sem isso, uma vistoria
// dessas fica Pendente pra sempre, pedindo corte de água/energia de
// um débito que não existe mais -- bug relatado em 13/11/2026 (sobra
// de quando existiam duas Receitas de Aluguel pro mesmo mês/inquilino).
const TITULO_REALIZAR_CORTE = 'REALIZAR CORTE DE ÁGUA E ENERGIA';

const resolverOrfas = async () => {

  const abertas = await prisma.vistoria.findMany({
    where: { titulo: TITULO_REALIZAR_CORTE, status: { notIn: ['CANCELADA', 'REALIZADA'] } },
    select: { id: true, observacoes: true },
  });

  let canceladas = 0;

  for (const vistoria of abertas) {

    const receita = await prisma.receita.findFirst({ where: { vistoriaCorteId: vistoria.id } });

    if (receita && aindaEmRisco(receita)) continue;

    await vistoriaService.atualizar(vistoria.id, {
      status: 'CANCELADA',
      observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- não existe mais nenhuma cobrança em aberto ligada a essa vistoria de corte.`,
    });

    canceladas++;

  }

  return canceladas;

};

// Pra quando a Receita está sendo EXCLUÍDA de vez -- aí não interessa
// mais se ela "ainda cabe" ou não (os critérios de aindaEmRisco nem
// fazem sentido pra uma cobrança que está deixando de existir): a
// vistoria é cancelada sempre que tiver uma vinculada. Chamar ANTES de
// apagar a receita (ver receitaService.remover).
const cancelarVinculada = async (receitaId) => {

  const receita = await prisma.receita.findUnique({ where: { id: receitaId } });

  if (!receita?.vistoriaCorteId) return;

  const vistoria = await prisma.vistoria.findUnique({ where: { id: receita.vistoriaCorteId } });

  if (vistoria && vistoria.status !== 'CANCELADA' && vistoria.status !== 'REALIZADA') {

    await vistoriaService.atualizar(vistoria.id, {
      status: 'CANCELADA',
      observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- a cobrança que gerou esse risco de corte foi excluída.`,
    });

  }

};

module.exports = { aindaEmRisco, resolverSeNaoCabeMais, resolverOrfas, cancelarVinculada, TITULO_REALIZAR_CORTE };
