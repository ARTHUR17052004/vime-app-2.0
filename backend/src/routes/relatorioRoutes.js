const express = require("express");

const router = express.Router();

const relatorioConfigController = require("../controllers/relatorioConfigController");
const relatorioEnvioController = require("../controllers/relatorioEnvioController");
const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");
const { apenasAdministradorGeral } = require("../middlewares/restricoes");

router.use(authMiddleware);

// Quais relatórios estão disponíveis (qualquer um com permissão de ver
// Relatórios lê isso, pra filtrar os cards da tela).
router.get("/config", permissaoMiddleware("relatorios.visualizar"), relatorioConfigController.listarConfig);

// Ligar/desligar um relatório (tela Administração > Relatórios) -- só o
// administrador geral, igual a Administração > Notificações.
router.put("/config/:tipo", apenasAdministradorGeral, relatorioConfigController.atualizarConfig);

// Envio agendado de relatório por e-mail (ver relatorioEnvioService.js) --
// fila/histórico com data/hora e destinatário de cada envio. Pedido do
// usuário em 26/11/2026.
router.get("/agendados", permissaoMiddleware("relatorios.visualizar"), relatorioEnvioController.listar);
router.post("/agendados", permissaoMiddleware("relatorios.enviar"), relatorioEnvioController.criar);
router.delete("/agendados/:id", permissaoMiddleware("relatorios.cancelarEnvio"), relatorioEnvioController.cancelar);

module.exports = router;
