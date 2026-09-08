const emailService = require("./emailService");

/*
  E-mail automático ligado ao ciclo de vida da cobrança -- canal
  paralelo ao WhatsApp (ver whatsappAutomacaoService.js). Não depende
  de aprovação de modelo nem de janela de 24h como o WhatsApp -- assim
  que o SMTP estiver configurado em Configurações, funciona na hora.

  Nunca deixa uma falha de e-mail derrubar o fluxo que chamou (mesma
  regra do WhatsApp) -- só loga e segue.
*/

function formatarMoeda(valor) {
  return Number(valor || 0).toFixed(2).replace(".", ",");
}

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-";
}

async function notificarNovaCobranca(receita, inquilino) {

  if (!inquilino?.email) {
    return { success: false, mensagem: "Inquilino sem e-mail cadastrado." };
  }

  const link = receita.linkBoleto || "";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #059669;">Nova cobrança</h2>
      <p>Olá, ${inquilino.nome}!</p>
      <p>Uma nova cobrança foi gerada para você:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Valor</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">R$ ${formatarMoeda(receita.valor)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Vencimento</td>
          <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatarData(receita.vencimento)}</td>
        </tr>
      </table>
      ${link ? `
        <p style="text-align: center; margin: 24px 0;">
          <a href="${link}" style="background: #059669; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Ver boleto e pagar
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">Ou copie o link: <a href="${link}">${link}</a></p>
      ` : ""}
      <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">Qualquer dúvida, entre em contato conosco.</p>
    </div>
  `;

  const texto = `Olá, ${inquilino.nome}!\n\nUma nova cobrança foi gerada para você:\nValor: R$ ${formatarMoeda(receita.valor)}\nVencimento: ${formatarData(receita.vencimento)}\n${link ? `\nLink para pagamento: ${link}` : ""}`;

  try {

    await emailService.enviarEmail({
      para: inquilino.email,
      assunto: `Nova cobrança - R$ ${formatarMoeda(receita.valor)} vencendo em ${formatarData(receita.vencimento)}`,
      html,
      texto,
    });

    return { success: true };

  } catch (error) {

    console.error(`[E-mail] Falha ao enviar nova cobrança para ${inquilino.email}:`, error.message);

    return { success: false, mensagem: error.message };

  }

}

module.exports = {
  notificarNovaCobranca,
};
