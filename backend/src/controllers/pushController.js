const pushService = require("../services/pushService");

const chavePublica = (req, res) => {
  return res.json({
    success: true,
    data: { chavePublica: pushService.chavePublica() },
  });
};

const inscrever = async (req, res) => {

  await pushService.salvarSubscricao(req.usuario.id, req.body);

  return res.json({
    success: true,
    message: "Inscrito para notificações no celular.",
  });

};

const desinscrever = async (req, res) => {

  await pushService.removerSubscricao(req.body.endpoint);

  return res.json({
    success: true,
    message: "Desinscrito.",
  });

};

// Manda uma notificação de teste só pro próprio usuário (não cria nada
// no sino, nem aparece pros outros) -- pra conferir se o celular recebe.
const teste = async (req, res) => {

  if (!pushService.configurado) {
    return res.status(400).json({
      success: false,
      message: "Notificação no celular não está configurada no servidor.",
    });
  }

  if ((await pushService.contarSubscricoes(req.usuario.id)) === 0) {
    return res.status(400).json({
      success: false,
      message: "Nenhum aparelho seu está inscrito. Toque em Ativar primeiro.",
    });
  }

  await pushService.enviarPara(req.usuario.id, {
    title: "Teste do VIME",
    body: "Se você está vendo isso, as notificações no celular estão funcionando.",
    url: "/notificacoes",
  });

  return res.json({ success: true, message: "Teste enviado." });

};

module.exports = {
  teste,
  chavePublica,
  inscrever,
  desinscrever,
};
