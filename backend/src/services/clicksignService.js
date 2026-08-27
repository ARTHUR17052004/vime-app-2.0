const crypto = require("crypto");

const prisma = require("../config/prisma");
const ClicksignApi = require("./ClicksignApi");
const ClicksignApiV3 = require("./ClicksignApiV3");
const notificacaoService = require("./notificacaoService");

// Confere se o webhook realmente veio da Clicksign, usando o segredo
// gerado pra esse endpoint (header "Content-Hmac: sha256=<hash>").
//
// MODO OBSERVAÇÃO: a documentação pública da Clicksign não deixa claro
// se o cálculo é um HMAC de verdade (chave = segredo) ou um hash simples
// do corpo concatenado com o segredo -- por segurança, aqui só REGISTRA
// no log qual das duas contas bate com o header recebido, sem bloquear
// nada ainda. Depois de confirmar nos logs qual delas bate com avisos
// reais da Clicksign, trocar `apenasRegistrar` por `false` fecha a
// validação de verdade (rejeitar quando não bater).
const apenasRegistrar = true;

const verificarAssinaturaWebhook = async (req) => {

  const header = req.headers["content-hmac"];
  const rawBody = req.rawBody;

  if (!header || !rawBody) {
    console.warn("[Clicksign Webhook] Sem header Content-Hmac ou corpo bruto -- não deu pra conferir a assinatura.");
    return { valido: apenasRegistrar, motivo: "sem-dados" };
  }

  const assinaturaRecebida = header.replace(/^sha256=/, "");

  const segredo = await ClicksignApiV3.obterSegredoWebhook();

  if (!segredo) {
    console.warn("[Clicksign Webhook] Sem segredo do webhook configurado -- não deu pra conferir a assinatura.");
    return { valido: apenasRegistrar, motivo: "sem-segredo" };
  }

  const digestHmacDeVerdade = crypto
    .createHmac("sha256", segredo)
    .update(rawBody)
    .digest("hex");

  const digestConcatenado = crypto
    .createHash("sha256")
    .update(Buffer.concat([rawBody, Buffer.from(segredo)]))
    .digest("hex");

  const compararSeguro = (a, b) => {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  };

  const bateHmac = compararSeguro(digestHmacDeVerdade, assinaturaRecebida);
  const bateConcatenado = compararSeguro(digestConcatenado, assinaturaRecebida);

  console.log(
    `[Clicksign Webhook] Verificação de assinatura -- HMAC(secret,body)=${bateHmac ? "BATEU" : "não bateu"} | SHA256(body+secret)=${bateConcatenado ? "BATEU" : "não bateu"}`
  );

  return { valido: bateHmac || bateConcatenado || apenasRegistrar, motivo: bateHmac || bateConcatenado ? "confirmado" : "nenhum-bateu" };

};

const config = async () => {

  const { apiKey, ambiente } = await ClicksignApi.obterConfig();

  return {
    ambiente,
    configurado: !!apiKey,
    apiUrl: process.env.CLICKSIGN_API_URL || null
  };
};

const status = async () => {

  const { apiKey, ambiente } = await ClicksignApi.obterConfig();

  return {
    online: true,
    ambiente,
    configurado: !!apiKey
  };
};

/* ==========================================
   TESTAR CONEXÃO (botão na tela)
========================================== */

const testarConexao = async () => {

  const { apiKey, ambiente } = await ClicksignApi.obterConfig();

  if (!apiKey) {
    return {
      success: false,
      mensagem: "Nenhum token da Clicksign configurado ainda."
    };
  }

  try {

    const resposta = await ClicksignApi.listarDocumentos();

    if (resposta?.mock) {
      return {
        success: false,
        mock: true,
        mensagem: "CLICKSIGN_MOCK está ativo — nenhuma chamada real foi feita à Clicksign."
      };
    }

    return {
      success: true,
      ambiente,
      mensagem: "Conexão com a Clicksign realizada com sucesso."
    };

  } catch (error) {

    return {
      success: false,
      mensagem: error.message || "Não foi possível conectar à Clicksign."
    };

  }

};

/* ==========================================
   ENVIAR DOCUMENTO (chama a API real / mock)
========================================== */

const enviarDocumento = async (dados) => {

  const nomeArquivo = dados?.nome || `documento-${Date.now()}.pdf`;

  const resposta = await ClicksignApi.criarDocumento({
    document: {
      path: `/${nomeArquivo}`,
      content_base64: dados?.conteudoBase64 || null,
      deadline_at: dados?.prazo || null,
      auto_close: true
    }
  });

  const documentoKey =
    resposta?.document?.key ||
    resposta?.key ||
    null;

  const signatariosAdicionados = [];

  if (documentoKey && Array.isArray(dados?.signatarios)) {

    for (const signatario of dados.signatarios) {

      const signatarioCriado = await ClicksignApi.criarSignatario(signatario);

      const signerKey =
        signatarioCriado?.signer?.key ||
        signatarioCriado?.key ||
        null;

      const lista = signerKey
        ? await ClicksignApi.criarLista(documentoKey, signerKey, {
            message: dados?.mensagem
          })
        : null;

      signatariosAdicionados.push({ signatarioCriado, lista });

    }

  }

  return {
    ...resposta,
    signatariosAdicionados
  };

};

