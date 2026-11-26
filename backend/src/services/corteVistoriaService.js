const prisma = require('../config/prisma');
const vistoriaService = require('./vistoriaService');
const diaUtil = require('../utils/diaUtil');

/*
  Ponte entre Financeiro e Vistorias pro "risco de corte" -- antes só
  existia o caminho de ida (verificarAtrasoCorteJob.js cria a vistoria
  quando uma cobrança vira 72h+ atrasada), nunca o de volta. Resultado:
  a cobrança deixava de estar em risco (foi paga, a data foi corrigida
  pro futuro, foi cancelada) e a vistoria ficava aberta pra sempre,
  achando que ainda tinha risco de corte -- bug relatado em 12/11/2026
  (Guilherme Rodrigues Oliveira: vencimento corrigido e cobrança
  enviada, mas a vistoria de corte continuava Pendente).

  Escalada em 2 estágios (pedido do usuário em 18/11/2026, renomeado e
  reajustado em 26/11/2026): atraso 72h ÚTEIS+ -> vistoria "REALIZAR
  CORTE DE ÁGUA E ENERGIA" -> realizada mas a cobrança continua sem
  resolver por mais 48h ÚTEIS -> vistoria "FAZER DESOCUPAÇÃO DE
  IMÓVEL" (que, ao ser realizada, encerra o contrato e libera a kitnet
  sozinha -- ver vistoriaService.atualizar). Cada estágio é descrito
  aqui (ver ESTAGIOS) pra não duplicar a mesma lógica de
  cancelar/resolver duas vezes. Nomes internos dos campos (vistoriaEsvaziarId/
  vistoriaEsvaziarCriadaEm/kitnetEsvaziadaEm) continuam com o nome
  antigo no banco -- só o TÍTULO que o zelador vê e o texto mudaram.
*/

const TITULO_REALIZAR_CORTE = 'REALIZAR CORTE DE ÁGUA E ENERGIA';
const TITULO_FAZER_DESOCUPACAO = 'FAZER DESOCUPAÇÃO DE IMÓVEL';

const ESTAGIOS = [
  { campoVistoriaId: 'vistoriaCorteId', campoCriadaEm: 'vistoriaCorteAtrasoCriadaEm', titulo: TITULO_REALIZAR_CORTE },
  { campoVistoriaId: 'vistoriaEsvaziarId', campoCriadaEm: 'vistoriaEsvaziarCriadaEm', titulo: TITULO_FAZER_DESOCUPACAO },
];

// Mesmo critério usado na criação (verificarAtrasoCorteJob.js) --
// "ainda em risco" = atrasada, enviada ao banco, vencida há 3 dias
// ÚTEIS+ (não 72h corridas -- o zelador não trabalha sábado/domingo/
// feriado, pedido do usuário em 23/11/2026).
const aindaEmRisco = async (receita) => {

  if (!receita) return false;
  if (receita.status === 'PAGO' || receita.status === 'PAGA' || receita.status === 'CANCELADA') return false;
  if (!receita.gatewayReferencia) return false;
  if (!receita.vencimento) return false;

  const vencimento = new Date(receita.vencimento);
  const feriadosSet = await diaUtil.obterFeriadosSet([vencimento.getFullYear(), vencimento.getFullYear() + 1]);
  const limite = diaUtil.adicionarDiasUteis(vencimento, 3, feriadosSet);

  return limite <= new Date();

};

