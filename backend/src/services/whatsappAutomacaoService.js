const prisma = require("../config/prisma");
const metaWhatsappService = require("./metaWhatsappService");
const { getIO } = require("../socket");
const { paraChave: normalizarTelefone } = require("../utils/telefoneWhatsapp");

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

// Erros da Meta relacionados ao MODELO em si (não existe, não aprovado
// ainda, idioma errado etc) -- só nesses casos vale tentar a mensagem
// livre como alternativa. Um erro de outro tipo (token inválido,
// número mal formatado...) não seria resolvido por essa troca.
function erroEhDeModelo(mensagem) {
  const m = (mensagem || "").toLowerCase();
  return m.includes("template") || m.includes("modelo");
}

// Nunca deixa uma falha de WhatsApp derrubar o fluxo que chamou (enviar
// cobrança, marcar pagamento, etc) -- só loga e segue.
async function enviarTemplateParaInquilino({ inquilino, nomeModelo, parametros, documentoUrl, resumoParaHistorico, textoFallback }) {

  try {

    if (!inquilino?.telefone) {
      console.warn(`[WhatsApp] ${nomeModelo}: inquilino sem telefone cadastrado, não enviado.`);
      return { success: false, mensagem: "Inquilino sem telefone cadastrado." };
    }

    const conversa = await obterOuCriarConversa(inquilino);

    if (!conversa) {
      return { success: false, mensagem: "Telefone inválido." };
    }

    try {

      await metaWhatsappService.enviarTemplate(
        inquilino.telefone,
        nomeModelo,
        parametros,
        documentoUrl
      );

    } catch (erroTemplate) {

      // Modelo ainda não aprovado (ou não existe) -- tenta mensagem
      // livre como alternativa. Só funciona se o inquilino escreveu
      // pra gente nas últimas 24h (janela de atendimento da própria
      // Meta); se não, a Meta recusa e cai no catch de fora, sem
      // travar o fluxo de qualquer forma.
      if (!erroEhDeModelo(erroTemplate.message)) throw erroTemplate;

      console.warn(`[WhatsApp] Modelo "${nomeModelo}" indisponível (${erroTemplate.message}) -- tentando mensagem livre como alternativa.`);

      await metaWhatsappService.enviarMensagem(inquilino.telefone, textoFallback || resumoParaHistorico);

      if (documentoUrl) {
        await metaWhatsappService.enviarDocumento(inquilino.telefone, documentoUrl, "Boleto para pagamento.");
      }

    }

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

  // O link do boleto (BB e Asaas) é uma página pra abrir no navegador,
  // não um PDF puro -- por isso vai como link clicável no texto, não
  // como anexo de documento (a Meta rejeita/renderiza errado um
  // "documento" cujo conteúdo não é realmente um arquivo).
  const link = receita.linkBoleto || "";

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "nova_cobranca_boleto",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.vencimento), link],
    documentoUrl: null,
    resumoParaHistorico: `📄 Nova cobrança: R$ ${formatarMoeda(receita.valor)}, vencimento ${formatarData(receita.vencimento)}.`,
    textoFallback: `Olá ${inquilino.nome}, tudo bem?\n\nUma nova cobrança foi gerada para você:\n\n💰 Valor: R$ ${formatarMoeda(receita.valor)}\n📅 Vencimento: ${formatarData(receita.vencimento)}\n\n🔗 Link para pagamento (boleto/Pix): ${link}\n\nQualquer dúvida, é só responder aqui.`,
  });

}

async function notificarLembreteVencimento(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "lembrete_vencimento",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.vencimento)],
    documentoUrl: null,
    resumoParaHistorico: `⏰ Lembrete de vencimento: R$ ${formatarMoeda(receita.valor)}, vence ${formatarData(receita.vencimento)}.`,
    textoFallback: `Olá ${inquilino.nome}, tudo bem?\n\nPassando pra lembrar que sua cobrança vence em breve:\n\n💰 Valor: R$ ${formatarMoeda(receita.valor)}\n📅 Vencimento: ${formatarData(receita.vencimento)}\n\nEvite atrasos garantindo o pagamento até a data. Qualquer dúvida, é só responder aqui.`,
  });

}

async function notificarCobrancaVencida(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "cobranca_vencida",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.vencimento)],
    documentoUrl: null,
    resumoParaHistorico: `⚠️ Cobrança vencida: R$ ${formatarMoeda(receita.valor)}, venceu ${formatarData(receita.vencimento)}.`,
    textoFallback: `Olá ${inquilino.nome}, tudo bem?\n\nNotamos que sua cobrança venceu e ainda não identificamos o pagamento:\n\n💰 Valor: R$ ${formatarMoeda(receita.valor)}\n📅 Vencimento: ${formatarData(receita.vencimento)}\n\nSe já pagou, desconsidere esta mensagem. Caso contrário, regularize o quanto antes para evitar juros e multa. Qualquer dúvida, é só responder aqui.`,
  });

}

async function notificarPagamentoConfirmado(receita, inquilino) {

  return enviarTemplateParaInquilino({
    inquilino,
    nomeModelo: "pagamento_confirmado",
    parametros: [inquilino.nome, formatarMoeda(receita.valor), formatarData(receita.dataPagamento || new Date())],
    documentoUrl: null,
    resumoParaHistorico: `✅ Pagamento confirmado: R$ ${formatarMoeda(receita.valor)}.`,
    textoFallback: `Olá ${inquilino.nome}, tudo bem?\n\nRecebemos seu pagamento com sucesso! ✅\n\n💰 Valor: R$ ${formatarMoeda(receita.valor)}\n📅 Pago em: ${formatarData(receita.dataPagamento || new Date())}\n\nObrigado pela pontualidade! Qualquer dúvida, é só responder aqui.`,
  });

}

module.exports = {
  notificarNovaCobranca,
  notificarLembreteVencimento,
  notificarCobrancaVencida,
  notificarPagamentoConfirmado,
  obterOuCriarConversa,
};
