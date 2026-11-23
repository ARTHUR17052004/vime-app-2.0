const prisma = require('../config/prisma');
const campoObrigatorioService = require('./campoObrigatorioService');
const { filtroKitnet } = require('../utils/escopoLocador');
const { gerarVistoriaDeEntrega } = require('../utils/kitnetOcupacao');
const notificacaoService = require('./notificacaoService');

const listar = (usuario) => {
  return prisma.kitnet.findMany({
    where: filtroKitnet(usuario),
    include: {
      unidade: true,
      // Pro "Detalhes da Kitnet" mostrar inquilino/CPF/contrato quando
      // ocupada (ver kitnets/[id]/page.js) -- inquilino pela relação
      // direta (sempre existe quando ocupada, mesmo sem Contrato digital
      // ainda gerado) e o contrato "ATIVO" mais recente só pra data.
      inquilinos: {
        where: { ativo: true },
        orderBy: { createdAt: 'desc' },
      },
      // select (não o contrato inteiro) -- Contrato guarda o PDF/foto
      // anexado em base64 em arquivoDados, e isso sozinho já deixava a
      // resposta de /kitnets gigante o bastante pra derrubar a conexão
      // (erro "Server has closed the connection" em toda a lista).
      contratos: {
        where: { status: 'ATIVO' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { id: true, dataFim: true },
      },
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const buscarPorId = (id) => {
  return prisma.kitnet.findUnique({
    where: { id },
    include: {
      unidade: true
    }
  });
};

// Dois números iguais na mesma residência é a raiz do problema que
// gerou duas "kitnet 15" (e nenhuma 14) na ARA -- sem essa checagem o
// formulário deixava salvar um número repetido sem avisar nada.
const validarNumeroUnico = async (unidadeId, numero, { ignorarId } = {}) => {

  const duplicada = await prisma.kitnet.findFirst({
    where: {
      unidadeId,
      numero: String(numero),
      ...(ignorarId ? { id: { not: ignorarId } } : {}),
    },
  });

  if (duplicada) {
    throw new Error(`Já existe uma kitnet número ${numero} nessa residência.`);
  }

};

const criar = async (dados, usuario) => {

  await campoObrigatorioService.validar('kitnet', dados);

  const unidade = await prisma.unidade.findUnique({
    where: { id: dados.unidadeId }
  });

  if (!unidade) {
    throw new Error('Residência não encontrada.');
  }

  if (usuario?.locadorId && unidade.locadorId !== usuario.locadorId) {
    throw new Error('Residência não encontrada.');
  }

  if (dados.numero !== undefined && dados.numero !== null && dados.numero !== '') {
    await validarNumeroUnico(dados.unidadeId, dados.numero);
  }

  // unidade.kitnets é o limite cadastrado pra essa residência -- sem
  // limite definido (null/0), não há teto a aplicar aqui.
  if (unidade.kitnets) {

    const existentes = await prisma.kitnet.count({
      where: { unidadeId: dados.unidadeId }
    });

    if (existentes >= unidade.kitnets) {
      throw new Error(
        `Não é possível criar uma kitnet fora do limite da residência: "${unidade.nome}" já tem ${existentes} de ${unidade.kitnets} kitnet(s) cadastradas. Para adicionar mais, aumente a "Quantidade de Kitnets" em Residências.`
      );
    }

  }

  const kitnet = await prisma.kitnet.create({
    // Criada manualmente aqui (fora do lote automático da Residência)
    // -- o valor já veio escolhido pelo usuário, então não deixa a
    // edição da Residência sobrescrever depois.
    data: { ...dados, aluguelManual: true }
  });

  // Já nasce vazia (status padrão é DISPONIVEL) -- mesmo gatilho de
  // vistoria automática das que ficaram vazias depois de ocupadas.
  if (kitnet.status === 'DISPONIVEL') {
    gerarVistoriaDeEntrega(kitnet.id);
  }

  return kitnet;

};

const atualizar = async (id, dados) => {

  // Só pergunta/gera quando a kitnet está de fato esvaziando aqui
  // (status virando DISPONIVEL) -- ver mais abaixo. Default true pra
  // não quebrar nenhuma chamada antiga que não manda esse campo.
  const gerarVistoriaEntrega = dados.gerarVistoriaEntrega !== false;
  delete dados.gerarVistoriaEntrega;

  const atual = await prisma.kitnet.findUnique({ where: { id } });

  // Atualização parcial (ex.: só o status) não pode reprovar por
  // "faltar" um campo que já está preenchido desde a criação -- valida
  // o resultado final (atual + alterações), não só o pedaço enviado.
  await campoObrigatorioService.validar('kitnet', { ...atual, ...dados });

  if (
    dados.numero !== undefined &&
    dados.numero !== null &&
    dados.numero !== '' &&
    String(dados.numero) !== String(atual?.numero)
  ) {
    await validarNumeroUnico(atual.unidadeId, dados.numero, { ignorarId: id });
  }

  // Só marca como "editada manualmente" se o aluguel realmente mudou --
  // assim um salvar sem mexer nesse campo não trava a sincronização
  // automática vinda da Residência.
  if (
    atual &&
    dados.aluguel !== undefined &&
    Number(dados.aluguel) !== atual.aluguel
  ) {
    dados.aluguelManual = true;
  }

  // "ocupada" e "status" representam a mesma coisa, mas quando o
  // status é trocado direto aqui (fora do fluxo de contrato/inquilino),
  // só ele era atualizado -- "ocupada" ficava para trás. Mantém os dois
  // batendo sempre que o status muda nessa tela.
  if (dados.status !== undefined) {
    dados.ocupada = dados.status === 'OCUPADA';
  }

  const resultado = await prisma.kitnet.update({
    where: { id },
    data: dados
  });

  // Ficou vazia agora mesmo (editada direto nesta tela, não por um
  // contrato/inquilino) -- mesmo gatilho de vistoria automática, mas só
  // se o usuário confirmou no popup "Enviar vistoria de entrega?" (ver
  // KitnetForm.jsx) -- evita vistoria órfã quando a kitnet já tem
  // locação marcada pro mesmo dia.
  if (dados.status === 'DISPONIVEL' && atual?.status !== 'DISPONIVEL' && gerarVistoriaEntrega) {
    gerarVistoriaDeEntrega(id);
  }

  return resultado;
};

// Excluir a kitnet derruba (cascade no banco) o(s) contrato(s) e o(s)
// inquilino(s) dela junto, sem passar por contratoService.remover()
// nem inquilinoService.remover() -- que têm suas próprias travas
// (cancelar envelope Clicksign, bloquear se tiver receita vinculada).
// A trava de senha da rota (exigirConfirmacaoTerminoAntecipado) só
// pega contrato com dataFim ainda no futuro; um contrato sem dataFim,
// ou já vencido mas ainda não encerrado pelo job, passava direto sem
// pedir nada e apagava um inquilino de verdade morando lá (bug
// relatado em 23/11/2026). Bloqueia aqui, incondicional -- pra excluir
// a kitnet tem que encerrar/excluir o contrato e o inquilino primeiro,
// pelos fluxos certos.
const remover = async (id) => {

  const contratoAberto = await prisma.contrato.findFirst({
    where: { kitnetId: id, status: { in: ['ATIVO', 'PENDENTE'] } },
    select: { id: true },
  });

  if (contratoAberto) {
    const erro = new Error(
      'PROIBIDO: essa kitnet tem um contrato ativo ou pendente -- encerre (ou exclua) o contrato antes de excluir a kitnet.'
    );
    erro.status = 400;
    throw erro;
  }

  const inquilinoComReceita = await prisma.inquilino.findFirst({
    where: { kitnetId: id, receitas: { some: {} } },
    select: { id: true, nome: true },
  });

  if (inquilinoComReceita) {
    const erro = new Error(
      `PROIBIDO: essa kitnet tem um inquilino (${inquilinoComReceita.nome}) com cobrança vinculada -- resolva ou exclua o inquilino antes de excluir a kitnet.`
    );
    erro.status = 400;
    throw erro;
  }

  const vistorias = await prisma.vistoria.findMany({
    where: { kitnetId: id },
    select: { id: true },
  });

  const removido = await prisma.kitnet.delete({
    where: { id }
  });

  await Promise.all(
    vistorias.map((v) => notificacaoService.removerPorLink(`/vistorias/${v.id}`))
  );

  return removido;

};

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};