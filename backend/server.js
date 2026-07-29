require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

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
const clicksignRoutes = require("./src/routes/clicksignRoutes");

const solicitacaoRoutes = require("./src/routes/solicitacaoRoutes");
const vistoriaRoutes = require("./src/routes/vistoriaRoutes");
const logRoutes = require("./src/routes/logRoutes");

const errorMiddleware = require("./src/middlewares/errorMiddleware");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: "ok",
      api: "VIME 2.0 Backend",
      version: "1.0.0",
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
   SOLICITAÇÕES
=========================== */

app.use("/solicitacoes", solicitacaoRoutes);

/* ===========================
   VISTORIAS
=========================== */

app.use("/vistorias", vistoriaRoutes);

/* ===========================
   ASAAS
=========================== */

app.use("/asaas", asaasRoutes);

/* ===========================
   CLICKSIGN
=========================== */

app.use("/clicksign", clicksignRoutes);
app.use("/logs", logRoutes);

/* ===========================
   404
=========================== */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
  });
});

/* ===========================
   ERROR MIDDLEWARE
=========================== */

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(
    `[VIME 2.0] Servidor iniciado com sucesso na porta ${PORT}`
  );
});