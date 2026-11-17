const prisma = require('../config/prisma');

const {
  filtroUnidade,
  filtroKitnet,
  filtroContrato,
  filtroReceita,
  filtroSolicitacao,
} = require('../utils/escopoLocador');

const resumo = async (usuario) => {

  const inquilinos = await prisma.inquilino.count({
    where: { kitnet: { unidade: filtroUnidade(usuario) } }
  });

  const unidades = await prisma.unidade.count({
    where: filtroUnidade(usuario)
  });

  const kitnets = await prisma.kitnet.count({
    where: filtroKitnet(usuario)
  });

  // "Locadores" no card de resumo é só um contador de referência --
  // pra quem está restrito a um locador, o número certo é sempre 1.
  const locadores = usuario?.locadorId
    ? 1
    : await prisma.locador.count();

  const contratosAtivos = await prisma.contrato.count({
    where: { ...filtroContrato(usuario), status: 'ATIVO' }
  });

  const contratosVencendo = 0;

  const inadimplentes = await prisma.contrato.count({
    where: { ...filtroContrato(usuario), status: 'INADIMPLENTE' }
  });

  // Solicitações não têm nenhum vínculo com kitnet/unidade/locador no
  // banco -- não tem como restringir por locador, então continuam
  // visíveis pra todo mundo (mesmo comportamento de sempre).
  const solicitacoesPendentes = await prisma.solicitacao.count({
    where: {
      ...filtroSolicitacao(usuario),
      status: {
        notIn: ['ATENDIDA', 'REJEITADA']
      }
    }
  });

  const receitas = await prisma.receita.findMany({
    where: { ...filtroReceita(usuario), status: 'PENDENTE' }
  });

  const receitaMensal = receitas.reduce((total, receita) => {
    return total + receita.valor;
  }, 0);

  // "status" é o campo que a tela de Kitnets mostra e deixa editar
  // direto -- usar ele aqui em vez de "ocupada" evita o dashboard
  // ficar dessincronizado quando o status é alterado manualmente.
  const kitnetsOcupadas = await prisma.kitnet.count({
    where: { ...filtroKitnet(usuario), status: 'OCUPADA' }
  });

  const ocupacao =
    kitnets > 0
      ? Math.round((kitnetsOcupadas / kitnets) * 100)
      : 0;

  return {
    inquilinos,
    unidades,
    kitnets,
    locadores,
    receitaMensal,
    ocupacao,
    contratosAtivos,
    contratosVencendo,
    inadimplentes,
    solicitacoesPendentes
  };
};

const STATUS_ATIVIDADE = {
  SOLICITADA: 'solicitada',
  'EM COTAÇÃO': 'em cotação',
  'AGUARDANDO COMPRA': 'aguardando compra',
  ATENDIDA: 'atendida',
  REJEITADA: 'rejeitada'
};

