require("dotenv").config();

console.log("DATABASE_URL:");
console.log(process.env.DATABASE_URL);

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const locadorRoutes = require("./src/routes/locadorRoutes");
const unidadeRoutes = require("./src/routes/unidadeRoutes");
const kitnetRoutes = require("./src/routes/kitnetRoutes");
const inquilinoRoutes = require("./src/routes/inquilinoRoutes");
const contratoRoutes = require("./src/routes/contratoRoutes");

const receitaRoutes = require("./src/routes/receitaRoutes");
const despesaRoutes = require("./src/routes/despesaRoutes");
const financeiroRoutes = require("./src/routes/financeiroRoutes");

const dashboardRoutes = require("./src/routes/dashboardRoutes");
const asaasRoutes = require("./src/routes/asaasRoutes");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
    },
  });
});

/* ===========================
   AUTENTICAÇÃO
=========================== */

app.use("/auth", authRoutes);

/* ===========================
   USUÁRIOS
=========================== */

app.use("/usuarios", usuarioRoutes);

/* ===========================
   LOCADORES
=========================== */

app.use("/locadores", locadorRoutes);

/* ===========================
   UNIDADES
=========================== */

app.use("/unidades", unidadeRoutes);

/* ===========================
   KITNETS
=========================== */

app.use("/kitnets", kitnetRoutes);

/* ===========================
   INQUILINOS
=========================== */

app.use("/inquilinos", inquilinoRoutes);

/* ===========================
   CONTRATOS
=========================== */

app.use("/contratos", contratoRoutes);

/* ===========================
   FINANCEIRO
=========================== */

app.use("/receitas", receitaRoutes);
app.use("/despesas", despesaRoutes);
app.use("/financeiro", financeiroRoutes);

/* ===========================
   DASHBOARD
=========================== */

app.use("/dashboard", dashboardRoutes);

/* ===========================
   ASAAS
=========================== */

app.use("/asaas", asaasRoutes);

app.listen(PORT, () => {
  console.log(
    `[VIME 2.0] Servidor iniciado com sucesso na porta ${PORT}`
  );
});