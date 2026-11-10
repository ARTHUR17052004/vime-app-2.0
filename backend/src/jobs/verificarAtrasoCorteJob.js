const prisma = require('../config/prisma');
const vistoriaService = require('../services/vistoriaService');

/*
  72h (3 dias) depois do vencimento sem pagamento -- cria uma Vistoria
  interna avisando que água/energia podem ser cortadas (cláusula do
  contrato já prevê isso), pra alguém da equipe avaliar e agir. NÃO
  manda nada pro inquilino (isso é só tarefa interna, por enquanto) --
  ver avisoVencidoEnviadoEm/cobrancaVencidaWhatsappJob.js pro aviso que
  já vai pro WhatsApp dele.

  "72h depois do vencimento" = vencimento + 3 dias, contado direto da
  data (sem precisar guardar quando a cobrança "entrou" em atraso --
  o relógio mostrado na tela de Receitas usa a mesma conta).
  vistoriaCorteAtrasoCriadaEm evita criar duas vezes pra mesma Receita.
*/
module.exports = async () => {

  const limite = new Date();
  limite.setHours(limite.getHours() - 72);

  const receitas = await prisma.receita.findMany({
    where: {
      status: 'ATRASADA',
      vencimento: { lte: limite },
      vistoriaCorteAtrasoCriadaEm: null,
    },
    include: {
      contrato: { include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } },
    },
  });

  if (receitas.length === 0) return;

  console.log(`[JOB] Criando vistoria de risco de corte pra ${receitas.length} cobrança(s) atrasada(s) há 72h+...`);

  let criadas = 0;

  for (const receita of receitas) {

    const kitnet = receita.contrato?.kitnet || receita.inquilino?.kitnet;
    const unidade = receita.contrato?.unidade || receita.inquilino?.kitnet?.unidade;
    const inquilino = receita.inquilino || receita.contrato?.inquilino;

    if (!kitnet || !unidade) {
      // Receita avulsa, sem contrato/inquilino vinculado a uma kitnet --
      // não tem "onde" cortar água/energia, não dá pra criar vistoria.
      continue;
    }

    try {

      await vistoriaService.criar({
        titulo: `Risco de corte -- atraso de pagamento (${inquilino?.nome || 'inquilino'})`,
        descricao: `A cobrança de R$ ${Number(receita.valor).toFixed(2)} venceu em ${new Date(receita.vencimento).toLocaleDateString('pt-BR')} e está atrasada há mais de 72h. Conforme o contrato, água/energia podem ser suspensas até a quitação do débito -- avaliar e agir.`,
        unidadeId: unidade.id,
        kitnetId: kitnet.id,
        categoria: 'Cobrança',
        periodicidade: 'Única',
        responsavel: 'Administração',
        status: 'PENDENTE',
        data: new Date(),
      });

      await prisma.receita.update({
        where: { id: receita.id },
        data: { vistoriaCorteAtrasoCriadaEm: new Date() },
      });

      criadas++;

    } catch (erro) {

      console.error(`[JOB] Erro ao criar vistoria de corte da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${criadas} vistoria(s) de risco de corte criada(s).`);

};
