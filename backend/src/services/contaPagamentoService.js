const prisma = require('../config/prisma');
const EFIApi = require('./EFIApi');

const listar = () => {
  return prisma.contaPagamento.findMany({
    include: {
      locadores: { select: { id: true, nome: true } },
      locadorDono: { select: { id: true, nome: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
};

const buscarPorId = (id) => {
  return prisma.contaPagamento.findUnique({
    where: { id },
  });
};

const criar = async (dados) => {

  if (!dados.provider) {
    throw new Error('Escolha o banco/provedor da conta.');
  }

  if (!dados.nome) {
    throw new Error('Dê um nome pra essa conta.');
  }

  // Só uma conta padrão por vez -- vira a substituta de qualquer
  // padrão anterior.
  if (dados.padrao) {
    await prisma.contaPagamento.updateMany({
      where: { padrao: true },
      data: { padrao: false },
    });
  }

  return prisma.contaPagamento.create({
    data: {
      provider: dados.provider,
      nome: dados.nome,
      credenciais: dados.credenciais || {},
      taxaBoletoValor: paraTaxaOuZero(dados.taxaBoletoValor),
      padrao: dados.padrao === true,
      ativo: dados.ativo !== false,
      locadorId: dados.locadorId || null,
    },
  });

};

function paraTaxaOuZero(valor) {
  if (valor === undefined || valor === null || valor === "") return 0;
  const numero = Number(String(valor).replace(",", "."));
  return Number.isNaN(numero) ? 0 : numero;
}

const atualizar = async (id, dados) => {

  if (dados.padrao) {
    await prisma.contaPagamento.updateMany({
      where: { padrao: true, NOT: { id } },
      data: { padrao: false },
    });
  }

  return prisma.contaPagamento.update({
    where: { id },
    data: {
      nome: dados.nome,
      credenciais: dados.credenciais,
      taxaBoletoValor: paraTaxaOuZero(dados.taxaBoletoValor),
      padrao: dados.padrao,
      ativo: dados.ativo,
      ...(dados.locadorId !== undefined && { locadorId: dados.locadorId || null }),
    },
  });

};

const remover = async (id) => {

  const emUso = await prisma.locador.count({ where: { contaPagamentoId: id } });

  if (emUso > 0) {
    throw new Error(
      `Não é possível excluir: ${emUso} locador(es) ainda usam essa conta. Troque a conta deles primeiro.`
    );
  }

  return prisma.contaPagamento.delete({ where: { id } });

};

// Qual conta processa a cobrança de um locador -- a dele mesmo, se
// tiver escolhido; senão a conta padrão do sistema.
const resolverParaLocador = async (locadorId) => {

  if (locadorId) {

    const locador = await prisma.locador.findUnique({
      where: { id: locadorId },
      include: { contaPagamento: true },
    });

    if (locador?.contaPagamento?.ativo) {
      return locador.contaPagamento;
    }

  }

  return prisma.contaPagamento.findFirst({
    where: { padrao: true, ativo: true },
  });

};

// Mesma ideia de resolverParaLocador, só que checando primeiro a
// conta própria da KITNET (um locador pode ter várias contas -- ex.:
// SH com BB-H, BB-S e Efí, cada uma recebendo de kitnets diferentes).
// Sem conta na kitnet, cai pro padrão do locador; sem isso também, cai
// pro padrão do sistema -- mesma cadeia de sempre.
const resolverParaKitnet = async (kitnetId, locadorId) => {

  if (kitnetId) {

    const kitnet = await prisma.kitnet.findUnique({
      where: { id: kitnetId },
      include: { contaPagamento: true },
    });

    if (kitnet?.contaPagamento?.ativo) {
      return kitnet.contaPagamento;
    }

  }

  return resolverParaLocador(locadorId);

};

// "AAAA-MM" -> início/fim daquele mês (UTC) -- sem informar, usa o
// mês atual. Compartilhado por qualquer consulta "por mês" de conta.
const intervaloDoMes = (mes) => {

  const [ano, mesNumero] = (mes || new Date().toISOString().slice(0, 7)).split('-').map(Number);

  return {
    ano,
    mesNumero,
    inicio: new Date(Date.UTC(ano, mesNumero - 1, 1, 0, 0, 0)),
    fim: new Date(Date.UTC(ano, mesNumero, 0, 23, 59, 59, 999)),
  };

};

// Extrato Pix recebido no mês -- só faz sentido pra conta EFI (único
// banco com esse endpoint implementado até agora). `mes` no formato
// "AAAA-MM"; sem informar, usa o mês atual.
const extratoPixDoMes = async (id, mes) => {

  const conta = await buscarPorId(id);

  if (!conta) {
    throw new Error('Conta não encontrada.');
  }

  if (conta.provider !== 'EFI') {
    throw new Error('Extrato Pix só está disponível pra contas do banco Efí.');
  }

  const { ano, mesNumero, inicio, fim } = intervaloDoMes(mes);

  const extrato = await EFIApi.listarPixRecebidos(
    { dataInicio: inicio.toISOString(), dataFim: fim.toISOString() },
    conta.credenciais
  );

  const pixComInquilino = await vincularPagadores(extrato.pix);

  return { ...extrato, pix: pixComInquilino, mes: `${ano}-${String(mesNumero).padStart(2, '0')}` };

};

// Quanto essa conta recebeu no mês, pelas Receitas de verdade do
// sistema (qualquer provider -- BB, Asaas, EFI, BRB; todos marcam
// Receita.contaPagamentoId quando enviam a cobrança, ver
// gatewayPagamentoService/asaasService). Diferente do extrato Pix da
// EFI acima (que pergunta direto pro banco, sem saber de contrato
// nenhum) -- isso aqui é só o que o PRÓPRIO sistema cobrou e já
// confirmou como pago, com o inquilino/kitnet certinho (não precisa
// adivinhar por CPF).
// CEP no cadastro vem sem máscara consistente ("74969170", "75259-705",
// " 74640050") -- normaliza pro padrão NNNNN-NNN só na hora de montar o
// relatório, sem mexer no dado cru salvo (pedido do usuário em
// 25/11/2026, junto com Unidade/Kitnet e vigência do contrato no
// Relatório de Receitas).
function formatarCep(cep) {
  const digitos = String(cep || '').replace(/\D/g, '');
  if (digitos.length !== 8) return cep || null;
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function enderecoCompleto(unidade) {
  if (!unidade) return null;
  const linha1 = [unidade.logradouro, unidade.numero].filter(Boolean).join(', ');
  const linha2 = [unidade.bairro, unidade.cidade && unidade.uf ? `${unidade.cidade}/${unidade.uf}` : unidade.cidade].filter(Boolean).join(' - ');
  return [linha1, unidade.complemento, linha2].filter(Boolean).join(' - ') || null;
}

const SELECT_UNIDADE_ENDERECO = {
  nome: true,
  logradouro: true,
  numero: true,
  complemento: true,
  bairro: true,
  cidade: true,
  uf: true,
  cep: true,
  locadorRel: { select: { taxaAdministracao: true } },
};

const recebidoDoMes = async (id, mes) => {

  const conta = await buscarPorId(id);

  if (!conta) {
    throw new Error('Conta não encontrada.');
  }

  const { ano, mesNumero, inicio, fim } = intervaloDoMes(mes);

  const receitas = await prisma.receita.findMany({
    where: {
      contaPagamentoId: id,
      status: { in: ['PAGA', 'PAGO'] },
      dataPagamento: { gte: inicio, lte: fim },
    },
    include: {
      inquilino: {
        select: {
          nome: true,
          cpf: true,
          valorDeducao: true,
          kitnet: {
            select: {
              numero: true,
              aluguel: true,
              unidade: { select: SELECT_UNIDADE_ENDERECO },
            },
          },
        },
      },
      contrato: {
        select: {
          valorAluguel: true,
          dataInicio: true,
          dataFim: true,
          inquilino: { select: { nome: true, cpf: true, valorDeducao: true } },
          kitnet: {
            select: {
              numero: true,
              aluguel: true,
              unidade: { select: SELECT_UNIDADE_ENDERECO },
            },
          },
        },
      },
    },
    orderBy: { dataPagamento: 'desc' },
  });

  const linhas = receitas.map((r) => {

    const kitnet = r.inquilino?.kitnet || r.contrato?.kitnet || null;

    return {
      id: r.id,
      descricao: r.descricao,
      valor: r.valorLiquido ?? r.valor,
      dataPagamento: r.dataPagamento,
      // Quando o dinheiro CAI na conta -- só o BB devolve isso separado
      // de dataPagamento (compensação de boleto não é sempre no mesmo
      // dia). Pix/Asaas creditam na hora, então ficam iguais; null
      // quando o banco ainda não confirmou o crédito. Ver campo
      // Receita.dataCredito no schema.
      dataCredito: r.dataCredito,
      pagador: r.inquilino?.nome || r.contrato?.inquilino?.nome || r.pagadorNome || null,
      unidade: kitnet?.unidade?.nome || null,
      kitnet: kitnet?.numero || null,
      // Campos extras só pro Relatório de Receitas (Financeiro >
      // Extratos > Exportar Excel) -- ver montarLinhaRelatorio no
      // controller/frontend (FinanceiroAsaas.jsx) pra como cada um vira
      // coluna da planilha.
      //
      // Nosso Número: Asaas usa o campo próprio (r.nossoNumero, o que
      // aparece impresso no boleto de verdade) -- gatewayReferencia
      // pra Asaas é só o id interno (pay_xxxx), nunca o nosso número.
      // BB/outros continuam usando gatewayReferencia, que já É o nosso
      // número de verdade pra eles. Pedido do usuário em 26/11/2026.
      nossoNumero: (r.gatewayProvider === 'ASAAS' ? r.nossoNumero : null) || r.gatewayReferencia || null,
      gatewayProvider: r.gatewayProvider || null,
      cpf: r.inquilino?.cpf || r.contrato?.inquilino?.cpf || r.pagadorCpf || null,
      valorBruto: r.valor,
      vencimento: r.vencimento,
      // Endereço completo + CEP (normalizado) da Unidade da kitnet --
      // pedido do usuário em 25/11/2026 pro Relatório de Receitas.
      enderecoCompleto: enderecoCompleto(kitnet?.unidade),
      cep: formatarCep(kitnet?.unidade?.cep),
      // Vigência do contrato (início/fim) -- null quando a receita é
      // avulsa, sem contrato por trás.
      contratoDataInicio: r.contrato?.dataInicio ?? null,
      contratoDataFim: r.contrato?.dataFim ?? null,
      // Aluguel NOMINAL do contrato/kitnet (não da Descrição -- tentamos
      // ler "Aluguel: R$ X" da Descrição antes, mas a Descrição padrão
      // de toda receita recorrente é só "Aluguel - MM/AAAA", sem valor
      // nenhum escrito; usar esse campo de verdade evita o bug de
      // confundir o "11" do mês com um valor em reais). Null só quando
      // não dá pra saber (receita avulsa sem contrato nem kitnet).
      valorAluguelContrato: r.contrato?.valorAluguel ?? kitnet?.aluguel ?? null,
      // jurosValor/multaValor NÃO são valor em reais -- são a TAXA (%)
      // configurada no boleto pro banco calcular se atrasar (multa:
      // percentual fixo aplicado uma vez só; jurosMora: taxa MENSAL,
      // ver BBApi.criarBoleto). Servem só de FALLBACK no relatório
      // (estimativa por taxa x dias de atraso) pra receitas antigas, ou
      // de provedores/casos em que o valor real abaixo ainda não foi
      // confirmado.
      jurosValor: r.jurosValor || 0,
      multaValor: r.multaValor || 0,
      // Valor em REAIS de verdade que o provedor confirmou ter
      // cobrado/recebido de multa/juros (BB: valorMultaRecebido da
      // consulta; Asaas: value - originalValue). Null = não confirmado
      // -- relatório cai pro cálculo ESTIMADO acima, ver
      // montarLinhaRelatorio no frontend. Bug real encontrado em
      // 25/11/2026: o estimado cobrava R$90,30 de um pagamento que o BB
      // confirmou não ter cobrado nada (só 1 dia de atraso na
      // compensação, sem multa/juros de verdade).
      valorMultaRecebida: r.valorMultaRecebida,
      valorJurosRecebido: r.valorJurosRecebido,
      // Null = inquilino não tem valor próprio -- relatório cai pro
      // padrão do locador da kitnet (ver fallback no frontend).
      valorDeducaoInquilino: r.inquilino?.valorDeducao ?? r.contrato?.inquilino?.valorDeducao ?? null,
      taxaAdministracaoLocador: kitnet?.unidade?.locadorRel?.taxaAdministracao ?? null,
    };

  });

  return {
    mes: `${ano}-${String(mesNumero).padStart(2, '0')}`,
    total: linhas.reduce((soma, l) => soma + Number(l.valor || 0), 0),
    quantidade: linhas.length,
    receitas: linhas,
    taxaBoletoValor: conta.taxaBoletoValor || 0,
    contaNome: conta.nome,
  };

};

// Cruza o CPF de quem mandou cada Pix com os inquilinos já
// cadastrados -- só informativo (não grava nada, não muda nenhum
// registro), é o "de quem é, de onde veio" que a EFI sozinha não
// sabe dizer (ela só manda o CPF/nome de quem pagou). Sem o CPF bater
// com ninguém cadastrado, fica como "Pix não identificado" na tela --
// pode ser alguém de fora, ou um inquilino cujo CPF está diferente do
// cadastrado.
const vincularPagadores = async (pix) => {

  const cpfsRecebidos = [...new Set(
    pix.map((p) => (p.pagador?.cpf || '').replace(/\D/g, '')).filter(Boolean)
  )];

  if (cpfsRecebidos.length === 0) return pix;

  // `cpf` é obrigatório no cadastro (String, não String?) -- sem
  // filtro de null aqui, só descarta vazio/sem dígito no map abaixo.
  const inquilinos = await prisma.inquilino.findMany({
    select: {
      nome: true,
      cpf: true,
      kitnet: { select: { numero: true, unidade: { select: { nome: true } } } },
    },
  });

  const porCpf = new Map();
  inquilinos.forEach((i) => {
    const digitos = (i.cpf || '').replace(/\D/g, '');
    if (digitos) porCpf.set(digitos, i);
  });

  return pix.map((p) => {

    const cpfPagador = (p.pagador?.cpf || '').replace(/\D/g, '');
    const inquilino = cpfPagador ? porCpf.get(cpfPagador) : null;

    return {
      ...p,
      inquilinoVinculado: inquilino ? {
        nome: inquilino.nome,
        kitnet: inquilino.kitnet?.numero || null,
        unidade: inquilino.kitnet?.unidade?.nome || null,
      } : null,
    };

  });

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  resolverParaLocador,
  resolverParaKitnet,
  extratoPixDoMes,
  recebidoDoMes,
};
