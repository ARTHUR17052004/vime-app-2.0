const express = require("express");

const router = express.Router();

const insightsController = require("../controllers/insightsController");

const authMiddleware = require("../middlewares/authMiddleware");
const permissaoMiddleware = require("../middlewares/permissaoMiddleware");

router.use(authMiddleware);

router.get("/financeiro", permissaoMiddleware("insights.visualizar"), insightsController.financeiro);
router.get("/imoveis", permissaoMiddleware("insights.visualizar"), insightsController.imoveis);

module.exports = router;
