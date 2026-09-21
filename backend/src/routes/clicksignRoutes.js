const express = require('express');

const router = express.Router();

const clicksignController = require('../controllers/clicksignController');
const authMiddleware = require('../middlewares/authMiddleware');
const { chavesDoEscopo } = require('../utils/escopoClicksign');
const permissaoMiddleware = require('../middlewares/permissaoMiddleware');

// Webhook fica FORA da autenticação de usuário —
// quem chama essa rota é o servidor da ClickSign, não um usuário logado
router.post('/webhook', clicksignController.webhook);

// Todas as rotas abaixo continuam exigindo login
router.use(authMiddleware);

// Todas as rotas com :id aqui são de documento da Clicksign (conta única da
// empresa): usuário restrito a um locador só acessa documento de contrato dele.
router.param("id", async (req, res, next, id) => {

  if (!req.usuario?.locadorId) return next();

  try {

    const chaves = await chavesDoEscopo(req.usuario);

    if (!chaves.has(id)) {
      return res.status(404).json({ success: false, message: "Documento não encontrado." });
    }

    return next();

  } catch (erro) {

    return next(erro);

  }

});

router.get('/config', permissaoMiddleware('clicksign.visualizar'), clicksignController.config);

router.get('/status', permissaoMiddleware('clicksign.visualizar'), clicksignController.status);

router.post('/testar-conexao', permissaoMiddleware('clicksign.testarConexao'), clicksignController.testarConexao);

router.post('/enviar', permissaoMiddleware('clicksign.enviar'), clicksignController.enviarDocumento);

router.post('/sincronizar', permissaoMiddleware('clicksign.sincronizar'), clicksignController.sincronizar);

router.get("/documentos", permissaoMiddleware('clicksign.visualizar'), clicksignController.listarDocumentosApi);

router.post("/documentos", permissaoMiddleware('clicksign.enviar'), clicksignController.criarDocumentoApi);

router.get("/documentos/:id", permissaoMiddleware('clicksign.visualizar'), clicksignController.buscarDocumentoApi);

router.get("/documentos/:id/baixar", permissaoMiddleware('clicksign.visualizar'), clicksignController.baixarArquivoDocumento);

router.delete("/documentos/:id", permissaoMiddleware('clicksign.cancelar'), clicksignController.cancelarDocumento);

router.post(
  "/documentos/:id/assinar",
  permissaoMiddleware('clicksign.enviar'),
  clicksignController.enviarAssinatura
);

module.exports = router;