const prisma = require("../config/prisma");
const notificacaoService = require("../services/notificacaoService");

// Uma kitnet pode ter mais de um inquilino/contrato ao mesmo tempo
// (república, por exemplo). Antes de marcar ela como vazia por causa da
// saída de UM inquilino/contrato, confere se não sobrou outro ativo --
// senão o sistema mostrava "vazia" com gente ainda morando lá, só
// porque um dos vários saiu.
const kitnetAindaOcupada = async (kitnetId, { ignorarInquilinoId, ignorarContratoId } = {}) => {

  const outroInquilino = await prisma.inquilino.findFirst({
    where: {
      kitnetId,
      ativo: true,
      ...(ignorarInquilinoId ? { id: { not: ignorarInquilinoId } } : {}),
    },
  });

  if (outroInquilino) return true;

  // Excluir o inquilino (onDelete: Cascade) também apaga o(s) contrato(s)
  // dele junto -- sem filtrar por inquilinoId aqui, essa query achava o
  // próprio contrato do inquilino sendo excluído (ainda ATIVO nesse
  // instante, antes do delete em cascata acontecer) e achava que
  // "sobrou" outro contrato, deixando a kitnet presa como OCUPADA pra
  // sempre depois de excluir o único inquilino dela.
  const outroContrato = await prisma.contrato.findFirst({
    where: {
      kitnetId,
      status: { in: ["ATIVO", "PENDENTE"] },
      ...(ignorarContratoId ? { id: { not: ignorarContratoId } } : {}),
      ...(ignorarInquilinoId ? { inquilinoId: { not: ignorarInquilinoId } } : {}),
    },
  });

  return Boolean(outroContrato);

};

// Mesma ideia pro inquilino: só desativa se ele não tiver outro
// contrato em andamento (ex.: renovação que já gerou um contrato novo
// antes do antigo ser encerrado/excluído).
const inquilinoTemOutroContratoAtivo = async (inquilinoId, { ignorarContratoId } = {}) => {

  const outroContrato = await prisma.contrato.findFirst({
    where: {
      inquilinoId,
      status: { in: ["ATIVO", "PENDENTE"] },
      ...(ignorarContratoId ? { id: { not: ignorarContratoId } } : {}),
    },
  });

  return Boolean(outroContrato);

};

// Toda vez que uma kitnet fica vazia de verdade (sem ninguém mais
// morando), gera sozinha uma vistoria de entrega pro Zelador validar em
// que estado ela ficou -- já nasce Pendente (urgente, não espera a
// janela normal de Programada -> Pendente) mas com as mesmas 72h de
// prazo que o resto do sistema usa antes de virar Atrasada (ver
// atualizarStatusVistoriasJob.js) -- nascer com dataProxima = agora
// virava Atrasada na hora, sem nenhum tempo de verdade pra ir resolver.
const gerarVistoriaDeEntrega = async (kitnetId) => {

  try {

    const kitnet = await prisma.kitnet.findUnique({
      where: { id: kitnetId },
      include: { unidade: true },
    });

    if (!kitnet || kitnet.status !== "DISPONIVEL") return;

    // Evita duplicar: já existe uma vistoria de entrega em aberto pra
    // essa kitnet (ex.: dois gatilhos quase juntos, tipo editar e
    // excluir o mesmo inquilino em sequência)? Só conta se ela for
    // dessa MESMA vacância (criada depois de vazioDesde) -- senão uma
    // vistoria antiga nunca realizada (de um inquilino anterior que já
    // saiu, kitnet foi ocupada de novo e esvaziou outra vez) calava o
    // aviso novo pra sempre, mesmo a kitnet tendo ficado vazia de novo.
    const jaExiste = await prisma.vistoria.findFirst({
      where: {
        kitnetId,
        categoria: "Entrega de kitnet vazia",
        status: { notIn: ["REALIZADA", "CANCELADA"] },
        ...(kitnet.vazioDesde ? { createdAt: { gte: kitnet.vazioDesde } } : {}),
      },
    });

    if (jaExiste) return;

    const nomeKitnet = kitnet.nome || `Kitnet ${kitnet.numero}`;
    const nomeUnidade = kitnet.unidade?.nome || "residência";
    const agora = new Date();

    // Endereço completo da residência -- pra quem vai até lá não
    // precisar abrir a Residência só pra descobrir onde fica.
    const u = kitnet.unidade || {};
    const endereco = [
      [u.logradouro, u.numero].filter(Boolean).join(", "),
      u.complemento,
      u.bairro,
      [u.cidade, u.uf].filter(Boolean).join("/"),
    ].filter(Boolean).join(" -- ") || null;

    // Responsável já nasce com um zelador de verdade escolhido (o
    // primeiro ativo), pra bater com as opções do seletor da tela --
    // "Zelador" genérico só se ainda não tiver nenhum cadastrado.
    const primeiroZelador = await prisma.usuario.findFirst({
      where: { ativo: true, perfil: { nome: "ZELADOR" } },
      orderBy: { nome: "asc" },
      select: { nome: true },
    });

    const vistoria = await prisma.vistoria.create({
      data: {
        titulo: `Vistoria de entrega - ${nomeKitnet} (${nomeUnidade})`,
        descricao: `Gerada automaticamente: a kitnet acabou de ficar vazia. Precisa ir até lá fazer a visita e a manutenção necessária antes de disponibilizar pro próximo inquilino.${endereco ? `\n\nEndereço: ${endereco}` : ""}`,
        unidadeId: kitnet.unidadeId,
        kitnetId: kitnet.id,
        categoria: "Entrega de kitnet vazia",
        criticidade: "Alta",
        responsavel: primeiroZelador?.nome || "Zelador",
        status: "PENDENTE",
        data: agora,
        dataProxima: new Date(agora.getTime() + 72 * 60 * 60 * 1000),
      },
    });

    // Título próprio (não "Nova vistoria") de propósito -- vira um tipo
    // separado em Administração > Notificações, e o frontend usa esse
    // mesmo título pra saber quando tocar o alerta mais forte (ver
    // somNotificacao.js) e destacar com um ícone diferente na lista.
    await notificacaoService.criar({
      origem: "SISTEMA",
      titulo: "Vistoria urgente: kitnet vazia",
      mensagem: await notificacaoService.renderizarMensagem(
        'VISTORIA_ENTREGA_VAZIA',
        { kitnet: nomeKitnet, unidade: nomeUnidade, endereco: endereco || '' },
        `🔑🚨 ${nomeKitnet} (${nomeUnidade}) acabou de ficar vazia!${endereco ? ` (${endereco})` : ""} Vai lá conferir a entrega assim que puder.`
      ),
      link: `/vistorias/${vistoria.id}`,
    });

  } catch (erro) {

    // Nunca pode travar o fluxo (encerrar contrato, excluir inquilino...)
    // por causa disso -- só loga.
    console.error("[vistoria-automatica] Falha ao gerar vistoria de entrega:", erro.message);

  }

};

module.exports = { kitnetAindaOcupada, inquilinoTemOutroContratoAtivo, gerarVistoriaDeEntrega };
