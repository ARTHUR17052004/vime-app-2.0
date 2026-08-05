const express = require("express");

const router = express.Router();

const usuarioController = require("../controllers/usuarioController");

const authMiddleware = require("../middlewares/authMiddleware");
const perfilMiddleware = require("../middlewares/perfilMiddleware");

/* ==========================================
   LISTAR
========================================== */

router.get(

    "/",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.listar

);

/* ==========================================
   BUSCAR POR ID
========================================== */

router.get(

    "/:id",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.buscarPorId

);

/* ==========================================
   CRIAR
========================================== */

router.post(

    "/",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.criar

);

/* ==========================================
   ATUALIZAR
========================================== */

router.put(

    "/:id",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.atualizar

);

/* ==========================================
   REMOVER
========================================== */

router.delete(

    "/:id",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.remover

);

/* ==========================================
   REDEFINIR SENHA
========================================== */

router.post(

    "/:id/redefinir-senha",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.redefinirSenha

);

/* ==========================================
   ENVIAR ACESSO
========================================== */

router.post(

    "/:id/enviar-acesso",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    usuarioController.enviarAcesso

);

module.exports = router;