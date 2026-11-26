const prisma = require("../config/prisma");
const logService = require("../services/logService");
const notificacaoService = require("../services/notificacaoService");
const contratoService = require("../services/contratoService");
const WhatsappService = require("../services/whatsappService");
const { emitirAtualizacao } = require("../socket");

module.exports = async () => {

  console.log("[JOB] Verificando contratos...");

  // Mesmo bug (e mesma correção) do verificarVencimentosJob.js: comparar
  // com `new Date()` (hora atual) agia a partir da meia-noite do próprio
  // último dia de vigência -- faltando o dia inteiro pra acabar de
  // verdade. Só age a partir do dia SEGUINTE a dataFim.
  const inicioDeHoje = new Date();
  inicioDeHoje.setHours(0, 0, 0, 0);

  const contratos = await prisma.contrato.findMany({
    where: {
      status: "ATIVO",
      dataFim: {
        not: null,
        lt: inicioDeHoje
      }
    },
    include: {
      inquilino: true
    }
  });

  // RENOVAR automaticamente, não ENCERRAR -- pedido do usuário em
  // 26/11/2026: o comportamento anterior (encerrar sozinho ao vencer o
  // prazo -- liberar a kitnet, desativar o inquilino, cancelar/classificar
  // receitas) estava encerrando contratos que na verdade precisavam
  // continuar. Renovar é bem mais simples (contratoService.renovar só
  // empurra dataFim +MESES_RENOVACAO e mantém ATIVO) -- não mexe em
  // kitnet/inquilino/receita nenhuma, porque o contrato não está
  // acabando de verdade. Quem precisar encerrar de propósito continua
  // usando o botão "Encerrar contrato" (manual, com motivo).
  for (const contrato of contratos) {

    try {

      const renovado = await contratoService.renovar(contrato.id, { id: null, nome: "Scheduler" });

      const dataFimFormatada = new Date(renovado.dataFim).toLocaleDateString("pt-BR", { timeZone: "UTC" });

      await logService.registrar({
        usuarioId: null,
        usuarioNome: "Scheduler",
        modulo: "CONTRATOS",
        acao: "RENOVACAO_AUTOMATICA",
        descricao: `Contrato ${contrato.id} renovado automaticamente até ${dataFimFormatada}.`
      });

      // Mesmo princípio do encerramento automático que esse job fazia
      // antes: nenhuma ação automática pode acontecer sem o usuário
      // ficar sabendo.
      try {
        await notificacaoService.criar({
          origem: "SISTEMA",
          titulo: "Contrato renovado automaticamente",
          mensagem: await notificacaoService.renderizarMensagem(
            'CONTRATO_RENOVADO_AUTOMATICO',
            { contrato: contrato.id },
            `Contrato de ${contrato.inquilino?.nome || 'um inquilino'} venceu e foi renovado automaticamente até ${dataFimFormatada}.`
          ),
          link: `/contratos/${contrato.id}`
        });
      } catch (erroNotificacao) {
        console.error(`[JOB] Erro ao notificar renovação automática do contrato ${contrato.id}:`, erroNotificacao.message);
      }

      if (contrato.inquilino?.telefone) {
        try {
          await WhatsappService.enviarMensagem({
            numero: contrato.inquilino.telefone,
            mensagem: `Seu contrato venceu e foi renovado automaticamente até ${dataFimFormatada}.`
          });
        } catch (erroWhatsapp) {
          console.error(`[JOB] Erro ao enviar WhatsApp de renovação automática (contrato ${contrato.id}):`, erroWhatsapp.message);
        }
      }

      console.log(`[JOB] Contrato ${contrato.id} renovado automaticamente até ${dataFimFormatada}.`);

    } catch (erro) {

      console.error(`[JOB] Falha ao renovar automaticamente o contrato ${contrato.id}:`, erro.message);

    }

  }

  if (contratos.length > 0) {
    emitirAtualizacao("contrato");
  }

};
