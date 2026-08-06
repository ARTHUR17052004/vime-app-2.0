require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { setIO } = require("./src/socket");

// const iniciarJobs = require("./src/jobs");
const perfilRoutes = require("./src/routes/perfilRoutes");
const iniciarJobs = require("./src/jobs");
const authRoutes = require("./src/routes/authRoutes");
const auditoriaRoutes = require("./src/routes/auditoriaRoutes");
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
const whatsappRoutes = require("./src/routes/whatsappRoutes");

const errorMiddleware = require("./src/middlewares/errorMiddleware");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {

  cors: {

    origin: "*",

    methods: ["GET", "POST"]

  }

});

setIO(io);

app.set("io", io);

io.on("connection", (socket) => {

  console.log("🔌 Cliente conectado:", socket.id);

  socket.on("disconnect", () => {

    console.log("❌ Cliente desconectado:", socket.id);

  });

});

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
   PERFIS
=========================== */

app.use("/perfis", perfilRoutes);

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
   WHATSAPP
=========================== */

app.use("/whatsapp", whatsappRoutes);

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

/* ===========================
   START SERVER
=========================== */

server.listen(PORT, () => {

  console.log(
    `[VIME 2.0] Servidor iniciado com sucesso na porta ${PORT}`
  );

});