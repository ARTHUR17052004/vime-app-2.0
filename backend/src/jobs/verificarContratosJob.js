const prisma = require("../config/prisma");
const logService = require("../services/logService");
const notificacaoService = require("../services/notificacaoService");
const WhatsappService = require("../services/whatsappService");
const { emitirAtualizacao } = require("../socket");
const { kitnetAindaOcupada, inquilinoTemOutroContratoAtivo, gerarVistoriaDeEntrega } = require("../utils/kitnetOcupacao");

module.exports = async () => {

  console.log("[JOB] Verificando contratos...");

  // Mesmo bug (e mesma correção) do verificarVencimentosJob.js: comparar
  // com `new Date()` (hora atual) encerrava o contrato a partir da meia-
  // noite do próprio último dia de vigência -- liberando a kitnet,
  // desativando o inquilino e avisando por WhatsApp que "o contrato
  // chegou ao fim" faltando o dia inteiro pra acabar de verdade. Só
  // encerra a partir do dia SEGUINTE a dataFim agora.
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

  let receitasEncerradas = 0;

  for (const contrato of contratos) {

    await prisma.contrato.update({
      where: {
        id: contrato.id
      },
      data: {
        status: "ENCERRADO"
      }
    });

    // Financeiro não sabia que um contrato tinha acabado -- a
    // recorrência (ver gerarRecorrenciaReceitasJob.js) continuava
    // gerando cobrança do mês seguinte pra sempre, mesmo com o
    // inquilino já fora. Encerrar o contrato agora também desativa a
    // recorrência das receitas dele (por contratoId, ou por
    // inquilinoId pra receita avulsa sem contrato vinculado).
    const { count } = await prisma.receita.updateMany({
      where: {
        recorrente: true,
        OR: [
          { contratoId: contrato.id },
          { inquilinoId: contrato.inquilinoId, contratoId: null },
        ],
      },
      data: { recorrente: false },
    });

    receitasEncerradas += count;

    // Sem ignorarInquilinoId, kitnetAindaOcupada encontrava o PRÓPRIO
    // inquilino desse contrato (ainda com ativo:true nesse instante) e
    // achava que "sobrou" morador -- a kitnet nunca era liberada
    // sozinha pelo job, mesmo sem ninguém mais morando lá.
    if (!(await kitnetAindaOcupada(contrato.kitnetId, { ignorarContratoId: contrato.id, ignorarInquilinoId: contrato.inquilinoId }))) {
      await prisma.kitnet.update({
        where: {
          id: contrato.kitnetId
        },
        data: {
          ocupada: false,
          status: "DISPONIVEL"
        }
      });
      gerarVistoriaDeEntrega(contrato.kitnetId);
    }

    // Mesma lógica de inquilinoService/contratoService.encerrar -- o
    // job não desativava o inquilino, então ele continuava "ativo"
    // para sempre mesmo depois do contrato vencer sozinho.
    if (!(await inquilinoTemOutroContratoAtivo(contrato.inquilinoId, { ignorarContratoId: contrato.id }))) {
      await prisma.inquilino.update({
        where: { id: contrato.inquilinoId },
        data: { ativo: false }
      });
    }

    await logService.registrar({
      usuarioId: null,
      usuarioNome: "Scheduler",
      modulo: "CONTRATOS",
      acao: "ENCERRAMENTO_AUTOMATICO",
      descricao: `Contrato ${contrato.id} encerrado automaticamente.`
    });

    // O fechamento MANUAL (contratoService.encerrar) já avisa o sistema
    // e o inquilino -- esse job automático fazia tudo isso calado (só o
    // log de auditoria, que ninguém olha no dia a dia). Nenhuma ação
    // automática pode acontecer sem o usuário ficar sabendo -- os
    // lembretes de 10/5/3 dias (notificarVencimentoContratoJob) já
    // avisam ANTES; esse aqui avisa DEPOIS, que a ação de verdade
    // aconteceu.
    try {
      await notificacaoService.criar({
        origem: "SISTEMA",
        titulo: "Contrato encerrado automaticamente",
        mensagem: await notificacaoService.renderizarMensagem(
          'CONTRATO_ENCERRADO',
          { contrato: contrato.id },
          `Contrato de ${contrato.inquilino?.nome || 'um inquilino'} venceu e foi encerrado automaticamente.`
        ),
        link: `/contratos/${contrato.id}`
      });
    } catch (erroNotificacao) {
      console.error(`[JOB] Erro ao notificar encerramento automático do contrato ${contrato.id}:`, erroNotificacao.message);
    }

    if (contrato.inquilino?.telefone) {
      try {
        await WhatsappService.enviarMensagem({
          numero: contrato.inquilino.telefone,
          mensagem: "Seu contrato chegou ao fim e foi encerrado automaticamente."
        });
      } catch (erroWhatsapp) {
        console.error(`[JOB] Erro ao enviar WhatsApp de encerramento automático (contrato ${contrato.id}):`, erroWhatsapp.message);
      }
    }

    console.log(
      `[JOB] Contrato ${contrato.id} encerrado automaticamente.`
    );

  }

  if (contratos.length > 0) {
    emitirAtualizacao("contrato");
  }

  if (receitasEncerradas > 0) {
    emitirAtualizacao("receita");
  }

};