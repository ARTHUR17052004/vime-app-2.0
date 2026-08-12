const prisma = require("../config/prisma");
const ClicksignApi = require("./ClicksignApi");

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

      const resultado = await ClicksignApi.adicionarSignatario(
        documentoKey,
        signatario
      );

      signatariosAdicionados.push(resultado);

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

  const documento = await prisma.contrato.findFirst({
    where: {
      id: evento.document?.key
    }
  });

  if (!documento) {
    return {
      success: false,
      message: "Contrato não encontrado."
    };
  }

  switch (evento.event?.name) {

    case "signature_finished":

      await prisma.contrato.update({
        where: {
          id: documento.id
        },
        data: {
          status: "ASSINADO"
        }
      });

      break;

    case "document_cancelled":

      await prisma.contrato.update({
        where: {
          id: documento.id
        },
        data: {
          status: "CANCELADO"
        }
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
  processarWebhook
};