/* ==========================================
   PROCESSAR WEBHOOK (chamado pela ClickSign)
========================================== */

const processarWebhook = async (evento) => {

  if (!evento) {
    return {
      success: false,
      message: "Evento inválido."
    };
  }

  const nomeEvento = evento.event?.name;
  const documentKey = evento.document?.key;

  console.log(`[Clicksign Webhook] evento="${nomeEvento}" documentKey="${documentKey}"`);

  const documento = await prisma.contrato.findFirst({
    where: {
      clicksignDocumentKey: documentKey
    },
    include: {
      kitnet: true,
      inquilino: true
    }
  });

  if (!documento) {
    console.log(`[Clicksign Webhook] Nenhum contrato local com clicksignDocumentKey="${documentKey}".`);
    return {
      success: false,
      message: "Contrato não encontrado."
    };
  }

  // A Clicksign v1 não manda um evento chamado "signature_finished" — o
  // nome real depende de como o documento foi fechado: "close" (fechado
  // manualmente ou quando todos assinam) ou "auto_close" (fechamento
  // automático, que é o que usamos em criarDocumento com auto_close:true).
  // "document_closed" aparece na lista de eventos configuráveis do painel
  // como sinônimo. Tratamos os três como "documento assinado".
  const eventosDeAssinaturaCompleta = ["close", "auto_close", "document_closed"];

  switch (true) {

    case eventosDeAssinaturaCompleta.includes(nomeEvento):

      console.log(`[Clicksign Webhook] Contrato ${documento.id} confirmado como assinado.`);

      // Vai para "ATIVO" (não "ASSINADO") porque é esse o status que o
      // resto do sistema já reconhece como "contrato vigente" — filtros
      // de dashboard, contagem de vencimentos e a checagem de contrato
      // duplicado em contratoService.criar todos olham para "ATIVO".
      await prisma.contrato.update({
        where: {
          id: documento.id
        },
        data: {
          status: "ATIVO"
        }
      });

      // Cobrança do aluguel só nasce aqui — depois que o contrato foi
      // assinado de verdade. Se o webhook chegar duplicado (a Clicksign
      // pode reenviar), não cria a mesma receita duas vezes.
      const jaExiste = await prisma.receita.findFirst({
        where: {
          contratoId: documento.id,
          categoria: "Aluguel"
        }
      });

      if (!jaExiste) {

        const receitaCriada = await prisma.receita.create({
          data: {
            contratoId: documento.id,
            inquilinoId: documento.inquilinoId,
            categoria: "Aluguel",
            descricao: `Aluguel - ${documento.kitnet?.numero || documento.kitnet?.nome || ""}`,
            valor: documento.valorAluguel,
            vencimento: documento.dataInicio,
            status: "PENDENTE"
          }
        });

        console.log(`[Clicksign Webhook] Receita ${receitaCriada.id} criada para o contrato ${documento.id}.`);

        await notificacaoService.criar({
          origem: "CLICKSIGN",
          titulo: "Contrato assinado",
          mensagem: `Contrato de ${documento.inquilino?.nome || "inquilino"} foi assinado na Clicksign.`,
          link: `/contratos/${documento.id}`
        });

      } else {

        console.log(`[Clicksign Webhook] Receita já existia para o contrato ${documento.id}, nada a fazer.`);

      }

      break;

    case nomeEvento === "cancel":

      await prisma.contrato.update({
        where: {
          id: documento.id
        },
        data: {
          status: "CANCELADO"
        }
      });

      await notificacaoService.criar({
        origem: "CLICKSIGN",
        titulo: "Contrato cancelado na Clicksign",
        mensagem: `O envio para assinatura do contrato de ${documento.inquilino?.nome || "inquilino"} foi cancelado.`,
        link: `/contratos/${documento.id}`
      });

      break;

  }

  return {
    success: true
  };

};

/* ==========================================
   SINCRONIZAÇÃO MANUAL (botão na tela)
   Busca documentos reais na ClickSign e
   atualiza os contratos locais.

   ATENÇÃO: ajuste os nomes dos campos
   (doc.status, doc.key) conforme o formato
   real que a API da ClickSign devolver —
   sugiro dar um console.log(documentos)
   na primeira execução pra conferir.
========================================== */

const sincronizar = async () => {

  const resposta = await ClicksignApi.listarDocumentos();

  const documentos = resposta?.documents || resposta?.data || [];

  let atualizados = 0;

  for (const doc of documentos) {

    const contrato = await prisma.contrato.findFirst({
      where: {
        id: doc.key || doc.id
      }
    });

    if (!contrato) continue;

    let novoStatus = contrato.status;

    if (doc.status === "closed" || doc.finished === true) {
      novoStatus = "ASSINADO";
    } else if (doc.status === "canceled") {
      novoStatus = "CANCELADO";
    }

    if (novoStatus !== contrato.status) {

      await prisma.contrato.update({
        where: { id: contrato.id },
        data: { status: novoStatus }
      });

      atualizados++;
    }

  }

  return {
    success: true,
    atualizados
  };

};

module.exports = {
  config,
  status,
  testarConexao,
  enviarDocumento,
  sincronizar,
  processarWebhook,
  verificarAssinaturaWebhook
};