const express = require("express");

const router = express.Router();

const relatorioConfigController = require("../controllers/relatorioConfigController");
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

module.exports = router;
