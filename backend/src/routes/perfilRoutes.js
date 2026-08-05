const express = require("express");

const router = express.Router();

const perfilController = require("../controllers/perfilController");

const authMiddleware = require("../middlewares/authMiddleware");
const perfilMiddleware = require("../middlewares/perfilMiddleware");

/* ==========================================
   LISTAR
========================================== */

router.get(

    "/",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    perfilController.listar

);

/* ==========================================
   BUSCAR POR ID
========================================== */

router.get(

    "/:id",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    perfilController.buscarPorId

);

/* ==========================================
   CRIAR
========================================== */

router.post(

    "/",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    perfilController.criar

);

/* ==========================================
   ATUALIZAR
========================================== */

router.put(

    "/:id",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    perfilController.atualizar

);

/* ==========================================
   REMOVER
========================================== */

router.delete(

    "/:id",

    authMiddleware,

    perfilMiddleware("ADMINISTRADOR"),

    perfilController.remover

);

module.exports = router;