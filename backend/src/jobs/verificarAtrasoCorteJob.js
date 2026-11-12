const prisma = require('../config/prisma');
const vistoriaService = require('../services/vistoriaService');
const corteVistoriaService = require('../services/corteVistoriaService');

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
// Responsável vai pro zelador de verdade (perfil "ZELADOR" cadastrado)
// -- o campo da Vistoria é só texto, mas a tela de Editar escolhe entre
// esses nomes, então grava literal assim quando existir. Mais de um
// zelador ativo: avisa todos (nomes juntos); nenhum: deixa descritivo,
// sem inventar um nome que não existe.
const resolverResponsavelZelador = async () => {

  const zeladores = await prisma.usuario.findMany({
    where: { ativo: true, perfil: { nome: 'ZELADOR' } },
    select: { nome: true },
    orderBy: { nome: 'asc' },
  });

  if (zeladores.length === 0) return 'Zelador';

  return zeladores.map((z) => z.nome).join(', ');

};

module.exports = async () => {

  // Caminho de VOLTA primeiro -- pra toda receita que já gerou uma
  // vistoria de corte, confere se ela ainda cabe (ver corteVistoriaService).
  // Pega qualquer jeito que a cobrança tenha deixado de estar em risco
  // (paga, cancelada, data corrigida pro futuro), não só edição manual
  // -- inclusive confirmação de pagamento via webhook/job, que atualiza
  // a Receita direto no banco sem passar pelo service.
  const comVistoriaDeCorte = await prisma.receita.findMany({
    where: { vistoriaCorteId: { not: null } },
    select: { id: true },
  });

  for (const { id } of comVistoriaDeCorte) {

    try {
      await corteVistoriaService.resolverSeNaoCabeMais(id);
    } catch (erro) {
      console.error(`[JOB] Erro ao resolver vistoria de corte da receita ${id}:`, erro.message);
    }

  }

  const limite = new Date();
  limite.setHours(limite.getHours() - 72);

  const receitas = await prisma.receita.findMany({
    where: {
      status: 'ATRASADA',
      vencimento: { lte: limite },
      vistoriaCorteAtrasoCriadaEm: null,
      // Só dispara risco de corte pra cobrança que virou um boleto de
      // verdade -- sem isso, uma cobrança que nunca foi enviada ao
      // banco (ninguém clicou "Enviar ao Banco" ainda) entrava no
      // mesmo risco de corte de quem realmente recebeu e não pagou,
      // mesmo sem nenhum boleto pra cobrar o inquilino de fato.
      gatewayReferencia: { not: null },
    },
    include: {
      contrato: { include: { inquilino: true, kitnet: true, unidade: true } },
      inquilino: { include: { kitnet: { include: { unidade: true } } } },
    },
  });

  if (receitas.length === 0) return;

  console.log(`[JOB] Criando vistoria de risco de corte pra ${receitas.length} cobrança(s) atrasada(s) há 72h+...`);

  const responsavel = await resolverResponsavelZelador();

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

      const vistoria = await vistoriaService.criar({
        titulo: 'REALIZAR CORTE DE ÁGUA E ENERGIA',
        descricao: `Kitnet com falta de pagamento após 72 horas. ${inquilino?.nome || 'Inquilino'} -- R$ ${Number(receita.valor).toFixed(2)}, venceu em ${new Date(receita.vencimento).toLocaleDateString('pt-BR')}. Conforme o contrato, água/energia podem ser suspensas até a quitação do débito.`,
        unidadeId: unidade.id,
        kitnetId: kitnet.id,
        categoria: 'Cobrança',
        criticidade: 'Crítica',
        periodicidade: 'Única',
        responsavel,
        status: 'PENDENTE',
        data: new Date(),
      });

      await prisma.receita.update({
        where: { id: receita.id },
        data: { vistoriaCorteAtrasoCriadaEm: new Date(), vistoriaCorteId: vistoria.id },
      });

      criadas++;

    } catch (erro) {

      console.error(`[JOB] Erro ao criar vistoria de corte da receita ${receita.id}:`, erro.message);

    }

  }

  console.log(`[JOB] ${criadas} vistoria(s) de risco de corte criada(s).`);

};
