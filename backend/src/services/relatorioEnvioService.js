const prisma = require("../config/prisma");
const { TIPOS } = require("../utils/tiposRelatorio");
const relatorioConfigService = require("./relatorioConfigService");
const { gerarRelatorio } = require("../config/catalogoRelatorios");
const { gerarPdfBuffer, gerarExcelBuffer } = require("../utils/relatorioArquivo");
const { gerarRelatorioExtratoConta } = require("../utils/extratoContaRelatorio");
const contaPagamentoService = require("./contaPagamentoService");
const emailService = require("./emailService");
const logService = require("./logService");
const { somarMeses } = require("./contratoDocumentoService");

// "AAAA-MM" + 1 mês, sem depender de Date (evita fuso virando o mês
// errado) -- usado só pra avançar o mês de referência do Extrato numa
// série recorrente.
function somarMesReferencia(mesReferencia) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  const proximoMes = mes === 12 ? 1 : mes + 1;
  const proximoAno = mes === 12 ? ano + 1 : ano;
  return `${proximoAno}-${String(proximoMes).padStart(2, "0")}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "EXTRATO_CONTA" é um relatório à parte do catálogo genérico de
// utils/tiposRelatorio.js -- é o Relatório de Receitas por conta/mês
// que já existe em Financeiro > Extratos (FinanceiroAsaas.jsx), que
// precisa de conta+mês pra existir, então nunca aparece na lista
// liga/desliga de Administração > Relatórios. Só existe em Excel
// (mesmo formato de lá -- nunca teve PDF). Pedido do usuário em
// 26/11/2026 -- foi o motivo real de pedir essa área de envio.
const validarCriacao = async (dados) => {

  const email = String(dados.destinatarioEmail || "").trim();
  if (!EMAIL_REGEX.test(email)) {
    throw new Error("Digite um e-mail válido pra receber o relatório.");
  }

  const dataAgendada = new Date(dados.dataAgendada);
  if (Number.isNaN(dataAgendada.getTime())) {
    throw new Error("Data de envio inválida.");
  }

  if (dados.relatorioChave === "EXTRATO_CONTA") {

    if (!dados.contaPagamentoId) {
      throw new Error("Escolha a conta de pagamento do extrato.");
    }

    const conta = await contaPagamentoService.buscarPorId(dados.contaPagamentoId);
    if (!conta) {
      throw new Error("Conta de pagamento não encontrada.");
    }

    if (!/^\d{4}-\d{2}$/.test(dados.mesReferencia || "")) {
      throw new Error("Escolha o mês de referência do extrato.");
    }

    return {
      relatorioChave: "EXTRATO_CONTA",
      relatorioTitulo: `Extrato de Receitas - ${conta.nome} - ${dados.mesReferencia}`,
      formato: "excel",
      contaPagamentoId: conta.id,
      mesReferencia: dados.mesReferencia,
      email,
      dataAgendada,
      recorrente: !!dados.recorrente,
    };

  }

  const tipo = TIPOS.find((t) => t.chave === dados.relatorioChave);
  if (!tipo) {
    throw new Error("Relatório inválido.");
  }

  const disponiveis = await relatorioConfigService.listar();
  const config = disponiveis.find((r) => r.chave === dados.relatorioChave);
  if (config && !config.ativo) {
    throw new Error("Esse relatório está desativado em Administração > Relatórios.");
  }

  if (!["pdf", "excel"].includes(dados.formato)) {
    throw new Error("Formato inválido -- escolha PDF ou Excel.");
  }

  return {
    relatorioChave: tipo.chave,
    relatorioTitulo: tipo.rotulo,
    formato: dados.formato,
    contaPagamentoId: null,
    mesReferencia: null,
    email,
    dataAgendada,
    recorrente: !!dados.recorrente,
  };

};

const criar = async (dados, autor) => {

  const resolvido = await validarCriacao(dados);

  const agendamento = await prisma.relatorioAgendado.create({
    data: {
      relatorioChave: resolvido.relatorioChave,
      relatorioTitulo: resolvido.relatorioTitulo,
      formato: resolvido.formato,
      destinatarioEmail: resolvido.email,
      dataAgendada: resolvido.dataAgendada,
      contaPagamentoId: resolvido.contaPagamentoId,
      mesReferencia: resolvido.mesReferencia,
      recorrente: resolvido.recorrente,
      criadoPorId: autor?.id || null,
      criadoPorNome: autor?.nome || "Sistema",
    },
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RELATORIOS",
    acao: "AGENDAR_ENVIO",
    descricao: `${autor?.nome || "Alguém"} agendou o envio de "${resolvido.relatorioTitulo}" (${resolvido.formato.toUpperCase()}) pra ${resolvido.email} em ${resolvido.dataAgendada.toLocaleString("pt-BR")}${resolvido.recorrente ? ", repetindo todo mês" : ""}.`,
  });

  return agendamento;

};

// Mesma visão pra todo mundo com permissão (não escopado por locador --
// é um agendamento do admin do sistema, não um dado de um locador só).
const listar = () => {
  return prisma.relatorioAgendado.findMany({
    orderBy: { dataAgendada: "desc" },
  });
};

// Só cancela o que ainda não foi enviado -- um já ENVIADO ou ERRO vira
// histórico permanente (não existe "desfazer" um e-mail já mandado).
const cancelar = async (id, autor) => {

  const agendamento = await prisma.relatorioAgendado.findUnique({ where: { id } });

  if (!agendamento) {
    throw new Error("Agendamento não encontrado.");
  }

  if (agendamento.status !== "PENDENTE") {
    throw new Error("Só dá pra cancelar um envio que ainda não aconteceu.");
  }

  const cancelado = await prisma.relatorioAgendado.update({
    where: { id },
    data: { status: "CANCELADO" },
  });

  await logService.registrar({
    usuarioId: autor?.id || null,
    usuarioNome: autor?.nome || "Sistema",
    modulo: "RELATORIOS",
    acao: "CANCELAR_ENVIO",
    descricao: `${autor?.nome || "Alguém"} cancelou o envio agendado de "${agendamento.relatorioTitulo}" pra ${agendamento.destinatarioEmail}.`,
  });

  return cancelado;

};

const gerarConteudo = async (agendamento) => {

  if (agendamento.contaPagamentoId) {
    const resultado = await contaPagamentoService.recebidoDoMes(agendamento.contaPagamentoId, agendamento.mesReferencia);
    return gerarRelatorioExtratoConta(resultado);
  }

  return gerarRelatorio(agendamento.relatorioChave);

};

// Chamado pelo job (enviarRelatoriosAgendadosJob.js) -- gera o arquivo
// na hora (nunca guarda o PDF/Excel pronto, só a configuração do envio)
// e manda por e-mail. Cada agendamento resolve sozinho: um erro num não
// trava os outros da fila.
const processarPendentes = async () => {

  const pendentes = await prisma.relatorioAgendado.findMany({
    where: { status: "PENDENTE", dataAgendada: { lte: new Date() } },
  });

  for (const agendamento of pendentes) {

    try {

      const relatorio = await gerarConteudo(agendamento);

      if (relatorio.linhas.length === 0) {
        throw new Error(`"${relatorio.titulo}" não tem nenhum registro pra mandar agora.`);
      }

      const ehPdf = agendamento.formato === "pdf";
      const buffer = ehPdf
        ? gerarPdfBuffer(relatorio)
        : gerarExcelBuffer(relatorio);

      const nomeArquivo = `${agendamento.relatorioTitulo.replace(/[^\p{L}\p{N}]+/gu, "-")}.${ehPdf ? "pdf" : "xlsx"}`;
      const contentType = ehPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      await emailService.enviarEmail({
        para: agendamento.destinatarioEmail,
        assunto: `Relatório: ${agendamento.relatorioTitulo}`,
        texto: `Segue em anexo o relatório "${agendamento.relatorioTitulo}", gerado em ${new Date().toLocaleString("pt-BR")}.`,
        html: `<p>Segue em anexo o relatório <strong>${agendamento.relatorioTitulo}</strong>, gerado em ${new Date().toLocaleString("pt-BR")}.</p>`,
        anexos: [{
          filename: nomeArquivo,
          content: buffer,
          contentType,
        }],
      });

      await prisma.relatorioAgendado.update({
        where: { id: agendamento.id },
        data: {
          status: "ENVIADO",
          enviadoEm: new Date(),
          erro: null,
          arquivoDados: buffer.toString("base64"),
          arquivoNomeOriginal: nomeArquivo,
          arquivoMimeType: contentType,
        },
      });

      await logService.registrar({
        modulo: "RELATORIOS",
        acao: "ENVIAR_RELATORIO",
        descricao: `Relatório "${agendamento.relatorioTitulo}" enviado pra ${agendamento.destinatarioEmail}.`,
      });

      // Recorrente: só cria o próximo agendamento DEPOIS de um envio
      // bem-sucedido -- cancelar o próximo da fila naturalmente encerra
      // a série, sem precisar de nenhuma lógica extra de "série".
      if (agendamento.recorrente) {
        await prisma.relatorioAgendado.create({
          data: {
            relatorioChave: agendamento.relatorioChave,
            relatorioTitulo: agendamento.contaPagamentoId
              ? agendamento.relatorioTitulo.replace(/\d{4}-\d{2}$/, somarMesReferencia(agendamento.mesReferencia))
              : agendamento.relatorioTitulo,
            formato: agendamento.formato,
            destinatarioEmail: agendamento.destinatarioEmail,
            dataAgendada: somarMeses(agendamento.dataAgendada, 1),
            contaPagamentoId: agendamento.contaPagamentoId,
            mesReferencia: agendamento.mesReferencia ? somarMesReferencia(agendamento.mesReferencia) : null,
            recorrente: true,
            criadoPorId: agendamento.criadoPorId,
            criadoPorNome: agendamento.criadoPorNome,
          },
        });
      }

    } catch (erro) {

      console.error(`[relatorio-envio] Falha ao enviar agendamento ${agendamento.id}:`, erro.message);

      await prisma.relatorioAgendado.update({
        where: { id: agendamento.id },
        data: { status: "ERRO", erro: erro.message },
      });

    }

  }

};

// Devolve o arquivo exatamente como foi mandado por e-mail (nunca gera
// de novo -- os dados de origem podem ter mudado desde o envio).
const obterArquivo = async (id) => {

  const agendamento = await prisma.relatorioAgendado.findUnique({ where: { id } });

  if (!agendamento || agendamento.status !== "ENVIADO" || !agendamento.arquivoDados) {
    throw new Error("Esse relatório ainda não foi enviado, ou o arquivo não está mais disponível.");
  }

  return {
    buffer: Buffer.from(agendamento.arquivoDados, "base64"),
    nomeArquivo: agendamento.arquivoNomeOriginal || "relatorio",
    mimeType: agendamento.arquivoMimeType || "application/octet-stream",
  };

};

module.exports = {
  criar,
  listar,
  cancelar,
  processarPendentes,
  obterArquivo,
};
