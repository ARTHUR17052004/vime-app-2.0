const nodemailer = require("nodemailer");

const prisma = require("../config/prisma");

async function obterConfig() {

  const configuracao = await prisma.configuracao.findFirst({
    orderBy: { id: "asc" },
  });

  return {
    host: configuracao?.smtpHost || null,
    porta: configuracao?.smtpPorta || 587,
    usuario: configuracao?.smtpUsuario || null,
    senha: configuracao?.smtpSenha || null,
    nomeSistema: configuracao?.nomeSistema || "VIME",
  };

}

async function enviarEmail({ para, assunto, html, texto, anexos }) {

  const config = await obterConfig();

  if (!config.host || !config.usuario || !config.senha) {
    throw new Error(
      "Envio de e-mail não configurado. Configure o SMTP em Configurações."
    );
  }

  const transportador = nodemailer.createTransport({
    host: config.host,
    port: Number(config.porta),
    secure: Number(config.porta) === 465,
    auth: {
      user: config.usuario,
      pass: config.senha,
    },
  });

  await transportador.sendMail({
    from: `"${config.nomeSistema}" <${config.usuario}>`,
    to: para,
    subject: assunto,
    text: texto,
    html,
    // [{ filename, content: Buffer, contentType }] -- usado pelo envio
    // agendado de relatório (ver relatorioEnvioService.js) pra anexar o
    // PDF/Excel gerado na hora, sem precisar hospedar o arquivo em
    // lugar nenhum.
    ...(anexos?.length ? { attachments: anexos } : {}),
  });

}

module.exports = {
  enviarEmail,
};
