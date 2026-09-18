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

module.exports = {
  chavePublica,
  inscrever,
  desinscrever,
};