// Solicitações também não têm vínculo com locador -- ver comentário em
// resumo() acima.
const atividades = async (usuario) => {

  const solicitacoes = await prisma.solicitacao.findMany({
    where: filtroSolicitacao(usuario),
    take: 10,
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return solicitacoes.map(item => ({
    id: item.id,
    tipo: 'SOLICITACAO',
    descricao: `${item.numero} · ${item.titulo}`,
    data: item.updatedAt,
    status: STATUS_ATIVIDADE[item.status] || item.status,
    link: `/solicitacoes/${item.id}`
  }));
};

const alertas = async (usuario) => {

  const lista = [];

  const hoje = new Date();

  const em10Dias = new Date();
  em10Dias.setDate(em10Dias.getDate() + 10);

  const contratosVencendo = await prisma.contrato.findMany({
    where: {
      ...filtroContrato(usuario),
      status: 'ATIVO',
      dataFim: {
        not: null,
        gte: hoje,
        lte: em10Dias
      }
    },
    include: {
      inquilino: true,
      kitnet: true
    },
    orderBy: {
      dataFim: 'asc'
    }
  });

  contratosVencendo.forEach((contrato) => {

    const dias = Math.max(
      0,
      Math.ceil((new Date(contrato.dataFim) - hoje) / (1000 * 60 * 60 * 24))
    );

    lista.push({
      id: `contrato-vencendo-${contrato.id}`,
      titulo: `Contrato de ${contrato.inquilino?.nome || 'inquilino'} vence em ${dias} dia(s)`,
      descricao: `Kitnet ${contrato.kitnet?.nome || contrato.kitnet?.numero || '-'} — vencimento em ${new Date(contrato.dataFim).toLocaleDateString('pt-BR')}.`,
      data: new Date(contrato.dataFim).toLocaleDateString('pt-BR'),
      link: `/contratos/${contrato.id}`
    });

  });

  const cobrancasAtrasadas = await prisma.receita.count({
    where: { ...filtroReceita(usuario), status: 'ATRASADA' }
  });

  if (cobrancasAtrasadas > 0) {
    lista.push({
      id: 'cobrancas-atrasadas',
      titulo: `${cobrancasAtrasadas} cobrança(s) atrasada(s)`,
      descricao: 'Confira em Financeiro quais receitas estão em atraso.',
      data: '',
      link: '/financeiro'
    });
  }

  return lista;
};

// Pro card "Ocupação das residências" do mobile poder abrir cada
// residência e mostrar Ocupadas/Vagas/Em atraso dela -- "em atraso" é
// kitnet OCUPADA cujo contrato/inquilino atual tem uma Receita de
// Aluguel com status ATRASADA (mesmo campo que Financeiro e os jobs
// de cobrança já usam, mantido sozinho por verificarVencimentosJob).
// Não é um status da própria Kitnet -- por isso não dá pra só filtrar
// por "status", precisa cruzar com Receita.
const ocupacaoPorResidencia = async (usuario) => {

  const [unidades, receitasAtrasadas] = await Promise.all([

    // Unidade.kitnets é um Int solto (contador manual) -- a relação de
    // verdade com o model Kitnet se chama kitnetsRelacionadas.
    prisma.unidade.findMany({
      where: filtroUnidade(usuario),
      select: {
        id: true,
        nome: true,
        kitnetsRelacionadas: {
          where: filtroKitnet(usuario),
          select: { id: true, status: true },
        },
      },
      orderBy: { nome: 'asc' },
    }),

    prisma.receita.findMany({
      where: { ...filtroReceita(usuario), status: 'ATRASADA', categoria: 'Aluguel' },
      select: {
        contrato: { select: { kitnetId: true } },
        inquilino: { select: { kitnetId: true } },
      },
    }),

  ]);

  const kitnetsEmAtraso = new Set();

  for (const receita of receitasAtrasadas) {
    if (receita.contrato?.kitnetId) kitnetsEmAtraso.add(receita.contrato.kitnetId);
    if (receita.inquilino?.kitnetId) kitnetsEmAtraso.add(receita.inquilino.kitnetId);
  }

  return unidades.map((unidade) => {

    let ocupadas = 0;
    let vagas = 0;
    let emAtraso = 0;

    for (const kitnet of unidade.kitnetsRelacionadas) {
      if (kitnetsEmAtraso.has(kitnet.id)) emAtraso++;
      else if (kitnet.status === 'OCUPADA') ocupadas++;
      else if (kitnet.status === 'DISPONIVEL') vagas++;
    }

    const total = unidade.kitnetsRelacionadas.length;

    return {
      id: unidade.id,
      nome: unidade.nome,
      totalKitnets: total,
      ocupadas,
      vagas,
      emAtraso,
      percentual: total > 0 ? Math.round((ocupadas / total) * 100) : 0,
    };

  });

};

const ocupacao = async (usuario) => {

  const total = await prisma.kitnet.count({
    where: filtroKitnet(usuario)
  });

  const ocupadas = await prisma.kitnet.count({
    where: { ...filtroKitnet(usuario), status: 'OCUPADA' }
  });

  // Mesma regra da tela de Kitnets ("Vazias" = status DISPONIVEL): kitnet em
  // manutenção não conta como vazia.
  const vazias = await prisma.kitnet.count({
    where: { ...filtroKitnet(usuario), status: 'DISPONIVEL' }
  });

  const porResidencia = await ocupacaoPorResidencia(usuario);

  return {
    ocupadas,
    vazias,
    percentual: total > 0
      ? Math.round((ocupadas / total) * 100)
      : 0,
    porResidencia,
  };
};

const financeiro = async (usuario) => {

  const receitas = await prisma.receita.findMany({
    where: filtroReceita(usuario)
  });

  // "Recebido" é só do MÊS ATUAL (por dataPagamento, não por
  // vencimento) -- esse número precisa voltar pra zero sozinho todo
  // dia 1, senão vira uma soma de tudo que já foi pago desde que o
  // sistema existe, sem servir pra acompanhar o mês corrente. Pendente
  // e atrasado continuam sendo "o que está em aberto agora", sem
  // recorte de mês -- não fazem sentido zerar (uma cobrança atrasada
  // de 3 meses atrás continua atrasada hoje).
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const inicioProximoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  let recebido = 0;
  let pendente = 0;
  let atrasado = 0;
  let cancelado = 0;

  receitas.forEach(r => {

    if (r.status === 'PAGA') {
      const dataPagamento = r.dataPagamento ? new Date(r.dataPagamento) : null;
      if (dataPagamento && dataPagamento >= inicioMes && dataPagamento < inicioProximoMes) {
        recebido += Number(r.valorLiquido ?? r.valor);
      }
    }

    if (r.status === 'PENDENTE')
      pendente += r.valor;

    if (r.status === 'ATRASADA')
      atrasado += r.valor;

    if (r.status === 'CANCELADA')
      cancelado += r.valor;

  });

  return {
    recebido,
    pendente,
    atrasado,
    cancelado
  };
};

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const receitasMensais = async (ano, usuario) => {

  const receitas = await prisma.receita.findMany({
    where: {
      ...filtroReceita(usuario),
      vencimento: {
        gte: new Date(`${ano}-01-01`),
        lte: new Date(`${ano}-12-31`)
      }
    }
  });

  const totais = new Array(12).fill(0);

  receitas.forEach(r => {
    if (!r.vencimento) return;

    const mes = new Date(r.vencimento).getMonth();

    totais[mes] += r.valor;
  });

  return MESES.map((mes, index) => ({
    mes,
    receita: totais[index]
  }));
};

module.exports = {
  resumo,
  atividades,
  alertas,
  ocupacao,
  financeiro,
  receitasMensais
};
