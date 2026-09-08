const prisma = require("../config/prisma");
const metaWhatsappService = require("./metaWhatsappService");
const { getIO } = require("../socket");

/*
  Disparos automáticos de WhatsApp ligados ao ciclo de vida da cobrança:
  nova cobrança (ao enviar ao banco), lembrete de vencimento, cobrança
  vencida e pagamento confirmado.

  Cada função aqui:
  1. Resolve o telefone do inquilino (não dispara nada sem telefone).
  2. Garante que existe um WhatsappContato ligado a esse inquilino (pra
     aparecer com nome certo na tela de WhatsApp, e não só o número cru).
  3. Manda o modelo (template) aprovado pela Meta via metaWhatsappService.
  4. Registra a mensagem enviada na conversa, igual uma mensagem manual
     -- assim o envio automático também aparece no histórico da tela.

  Nomes dos modelos e ordem das variáveis do corpo são os criados no
  Gerenciador do WhatsApp (Meta): {{1}} nome do inquilino, {{2}} valor,
  {{3}} data (vencimento ou pagamento, dependendo do modelo).
*/

function formatarMoeda(valor) {
  return Number(valor || 0).toFixed(2).replace(".", ",");
}

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";
}

// Mesma regra do metaWhatsappService: o cadastro de Inquilino grava o
// telefone local (sem "55"), mas uma mensagem recebida via webhook já
// chega com o "55" na frente. Precisam virar a MESMA chave aqui --
// senão o mesmo inquilino ganha dois WhatsappContato diferentes (um
// pras mensagens automáticas, outro pra quando ele escreve pra gente).
function normalizarTelefone(telefone) {

  let digitos = (telefone || "").replace(/\D/g, "");

  if (digitos.length <= 11 && !digitos.startsWith("55")) {
    digitos = "55" + digitos;
  }

  return digitos;

}

/* ==========================================
   CONTATO + CONVERSA
========================================== */

async function obterOuCriarConversa(inquilino) {

  const telefoneDigitos = normalizarTelefone(inquilino.telefone);

  if (!telefoneDigitos) return null;

  let contato = await prisma.whatsappContato.findUnique({
    where: { telefone: telefoneDigitos },
  });

  if (!contato) {

    contato = await prisma.whatsappContato.create({
      data: {
        telefone: telefoneDigitos,
        nome: inquilino.nome,
        inquilinoId: inquilino.id,
      },
    });

  } else if (!contato.inquilinoId || contato.nome === contato.telefone) {

    // Contato já existia (ex: criado a partir de uma mensagem recebida
    // antes de sabermos quem era) -- agora que sabemos o inquilino,
    // completa o vínculo e corrige o nome exibido.
    contato = await prisma.whatsappContato.update({
      where: { id: contato.id },
      data: {
        inquilinoId: contato.inquilinoId || inquilino.id,
        nome: contato.nome === contato.telefone ? inquilino.nome : contato.nome,
      },
    });

  }

  let conversa = await prisma.whatsappConversa.findFirst({
    where: { contatoId: contato.id },
  });

  if (!conversa) {
    conversa = await prisma.whatsappConversa.create({
      data: { contatoId: contato.id },
    });
  }

  return conversa;

}

async function registrarMensagemEnviada(conversa, texto) {

  await prisma.whatsappMensagem.create({
    data: {
      conversaId: conversa.id,
      texto,
      tipo: "enviada",
      status: "enviada",
    },
  });

  await prisma.whatsappConversa.update({
    where: { id: conversa.id },
    data: {
      ultimaMensagem: texto,
      ultimaData: new Date(),
    },
  });

  const io = getIO();

  if (io) {

    const conversas = await require("./whatsappService").conversas();

    io.emit("whatsapp:update", conversas);

  }

}

/* ==========================================
   ENVIO GENÉRICO DE MODELO
========================================== */

// Nunca deixa uma falha de WhatsApp derrubar o fluxo que chamou (enviar
// cobrança, marcar pagamento, etc) -- só loga e segue.
async function enviarTemplateParaInquilino({ inquilino, nomeModelo, parametros, documentoUrl, resumoParaHistorico }) {

  try {

    if (!inquilino?.telefone) {
      console.warn(`[WhatsApp] ${nomeModelo}: inquilino sem telefone cadastrado, não enviado.`);
      return { success: false, mensagem: "Inquilino sem telefone cadastrado." };
    }

    const conversa = await obterOuCriarConversa(inquilino);

    if (!conversa) {
      return { success: false, mensagem: "Telefone inválido." };
    }

    await metaWhatsappService.enviarTemplate(
      inquilino.telefone,
      nomeModelo,
      parametros,
      documentoUrl
    );

    await registrarMensagemEnviada(conversa, resumoParaHistorico);

    return { success: true };

  } catch (error) {

    console.error(`[WhatsApp] Falha ao enviar modelo "${nomeModelo}" para ${inquilino?.nome}:`, error.message);

    return { success: false, mensagem: error.message };

  }

}

/* ==========================================
   OS 4 EVENTOS
========================================== */

async function notificarNovaCobranca(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "nova_cobranca",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.vencimento)],
    documentoUrl: receita.linkBoleto || null,
    resumoParaHistorico: `📄 Nova cobrança: R$ ${formatarMoeda(receita.valor)}, vencimento ${formatarData(receita.vencimento)}.`,
  });

}

async function notificarLembreteVencimento(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "lembrete_vencimento",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.vencimento)],
    documentoUrl: null,
    resumoParaHistorico: `⏰ Lembrete de vencimento: R$ ${formatarMoeda(receita.valor)}, vence ${formatarData(receita.vencimento)}.`,
  });

}

async function notificarCobrancaVencida(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "cobranca_vencida",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.vencimento)],
    documentoUrl: null,
    resumoParaHistorico: `⚠️ Cobrança vencida: R$ ${formatarMoeda(receita.valor)}, venceu ${formatarData(receita.vencimento)}.`,
  });

}

async function notificarPagamentoConfirmado(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "pagamento_confirmado",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.dataPagamento || new Date())],
    documentoUrl: null,
    resumoParaHistorico: `✅ Pagamento confirmado: R$ ${formatarMoeda(receita.valor)}.`,
  });

}

module.exports = {
  notificarNovaCobranca,
  notificarLembreteVencimento,
  notificarCobrancaVencida,
  notificarPagamentoConfirmado,
  obterOuCriarConversa,
};