// Chamado toda vez que uma Receita muda (editar, marcar paga, cancelar,
// webhook de pagamento...) E pela varredura do job (pega quem mudou por
// outro caminho, ex.: confirmação direta do banco). Idempotente -- não
// faz nada se não tiver vistoria vinculada, ou se ela já estiver
// Cancelada/Realizada. Roda os 2 estágios (corte e esvaziar) sempre que
// chamado -- qualquer um dos dois pode estar aberto.
const resolverSeNaoCabeMais = async (receitaId) => {

  const receita = await prisma.receita.findUnique({ where: { id: receitaId } });

  if (!receita) return;

  if (await aindaEmRisco(receita)) return;

  for (const estagio of ESTAGIOS) {

    const vistoriaId = receita[estagio.campoVistoriaId];

    if (!vistoriaId) continue;

    const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

    // Já foi REALIZADA de verdade (zelador cumpriu essa etapa) -- "não
    // tá mais em risco" aqui só é sobre essa etapa especificamente
    // (aindaEmRisco usa o mesmo critério de vencimento+3 dias úteis da
    // CRIAÇÃO), não quer dizer que a etapa nunca aconteceu. A etapa
    // SEGUINTE (corte -> esvaziar) tem seu próprio prazo e critério,
    // independente deste (ver verificarEscalonamentoCorteJob,
    // corteRealizadoEm). Limpar o vínculo aqui fazia o job de criação
    // enxergar a receita como candidata do zero de novo, recriando a
    // MESMA etapa já concluída -- bug real encontrado em 26/11/2026
    // (CELSON SILVA GOMES, kitnet 01 VIME VI: o corte já tinha sido
    // realizado dia 25/11, mas nasceu uma vistoria NOVA de "Realizar
    // corte" pra mesma dívida no dia seguinte). Pular todo o resto do
    // estágio quando já está Realizada -- nada aqui se aplica mais.
    if (vistoria?.status === 'REALIZADA') continue;

    if (vistoria && vistoria.status !== 'CANCELADA') {

      await vistoriaService.atualizar(vistoria.id, {
        status: 'CANCELADA',
        observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- a cobrança que gerou esse risco não está mais em atraso/aberta.`,
      });

    }

    // Libera o vínculo (e o dedupe) -- se essa mesma receita voltar a
    // ficar em risco de novo no futuro, pode gerar outra vistoria.
    await prisma.receita.update({
      where: { id: receita.id },
      data: { [estagio.campoVistoriaId]: null, [estagio.campoCriadaEm]: null },
    });

  }

};

// Caminho INVERSO do resolverSeNaoCabeMais (que parte da Receita) --
// varre direto as Vistorias de corte/esvaziar ainda abertas e cancela
// qualquer uma que não tenha mais uma Receita de verdade te back-la
// (ex.: a Receita que gerou ela foi excluída/cancelada por fora do
// fluxo normal, sem passar por cancelarVinculada). Sem isso, uma
// vistoria dessas fica Pendente pra sempre, pedindo uma ação sobre um
// débito que não existe mais -- bug relatado em 13/11/2026 (sobra de
// quando existiam duas Receitas de Aluguel pro mesmo mês/inquilino).
const resolverOrfas = async () => {

  let canceladas = 0;

  for (const estagio of ESTAGIOS) {

    const abertas = await prisma.vistoria.findMany({
      where: { titulo: estagio.titulo, status: { notIn: ['CANCELADA', 'REALIZADA'] } },
      select: { id: true, observacoes: true },
    });

    for (const vistoria of abertas) {

      const receita = await prisma.receita.findFirst({ where: { [estagio.campoVistoriaId]: vistoria.id } });

      if (receita && await aindaEmRisco(receita)) continue;

      await vistoriaService.atualizar(vistoria.id, {
        status: 'CANCELADA',
        observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- não existe mais nenhuma cobrança em aberto ligada a essa vistoria.`,
      });

      canceladas++;

    }

  }

  return canceladas;

};

// Pra quando a Receita está sendo EXCLUÍDA de vez -- aí não interessa
// mais se ela "ainda cabe" ou não (os critérios de aindaEmRisco nem
// fazem sentido pra uma cobrança que está deixando de existir): a
// vistoria é cancelada sempre que tiver uma vinculada (dos 2 estágios).
// Chamar ANTES de apagar a receita (ver receitaService.remover).
const cancelarVinculada = async (receitaId) => {

  const receita = await prisma.receita.findUnique({ where: { id: receitaId } });

  if (!receita) return;

  for (const estagio of ESTAGIOS) {

    const vistoriaId = receita[estagio.campoVistoriaId];

    if (!vistoriaId) continue;

    const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

    if (vistoria && vistoria.status !== 'CANCELADA' && vistoria.status !== 'REALIZADA') {

      await vistoriaService.atualizar(vistoria.id, {
        status: 'CANCELADA',
        observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- a cobrança que gerou esse risco foi excluída.`,
      });

    }

  }

};

// Pra quando a Receita é classificada como Inadimplência (botão
// "Inadimplência" do Financeiro) -- igual cancelarVinculada, mas por
// outro motivo: aindaEmRisco() continua achando que tem risco (o
// "selo adicional" não muda o status por baixo, ver schema.prisma), só
// que agora não importa mais -- a receita já saiu do fluxo normal de
// cobrança, foi formalmente classificada e está indo pra
// /financeiro/inadimplentes. Deixar o zelador com uma tarefa de
// "realizar corte"/"esvaziar kitnet" pendente sobre um caso que já foi
// encerrado administrativamente não faz sentido (bug relatado em
// 23/11/2026). Chamado por receitaService.classificarInadimplencia.
const cancelarVinculadaPorInadimplencia = async (receitaId) => {

  const receita = await prisma.receita.findUnique({ where: { id: receitaId } });

  if (!receita) return;

  for (const estagio of ESTAGIOS) {

    const vistoriaId = receita[estagio.campoVistoriaId];

    if (!vistoriaId) continue;

    const vistoria = await prisma.vistoria.findUnique({ where: { id: vistoriaId } });

    if (vistoria && vistoria.status !== 'CANCELADA' && vistoria.status !== 'REALIZADA') {

      await vistoriaService.atualizar(vistoria.id, {
        status: 'CANCELADA',
        observacoes: `${vistoria.observacoes ? vistoria.observacoes + '\n\n' : ''}Cancelada automaticamente -- a cobrança que gerou esse risco foi classificada como inadimplência (caso encerrado administrativamente).`,
      });

    }

  }

};

module.exports = {
  aindaEmRisco,
  resolverSeNaoCabeMais,
  resolverOrfas,
  cancelarVinculada,
  cancelarVinculadaPorInadimplencia,
  TITULO_REALIZAR_CORTE,
  TITULO_FAZER_DESOCUPACAO,
};
