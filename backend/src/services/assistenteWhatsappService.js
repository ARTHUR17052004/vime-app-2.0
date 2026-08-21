const Anthropic = require("@anthropic-ai/sdk");
const prisma = require("../config/prisma");

function digitsOnly(v) {
  return (v || "").replace(/\D/g, "");
}

// Compara números ignorando formatação e o "55" do Brasil na frente,
// já que o WhatsApp manda o número completo (556299998888) mas o
// cadastro do inquilino pode ter sido digitado sem o código do país.
function normalizarTelefoneBR(v) {
  let d = digitsOnly(v);
  if (d.length > 11 && d.startsWith("55")) {
    d = d.slice(2);
  }
  return d;
}

async function encontrarInquilinoPeloNumero(numeroWhatsapp) {
  const alvo = normalizarTelefoneBR(numeroWhatsapp);
  if (!alvo) return null;

  // telefone é obrigatório no cadastro de Inquilino (não aceita null),
  // então não precisa de filtro -- só busca todos e compara normalizado.
  const inquilinos = await prisma.inquilino.findMany({
    include: { kitnet: true },
  });

  return (
    inquilinos.find((i) => normalizarTelefoneBR(i.telefone) === alvo) || null
  );
}

async function montarContexto(inquilino) {
  const contrato = await prisma.contrato.findFirst({
    where: {
      inquilinoId: inquilino.id,
      status: { in: ["ATIVO", "PENDENTE"] },
    },
    orderBy: { createdAt: "desc" },
    include: { kitnet: true },
  });

  const receitas = await prisma.receita.findMany({
    where: {
      OR: [
        { inquilinoId: inquilino.id },
        ...(contrato ? [{ contratoId: contrato.id }] : []),
      ],
    },
    orderBy: { vencimento: "desc" },
    take: 6,
  });

  return { contrato, receitas };
}

function formatarContexto(inquilino, contrato, receitas) {
  const linhas = [`Inquilino: ${inquilino.nome}`];

  if (contrato) {
    linhas.push(
      `Contrato: status ${contrato.status}, kitnet ${
        contrato.kitnet?.nome || contrato.kitnet?.numero || "-"
      }, aluguel R$ ${contrato.valorAluguel}, vencimento todo dia ${
        contrato.diaVencimento
      }, início ${new Date(contrato.dataInicio).toLocaleDateString("pt-BR")}${
        contrato.dataFim
          ? `, fim ${new Date(contrato.dataFim).toLocaleDateString("pt-BR")}`
          : ""
      }.`
    );
  } else {
    linhas.push("Contrato: nenhum contrato ativo/pendente encontrado.");
  }

  if (receitas.length > 0) {
    linhas.push("Últimas cobranças:");
    receitas.forEach((r) => {
      linhas.push(
        `- ${r.descricao}: R$ ${r.valor}, vencimento ${
          r.vencimento ? new Date(r.vencimento).toLocaleDateString("pt-BR") : "-"
        }, status ${r.status}${
          r.dataPagamento
            ? `, pago em ${new Date(r.dataPagamento).toLocaleDateString("pt-BR")}`
            : ""
        }.`
      );
    });
  } else {
    linhas.push("Nenhuma cobrança encontrada.");
  }

  return linhas.join("\n");
}

async function gerarResposta({ apiKey, mensagemUsuario, inquilino, contrato, receitas }) {
  const anthropic = new Anthropic({ apiKey });

  const contexto = formatarContexto(inquilino, contrato, receitas);

  const resposta = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    system:
      "Você é o assistente virtual do sistema VIME, respondendo por WhatsApp diretamente ao inquilino sobre o próprio contrato e cobranças. Responda em português, curto e direto, como uma mensagem de WhatsApp normal (sem markdown, sem títulos, sem emoji em excesso). Use SOMENTE as informações abaixo — nunca invente valores, datas ou status que não estejam ali. Se a pergunta não puder ser respondida com esses dados, diga educadamente que vai encaminhar para um atendente humano.\n\n" +
      contexto,
    messages: [{ role: "user", content: mensagemUsuario }],
  });

  const bloco = resposta.content?.find((c) => c.type === "text");

  return (
    bloco?.text ||
    "Desculpa, não consegui processar sua mensagem agora. Vou encaminhar para um atendente."
  );
}

// Chamado pelo webhook do WhatsApp a cada mensagem recebida. Retorna
// `null` quando o assistente não deve responder (desativado, sem
// chave, ou número que não bate com nenhum inquilino cadastrado —
// nesse caso um humano assume a conversa normalmente).
async function processarMensagemRecebida({ numeroWhatsapp, textoMensagem }) {
  const config = await prisma.configuracaoWhatsapp.findFirst();

  if (!config?.iaAtivo || !config?.iaApiKey) {
    return null;
  }

  const inquilino = await encontrarInquilinoPeloNumero(numeroWhatsapp);

  if (!inquilino) {
    return null;
  }

  const { contrato, receitas } = await montarContexto(inquilino);

  try {
    return await gerarResposta({
      apiKey: config.iaApiKey,
      mensagemUsuario: textoMensagem,
      inquilino,
      contrato,
      receitas,
    });
  } catch (error) {
    console.error("Erro no assistente IA do WhatsApp:", error.message);
    return null;
  }
}

module.exports = {
  processarMensagemRecebida,
  encontrarInquilinoPeloNumero,
  normalizarTelefoneBR,
};
