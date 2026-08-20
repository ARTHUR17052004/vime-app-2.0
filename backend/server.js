require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const iniciarJobs = require("./src/jobs");
const { setIO, registrarConexao, removerConexao } = require("./src/socket");

const authRoutes = require("./src/routes/authRoutes");
const auditoriaRoutes = require("./src/routes/auditoriaRoutes");
const usuarioRoutes = require("./src/routes/usuarioRoutes");
const perfilRoutes = require("./src/routes/perfilRoutes");
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
const sessaoRoutes = require("./src/routes/sessaoRoutes");
const whatsappRoutes = require("./src/routes/whatsappRoutes");
const notificacaoRoutes = require("./src/routes/notificacaoRoutes");
const buscaRoutes = require("./src/routes/buscaRoutes");
const configuracaoRoutes = require("./src/routes/configuracaoRoutes");
const modeloDocumentoRoutes = require("./src/routes/modeloDocumentoRoutes");

const errorMiddleware = require("./src/middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 3001;

// Atrás de proxy reverso (HTTPS termina antes de chegar no Node): sem
// isso, req.protocol sempre volta "http", mesmo em requisições https reais.
// Isso já causou o webhook da Asaas ser registrado como http:// por engano.
app.set("trust proxy", 1);

/* ===========================
   CORS
=========================== */
const origensPadrao = [
  "http://localhost:3000",
  "https://vimesistema.online",
  "https://www.vimesistema.online",
];

const origensPermitidas = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : origensPadrao;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origensPermitidas.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS."));
    },
    credentials: true,
  })
);

app.use(
  helmet({
    hsts: process.env.NODE_ENV === "production",
  })
);
app.use(morgan("dev"));
// Padrão do Express é 100kb — pequeno demais pra PDFs/DOCX em base64
// (upload de documentos pra Clicksign, geração de contrato, etc.)
app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());

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

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/perfis", perfilRoutes);
app.use("/locadores", locadorRoutes);
app.use("/unidades", unidadeRoutes);
app.use("/kitnets", kitnetRoutes);
app.use("/inquilinos", inquilinoRoutes);
app.use("/contratos", contratoRoutes);
app.use("/receitas", receitaRoutes);
app.use("/despesas", despesaRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/solicitacoes", solicitacaoRoutes);
app.use("/vistorias", vistoriaRoutes);
app.use("/auditoria", auditoriaRoutes);
app.use("/asaas", asaasRoutes);
app.use("/clicksign", clicksignRoutes);
app.use("/logs", logRoutes);
app.use("/sessoes", sessaoRoutes);
app.use("/whatsapp", whatsappRoutes);
app.use("/notificacoes", notificacaoRoutes);
app.use("/busca", buscaRoutes);
app.use("/configuracoes", configuracaoRoutes);
app.use("/modelos-documento", modeloDocumentoRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
  });
});

app.use(errorMiddleware);

/* ===========================
   SERVIDOR HTTP + SOCKET.IO
=========================== */
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: origensPermitidas,
    credentials: true,
  },
});

/* ===========================
   AUTENTICAÇÃO DO SOCKET
   Lê o mesmo cookie "token" do login
   e coloca o usuário numa sala própria,
   pra notificações filtradas por usuário.
=========================== */

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean)
    .reduce((acc, item) => {
      const [key, ...rest] = item.split("=");
      acc[key] = decodeURIComponent(rest.join("="));
      return acc;
    }, {});
}

io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.token;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "vime_secret_dev"
    );

    socket.usuario = decoded;

    next();
  } catch (error) {
    next();
  }
});

io.on("connection", (socket) => {
  if (socket.usuario?.id) {
    socket.join(`usuario:${socket.usuario.id}`);
    registrarConexao(socket);
  }

  socket.on("disconnect", () => {
    removerConexao(socket);
  });
});

setIO(io);

httpServer.listen(PORT, () => {
  console.log(
    `[VIME 2.0] Servidor iniciado com sucesso na porta ${PORT}`
  );
  iniciarJobs();
});